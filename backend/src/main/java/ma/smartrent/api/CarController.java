package ma.smartrent.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import ma.smartrent.domain.Car;
import ma.smartrent.domain.User;
import ma.smartrent.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/cars")
public class CarController {
  private final JdbcTemplate jdbc;
  private final UserRepository users;

  public CarController(JdbcTemplate jdbc, UserRepository users) {
    this.jdbc = jdbc;
    this.users = users;
  }

  @GetMapping
  public List<FleetCarRow> list(
      Principal principal,
      @RequestParam(required = false) String search,
      @RequestParam(required = false) Car.Status status,
      @RequestParam(required = false) Car.FuelType fuelType,
      @RequestParam(required = false) Car.Transmission transmission) {
    UUID agencyId = agencyId(principal);
    StringBuilder sql = new StringBuilder("""
        select c.id, c.brand, c.model, c.year, c.mileage, c.fuel_type::text as fuel_type,
               c.transmission::text as transmission, c.plate_number, c.status::text as status,
               c.daily_rate,
               (select ci.url from car_images ci where ci.car_id = c.id order by ci.is_primary desc, ci.created_at desc limit 1) as primary_image_url,
               (select min(i.end_date) from insurance i where i.car_id = c.id and i.end_date >= current_date) as insurance_expiry,
               (select min(ti.next_due_date) from technical_inspections ti where ti.car_id = c.id and ti.next_due_date >= current_date) as inspection_due_date,
               (select count(*) from maintenance m where m.car_id = c.id and m.completed_at is null) as open_maintenance_count,
               (select count(*) from bookings b where b.car_id = c.id and b.status in ('PENDING','APPROVED','ACTIVE')) as booking_activity_count
        from cars c
        where c.agency_id = ?
        """);
    List<Object> args = new ArrayList<>();
    args.add(agencyId);

    if (search != null && !search.isBlank()) {
      sql.append(" and (lower(c.brand) like ? or lower(c.model) like ? or lower(c.plate_number) like ?)");
      String pattern = "%" + search.toLowerCase(Locale.ROOT).trim() + "%";
      args.add(pattern);
      args.add(pattern);
      args.add(pattern);
    }
    if (status != null) {
      sql.append(" and c.status = ?::car_status");
      args.add(status.name());
    }
    if (fuelType != null) {
      sql.append(" and c.fuel_type = ?::fuel_type");
      args.add(fuelType.name());
    }
    if (transmission != null) {
      sql.append(" and c.transmission = ?::transmission_type");
      args.add(transmission.name());
    }
    sql.append(" order by c.created_at desc, c.brand, c.model");

    return jdbc.query(sql.toString(), (rs, rowNum) -> fleetRow(rs), args.toArray());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public FleetCarRow create(Principal principal, @Valid @RequestBody CarRequest request) {
    UUID agencyId = agencyId(principal);
    validatePlateAvailable(request.plateNumber(), null);
    UUID id = jdbc.queryForObject("""
        insert into cars(agency_id, brand, model, year, mileage, fuel_type, transmission, plate_number, status, daily_rate)
        values (?, ?, ?, ?, ?, ?::fuel_type, ?::transmission_type, ?, 'AVAILABLE', ?)
        returning id
        """, UUID.class,
        agencyId,
        request.brand().trim(),
        request.model().trim(),
        request.year(),
        request.mileage(),
        request.fuelType().name(),
        request.transmission().name(),
        request.plateNumber().trim(),
        request.dailyRate());
    return getRowOrThrow(agencyId, id);
  }

  @GetMapping("/{id}")
  public CarDetail get(Principal principal, @PathVariable UUID id) {
    UUID agencyId = agencyId(principal);
    FleetCarRow car = getRowOrThrow(agencyId, id);
    return new CarDetail(
        car,
        insurance(id, agencyId),
        inspections(id, agencyId),
        maintenance(id, agencyId),
        bookings(id, agencyId),
        images(id, agencyId),
        damageSummary(id, agencyId));
  }

  @PutMapping("/{id}")
  public FleetCarRow update(Principal principal, @PathVariable UUID id, @Valid @RequestBody CarRequest request) {
    UUID agencyId = agencyId(principal);
    ensureCarInAgency(id, agencyId);
    validatePlateAvailable(request.plateNumber(), id);
    jdbc.update("""
        update cars
        set brand = ?, model = ?, year = ?, mileage = ?, fuel_type = ?::fuel_type,
            transmission = ?::transmission_type, plate_number = ?, daily_rate = ?, updated_at = now()
        where id = ? and agency_id = ?
        """,
        request.brand().trim(),
        request.model().trim(),
        request.year(),
        request.mileage(),
        request.fuelType().name(),
        request.transmission().name(),
        request.plateNumber().trim(),
        request.dailyRate(),
        id,
        agencyId);
    return getRowOrThrow(agencyId, id);
  }

  @PatchMapping("/{id}/status")
  public FleetCarRow updateStatus(Principal principal, @PathVariable UUID id, @Valid @RequestBody StatusRequest request) {
    UUID agencyId = agencyId(principal);
    ensureCarInAgency(id, agencyId);
    if (request.status() == Car.Status.AVAILABLE && hasActiveBooking(id, agencyId)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot mark a car with an active booking as available");
    }
    jdbc.update("update cars set status = ?::car_status, updated_at = now() where id = ? and agency_id = ?", request.status().name(), id, agencyId);
    return getRowOrThrow(agencyId, id);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(Principal principal, @PathVariable UUID id) {
    UUID agencyId = agencyId(principal);
    ensureCarInAgency(id, agencyId);
    long bookings = count("select count(*) from bookings where car_id = ? and agency_id = ?", id, agencyId);
    if (bookings > 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a car with booking history");
    }
    jdbc.update("delete from cars where id = ? and agency_id = ?", id, agencyId);
  }

  @PostMapping("/{id}/maintenance")
  @ResponseStatus(HttpStatus.CREATED)
  public MaintenanceRecord addMaintenance(Principal principal, @PathVariable UUID id, @Valid @RequestBody MaintenanceRequest request) {
    UUID agencyId = agencyId(principal);
    ensureCarInAgency(id, agencyId);
    UUID maintenanceId = jdbc.queryForObject("""
        insert into maintenance(car_id, type, description, mileage_at_service, due_at, cost)
        values (?, ?, ?, ?, ?, ?)
        returning id
        """, UUID.class, id, request.type().trim(), request.description(), request.mileageAtService(), request.dueAt(), request.cost());
    return maintenanceRecord(maintenanceId, agencyId);
  }

  @PostMapping("/{id}/insurance")
  @ResponseStatus(HttpStatus.CREATED)
  public InsuranceRecord addInsurance(Principal principal, @PathVariable UUID id, @Valid @RequestBody InsuranceRequest request) {
    UUID agencyId = agencyId(principal);
    ensureCarInAgency(id, agencyId);
    if (!request.endDate().isAfter(request.startDate())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insurance end date must be after start date");
    }
    UUID insuranceId = jdbc.queryForObject("""
        insert into insurance(car_id, company, contract_number, start_date, end_date, document_url)
        values (?, ?, ?, ?, ?, ?)
        returning id
        """, UUID.class, id, request.company().trim(), request.contractNumber().trim(), request.startDate(), request.endDate(), request.documentUrl());
    return insuranceRecord(insuranceId, agencyId);
  }

  @PostMapping("/{id}/technical-inspections")
  @ResponseStatus(HttpStatus.CREATED)
  public InspectionRecord addInspection(Principal principal, @PathVariable UUID id, @Valid @RequestBody InspectionRequest request) {
    UUID agencyId = agencyId(principal);
    ensureCarInAgency(id, agencyId);
    if (request.nextDueDate().isBefore(request.inspectionDate())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Next due date must be on or after inspection date");
    }
    UUID inspectionId = jdbc.queryForObject("""
        insert into technical_inspections(car_id, inspection_date, next_due_date, result, document_url)
        values (?, ?, ?, ?, ?)
        returning id
        """, UUID.class, id, request.inspectionDate(), request.nextDueDate(), request.result().trim(), request.documentUrl());
    return inspectionRecord(inspectionId, agencyId);
  }

  private UUID agencyId(Principal principal) {
    User user = users.findByEmail(principal.getName()).orElseThrow();
    if (user.getAgency() == null) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not attached to an agency");
    }
    return user.getAgency().getId();
  }

  private FleetCarRow getRowOrThrow(UUID agencyId, UUID id) {
    List<FleetCarRow> rows = jdbc.query("""
        select c.id, c.brand, c.model, c.year, c.mileage, c.fuel_type::text as fuel_type,
               c.transmission::text as transmission, c.plate_number, c.status::text as status,
               c.daily_rate,
               (select ci.url from car_images ci where ci.car_id = c.id order by ci.is_primary desc, ci.created_at desc limit 1) as primary_image_url,
               (select min(i.end_date) from insurance i where i.car_id = c.id and i.end_date >= current_date) as insurance_expiry,
               (select min(ti.next_due_date) from technical_inspections ti where ti.car_id = c.id and ti.next_due_date >= current_date) as inspection_due_date,
               (select count(*) from maintenance m where m.car_id = c.id and m.completed_at is null) as open_maintenance_count,
               (select count(*) from bookings b where b.car_id = c.id and b.status in ('PENDING','APPROVED','ACTIVE')) as booking_activity_count
        from cars c
        where c.agency_id = ? and c.id = ?
        """, (rs, rowNum) -> fleetRow(rs), agencyId, id);
    if (rows.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found");
    }
    return rows.get(0);
  }

  private FleetCarRow fleetRow(java.sql.ResultSet rs) throws java.sql.SQLException {
    return new FleetCarRow(
        rs.getObject("id", UUID.class),
        rs.getString("brand"),
        rs.getString("model"),
        rs.getInt("year"),
        rs.getInt("mileage"),
        rs.getString("fuel_type"),
        rs.getString("transmission"),
        rs.getString("plate_number"),
        rs.getString("status"),
        rs.getBigDecimal("daily_rate"),
        rs.getString("primary_image_url"),
        rs.getObject("insurance_expiry", LocalDate.class),
        rs.getObject("inspection_due_date", LocalDate.class),
        rs.getLong("open_maintenance_count"),
        rs.getLong("booking_activity_count"));
  }

  private void ensureCarInAgency(UUID id, UUID agencyId) {
    if (count("select count(*) from cars where id = ? and agency_id = ?", id, agencyId) == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found");
    }
  }

  private void validatePlateAvailable(String plateNumber, UUID currentCarId) {
    Long existing = currentCarId == null
        ? jdbc.queryForObject("select count(*) from cars where lower(plate_number) = lower(?)", Long.class, plateNumber.trim())
        : jdbc.queryForObject("select count(*) from cars where lower(plate_number) = lower(?) and id <> ?", Long.class, plateNumber.trim(), currentCarId);
    if (existing != null && existing > 0) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Plate number already exists");
    }
  }

  private boolean hasActiveBooking(UUID carId, UUID agencyId) {
    return count("select count(*) from bookings where car_id = ? and agency_id = ? and status = 'ACTIVE'", carId, agencyId) > 0;
  }

  private long count(String sql, Object... args) {
    Long value = jdbc.queryForObject(sql, Long.class, args);
    return value == null ? 0 : value;
  }

  private List<InsuranceRecord> insurance(UUID carId, UUID agencyId) {
    return jdbc.query("""
        select i.id, i.company, i.contract_number, i.start_date, i.end_date, i.document_url
        from insurance i join cars c on c.id = i.car_id
        where i.car_id = ? and c.agency_id = ?
        order by i.end_date desc
        """, (rs, rowNum) -> new InsuranceRecord(
        rs.getObject("id", UUID.class),
        rs.getString("company"),
        rs.getString("contract_number"),
        rs.getObject("start_date", LocalDate.class),
        rs.getObject("end_date", LocalDate.class),
        rs.getString("document_url")), carId, agencyId);
  }

  private List<InspectionRecord> inspections(UUID carId, UUID agencyId) {
    return jdbc.query("""
        select ti.id, ti.inspection_date, ti.next_due_date, ti.result, ti.document_url
        from technical_inspections ti join cars c on c.id = ti.car_id
        where ti.car_id = ? and c.agency_id = ?
        order by ti.next_due_date desc
        """, (rs, rowNum) -> new InspectionRecord(
        rs.getObject("id", UUID.class),
        rs.getObject("inspection_date", LocalDate.class),
        rs.getObject("next_due_date", LocalDate.class),
        rs.getString("result"),
        rs.getString("document_url")), carId, agencyId);
  }

  private List<MaintenanceRecord> maintenance(UUID carId, UUID agencyId) {
    return jdbc.query("""
        select m.id, m.type, m.description, m.mileage_at_service, m.due_at, m.completed_at, m.cost
        from maintenance m join cars c on c.id = m.car_id
        where m.car_id = ? and c.agency_id = ?
        order by coalesce(m.completed_at, m.due_at) desc nulls last
        """, (rs, rowNum) -> maintenanceRecord(rs), carId, agencyId);
  }

  private MaintenanceRecord maintenanceRecord(UUID maintenanceId, UUID agencyId) {
    return jdbc.queryForObject("""
        select m.id, m.type, m.description, m.mileage_at_service, m.due_at, m.completed_at, m.cost
        from maintenance m join cars c on c.id = m.car_id
        where m.id = ? and c.agency_id = ?
        """, (rs, rowNum) -> maintenanceRecord(rs), maintenanceId, agencyId);
  }

  private MaintenanceRecord maintenanceRecord(java.sql.ResultSet rs) throws java.sql.SQLException {
    return new MaintenanceRecord(
        rs.getObject("id", UUID.class),
        rs.getString("type"),
        rs.getString("description"),
        (Integer) rs.getObject("mileage_at_service"),
        rs.getObject("due_at", LocalDate.class),
        rs.getObject("completed_at", LocalDate.class),
        rs.getBigDecimal("cost"));
  }

  private InsuranceRecord insuranceRecord(UUID insuranceId, UUID agencyId) {
    return jdbc.queryForObject("""
        select i.id, i.company, i.contract_number, i.start_date, i.end_date, i.document_url
        from insurance i join cars c on c.id = i.car_id
        where i.id = ? and c.agency_id = ?
        """, (rs, rowNum) -> new InsuranceRecord(
        rs.getObject("id", UUID.class),
        rs.getString("company"),
        rs.getString("contract_number"),
        rs.getObject("start_date", LocalDate.class),
        rs.getObject("end_date", LocalDate.class),
        rs.getString("document_url")), insuranceId, agencyId);
  }

  private InspectionRecord inspectionRecord(UUID inspectionId, UUID agencyId) {
    return jdbc.queryForObject("""
        select ti.id, ti.inspection_date, ti.next_due_date, ti.result, ti.document_url
        from technical_inspections ti join cars c on c.id = ti.car_id
        where ti.id = ? and c.agency_id = ?
        """, (rs, rowNum) -> new InspectionRecord(
        rs.getObject("id", UUID.class),
        rs.getObject("inspection_date", LocalDate.class),
        rs.getObject("next_due_date", LocalDate.class),
        rs.getString("result"),
        rs.getString("document_url")), inspectionId, agencyId);
  }

  private List<BookingRecord> bookings(UUID carId, UUID agencyId) {
    return jdbc.query("""
        select b.id, u.full_name, b.status::text as status, b.pickup_at::text as pickup_at, b.return_at::text as return_at, b.total_amount
        from bookings b join users u on u.id = b.customer_id
        where b.car_id = ? and b.agency_id = ?
        order by b.created_at desc
        limit 8
        """, (rs, rowNum) -> new BookingRecord(
        rs.getObject("id", UUID.class),
        rs.getString("full_name"),
        rs.getString("status"),
        rs.getString("pickup_at"),
        rs.getString("return_at"),
        rs.getBigDecimal("total_amount")), carId, agencyId);
  }

  private List<ImageRecord> images(UUID carId, UUID agencyId) {
    return jdbc.query("""
        select ci.id, ci.url, ci.is_primary
        from car_images ci join cars c on c.id = ci.car_id
        where ci.car_id = ? and c.agency_id = ?
        order by ci.is_primary desc, ci.created_at desc
        """, (rs, rowNum) -> new ImageRecord(
        rs.getObject("id", UUID.class),
        rs.getString("url"),
        rs.getBoolean("is_primary")), carId, agencyId);
  }

  private DamageSummary damageSummary(UUID carId, UUID agencyId) {
    return jdbc.queryForObject("""
        select count(*) as total_reports, coalesce(sum(estimated_cost), 0) as estimated_cost
        from damage_reports dr join cars c on c.id = dr.car_id
        where dr.car_id = ? and c.agency_id = ?
        """, (rs, rowNum) -> new DamageSummary(rs.getLong("total_reports"), rs.getBigDecimal("estimated_cost")), carId, agencyId);
  }

  public record FleetCarRow(
      UUID id,
      String brand,
      String model,
      int year,
      int mileage,
      String fuelType,
      String transmission,
      String plateNumber,
      String status,
      BigDecimal dailyRate,
      String primaryImageUrl,
      LocalDate insuranceExpiry,
      LocalDate inspectionDueDate,
      long openMaintenanceCount,
      long bookingActivityCount) {}

  public record CarDetail(
      FleetCarRow car,
      List<InsuranceRecord> insurance,
      List<InspectionRecord> inspections,
      List<MaintenanceRecord> maintenance,
      List<BookingRecord> bookings,
      List<ImageRecord> images,
      DamageSummary damageSummary) {}

  public record CarRequest(
      @NotBlank String brand,
      @NotBlank String model,
      @Min(1990) @Max(2100) int year,
      @Min(0) int mileage,
      @NotNull Car.FuelType fuelType,
      @NotNull Car.Transmission transmission,
      @NotBlank String plateNumber,
      @NotNull @DecimalMin("0.00") BigDecimal dailyRate) {}

  public record StatusRequest(@NotNull Car.Status status) {}

  public record MaintenanceRequest(
      @NotBlank String type,
      String description,
      @Min(0) Integer mileageAtService,
      LocalDate dueAt,
      @NotNull @DecimalMin("0.00") BigDecimal cost) {}

  public record InsuranceRequest(
      @NotBlank String company,
      @NotBlank String contractNumber,
      @NotNull LocalDate startDate,
      @NotNull LocalDate endDate,
      String documentUrl) {}

  public record InspectionRequest(
      @NotNull LocalDate inspectionDate,
      @NotNull LocalDate nextDueDate,
      @NotBlank String result,
      String documentUrl) {}

  public record InsuranceRecord(UUID id, String company, String contractNumber, LocalDate startDate, LocalDate endDate, String documentUrl) {}
  public record InspectionRecord(UUID id, LocalDate inspectionDate, LocalDate nextDueDate, String result, String documentUrl) {}
  public record MaintenanceRecord(UUID id, String type, String description, Integer mileageAtService, LocalDate dueAt, LocalDate completedAt, BigDecimal cost) {}
  public record BookingRecord(UUID id, String customerName, String status, String pickupAt, String returnAt, BigDecimal totalAmount) {}
  public record ImageRecord(UUID id, String url, boolean primary) {}
  public record DamageSummary(long totalReports, BigDecimal estimatedCost) {}
}

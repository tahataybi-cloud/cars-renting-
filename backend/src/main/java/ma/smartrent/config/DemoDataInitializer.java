package ma.smartrent.config;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import ma.smartrent.domain.Agency;
import ma.smartrent.domain.Car;
import ma.smartrent.domain.User;
import ma.smartrent.repo.AgencyRepository;
import ma.smartrent.repo.CarRepository;
import ma.smartrent.repo.RoleRepository;
import ma.smartrent.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoDataInitializer implements CommandLineRunner {
  private final AgencyRepository agencies;
  private final CarRepository cars;
  private final RoleRepository roles;
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JdbcTemplate jdbc;

  public DemoDataInitializer(
      AgencyRepository agencies,
      CarRepository cars,
      RoleRepository roles,
      UserRepository users,
      PasswordEncoder encoder,
      JdbcTemplate jdbc) {
    this.agencies = agencies;
    this.cars = cars;
    this.roles = roles;
    this.users = users;
    this.encoder = encoder;
    this.jdbc = jdbc;
  }

  @Override
  public void run(String... args) {
    User owner = users.findByEmail("owner@smartrent.ma").orElseGet(this::createDemoOwner);
    Agency agency = owner.getAgency();

    ensureCar(agency, "Dacia", "Duster", 2024, "A-123456", Car.Status.AVAILABLE, new BigDecimal("450"));
    ensureCar(agency, "Renault", "Clio", 2023, "B-778899", Car.Status.RENTED, new BigDecimal("320"));
    ensureCar(agency, "Hyundai", "Tucson", 2024, "C-445566", Car.Status.MAINTENANCE, new BigDecimal("650"));
    seedDashboardData(agency, owner);
  }

  private User createDemoOwner() {
    Agency agency = new Agency();
    agency.setName("Atlas Rent Casablanca");
    agency.setCity("Casablanca");
    agency.setAddress("Maarif, Casablanca");
    agency.setPhone("+212 522 000 000");
    agency.setEmail("contact@atlasrent.ma");
    agencies.save(agency);

    User owner = new User();
    owner.setAgency(agency);
    owner.setFullName("Demo Agency Owner");
    owner.setEmail("owner@smartrent.ma");
    owner.setPhone("+212 600 000 000");
    owner.setPasswordHash(encoder.encode("password123"));
    owner.getRoles().add(roles.findByName("AGENCY_OWNER").orElseThrow());
    users.save(owner);
    return owner;
  }

  private void ensureCar(Agency agency, String brand, String model, int year, String plate, Car.Status status, BigDecimal dailyRate) {
    Long existing = jdbc.queryForObject("select count(*) from cars where plate_number = ?", Long.class, plate);
    if (existing != null && existing > 0) {
      return;
    }
    createCar(agency, brand, model, year, plate, status, dailyRate);
  }

  private void createCar(Agency agency, String brand, String model, int year, String plate, Car.Status status, BigDecimal dailyRate) {
    Car car = new Car();
    car.setAgency(agency);
    car.setBrand(brand);
    car.setModel(model);
    car.setYear(year);
    car.setMileage(18_000);
    car.setFuelType(Car.FuelType.DIESEL);
    car.setTransmission(Car.Transmission.AUTOMATIC);
    car.setPlateNumber(plate);
    car.setStatus(status);
    car.setDailyRate(dailyRate);
    cars.save(car);
  }

  private void seedDashboardData(Agency agency, User owner) {
    Long existing = jdbc.queryForObject(
        "select count(*) from payments where reference like 'DEMO-DASHBOARD-%'",
        Long.class);
    if (existing != null && existing > 0) {
      return;
    }

    UUID duster = carId("A-123456");
    UUID clio = carId("B-778899");
    UUID tucson = carId("C-445566");
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

    UUID todayBooking = insertBooking(agency.getId(), duster, owner.getId(), "COMPLETED", now.minusHours(6), now.minusHours(2), "450", "450", now.minusHours(8));
    insertPayment(todayBooking, "450", "PAID", "CASH", now.minusHours(2), "DEMO-DASHBOARD-TODAY");

    UUID activeBooking = insertBooking(agency.getId(), clio, owner.getId(), "ACTIVE", now.minusDays(1), now.plusHours(20), "320", "960", now.minusDays(2));
    insertPayment(activeBooking, "640", "PAID", "CARD", now.minusDays(1), "DEMO-DASHBOARD-ACTIVE");
    insertDeposit(activeBooking, "2500", "PENDING");

    for (int i = 1; i <= 5; i++) {
      OffsetDateTime pickup = now.minusMonths(i).withDayOfMonth(8).withHour(10).withMinute(0).withSecond(0).withNano(0);
      UUID booking = insertBooking(
          agency.getId(),
          i % 2 == 0 ? duster : clio,
          owner.getId(),
          "COMPLETED",
          pickup,
          pickup.plusDays(3),
          i % 2 == 0 ? "450" : "320",
          i % 2 == 0 ? "1350" : "960",
          pickup.minusDays(5));
      insertPayment(booking, i % 2 == 0 ? "1350" : "960", "PAID", "ONLINE", pickup.plusDays(1), "DEMO-DASHBOARD-M" + i);
    }

    insertBooking(agency.getId(), duster, owner.getId(), "APPROVED", now.plusDays(5), now.plusDays(8), "450", "1350", now.minusHours(3));

    jdbc.update("""
        insert into insurance(car_id, company, contract_number, start_date, end_date, document_url)
        select ?, 'Wafa Assurance', 'DEMO-INS-001', current_date - interval '11 months', current_date + interval '15 days', null
        where not exists (select 1 from insurance where contract_number = 'DEMO-INS-001')
        """, tucson);

    jdbc.update("""
        insert into technical_inspections(car_id, inspection_date, next_due_date, result, document_url)
        select ?, current_date - interval '11 months', current_date + interval '12 days', 'PASSED', null
        where not exists (select 1 from technical_inspections where car_id = ? and result = 'PASSED')
        """, duster, duster);

    jdbc.update("""
        insert into maintenance(car_id, type, description, mileage_at_service, due_at, completed_at, cost)
        select ?, 'Oil Change', 'Demo overdue oil change alert', 18000, current_date - interval '3 days', null, 0
        where not exists (select 1 from maintenance where car_id = ? and type = 'Oil Change' and completed_at is null)
        """, tucson, tucson);
  }

  private UUID carId(String plateNumber) {
    return jdbc.queryForObject("select id from cars where plate_number = ?", UUID.class, plateNumber);
  }

  private UUID insertBooking(UUID agencyId, UUID carId, UUID customerId, String status, OffsetDateTime pickupAt, OffsetDateTime returnAt, String dailyRate, String totalAmount, OffsetDateTime createdAt) {
    return jdbc.queryForObject("""
        insert into bookings(agency_id, car_id, customer_id, status, pickup_at, return_at, daily_rate, total_amount, created_at)
        values (?, ?, ?, ?::booking_status, ?, ?, ?, ?, ?)
        returning id
        """, UUID.class, agencyId, carId, customerId, status, pickupAt, returnAt, new BigDecimal(dailyRate), new BigDecimal(totalAmount), createdAt);
  }

  private void insertPayment(UUID bookingId, String amount, String status, String method, OffsetDateTime paidAt, String reference) {
    jdbc.update("""
        insert into payments(booking_id, amount, method, status, paid_at, reference)
        values (?, ?, ?::payment_method, ?::payment_status, ?, ?)
        """, bookingId, new BigDecimal(amount), method, status, paidAt, reference);
  }

  private void insertDeposit(UUID bookingId, String amount, String status) {
    jdbc.update("""
        insert into deposits(booking_id, amount, paid_at, status)
        values (?, ?, now(), ?::deposit_status)
        """, bookingId, new BigDecimal(amount), status);
  }
}

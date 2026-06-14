package ma.smartrent.api;

import java.math.BigDecimal;
import java.security.Principal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import ma.smartrent.domain.User;
import ma.smartrent.repo.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
  private final JdbcTemplate jdbc;
  private final UserRepository users;

  public DashboardController(JdbcTemplate jdbc, UserRepository users) {
    this.jdbc = jdbc;
    this.users = users;
  }

  @GetMapping("/summary")
  public Summary summary(Principal principal) {
    return overview(principal).summary();
  }

  @GetMapping("/overview")
  public DashboardOverview overview(Principal principal) {
    UUID agencyId = agencyId(principal);
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    OffsetDateTime todayStart = now.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
    OffsetDateTime tomorrowStart = todayStart.plusDays(1);
    OffsetDateTime monthStart = YearMonth.from(now).atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
    OffsetDateTime nextMonthStart = monthStart.plusMonths(1);
    OffsetDateTime previousMonthStart = monthStart.minusMonths(1);

    BigDecimal revenueToday = money("""
        select coalesce(sum(p.amount), 0)
        from payments p
        join bookings b on b.id = p.booking_id
        where b.agency_id = ?
        and p.status = 'PAID'
        and p.paid_at >= ?
        and p.paid_at < ?
        """, agencyId, todayStart, tomorrowStart);

    BigDecimal revenueThisMonth = money("""
        select coalesce(sum(p.amount), 0)
        from payments p
        join bookings b on b.id = p.booking_id
        where b.agency_id = ?
        and p.status = 'PAID'
        and p.paid_at >= ?
        and p.paid_at < ?
        """, agencyId, monthStart, nextMonthStart);

    BigDecimal bookedRevenueThisMonth = money("""
        select coalesce(sum(b.total_amount), 0)
        from bookings b
        where b.agency_id = ?
        and b.status in ('APPROVED', 'ACTIVE', 'COMPLETED')
        and (
          (b.created_at >= ? and b.created_at < ?)
          or (b.pickup_at >= ? and b.pickup_at < ?)
        )
        """, agencyId, monthStart, nextMonthStart, monthStart, nextMonthStart);

    long currentCustomers = count("""
        select count(*) from users
        where agency_id = ?
        and created_at >= ?
        and created_at < ?
        """, agencyId, monthStart, nextMonthStart);
    long previousCustomers = count("""
        select count(*) from users
        where agency_id = ?
        and created_at >= ?
        and created_at < ?
        """, agencyId, previousMonthStart, monthStart);

    Summary summary = new Summary(
        revenueToday,
        revenueThisMonth,
        bookedRevenueThisMonth,
        count("select count(*) from bookings where agency_id = ? and status = 'ACTIVE'", agencyId),
        count("select count(*) from cars where agency_id = ? and status = 'AVAILABLE'", agencyId),
        count("select count(*) from cars where agency_id = ? and status = 'MAINTENANCE'", agencyId),
        count("""
            select count(*) from insurance i
            join cars c on c.id = i.car_id
            where c.agency_id = ?
            and i.end_date >= current_date
            and i.end_date <= current_date + interval '30 days'
            """, agencyId),
        count("""
            select count(*) from deposits d
            join bookings b on b.id = d.booking_id
            where b.agency_id = ?
            and d.status in ('PENDING', 'BLOCKED')
            """, agencyId),
        growth(currentCustomers, previousCustomers));

    return new DashboardOverview(
        summary,
        revenueTrend(agencyId, now),
        fleetUtilization(agencyId),
        monthlyReservations(agencyId, now),
        alerts(agencyId),
        recentBookings(agencyId));
  }

  private UUID agencyId(Principal principal) {
    User user = users.findByEmail(principal.getName()).orElseThrow();
    if (user.getAgency() == null) {
      throw new IllegalStateException("Authenticated user is not attached to an agency");
    }
    return user.getAgency().getId();
  }

  private BigDecimal money(String sql, Object... args) {
    BigDecimal value = jdbc.queryForObject(sql, BigDecimal.class, args);
    return value == null ? BigDecimal.ZERO : value;
  }

  private long count(String sql, Object... args) {
    Long value = jdbc.queryForObject(sql, Long.class, args);
    return value == null ? 0 : value;
  }

  private long growth(long current, long previous) {
    if (previous == 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((double) current - previous) * 100 / previous);
  }

  private List<TrendPoint> revenueTrend(UUID agencyId, OffsetDateTime now) {
    List<TrendPoint> points = new ArrayList<>();
    YearMonth currentMonth = YearMonth.from(now).minusMonths(5);
    for (int i = 0; i < 6; i++) {
      YearMonth month = currentMonth.plusMonths(i);
      OffsetDateTime start = month.atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
      OffsetDateTime end = start.plusMonths(1);
      points.add(new TrendPoint(
          label(month),
          money("""
              select coalesce(sum(p.amount), 0)
              from payments p
              join bookings b on b.id = p.booking_id
              where b.agency_id = ?
              and p.status = 'PAID'
              and p.paid_at >= ?
              and p.paid_at < ?
              """, agencyId, start, end),
          money("""
              select coalesce(sum(total_amount), 0)
              from bookings
              where agency_id = ?
              and status in ('APPROVED', 'ACTIVE', 'COMPLETED')
              and pickup_at >= ?
              and pickup_at < ?
              """, agencyId, start, end)));
    }
    return points;
  }

  private List<FleetStatus> fleetUtilization(UUID agencyId) {
    Map<String, Long> counts = jdbc.query("""
        select status::text as status, count(*) as total
        from cars
        where agency_id = ?
        group by status
        """, rs -> {
      Map<String, Long> result = new java.util.HashMap<>();
      while (rs.next()) {
        result.put(rs.getString("status"), rs.getLong("total"));
      }
      return result;
    }, agencyId);
    return List.of("AVAILABLE", "RESERVED", "RENTED", "MAINTENANCE", "OUT_OF_SERVICE").stream()
        .map(status -> new FleetStatus(status, counts.getOrDefault(status, 0L)))
        .toList();
  }

  private List<ReservationPoint> monthlyReservations(UUID agencyId, OffsetDateTime now) {
    List<ReservationPoint> points = new ArrayList<>();
    YearMonth currentMonth = YearMonth.from(now).minusMonths(5);
    for (int i = 0; i < 6; i++) {
      YearMonth month = currentMonth.plusMonths(i);
      OffsetDateTime start = month.atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
      OffsetDateTime end = start.plusMonths(1);
      points.add(new ReservationPoint(
          label(month),
          count("""
              select count(*) from bookings
              where agency_id = ?
              and created_at >= ?
              and created_at < ?
              """, agencyId, start, end)));
    }
    return points;
  }

  private List<DashboardAlert> alerts(UUID agencyId) {
    List<DashboardAlert> alerts = new ArrayList<>();
    jdbc.query("""
        select i.id::text as id, c.brand, c.model, c.plate_number, i.end_date
        from insurance i
        join cars c on c.id = i.car_id
        where c.agency_id = ?
        and i.end_date >= current_date
        and i.end_date <= current_date + interval '30 days'
        order by i.end_date
        limit 4
        """, rs -> {
      alerts.add(new DashboardAlert(
          rs.getString("id"),
          "INSURANCE",
          "WARNING",
          "Insurance expires soon",
          rs.getString("brand") + " " + rs.getString("model") + " (" + rs.getString("plate_number") + ") expires on " + rs.getDate("end_date"),
          "Review",
          "/maintenance"));
    }, agencyId);

    jdbc.query("""
        select ti.id::text as id, c.brand, c.model, c.plate_number, ti.next_due_date
        from technical_inspections ti
        join cars c on c.id = ti.car_id
        where c.agency_id = ?
        and ti.next_due_date >= current_date
        and ti.next_due_date <= current_date + interval '30 days'
        order by ti.next_due_date
        limit 3
        """, rs -> {
      alerts.add(new DashboardAlert(
          rs.getString("id"),
          "INSPECTION",
          "WARNING",
          "Technical inspection due",
          rs.getString("brand") + " " + rs.getString("model") + " is due on " + rs.getDate("next_due_date"),
          "Schedule",
          "/maintenance"));
    }, agencyId);

    jdbc.query("""
        select m.id::text as id, c.brand, c.model, c.plate_number, m.type, m.due_at
        from maintenance m
        join cars c on c.id = m.car_id
        where c.agency_id = ?
        and m.completed_at is null
        and m.due_at <= current_date
        order by m.due_at
        limit 3
        """, rs -> {
      alerts.add(new DashboardAlert(
          rs.getString("id"),
          "MAINTENANCE",
          "CRITICAL",
          "Maintenance overdue",
          rs.getString("type") + " for " + rs.getString("brand") + " " + rs.getString("model") + " was due on " + rs.getDate("due_at"),
          "Review",
          "/maintenance"));
    }, agencyId);

    jdbc.query("""
        select d.id::text as id, d.amount, d.status, u.full_name
        from deposits d
        join bookings b on b.id = d.booking_id
        join users u on u.id = b.customer_id
        where b.agency_id = ?
        and d.status in ('PENDING', 'BLOCKED')
        order by b.created_at desc
        limit 3
        """, rs -> {
      alerts.add(new DashboardAlert(
          rs.getString("id"),
          "DEPOSIT",
          "BLOCKED".equals(rs.getString("status")) ? "CRITICAL" : "INFO",
          "Deposit needs review",
          rs.getBigDecimal("amount") + " MAD deposit for " + rs.getString("full_name") + " is " + rs.getString("status").toLowerCase(Locale.ROOT),
          "Open",
          "/bookings"));
    }, agencyId);

    jdbc.query("""
        select b.id::text as id, u.full_name, c.brand, c.model, b.return_at
        from bookings b
        join users u on u.id = b.customer_id
        join cars c on c.id = b.car_id
        where b.agency_id = ?
        and b.status = 'ACTIVE'
        and b.return_at >= now()
        and b.return_at <= now() + interval '1 day'
        order by b.return_at
        limit 3
        """, rs -> {
      alerts.add(new DashboardAlert(
          rs.getString("id"),
          "BOOKING",
          "INFO",
          "Return due soon",
          rs.getString("brand") + " " + rs.getString("model") + " from " + rs.getString("full_name") + " returns at " + instantString(rs.getObject("return_at")),
          "Open",
          "/bookings"));
    }, agencyId);

    return alerts.stream().limit(10).toList();
  }

  private List<RecentBooking> recentBookings(UUID agencyId) {
    return jdbc.query("""
        select b.id::text as id, u.full_name, c.brand, c.model, c.plate_number,
               b.pickup_at, b.return_at, b.status::text as status, b.total_amount
        from bookings b
        join users u on u.id = b.customer_id
        join cars c on c.id = b.car_id
        where b.agency_id = ?
        order by b.created_at desc
        limit 8
        """, (rs, rowNum) -> new RecentBooking(
            rs.getString("id"),
            rs.getString("full_name"),
            rs.getString("brand") + " " + rs.getString("model"),
            rs.getString("plate_number"),
            instantString(rs.getObject("pickup_at")),
            instantString(rs.getObject("return_at")),
            rs.getString("status"),
            rs.getBigDecimal("total_amount")), agencyId);
  }

  private String label(YearMonth month) {
    return month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
  }

  private String instantString(Object value) {
    if (value instanceof OffsetDateTime offsetDateTime) {
      return offsetDateTime.toString();
    }
    if (value instanceof Timestamp timestamp) {
      return timestamp.toInstant().toString();
    }
    return String.valueOf(value);
  }

  public record Summary(
      BigDecimal revenueToday,
      BigDecimal revenueThisMonth,
      BigDecimal bookedRevenueThisMonth,
      long activeRentals,
      long availableCars,
      long carsInMaintenance,
      long expiringInsurance,
      long pendingDeposits,
      long customerGrowth) {}

  public record DashboardOverview(
      Summary summary,
      List<TrendPoint> revenueTrend,
      List<FleetStatus> fleetUtilization,
      List<ReservationPoint> monthlyReservations,
      List<DashboardAlert> alerts,
      List<RecentBooking> recentBookings) {}

  public record TrendPoint(String label, BigDecimal paidRevenue, BigDecimal bookedRevenue) {}
  public record FleetStatus(String status, long count) {}
  public record ReservationPoint(String label, long reservations) {}
  public record DashboardAlert(String id, String type, String severity, String title, String description, String actionLabel, String targetPath) {}
  public record RecentBooking(String id, String customerName, String vehicleLabel, String plateNumber, String pickupAt, String returnAt, String status, BigDecimal totalAmount) {}
}

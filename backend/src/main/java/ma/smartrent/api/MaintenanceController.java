package ma.smartrent.api;

import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.UUID;
import ma.smartrent.domain.User;
import ma.smartrent.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {
  private final JdbcTemplate jdbc;
  private final UserRepository users;

  public MaintenanceController(JdbcTemplate jdbc, UserRepository users) {
    this.jdbc = jdbc;
    this.users = users;
  }

  @PatchMapping("/{id}/complete")
  public CompletedMaintenance complete(Principal principal, @PathVariable UUID id, @Valid @RequestBody CompleteMaintenanceRequest request) {
    UUID agencyId = agencyId(principal);
    MaintenanceTarget target = findTarget(id, agencyId);
    if (target.completedAt() != null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Maintenance is already completed");
    }
    jdbc.update("update maintenance set completed_at = current_date where id = ?", id);
    if (request.returnToAvailable()) {
      long activeBookings = count("select count(*) from bookings where car_id = ? and agency_id = ? and status = 'ACTIVE'", target.carId(), agencyId);
      if (activeBookings > 0) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot mark car available while it has an active booking");
      }
      jdbc.update("update cars set status = 'AVAILABLE', updated_at = now() where id = ? and agency_id = ?", target.carId(), agencyId);
    }
    return new CompletedMaintenance(id, target.carId(), LocalDate.now(), request.returnToAvailable());
  }

  private UUID agencyId(Principal principal) {
    User user = users.findByEmail(principal.getName()).orElseThrow();
    if (user.getAgency() == null) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not attached to an agency");
    }
    return user.getAgency().getId();
  }

  private MaintenanceTarget findTarget(UUID maintenanceId, UUID agencyId) {
    var rows = jdbc.query("""
        select m.car_id, m.completed_at
        from maintenance m join cars c on c.id = m.car_id
        where m.id = ? and c.agency_id = ?
        """, (rs, rowNum) -> new MaintenanceTarget(
        rs.getObject("car_id", UUID.class),
        rs.getObject("completed_at", LocalDate.class)), maintenanceId, agencyId);
    if (rows.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance record not found");
    }
    return rows.get(0);
  }

  private long count(String sql, Object... args) {
    Long value = jdbc.queryForObject(sql, Long.class, args);
    return value == null ? 0 : value;
  }

  public record CompleteMaintenanceRequest(boolean returnToAvailable) {}
  public record CompletedMaintenance(UUID id, UUID carId, LocalDate completedAt, boolean returnedToAvailable) {}
  private record MaintenanceTarget(UUID carId, LocalDate completedAt) {}
}

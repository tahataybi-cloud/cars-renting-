package ma.smartrent.repo;

import java.time.OffsetDateTime;
import java.util.UUID;
import ma.smartrent.domain.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
  long countByStatus(Booking.Status status);

  @Query(value = """
      select exists (
        select 1 from bookings b
        where b.car_id = :carId
        and b.status in ('PENDING', 'APPROVED', 'ACTIVE')
        and b.pickup_at < :returnAt
        and b.return_at > :pickupAt
      )
      """, nativeQuery = true)
  boolean hasConflict(UUID carId, OffsetDateTime pickupAt, OffsetDateTime returnAt);
}

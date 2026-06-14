package ma.smartrent.api;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import ma.smartrent.domain.Booking;
import ma.smartrent.repo.AgencyRepository;
import ma.smartrent.repo.BookingRepository;
import ma.smartrent.repo.CarRepository;
import ma.smartrent.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bookings")
public class BookingController {
  private final BookingRepository bookings;
  private final CarRepository cars;
  private final UserRepository users;
  private final AgencyRepository agencies;

  public BookingController(BookingRepository bookings, CarRepository cars, UserRepository users, AgencyRepository agencies) {
    this.bookings = bookings;
    this.cars = cars;
    this.users = users;
    this.agencies = agencies;
  }

  @GetMapping
  public List<Booking> list() {
    return bookings.findAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Booking create(@Valid @RequestBody BookingRequest request) {
    if (bookings.hasConflict(request.carId(), request.pickupAt(), request.returnAt())) {
      throw new IllegalStateException("Vehicle is already booked for the selected dates");
    }
    Booking booking = new Booking();
    booking.setAgency(agencies.findById(request.agencyId()).orElseThrow());
    booking.setCar(cars.findById(request.carId()).orElseThrow());
    booking.setCustomer(users.findById(request.customerId()).orElseThrow());
    booking.setPickupAt(request.pickupAt());
    booking.setReturnAt(request.returnAt());
    booking.setDailyRate(request.dailyRate());
    booking.setTotalAmount(request.totalAmount());
    return bookings.save(booking);
  }

  public record BookingRequest(UUID agencyId, UUID carId, UUID customerId, OffsetDateTime pickupAt, OffsetDateTime returnAt, BigDecimal dailyRate, BigDecimal totalAmount) {}
}

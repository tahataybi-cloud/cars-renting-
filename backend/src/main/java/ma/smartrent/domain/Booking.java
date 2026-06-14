package ma.smartrent.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Entity
@Table(name = "bookings")
public class Booking extends BaseEntity {
  public enum Status { PENDING, APPROVED, CANCELLED, ACTIVE, COMPLETED, NO_SHOW }

  @ManyToOne(optional = false)
  @JoinColumn(name = "car_id")
  private Car car;

  @ManyToOne(optional = false)
  @JoinColumn(name = "customer_id")
  private User customer;

  @Enumerated(EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private Status status = Status.PENDING;

  @Column(name = "pickup_at")
  private OffsetDateTime pickupAt;

  @Column(name = "return_at")
  private OffsetDateTime returnAt;

  @Column(name = "daily_rate")
  private BigDecimal dailyRate;

  @Column(name = "total_amount")
  private BigDecimal totalAmount;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "agency_id")
  @JsonIgnore
  private Agency agency;

  public Car getCar() { return car; }
  public void setCar(Car car) { this.car = car; }
  public User getCustomer() { return customer; }
  public void setCustomer(User customer) { this.customer = customer; }
  public Status getStatus() { return status; }
  public void setStatus(Status status) { this.status = status; }
  public OffsetDateTime getPickupAt() { return pickupAt; }
  public void setPickupAt(OffsetDateTime pickupAt) { this.pickupAt = pickupAt; }
  public OffsetDateTime getReturnAt() { return returnAt; }
  public void setReturnAt(OffsetDateTime returnAt) { this.returnAt = returnAt; }
  public BigDecimal getDailyRate() { return dailyRate; }
  public void setDailyRate(BigDecimal dailyRate) { this.dailyRate = dailyRate; }
  public BigDecimal getTotalAmount() { return totalAmount; }
  public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
  public Agency getAgency() { return agency; }
  public void setAgency(Agency agency) { this.agency = agency; }
}

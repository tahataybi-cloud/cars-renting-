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
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Entity
@Table(name = "cars")
public class Car extends BaseEntity {
  public enum Status { AVAILABLE, RESERVED, RENTED, MAINTENANCE, OUT_OF_SERVICE }
  public enum FuelType { DIESEL, PETROL, HYBRID, ELECTRIC }
  public enum Transmission { MANUAL, AUTOMATIC }

  private String brand;
  private String model;
  private int year;
  private int mileage;

  @Enumerated(EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  @Column(name = "fuel_type")
  private FuelType fuelType;

  @Enumerated(EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private Transmission transmission;

  @Column(name = "plate_number", unique = true)
  private String plateNumber;

  @Enumerated(EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private Status status = Status.AVAILABLE;

  @Column(name = "daily_rate")
  private BigDecimal dailyRate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "agency_id")
  @JsonIgnore
  private Agency agency;

  public String getBrand() { return brand; }
  public void setBrand(String brand) { this.brand = brand; }
  public String getModel() { return model; }
  public void setModel(String model) { this.model = model; }
  public int getYear() { return year; }
  public void setYear(int year) { this.year = year; }
  public int getMileage() { return mileage; }
  public void setMileage(int mileage) { this.mileage = mileage; }
  public FuelType getFuelType() { return fuelType; }
  public void setFuelType(FuelType fuelType) { this.fuelType = fuelType; }
  public Transmission getTransmission() { return transmission; }
  public void setTransmission(Transmission transmission) { this.transmission = transmission; }
  public String getPlateNumber() { return plateNumber; }
  public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }
  public Status getStatus() { return status; }
  public void setStatus(Status status) { this.status = status; }
  public BigDecimal getDailyRate() { return dailyRate; }
  public void setDailyRate(BigDecimal dailyRate) { this.dailyRate = dailyRate; }
  public Agency getAgency() { return agency; }
  public void setAgency(Agency agency) { this.agency = agency; }
}

package ma.smartrent.repo;

import java.util.UUID;
import ma.smartrent.domain.Car;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, UUID> {
  long countByStatus(Car.Status status);
}


package ma.smartrent.repo;

import java.util.UUID;
import ma.smartrent.domain.Agency;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgencyRepository extends JpaRepository<Agency, UUID> {}


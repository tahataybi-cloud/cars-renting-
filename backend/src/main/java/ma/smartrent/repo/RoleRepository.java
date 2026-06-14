package ma.smartrent.repo;

import java.util.Optional;
import java.util.UUID;
import ma.smartrent.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, UUID> {
  Optional<Role> findByName(String name);
}


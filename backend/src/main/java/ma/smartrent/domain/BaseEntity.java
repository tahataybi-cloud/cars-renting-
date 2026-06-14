package ma.smartrent.domain;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@MappedSuperclass
public abstract class BaseEntity {
  @Id
  @UuidGenerator
  private UUID id;

  public UUID getId() {
    return id;
  }
}


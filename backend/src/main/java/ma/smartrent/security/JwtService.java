package ma.smartrent.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import ma.smartrent.domain.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final byte[] secret;
  private final long accessTtlMinutes;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.access-ttl-minutes}") long accessTtlMinutes) {
    this.secret = secret.getBytes(StandardCharsets.UTF_8);
    this.accessTtlMinutes = accessTtlMinutes;
  }

  public String issueAccessToken(User user) {
    Instant now = Instant.now();
    List<String> roles = user.getRoles().stream().map(role -> role.getName()).toList();
    return Jwts.builder()
        .subject(user.getEmail())
        .claim("uid", user.getId().toString())
        .claim("roles", roles)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(accessTtlMinutes * 60)))
        .signWith(Keys.hmacShaKeyFor(secret))
        .compact();
  }

  public String subject(String token) {
    return Jwts.parser()
        .verifyWith(Keys.hmacShaKeyFor(secret))
        .build()
        .parseSignedClaims(token)
        .getPayload()
        .getSubject();
  }
}


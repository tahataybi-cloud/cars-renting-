package ma.smartrent.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import ma.smartrent.domain.Agency;
import ma.smartrent.domain.User;
import ma.smartrent.repo.AgencyRepository;
import ma.smartrent.repo.RoleRepository;
import ma.smartrent.repo.UserRepository;
import ma.smartrent.security.JwtService;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UserRepository users;
  private final RoleRepository roles;
  private final AgencyRepository agencies;
  private final PasswordEncoder encoder;

  public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserRepository users, RoleRepository roles, AgencyRepository agencies, PasswordEncoder encoder) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.users = users;
    this.roles = roles;
    this.agencies = agencies;
    this.encoder = encoder;
  }

  @PostMapping("/register")
  public TokenResponse register(@Valid @RequestBody RegisterRequest request) {
    if (users.existsByEmail(request.email())) {
      throw new IllegalArgumentException("Email already registered");
    }
    User user = new User();
    Agency agency = new Agency();
    agency.setName(request.agencyName());
    agency.setCity(request.city());
    agencies.save(agency);
    user.setFullName(request.fullName());
    user.setEmail(request.email());
    user.setPhone(request.phone());
    user.setPasswordHash(encoder.encode(request.password()));
    user.setAgency(agency);
    user.getRoles().add(roles.findByName("AGENCY_OWNER").orElseThrow());
    users.save(user);
    return new TokenResponse(jwtService.issueAccessToken(user), "Bearer");
  }

  @PostMapping("/login")
  public TokenResponse login(@Valid @RequestBody LoginRequest request) {
    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
    User user = users.findByEmail(request.email()).orElseThrow();
    return new TokenResponse(jwtService.issueAccessToken(user), "Bearer");
  }

  @GetMapping("/me")
  public MeResponse me(Principal principal) {
    User user = users.findByEmail(principal.getName()).orElseThrow();
    return new MeResponse(
        user.getId(),
        user.getAgency() == null ? null : user.getAgency().getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRoles().stream().map(role -> role.getName()).toList());
  }

  public record RegisterRequest(@NotBlank String fullName, @Email String email, String phone, @NotBlank String password, @NotBlank String agencyName, @NotBlank String city) {}
  public record LoginRequest(@Email String email, @NotBlank String password) {}
  public record TokenResponse(String accessToken, String tokenType) {}
  public record MeResponse(UUID userId, UUID agencyId, String fullName, String email, List<String> roles) {}
}

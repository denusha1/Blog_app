package com.blogapp.auth;

import com.blogapp.user.UserDto;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) { return auth.register(request); }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) { return auth.login(request); }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public UserDto me(@AuthenticationPrincipal UserDetails principal) { return auth.me(principal.getUsername()); }

    @PutMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public AuthDtos.AuthResponse update(@AuthenticationPrincipal UserDetails principal,
                                        @Valid @RequestBody AuthDtos.UpdateProfileRequest request) {
        return auth.updateProfile(principal.getUsername(), request);
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "bearerAuth")
    public Map<String, String> changePassword(@AuthenticationPrincipal UserDetails principal,
                                               @Valid @RequestBody AuthDtos.ChangePasswordRequest request) {
        auth.changePassword(principal.getUsername(), request);
        return Map.of("message", "Password updated");
    }

    @DeleteMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public Map<String, String> delete(@AuthenticationPrincipal UserDetails principal) {
        auth.deleteAccount(principal.getUsername());
        return Map.of("message", "Account deleted");
    }
}

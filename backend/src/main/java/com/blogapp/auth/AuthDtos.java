package com.blogapp.auth;

import com.blogapp.user.UserDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}
    public record RegisterRequest(@NotBlank @Size(min=3, max=50) String username,
                                  @NotBlank @Email String email,
                                  @NotBlank @Size(min=8, max=100) String password) {}
    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record UpdateProfileRequest(@NotBlank @Size(min=3, max=50) String username,
                                       @NotBlank @Email String email,
                                       @Size(max=500) String bio,@Size(max=1000) String avatarUrl,
                                       @Size(max=300) String websiteUrl,@Size(max=300) String socialLinks) {}
    public record ChangePasswordRequest(@NotBlank String currentPassword,
                                        @NotBlank @Size(min=8, max=100) String newPassword) {}
    public record AuthResponse(String token, UserDto user) {}
}

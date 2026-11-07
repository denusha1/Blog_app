package com.blogapp.user;

import java.time.Instant;

public record UserDto(Long id, String username, String email, String role, Instant createdAt) {
    public static UserDto from(AppUser user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}

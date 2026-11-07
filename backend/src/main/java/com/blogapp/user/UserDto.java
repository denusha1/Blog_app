package com.blogapp.user;

import java.time.Instant;

public record UserDto(Long id, String username, String email, String role, boolean enabled, Instant createdAt,
                      String bio,String avatarUrl,String websiteUrl,String socialLinks) {
    public static UserDto from(AppUser user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),user.isEnabled(), user.getCreatedAt(),
                user.getBio(),user.getAvatarUrl(),user.getWebsiteUrl(),user.getSocialLinks());
    }
}

package com.blogapp.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.blogapp.post.PostRepository;
import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository users;
    @Mock PostRepository posts;
    @Mock PasswordEncoder passwords;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwt;
    @InjectMocks AuthService service;

    @Test
    void registerHashesPasswordAndReturnsToken() {
        when(users.existsByUsernameIgnoreCase("writer")).thenReturn(false);
        when(users.existsByEmailIgnoreCase("writer@example.com")).thenReturn(false);
        when(passwords.encode("GoodPass1")).thenReturn("hashed");
        when(users.save(any(AppUser.class))).thenAnswer(call -> call.getArgument(0));
        when(jwt.issue("writer")).thenReturn("signed-token");

        AuthDtos.AuthResponse result = service.register(new AuthDtos.RegisterRequest("writer", "writer@example.com", "GoodPass1"));

        assertThat(result.token()).isEqualTo("signed-token");
        assertThat(result.user().email()).isEqualTo("writer@example.com");
        verify(passwords).encode("GoodPass1");
    }
}

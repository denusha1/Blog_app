package com.blogapp.auth;

import com.blogapp.common.ApiException;
import com.blogapp.post.PostRepository;
import com.blogapp.security.AppUserDetailsService;
import com.blogapp.user.AppUser;
import com.blogapp.user.UserDto;
import com.blogapp.user.UserRepository;
import java.util.List;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.net.URI;

@Service
public class AuthService {
    private final UserRepository users;
    private final PostRepository posts;
    private final PasswordEncoder passwords;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwt;

    public AuthService(UserRepository users, PostRepository posts, PasswordEncoder passwords,
                       AuthenticationManager authenticationManager, JwtService jwt) {
        this.users = users;
        this.posts = posts;
        this.passwords = passwords;
        this.authenticationManager = authenticationManager;
        this.jwt = jwt;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        if (!username.matches("[A-Za-z0-9_]+")) throw ApiException.badRequest("Username may contain letters, numbers, and underscores only");
        if (request.password().length() < 8 || !request.password().matches(".*[A-Z].*") ||
                !request.password().matches(".*[a-z].*") || !request.password().matches(".*[0-9].*")) {
            throw ApiException.badRequest("Password needs 8 characters, an uppercase letter, a lowercase letter, and a number");
        }
        if (users.existsByUsernameIgnoreCase(username) || users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("Username or email is already registered");
        }
        AppUser user = users.save(new AppUser(username, email, passwords.encode(request.password())));
        return new AuthDtos.AuthResponse(jwt.issue(user.getUsername()), UserDto.from(user));
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        AppUser user = users.findByUsernameIgnoreCase(request.username())
                .or(() -> users.findByEmailIgnoreCase(request.username()))
                .orElseThrow(() -> ApiException.unauthorized("Account not found"));
        return new AuthDtos.AuthResponse(jwt.issue(user.getUsername()), UserDto.from(user));
    }

    public UserDto me(String username) { return UserDto.from(findUser(username)); }

    @Transactional
    public AuthDtos.AuthResponse updateProfile(String currentUsername, AuthDtos.UpdateProfileRequest request) {
        AppUser user = findUser(currentUsername);
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        if (!username.matches("[A-Za-z0-9_]+")) throw ApiException.badRequest("Username may contain letters, numbers, and underscores only");
        users.findByUsernameIgnoreCase(username).filter(other -> !other.getId().equals(user.getId()))
                .ifPresent(other -> { throw ApiException.conflict("Username is already in use"); });
        users.findByEmailIgnoreCase(email).filter(other -> !other.getId().equals(user.getId()))
                .ifPresent(other -> { throw ApiException.conflict("Email is already in use"); });
        validateUrl(request.avatarUrl(),"Profile picture"); validateUrl(request.websiteUrl(),"Website"); validateUrls(request.socialLinks(),"Social links");
        user.setUsername(username);
        user.setEmail(email);
        user.setBio(clean(request.bio())); user.setAvatarUrl(clean(request.avatarUrl()));
        user.setWebsiteUrl(clean(request.websiteUrl())); user.setSocialLinks(clean(request.socialLinks()));
        return new AuthDtos.AuthResponse(jwt.issue(user.getUsername()), UserDto.from(user));
    }

    @Transactional
    public void changePassword(String username, AuthDtos.ChangePasswordRequest request) {
        AppUser user = findUser(username);
        if (!passwords.matches(request.currentPassword(), user.getPassword())) throw ApiException.badRequest("Current password is incorrect");
        String next = request.newPassword();
        if (!next.matches(".*[A-Z].*") || !next.matches(".*[a-z].*") || !next.matches(".*[0-9].*")) {
            throw ApiException.badRequest("New password needs an uppercase letter, a lowercase letter, and a number");
        }
        user.setPassword(passwords.encode(next));
    }

    @Transactional
    public void deleteAccount(String username) {
        AppUser user = findUser(username);
        posts.deleteByAuthorId(user.getId());
        users.delete(user);
    }

    private AppUser findUser(String username) {
        return users.findByUsernameIgnoreCase(username).orElseThrow(() -> ApiException.notFound("Account not found"));
    }
    private String clean(String value){return value==null||value.isBlank()?null:value.trim();}
    private void validateUrls(String value,String label){if(value==null||value.isBlank())return;for(String url:value.split(","))validateUrl(url,label);}
    private void validateUrl(String value,String label){if(value==null||value.isBlank())return;try{URI uri=URI.create(value.trim());if(!List.of("https","http").contains(uri.getScheme())||uri.getHost()==null)throw new IllegalArgumentException();}catch(RuntimeException ex){throw ApiException.badRequest(label+" must be a valid http or https URL");}}
}

package com.blogapp.security;

import com.blogapp.user.AppUser;
import com.blogapp.user.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public AppUserDetailsService(UserRepository users) { this.users = users; }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        AppUser user = users.findByUsernameIgnoreCase(login).or(() -> users.findByEmailIgnoreCase(login))
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
        return User.withUsername(user.getUsername()).password(user.getPassword()).roles(user.getRole()).disabled(!user.isEnabled()).build();
    }
}

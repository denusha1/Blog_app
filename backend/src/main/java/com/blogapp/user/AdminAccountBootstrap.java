package com.blogapp.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminAccountBootstrap implements ApplicationRunner {
    private final UserRepository users;private final String adminEmail;
    public AdminAccountBootstrap(UserRepository users,@Value("${app.admin.email:}") String adminEmail){this.users=users;this.adminEmail=adminEmail;}
    @Override @Transactional public void run(ApplicationArguments args){
        if(adminEmail==null||adminEmail.isBlank())return;
        users.findByEmailIgnoreCase(adminEmail.trim()).ifPresent(user->{if(!user.getRole().equals("ADMIN"))user.setRole("ADMIN");});
    }
}

package com.vehiclerental.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.vehiclerental.service.AuthService;

@Component
public class AuthInitializer implements CommandLineRunner {

    private final AuthService authService;

    public AuthInitializer(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void run(String... args) {
        authService.seedAdminIfMissing();
        authService.seedDemoCustomersIfMissing();
    }
}
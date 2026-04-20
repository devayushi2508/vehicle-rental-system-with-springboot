package com.vehiclerental.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vehiclerental.dto.AuthResponse;
import com.vehiclerental.dto.LoginRequest;
import com.vehiclerental.dto.RegisterRequest;
import com.vehiclerental.exception.BusinessException;
import com.vehiclerental.model.AppUser;
import com.vehiclerental.model.Customer;
import com.vehiclerental.repository.AppUserRepository;
import com.vehiclerental.repository.CustomerRepository;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AppUserRepository appUserRepository, CustomerRepository customerRepository) {
        this.appUserRepository = appUserRepository;
        this.customerRepository = customerRepository;
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("Invalid email or password");
        }

        return new AuthResponse(user.getName(), user.getEmail(), user.getPhone(), user.getRole(), user.getCustomerId());
    }

    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new BusinessException("Email already registered");
        }

        Customer customer = new Customer();
        customer.setId(nextCustomerId());
        customer.setName(request.getName());
        customerRepository.save(customer);

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("CUSTOMER");
        user.setCustomerId(customer.getId());

        AppUser savedUser = appUserRepository.save(user);
        return new AuthResponse(savedUser.getName(), savedUser.getEmail(), savedUser.getPhone(), savedUser.getRole(), savedUser.getCustomerId());
    }

    public void seedAdminIfMissing() {
        if (appUserRepository.findByEmailIgnoreCase("admin@rentall.com").isPresent()) {
            return;
        }

        AppUser admin = new AppUser();
        admin.setName("Admin");
        admin.setEmail("admin@rentall.com");
        admin.setPhone("9999999999");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        admin.setCustomerId(null);
        appUserRepository.save(admin);
    }

    public void seedDemoCustomersIfMissing() {
        seedCustomerIfMissing("Ayush", "user@rentall.com", "8888888888", "user123", 1);
        seedCustomerIfMissing("Rahul", "rahul@rentall.com", "7777777777", "rahul123", 2);
    }

    private void seedCustomerIfMissing(String name, String email, String phone, String password, int customerId) {
        if (appUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }

        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("CUSTOMER");
        user.setCustomerId(customerId);
        appUserRepository.save(user);
    }

    private int nextCustomerId() {
        return customerRepository.findTopByOrderByIdDesc()
                .map(Customer::getId)
                .orElse(0) + 1;
    }
}
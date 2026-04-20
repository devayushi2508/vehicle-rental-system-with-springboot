package com.vehiclerental.dto;

public class AuthResponse {

    private String name;
    private String email;
    private String phone;
    private String role;
    private Integer customerId;

    public AuthResponse() {
    }

    public AuthResponse(String name, String email, String phone, String role, Integer customerId) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.customerId = customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }
}
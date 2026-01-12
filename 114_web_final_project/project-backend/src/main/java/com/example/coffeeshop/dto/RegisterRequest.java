package com.example.coffeeshop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for user registration.  
 */
public class RegisterRequest {
    @Email
    @NotBlank
    private String email;
    @NotBlank
    @Size(min = 6, max = 50)
    private String password;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
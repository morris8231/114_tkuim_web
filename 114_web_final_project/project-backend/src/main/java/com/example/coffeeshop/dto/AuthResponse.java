package com.example.coffeeshop.dto;

/**
 * Response returned after successful authentication.  
 * Contains a JWT token that should be sent in subsequent requests.
 */
public class AuthResponse {
    private String token;

    public AuthResponse() {
    }

    public AuthResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
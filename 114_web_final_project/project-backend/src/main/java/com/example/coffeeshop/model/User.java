package com.example.coffeeshop.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a platform user.  
 * Each user has an email/password for authentication and a role to determine permissions.
 */
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String password;
    private Role role;

    public enum Role {
        GUEST,
        MEMBER,
        ADMIN,
        OWNER
    }

    public User() {
    }

    public User(String email, String password, Role role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
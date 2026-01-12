package com.example.coffeeshop.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for adding a tag to a cafe.  
 */
public class TagRequest {
    @NotBlank
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
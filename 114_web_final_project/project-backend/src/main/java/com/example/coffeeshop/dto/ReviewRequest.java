package com.example.coffeeshop.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for adding a review to a cafe.  
 */
public class ReviewRequest {
    @Min(0)
    @Max(5)
    private double rating;
    @NotBlank
    private String comment;

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
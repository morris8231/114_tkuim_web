package com.example.coffeeshop.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    private String cafeId;
    private String userId;
    private String userEmail;
    private int rating; // 1-5
    private String comment;
    private List<String> imageUrls = new ArrayList<>();

    @CreatedDate
    private Date createdAt;

    public Review() {
    }

    public Review(String cafeId, String userId, String userEmail, int rating, String comment) {
        this.cafeId = cafeId;
        this.userId = userId;
        this.userEmail = userEmail;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = new Date(); // Fallback if @CreatedDate doesn't trigger automatically logic without config
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCafeId() {
        return cafeId;
    }

    public void setCafeId(String cafeId) {
        this.cafeId = cafeId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
package com.example.coffeeshop.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a user's favourite cafe.  
 * Favourites allow members to bookmark places for quick access.
 */
@Document(collection = "favorites")
public class Favorite {
    @Id
    private String id;
    private String userId;
    private String cafeId;

    public Favorite() {
    }

    public Favorite(String userId, String cafeId) {
        this.userId = userId;
        this.cafeId = cafeId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCafeId() {
        return cafeId;
    }

    public void setCafeId(String cafeId) {
        this.cafeId = cafeId;
    }
}
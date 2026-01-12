package com.example.coffeeshop.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a photo uploaded by a user to illustrate a cafe.  
 * Votes on photos are used to determine which image represents the cafe.
 */
@Document(collection = "photos")
public class Photo {
    @Id
    private String id;
    private String cafeId;
    private String userId;
    private String url;
    private int votes;

    public Photo() {
    }

    public Photo(String cafeId, String userId, String url) {
        this.cafeId = cafeId;
        this.userId = userId;
        this.url = url;
        this.votes = 0;
    }

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

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getVotes() {
        return votes;
    }

    public void setVotes(int votes) {
        this.votes = votes;
    }

    public void incrementVotes() {
        this.votes++;
    }
}
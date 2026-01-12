package com.example.coffeeshop.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a coffee shop on the platform.
 * Cafes are created by members or administrators and hold descriptive
 * metadata such as geolocation, tags and a human‑readable description.
 */
@Document(collection = "cafes")
public class Cafe {
    @Id
    private String id;
    private String name;
    private String description;
    private String address;
    private double latitude;
    private double longitude;
    // Tags are stored as simple strings for flexibility.
    // Weighted voting and relationships are handled at the service layer.
    private List<String> tags = new ArrayList<>();

    // Image URLs for the cafe
    private List<String> imageUrls = new ArrayList<>();

    // Additional info (for Google API integration)
    private String openingHours;
    private String menuUrl;
    private String phoneNumber;

    public Cafe() {
    }

    public Cafe(String name, String description, String address, double latitude, double longitude) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public String getOpeningHours() {
        return openingHours;
    }

    public void setOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }

    public String getMenuUrl() {
        return menuUrl;
    }

    public void setMenuUrl(String menuUrl) {
        this.menuUrl = menuUrl;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
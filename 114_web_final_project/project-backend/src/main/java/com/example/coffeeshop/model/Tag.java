package com.example.coffeeshop.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a descriptive tag that can be applied to cafes.  
 * Tags allow users to search by context or mood instead of numerical ratings.
 */
@Document(collection = "tags")
public class Tag {
    @Id
    private String id;
    private String name;
    private int weight;

    public Tag() {
    }

    public Tag(String name) {
        this.name = name;
        this.weight = 0;
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

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public void incrementWeight() {
        this.weight++;
    }
}
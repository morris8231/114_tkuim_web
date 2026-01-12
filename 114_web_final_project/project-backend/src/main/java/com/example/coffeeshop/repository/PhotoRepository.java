package com.example.coffeeshop.repository;

import com.example.coffeeshop.model.Photo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for photo metadata.  
 * Allows looking up photos by cafe or user.
 */
@Repository
public interface PhotoRepository extends MongoRepository<Photo, String> {
    List<Photo> findByCafeId(String cafeId);
    List<Photo> findByUserId(String userId);
}
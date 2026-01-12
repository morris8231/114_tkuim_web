package com.example.coffeeshop.repository;

import com.example.coffeeshop.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for tags.  
 * Used to persist and query tags applied to cafes.
 */
@Repository
public interface TagRepository extends MongoRepository<Tag, String> {
    Optional<Tag> findByName(String name);
}
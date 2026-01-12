package com.example.coffeeshop.repository;

import com.example.coffeeshop.model.Cafe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for persisting cafes.  
 * Additional query methods can be added as needed.
 */
@Repository
public interface CafeRepository extends MongoRepository<Cafe, String> {
}
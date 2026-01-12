package com.example.coffeeshop.repository;

import com.example.coffeeshop.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for accessing user data from MongoDB.  
 * Provides a method to look up users by email address for authentication.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}
package com.example.coffeeshop.repository;

import com.example.coffeeshop.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for favourites bookmarked by users.  
 * Provides convenient methods to look up favourites by user or cafe.
 */
@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    List<Favorite> findByUserId(String userId);
    List<Favorite> findByCafeId(String cafeId);
}
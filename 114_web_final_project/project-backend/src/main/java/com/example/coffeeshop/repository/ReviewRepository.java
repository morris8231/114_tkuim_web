package com.example.coffeeshop.repository;

import com.example.coffeeshop.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByCafeId(String cafeId);
}
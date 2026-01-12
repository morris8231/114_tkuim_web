package com.example.coffeeshop.service;

import com.example.coffeeshop.model.Review;
import com.example.coffeeshop.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Handles creation and retrieval of reviews.  
 * Additional logic such as anti‑spam measures can be added here later.
 */
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review addReview(Review review) {
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByCafe(String cafeId) {
        return reviewRepository.findByCafeId(cafeId);
    }
}
package com.example.coffeeshop.controller;

import com.example.coffeeshop.dto.ReviewRequest;
import com.example.coffeeshop.model.Review;
import com.example.coffeeshop.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for cafe reviews.
 * Provides endpoints to list and create reviews for a cafe.
 */
@RestController
@RequestMapping("/api/cafes/{cafeId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<Review> listReviews(@PathVariable String cafeId) {
        return reviewService.getReviewsByCafe(cafeId);
    }

    @PostMapping
    public ResponseEntity<Review> addReview(@PathVariable String cafeId,
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        // The authenticated user is available via Principal; they must be logged in to
        // add a review.
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Extract the user id from the authentication principal. The
        // JwtAuthenticationFilter
        // stores the full User object as the principal, so we downcast as needed.
        String userId;
        String userEmail = "Anonymous";
        Object principalObj = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        if (principalObj instanceof com.example.coffeeshop.model.User user) {
            userId = user.getId();
            userEmail = user.getEmail();
        } else {
            userId = principal.getName();
        }
        Review review = new Review(cafeId, userId, userEmail, (int) request.getRating(), request.getComment());
        Review saved = reviewService.addReview(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
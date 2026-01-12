package com.example.coffeeshop.controller;

import com.example.coffeeshop.dto.TagRequest;
import com.example.coffeeshop.model.Cafe;
import com.example.coffeeshop.model.Tag;
import com.example.coffeeshop.service.TagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for tag‑related operations.  
 * Allows adding tags to cafes and listing available tags.
 */
@RestController
@RequestMapping("/api")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping("/tags")
    public List<Tag> listTags() {
        return tagService.listAllTags();
    }

    @PostMapping("/cafes/{cafeId}/tags")
    public ResponseEntity<Cafe> addTag(@PathVariable String cafeId, @Valid @RequestBody TagRequest request) {
        try {
            Cafe cafe = tagService.addTagToCafe(cafeId, request.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(cafe);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
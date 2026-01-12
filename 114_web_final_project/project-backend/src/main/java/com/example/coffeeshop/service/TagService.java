package com.example.coffeeshop.service;

import com.example.coffeeshop.model.Cafe;
import com.example.coffeeshop.model.Tag;
import com.example.coffeeshop.repository.CafeRepository;
import com.example.coffeeshop.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Handles creation and association of tags with cafes.  
 * Tags are persisted separately and can be applied to multiple cafes.
 */
@Service
public class TagService {

    private final TagRepository tagRepository;
    private final CafeRepository cafeRepository;

    public TagService(TagRepository tagRepository, CafeRepository cafeRepository) {
        this.tagRepository = tagRepository;
        this.cafeRepository = cafeRepository;
    }

    /**
     * Returns all tags in the database.  
     * Useful for populating tag pickers on the client side.
     */
    public List<Tag> listAllTags() {
        return tagRepository.findAll();
    }

    /**
     * Adds a new tag to a cafe.  If the tag does not exist it is created.  
     * The tag name is normalized to lower case to avoid duplicates by case.
     */
    public Cafe addTagToCafe(String cafeId, String tagName) {
        Optional<Cafe> optionalCafe = cafeRepository.findById(cafeId);
        if (optionalCafe.isEmpty()) {
            throw new IllegalArgumentException("Cafe not found");
        }
        Cafe cafe = optionalCafe.get();
        String normalized = tagName.trim().toLowerCase();
        if (!cafe.getTags().contains(normalized)) {
            cafe.getTags().add(normalized);
        }
        // Persist cafe changes
        cafeRepository.save(cafe);
        // Ensure tag exists
        Tag tag = tagRepository.findByName(normalized).orElseGet(() -> {
            Tag t = new Tag(normalized);
            return tagRepository.save(t);
        });
        // Increase the weight to reflect another usage of the tag
        tag.incrementWeight();
        tagRepository.save(tag);
        return cafe;
    }
}
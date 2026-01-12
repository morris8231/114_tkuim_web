package com.example.coffeeshop.controller;

import com.example.coffeeshop.model.Cafe;
import com.example.coffeeshop.service.CafeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cafes")
public class CafeController {

    @Autowired
    private com.example.coffeeshop.service.CafeService cafeService;

    @GetMapping
    public List<Cafe> getAllCafes() {
        return cafeService.getAllCafes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cafe> getCafeById(@PathVariable String id) {
        Cafe cafe = cafeService.getCafeById(id);
        if (cafe != null) {
            return ResponseEntity.ok(cafe);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Cafe> createCafe(@RequestBody Cafe cafe) {
        Cafe created = cafeService.createCafe(cafe);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
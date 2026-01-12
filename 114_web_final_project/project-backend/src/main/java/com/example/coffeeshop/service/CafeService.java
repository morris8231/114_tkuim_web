package com.example.coffeeshop.service;

import com.example.coffeeshop.model.Cafe;
import com.example.coffeeshop.repository.CafeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CafeService {

    private final CafeRepository cafeRepository;

    public CafeService(CafeRepository cafeRepository) {
        this.cafeRepository = cafeRepository;
    }

    public List<Cafe> getAllCafes() {
        return cafeRepository.findAll();
    }

    public Cafe createCafe(Cafe cafe) {
        return cafeRepository.save(cafe);
    }

    public Cafe getCafeById(String id) {
        return cafeRepository.findById(id).orElse(null);
    }
}
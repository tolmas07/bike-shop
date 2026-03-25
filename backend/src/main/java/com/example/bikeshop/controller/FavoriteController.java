package com.example.bikeshop.controller;

import com.example.bikeshop.entity.Favorite;
import com.example.bikeshop.repository.FavoriteRepository;
import com.example.bikeshop.repository.ProductRepository;
import com.example.bikeshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Autowired
    public FavoriteController(FavoriteRepository favoriteRepository, ProductRepository productRepository,
            UserRepository userRepository) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public List<Favorite> getFavorites(@PathVariable Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    @PostMapping("/add")
    public Favorite addFavorite(@RequestParam Long userId, @RequestParam Long productId) {
        Favorite existing = favoriteRepository.findByUserIdAndProductId(userId, productId);
        if (existing != null)
            return existing;

        Favorite favorite = new Favorite();
        favorite.setUser(userRepository.findById(userId).orElseThrow());
        favorite.setProduct(productRepository.findById(productId).orElseThrow());
        return favoriteRepository.save(favorite);
    }

    @DeleteMapping("/remove")
    @org.springframework.transaction.annotation.Transactional
    public void removeFavorite(@RequestParam Long userId, @RequestParam Long productId) {
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }
}

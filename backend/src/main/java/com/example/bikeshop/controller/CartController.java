package com.example.bikeshop.controller;

import com.example.bikeshop.entity.CartItem;
import com.example.bikeshop.repository.CartRepository;
import com.example.bikeshop.repository.ProductRepository;
import com.example.bikeshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Autowired
    public CartController(CartRepository cartRepository, ProductRepository productRepository,
            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public List<CartItem> getCart(@PathVariable Long userId) {
        return cartRepository.findByUserId(userId);
    }

    @PostMapping("/add")
    public CartItem addToCart(@RequestParam Long userId, @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        CartItem existing = cartRepository.findByUserIdAndProductId(userId, productId);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            return cartRepository.save(existing);
        }
        CartItem cartItem = new CartItem();
        cartItem.setUser(userRepository.findById(userId).orElseThrow());
        cartItem.setProduct(productRepository.findById(productId).orElseThrow());
        cartItem.setQuantity(quantity);
        return cartRepository.save(cartItem);
    }

    @DeleteMapping("/remove/{id}")
    public void removeFromCart(@PathVariable Long id) {
        cartRepository.deleteById(id);
    }

    @DeleteMapping("/clear/{userId}")
    public void clearCart(@PathVariable Long userId) {
        cartRepository.deleteByUserId(userId);
    }
}

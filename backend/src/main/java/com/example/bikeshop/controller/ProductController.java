package com.example.bikeshop.controller;

import com.example.bikeshop.entity.Product;
import com.example.bikeshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "${ALLOWED_ORIGINS:http://localhost:5173}", allowCredentials = "true")
public class ProductController {

    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ProductController(ProductRepository productRepository, SimpMessagingTemplate messagingTemplate) {
        this.productRepository = productRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePublic())
                .body(products);
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        notifyClients();
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        return productRepository.findById(id).map(product -> {
            product.setName(updatedProduct.getName());
            product.setDescription(updatedProduct.getDescription());
            product.setPrice(updatedProduct.getPrice());
            product.setCategory(updatedProduct.getCategory());
            product.setImageUrl(updatedProduct.getImageUrl());
            product.setStock(updatedProduct.getStock());
            Product saved = productRepository.save(product);
            notifyClients();
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        notifyClients();
        return ResponseEntity.ok().build();
    }

    private void notifyClients() {
        messagingTemplate.convertAndSend("/topic/products", "updated");
    }
}

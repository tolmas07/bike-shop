package com.example.bikeshop.repository;

import com.example.bikeshop.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);

    CartItem findByUserIdAndProductId(Long userId, Long productId);

    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
}

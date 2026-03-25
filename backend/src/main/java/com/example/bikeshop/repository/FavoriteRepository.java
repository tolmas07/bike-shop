package com.example.bikeshop.repository;

import com.example.bikeshop.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);

    Favorite findByUserIdAndProductId(Long userId, Long productId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM favorites WHERE user_id = :userId AND product_id = :productId", nativeQuery = true)
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}

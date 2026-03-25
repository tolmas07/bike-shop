package com.example.bikeshop.repository;

import com.example.bikeshop.entity.BankCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BankCardRepository extends JpaRepository<BankCard, Long> {
    List<BankCard> findByUserId(Long userId);
}

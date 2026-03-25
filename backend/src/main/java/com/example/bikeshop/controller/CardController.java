package com.example.bikeshop.controller;

import com.example.bikeshop.entity.BankCard;
import com.example.bikeshop.entity.User;
import com.example.bikeshop.repository.BankCardRepository;
import com.example.bikeshop.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CardController {

    private final BankCardRepository bankCardRepository;
    private final UserRepository userRepository;

    public CardController(BankCardRepository bankCardRepository, UserRepository userRepository) {
        this.bankCardRepository = bankCardRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public List<BankCard> getUserCards(@PathVariable Long userId) {
        return bankCardRepository.findByUserId(userId);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCard(@RequestParam Long userId, @RequestBody BankCard card) {
        User user = userRepository.findById(userId).orElseThrow();
        card.setUser(user);
        return ResponseEntity.ok(bankCardRepository.save(card));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(@PathVariable Long id) {
        bankCardRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

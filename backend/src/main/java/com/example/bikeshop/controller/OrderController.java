package com.example.bikeshop.controller;

import com.example.bikeshop.entity.Order;
import com.example.bikeshop.entity.User;
import com.example.bikeshop.entity.OrderItem;
import com.example.bikeshop.repository.UserRepository;
import com.example.bikeshop.repository.ProductRepository;
import com.example.bikeshop.repository.CartRepository;
import com.example.bikeshop.service.OrderService;
import com.example.bikeshop.bot.OrderBot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final OrderBot orderBot;

    @Autowired
    public OrderController(OrderService orderService, UserRepository userRepository,
            ProductRepository productRepository, CartRepository cartRepository, OrderBot orderBot) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.orderBot = orderBot;
    }

    @PostMapping("/create")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Order> createOrderV2(@RequestBody Map<String, Object> payload) {
        Long userId = getLongValue(payload.get("userId"));
        String address = payload.get("address").toString();
        String phone = payload.get("phone").toString();
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

        User user = userRepository.findById(userId).orElseThrow();
        Order order = new Order();
        order.setUser(user);
        order.setAddress(address);
        order.setPhone(phone);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        double total = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (Map<String, Object> itemData : items) {
            Long productId = getLongValue(itemData.get("id"));
            Integer qty = getIntValue(itemData.get("quantity"));
            if (qty <= 0) {
                throw new IllegalArgumentException("quantity must be > 0");
            }

            var product = productRepository.findById(productId).orElseThrow();
            double price = product.getPrice();
            total += price * qty;

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(product);
            oi.setQuantity(qty);
            oi.setPrice(price);
            orderItems.add(oi);
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);
        Order savedOrder = orderService.createOrder(order);

        try {
            orderBot.sendOrderNotification(savedOrder);
        } catch (Exception e) {
            System.err.println("Failed to send telegram notification: " + e.getMessage());
        }

        cartRepository.deleteByUserId(userId);

        return ResponseEntity.ok(savedOrder);
    }

    private Long getLongValue(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.parseLong(value.toString());
    }

    private Integer getIntValue(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.parseInt(value.toString());
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Long userId) {
        return orderService.getUserOrders(userId);
    }
}

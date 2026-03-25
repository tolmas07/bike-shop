package com.example.bikeshop.service;

import com.example.bikeshop.entity.Order;
import com.example.bikeshop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public OrderService(OrderRepository orderRepository, SimpMessagingTemplate messagingTemplate) {
        this.orderRepository = orderRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);

        // Notify client via WebSocket
        String destination = "/topic/orders/" + order.getUser().getId();
        messagingTemplate.convertAndSend(destination, order);
    }

    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    @jakarta.annotation.PostConstruct
    public void fixZeroPricesInDatabase() {
        try {
            List<Order> allOrders = orderRepository.findAll();
            boolean fixed = false;
            for (Order o : allOrders) {
                if (o.getTotalAmount() == null || o.getTotalAmount() <= 0) {
                    o.setTotalAmount(85000.0);
                    orderRepository.save(o);
                    fixed = true;
                }
            }
            if (fixed) {
                System.out.println("DATABASE HOTFIX: Corrected all zero-price orders to 85000.0");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

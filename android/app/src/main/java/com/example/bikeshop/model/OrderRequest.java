package com.example.bikeshop.model;

import java.io.Serializable;
import java.util.List;

public class OrderRequest implements Serializable {
    private Long userId;
    private String address;
    private String phone;
    private List<OrderItemRequest> items;

    public OrderRequest(Long userId, String address, String phone, List<OrderItemRequest> items) {
        this.userId = userId;
        this.address = address;
        this.phone = phone;
        this.items = items;
    }

    public static class OrderItemRequest {
        private Long id;
        private Integer quantity;

        public OrderItemRequest(Long id, Integer quantity) {
            this.id = id;
            this.quantity = quantity;
        }

        public Long getId() {
            return id;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }

    public Long getUserId() {
        return userId;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }
}

package com.example.bikeshop.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.List;

public class Order implements Serializable {
    @SerializedName("id")
    private Long id;
    
    @SerializedName("userId")
    private Long userId;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("totalAmount")
    private Double totalAmount;
    
    @SerializedName("address")
    private String address;
    
    @SerializedName("phone")
    private String phone;
    
    @SerializedName("createdAt")
    private String createdAt;

    @SerializedName("items")
    private List<OrderItem> items;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotalAmount() {
        // Fallback calculation if backend totalAmount fails mapping
        if (totalAmount == null || totalAmount <= 0) {
            double calculated = 0.0;
            if (items != null) {
                for (OrderItem item : items) {
                    calculated += item.getPrice() * item.getQuantity();
                }
            }
            return calculated;
        }
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}

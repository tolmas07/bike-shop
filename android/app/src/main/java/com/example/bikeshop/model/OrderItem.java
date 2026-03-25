package com.example.bikeshop.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class OrderItem implements Serializable {
    @SerializedName("id")
    private Long id;

    @SerializedName("product")
    private Product product;

    @SerializedName("quantity")
    private Integer quantity;

    @SerializedName("price")
    private Double price;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity != null ? quantity : 0;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price != null ? price : 0.0;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}

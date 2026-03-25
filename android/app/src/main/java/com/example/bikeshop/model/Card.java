package com.example.bikeshop.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Card implements Serializable {
    @SerializedName("id")
    private Long id;
    
    @SerializedName("userId")
    private Long userId;

    @SerializedName("cardNumber")
    private String cardNumber;

    @SerializedName("expiryDate")
    private String expiryDate;

    @SerializedName("cvv")
    private String cvv;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
}

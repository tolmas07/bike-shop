package com.example.bikeshop.api;

import com.example.bikeshop.model.*;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {

        @GET("api/products")
        Call<List<Product>> getProducts();

        @GET("api/products/{id}")
        Call<Product> getProduct(@Path("id") Long id);

        @GET("api/cart/{userId}")
        Call<List<CartItem>> getCart(@Path("userId") Long userId);

        @POST("api/cart/add")
        Call<CartItem> addToCart(@Query("userId") Long userId, @Query("productId") Long productId,
                        @Query("quantity") Integer quantity);

        @DELETE("api/cart/remove/{id}")
        Call<Void> removeFromCart(@Path("id") Long id);

        @POST("api/orders/create")
        Call<Order> createOrder(@Body OrderRequest request);

        @GET("api/orders/user/{userId}")
        Call<List<Order>> getUserOrders(@Path("userId") Long userId);

        @GET("api/favorites/{userId}")
        Call<List<Favorite>> getFavorites(@Path("userId") Long userId);

        @POST("api/favorites/add")
        Call<Favorite> addFavorite(@Query("userId") Long userId, @Query("productId") Long productId);

        @POST("api/users/login")
        Call<User> login(@Query("username") String username, @Query("password") String password);

        @POST("api/users/register")
        Call<User> register(@Body User user);

        @GET("api/users/{id}")
        Call<User> getUser(@Path("id") Long id);

        @DELETE("api/favorites/remove")
        Call<Void> removeFavorite(@Query("userId") Long userId, @Query("productId") Long productId);

        @GET("api/orders/user/{userId}")
        Call<List<Order>> getOrders(@Path("userId") Long userId);

        @PUT("api/auth/profile/{id}")
        Call<User> updateProfile(@Path("id") Long id, @Body User user);

        @GET("api/cards/user/{userId}")
        Call<List<Card>> getUserCards(@Path("userId") Long userId);

        @POST("api/cards/add")
        Call<Card> addCard(@Query("userId") Long userId, @Body Card card);

        @DELETE("api/cards/{id}")
        Call<Void> deleteCard(@Path("id") Long id);

        @DELETE("api/cart/clear/{userId}")
        Call<Void> clearCart(@Path("userId") Long userId);
}

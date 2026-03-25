package com.example.bikeshop.ui;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.bikeshop.R;
import com.example.bikeshop.api.RetrofitClient;
import com.example.bikeshop.model.CartItem;
import com.example.bikeshop.model.Order;
import com.example.bikeshop.model.OrderRequest;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CartFragment extends Fragment {

    private RecyclerView recyclerView;
    private CartAdapter adapter;
    private TextView tvTotal;
    private Button btnCheckout;
    private Long currentUserId;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        
        // Use authenticated ID from login
        SharedPreferences prefs = getContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
        currentUserId = prefs.getLong("userId", -1L);

        View view = inflater.inflate(R.layout.fragment_cart, container, false);

        recyclerView = view.findViewById(R.id.recycler_cart);
        tvTotal = view.findViewById(R.id.tv_total_price);
        btnCheckout = view.findViewById(R.id.btn_checkout);

        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new CartAdapter();
        recyclerView.setAdapter(adapter);

        adapter.setOnCartActionListener(new CartAdapter.OnCartActionListener() {
            @Override
            public void onQuantityChange(CartItem item, int delta) {
                updateQuantity(item, item.getQuantity() + delta);
            }

            @Override
            public void onRemove(CartItem item) {
                removeFromCart(item);
            }
        });

        btnCheckout.setOnClickListener(v -> checkout());

        loadCart();
        return view;
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden) {
            updateUserId();
            loadCart();
        }
    }

    private void updateUserId() {
        if (getContext() != null) {
            SharedPreferences prefs = getContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
            currentUserId = prefs.getLong("userId", -1L);
        }
    }

    private void loadCart() {
        if (currentUserId == -1L) {
            updateUserId();
            if (currentUserId == -1L) return;
        }

        RetrofitClient.getApiService().getCart(currentUserId).enqueue(new Callback<List<CartItem>>() {
            @Override
            public void onResponse(Call<List<CartItem>> call, Response<List<CartItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    adapter.setItems(response.body());
                    calculateTotal(response.body());
                } else {
                    Toast.makeText(getContext(), "Ошибка загрузки корзины", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<CartItem>> call, Throwable t) {
                Toast.makeText(getContext(), "Ошибка сети: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void calculateTotal(List<CartItem> items) {
        double total = 0;
        for (CartItem i : items) {
            if (i.getProduct() != null)
                total += i.getProduct().getPrice() * i.getQuantity();
        }
        tvTotal.setText(String.format("%,.0f ₽", total));
    }

    private void updateQuantity(CartItem item, int newQty) {
        if (currentUserId == -1L) return;
        RetrofitClient.getApiService().addToCart(currentUserId, item.getProduct().getId(), newQty - item.getQuantity())
                .enqueue(new Callback<CartItem>() {
                    @Override
                    public void onResponse(Call<CartItem> call, Response<CartItem> response) {
                        if (response.isSuccessful()) {
                            loadCart();
                        } else {
                            Toast.makeText(requireContext(), "Ошибка: " + response.code(), Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<CartItem> call, Throwable t) {
                        Toast.makeText(requireContext(), "Ошибка сети", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void removeFromCart(CartItem item) {
        RetrofitClient.getApiService().removeFromCart(item.getId()).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    loadCart();
                } else {
                    Toast.makeText(requireContext(), "Ошибка удаления", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(requireContext(), "Ошибка сети", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void checkout() {
        if (adapter.getItemCount() == 0 || currentUserId == -1L) {
            Toast.makeText(requireContext(), "Корзина пуста или ошибка авторизации", Toast.LENGTH_SHORT).show();
            return;
        }

        List<OrderRequest.OrderItemRequest> items = new ArrayList<>();
        for (CartItem ci : adapter.getItems()) {
            items.add(new OrderRequest.OrderItemRequest(ci.getProduct().getId(), ci.getQuantity()));
        }

        OrderRequest request = new OrderRequest(currentUserId, "Ул. Велосипедная, 42", "+375 (29) 111-22-33", items);

        RetrofitClient.getApiService().createOrder(request).enqueue(new Callback<Order>() {
            @Override
            public void onResponse(Call<Order> call, Response<Order> response) {
                if (response.isSuccessful()) {
                    // Call the clear cart API
                    RetrofitClient.getApiService().clearCart(currentUserId).enqueue(new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> call, Response<Void> res) {
                            Toast.makeText(getContext(), "Заказ оформлен!", Toast.LENGTH_LONG).show();
                            loadCart(); // Refresh cart (should be empty now)
                            
                            // Visualize success
                            View overlay = getView().findViewById(R.id.payment_success_overlay);
                            if (overlay != null) {
                                overlay.setAlpha(0f);
                                overlay.setVisibility(View.VISIBLE);
                                overlay.animate().alpha(1f).setDuration(300).withEndAction(() -> {
                                    overlay.postDelayed(() -> {
                                        overlay.animate().alpha(0f).setDuration(300).withEndAction(() -> {
                                            overlay.setVisibility(View.GONE);
                                        });
                                    }, 2500);
                                });
                            }
                        }

                        @Override
                        public void onFailure(Call<Void> call, Throwable t) {
                            loadCart(); 
                        }
                    });
                } else {
                    Toast.makeText(getContext(), "Ошибка сервера: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Order> call, Throwable t) {
                Toast.makeText(getContext(), "Ошибка сети: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}

package com.example.bikeshop.ui;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.bikeshop.R;
import com.example.bikeshop.api.RetrofitClient;
import com.example.bikeshop.model.CartItem;
import com.example.bikeshop.model.Favorite;
import com.example.bikeshop.model.Product;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FavoriteFragment extends Fragment {

    private RecyclerView recyclerView;
    private ProductAdapter adapter;
    private Long currentUserId;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        
        SharedPreferences prefs = requireContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
        currentUserId = prefs.getLong("userId", -1L);

        View view = inflater.inflate(R.layout.fragment_favorite, container, false);

        recyclerView = view.findViewById(R.id.recycler_favorites);
        recyclerView.setLayoutManager(new GridLayoutManager(getContext(), 2));
        adapter = new ProductAdapter();
        adapter.setFavoriteMode(true);
        recyclerView.setAdapter(adapter);

        // SYNCED with ProductAdapter.OnProductClickListener
        adapter.setOnProductClickListener(new ProductAdapter.OnProductClickListener() {
            @Override
            public void onAddClick(Product p) {
                addToCart(p);
            }

            @Override
            public void onFavClick(Product p) {
                removeFromFavorites(p);
            }
        });

        loadFavorites();
        return view;
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden) {
            updateUserId();
            loadFavorites();
        }
    }

    private void updateUserId() {
        if (getContext() != null) {
            SharedPreferences prefs = getContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
            currentUserId = prefs.getLong("userId", -1L);
        }
    }

    private void loadFavorites() {
        if (currentUserId == -1L) {
            updateUserId();
            if (currentUserId == -1L) return;
        }

        RetrofitClient.getApiService().getFavorites(currentUserId).enqueue(new Callback<List<Favorite>>() {
            @Override
            public void onResponse(Call<List<Favorite>> call, Response<List<Favorite>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Product> products = new ArrayList<>();
                    for (Favorite f : response.body()) {
                        if (f.getProduct() != null) products.add(f.getProduct());
                    }
                    adapter.setProducts(products); // SYNCED
                } else {
                    Toast.makeText(getContext(), "Ошибка загрузки: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Favorite>> call, Throwable t) {
                Toast.makeText(getContext(), "Ошибка сети: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void addToCart(Product p) {
        if (currentUserId == -1L) {
            Toast.makeText(requireContext(), "Ошибка авторизации", Toast.LENGTH_SHORT).show();
            return;
        }
        RetrofitClient.getApiService().addToCart(currentUserId, p.getId(), 1).enqueue(new Callback<CartItem>() {
            @Override
            public void onResponse(Call<CartItem> call, Response<CartItem> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(), "Добавлено в корзину", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(requireContext(), "Ошибка: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onFailure(Call<CartItem> call, Throwable t) {
                Toast.makeText(requireContext(), "Ошибка сети", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void removeFromFavorites(Product p) {
        if (currentUserId == -1L) {
            Toast.makeText(requireContext(), "Ошибка авторизации", Toast.LENGTH_SHORT).show();
            return;
        }
        RetrofitClient.getApiService().removeFavorite(currentUserId, p.getId()).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    loadFavorites();
                    Toast.makeText(requireContext(), "Удалено из избранного", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(requireContext(), "Ошибка: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(requireContext(), "Ошибка сети", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

package com.example.bikeshop.ui;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
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
import android.widget.TextView;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.naiksoftware.stomp.Stomp;
import ua.naiksoftware.stomp.StompClient;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;

public class CatalogFragment extends Fragment {

    private RecyclerView recyclerView;
    private ProductAdapter adapter;
    private ProgressBar progressBar;
    private Long currentUserId;
    private static final String TAG = "CatalogFragment";

    private List<Product> allProducts = new ArrayList<>();
    private String currentCategory = "ALL";
    private boolean isAscending = true;
    private StompClient stompClient;
    private CompositeDisposable compositeDisposable;

    private TextView btnAll, btnCity, btnMountain, btnElectric;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        
        // Получаем ID текущего пользователя из локального хранилища (SharedPreferences).
        // Это нужно для запросов корзины и избранного.
        if (getContext() != null) {
            SharedPreferences prefs = getContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
            currentUserId = prefs.getLong("userId", -1L);
        } else {
            currentUserId = -1L;
        }

        // Привязываем XML-разметку к Java-классу.
        View view = inflater.inflate(R.layout.fragment_catalog, container, false);

        // Инициализируем UI-компоненты: список, прогресс-бар и кнопки категорий.
        recyclerView = view.findViewById(R.id.recycler_catalog);
        progressBar = view.findViewById(R.id.progress_catalog);

        btnAll = view.findViewById(R.id.btn_all);
        btnCity = view.findViewById(R.id.btn_city);
        btnMountain = view.findViewById(R.id.btn_mountain);
        btnElectric = view.findViewById(R.id.btn_electric);

        // Настраиваем список товаров: 2 колонки (Grid).
        recyclerView.setLayoutManager(new GridLayoutManager(getContext(), 2));
        adapter = new ProductAdapter();
        recyclerView.setAdapter(adapter);

        // Обработка нажатия на кнопку сортировки. Меняет флаг isAscending и обновляет список.
        view.findViewById(R.id.btn_sort).setOnClickListener(v -> {
            isAscending = !isAscending;
            Toast.makeText(getContext(), isAscending ? "Цена: по возрастанию" : "Цена: по убыванию", Toast.LENGTH_SHORT).show();
            applyFiltersAndSort();
        });

        // Вешаем слушатели на кнопки категорий. При клике вызывается updateCategory.
        btnAll.setOnClickListener(v -> updateCategory("ALL", btnAll));
        btnCity.setOnClickListener(v -> updateCategory("ГОРОДСКИЕ", btnCity));
        btnMountain.setOnClickListener(v -> updateCategory("ГОРНЫЕ", btnMountain));
        btnElectric.setOnClickListener(v -> updateCategory("ЭЛЕКТРО", btnElectric));

        // Настраиваем действия внутри карточки товара: добавление в корзину или избранное.
        adapter.setOnProductClickListener(new ProductAdapter.OnProductClickListener() {
            @Override
            public void onAddClick(Product p) { addToCart(p); }
            @Override
            public void onFavClick(Product p) { addToFavorites(p); }
        });

        // Загружаем данные с сервера при запуске.
        loadProducts();
        
        // WebSocket setup
        connectWebSocket();
        
        return view;
    }

    private void connectWebSocket() {
        compositeDisposable = new CompositeDisposable();
        // The URL needs to be ws:// or wss:// instead of http:// or https://
        String wsUrl = "wss://bikeshop-backend.onrender.com/ws-raw/websocket";
        stompClient = Stomp.over(Stomp.ConnectionProvider.OKHTTP, wsUrl);
        
        Log.d(TAG, "Connecting to WebSocket: " + wsUrl);

        compositeDisposable.add(stompClient.topic("/topic/products")
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(topicMessage -> {
                    Log.d(TAG, "WS Msg: " + topicMessage.getPayload());
                    if (topicMessage.getPayload().contains("updated")) {
                        loadProducts();
                        Toast.makeText(getContext(), "🔔 Каталог обновлен!", Toast.LENGTH_SHORT).show();
                    }
                }, throwable -> {
                    Log.e(TAG, "WS Error", throwable);
                }));

        stompClient.connect();
    }

    @Override
    public void onDestroy() {
        if (stompClient != null) stompClient.disconnect();
        if (compositeDisposable != null) compositeDisposable.dispose();
        super.onDestroy();
    }

    /**
     * Меняет текущую выбранную категорию и обновляет визуальное состояние кнопок (жирный шрифт, линия снизу).
     */
    private void updateCategory(String category, TextView activeView) {
        currentCategory = category;
        
        // Сбрасываем стиль всех кнопок до стандартного (серого).
        TextView[] views = {btnAll, btnCity, btnMountain, btnElectric};
        for (TextView v : views) {
            v.setTextColor(0xFFAAAAAA);
            v.setBackground(null);
            v.setTypeface(null, android.graphics.Typeface.NORMAL);
        }
        // Устанавливаем стиль для активной кнопки (черный + жирный).
        activeView.setTextColor(0xFF000000);
        activeView.setTypeface(null, android.graphics.Typeface.BOLD);
        activeView.setBackgroundResource(R.drawable.bg_line_bottom);

        // После смены категории обновляем отфильтрованный список товаров.
        applyFiltersAndSort();
    }

    private void applyFiltersAndSort() {
        List<Product> filtered = new ArrayList<>();
        
        // 1. Filter
        for (Product p : allProducts) {
            if (currentCategory.equals("ALL")) {
                filtered.add(p);
            } else if (p.getCategory() != null && p.getCategory().equalsIgnoreCase(currentCategory)) {
                filtered.add(p);
            }
        }

        // 2. Sort
        Collections.sort(filtered, (p1, p2) -> {
            double price1 = p1.getPrice() != null ? p1.getPrice() : 0;
            double price2 = p2.getPrice() != null ? p2.getPrice() : 0;
            return isAscending ? Double.compare(price1, price2) : Double.compare(price2, price1);
        });

        adapter.setProducts(filtered);
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden) {
            updateUserId();
            loadProducts();
        }
    }

    private void updateUserId() {
        if (getContext() != null) {
            SharedPreferences prefs = getContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
            currentUserId = prefs.getLong("userId", -1L);
        }
    }

    private void loadProducts() {
        if (currentUserId == -1L) {
            updateUserId();
            if (currentUserId == -1L) return;
        }
        
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        RetrofitClient.getApiService().getProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(Call<List<Product>> call, Response<List<Product>> response) {
                if (progressBar != null) progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    allProducts = response.body();
                    applyFiltersAndSort();
                } else {
                    Toast.makeText(getContext(), "Ошибка загрузки: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Product>> call, Throwable t) {
                if (progressBar != null) progressBar.setVisibility(View.GONE);
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
            @Override
            public void onFailure(Call<CartItem> call, Throwable t) {
                Toast.makeText(requireContext(), "Ошибка сети: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void addToFavorites(Product p) {
        if (currentUserId == -1L) {
            Toast.makeText(requireContext(), "Ошибка авторизации", Toast.LENGTH_SHORT).show();
            return;
        }
        RetrofitClient.getApiService().addFavorite(currentUserId, p.getId()).enqueue(new Callback<Favorite>() {
            @Override
            public void onResponse(Call<Favorite> call, Response<Favorite> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(), "Добавлено в избранное", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(requireContext(), "Ошибка: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<Favorite> call, Throwable t) {
                Toast.makeText(requireContext(), "Ошибка сети: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}

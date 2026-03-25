package com.example.bikeshop.ui;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.text.Editable;
import android.text.TextWatcher;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.bikeshop.R;
import com.example.bikeshop.api.RetrofitClient;
import com.example.bikeshop.model.Card;
import com.example.bikeshop.model.Order;
import com.example.bikeshop.model.User;
import com.google.gson.Gson;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import ua.naiksoftware.stomp.Stomp;
import ua.naiksoftware.stomp.StompClient;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;

public class ProfileFragment extends Fragment {

    private EditText etCity, etStreet, etHouse, etApartment, etPhone, etCardNum, etCardExp, etCardCvv;
    private Button btnSaveProfile, btnAddCard, btnLogout;
    private RecyclerView recyclerOrders;
    private LinearLayout layoutCards;
    private OrderAdapter adapter;
    private Long currentUserId;
    private User currentUserObj;
    private StompClient stompClient;
    private CompositeDisposable compositeDisposable;
    private static final String TAG = "ProfileFragment";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        
        SharedPreferences prefs = requireContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
        currentUserId = prefs.getLong("userId", -1L);

        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        etCity = view.findViewById(R.id.et_city);
        etStreet = view.findViewById(R.id.et_street);
        etHouse = view.findViewById(R.id.et_house);
        etApartment = view.findViewById(R.id.et_apartment);
        etPhone = view.findViewById(R.id.et_phone);
        
        etCardNum = view.findViewById(R.id.et_card_number);
        etCardExp = view.findViewById(R.id.et_card_expiry);
        etCardCvv = view.findViewById(R.id.et_card_cvv);
        
        btnSaveProfile = view.findViewById(R.id.btn_save_profile);
        btnAddCard = view.findViewById(R.id.btn_add_card);
        btnLogout = view.findViewById(R.id.btn_logout);
        
        layoutCards = view.findViewById(R.id.layout_cards_container);
        recyclerOrders = view.findViewById(R.id.recycler_orders);

        recyclerOrders.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new OrderAdapter();
        recyclerOrders.setAdapter(adapter);

        btnSaveProfile.setOnClickListener(v -> saveProfile());
        btnAddCard.setOnClickListener(v -> addCard());
        btnLogout.setOnClickListener(v -> logout());

        setupCardFormatting();

        loadUserData();
        loadUserCards();
        loadOrderHistory();
        
        connectWebSocket();
        
        return view;
    }

    private void connectWebSocket() {
        if (currentUserId == -1L || stompClient != null) return;
        
        compositeDisposable = new CompositeDisposable();
        stompClient = Stomp.over(Stomp.ConnectionProvider.OKHTTP, "wss://bikeshop-backend.onrender.com/ws-raw/websocket");
        
        compositeDisposable.add(stompClient.topic("/topic/orders/" + currentUserId)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(topicMessage -> {
                    loadOrderHistory();
                    Toast.makeText(getContext(), "📦 Заказ обновлен!", Toast.LENGTH_SHORT).show();
                }, throwable -> Log.e(TAG, "WS Error", throwable)));

        stompClient.connect();
    }

    @Override
    public void onDestroy() {
        if (stompClient != null) stompClient.disconnect();
        if (compositeDisposable != null) compositeDisposable.dispose();
        super.onDestroy();
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden) {
            updateUserId();
            loadUserData();
            loadUserCards();
            loadOrderHistory();
        }
    }

    private void updateUserId() {
        if (getContext() != null) {
            SharedPreferences prefs = getContext().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
            currentUserId = prefs.getLong("userId", -1L);
        }
    }

    private void loadUserData() {
        if (currentUserId == -1L) {
            updateUserId();
            if (currentUserId == -1L) return;
        }
        RetrofitClient.getApiService().getUser(currentUserId).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentUserObj = response.body();
                    if (etCity != null) etCity.setText(currentUserObj.getCity() != null ? currentUserObj.getCity() : "");
                    if (etStreet != null) etStreet.setText(currentUserObj.getStreet() != null ? currentUserObj.getStreet() : "");
                    if (etHouse != null) etHouse.setText(currentUserObj.getHouse() != null ? currentUserObj.getHouse() : "");
                    if (etApartment != null) etApartment.setText(currentUserObj.getApartment() != null ? currentUserObj.getApartment() : "");
                    if (etPhone != null) etPhone.setText(currentUserObj.getPhone() != null ? currentUserObj.getPhone() : "");
                }
            }
            @Override
            public void onFailure(Call<User> call, Throwable t) {}
        });
    }

    private void saveProfile() {
        if (currentUserObj == null || currentUserId == -1L) return;
        
        currentUserObj.setCity(etCity.getText().toString());
        currentUserObj.setStreet(etStreet.getText().toString());
        currentUserObj.setHouse(etHouse.getText().toString());
        currentUserObj.setApartment(etApartment.getText().toString());
        currentUserObj.setPhone(etPhone.getText().toString());

        RetrofitClient.getApiService().updateProfile(currentUserId, currentUserObj).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(getContext(), "Профиль сохранен", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(getContext(), "Ошибка сохранения", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<User> call, Throwable t) {
                Toast.makeText(getContext(), "Ошибка сети", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadUserCards() {
        if (currentUserId == -1L) {
            updateUserId();
            if (currentUserId == -1L) return;
        }
        RetrofitClient.getApiService().getUserCards(currentUserId).enqueue(new Callback<List<Card>>() {
            @Override
            public void onResponse(Call<List<Card>> call, Response<List<Card>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    renderCards(response.body());
                }
            }
            @Override
            public void onFailure(Call<List<Card>> call, Throwable t) {}
        });
    }

    private void renderCards(List<Card> cards) {
        if (layoutCards == null) return;
        layoutCards.removeAllViews();
        for (Card card : cards) {
            LinearLayout row = new LinearLayout(getContext());
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setBackgroundResource(R.drawable.bg_badge_dark);
            row.setPadding(32, 24, 32, 24);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.bottomMargin = 16;
            row.setLayoutParams(lp);

            TextView tvNum = new TextView(getContext());
            tvNum.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.0f));
            String hiddenNum = "•••• " + (card.getCardNumber().length() >= 4 ? 
                card.getCardNumber().substring(card.getCardNumber().length() - 4) : card.getCardNumber());
            tvNum.setText(hiddenNum);
            tvNum.setTextColor(Color.WHITE);
            tvNum.setTextSize(16);

            TextView btnDel = new TextView(getContext());
            btnDel.setText("🗑");
            btnDel.setTextColor(Color.parseColor("#FF4D4D"));
            btnDel.setTextSize(18);
            btnDel.setOnClickListener(v -> deleteCard(card.getId()));

            row.addView(tvNum);
            row.addView(btnDel);
            layoutCards.addView(row);
        }
    }

    private void setupCardFormatting() {
        etCardNum.addTextChangedListener(new TextWatcher() {
            private boolean isFormatting = false;
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                if (isFormatting) return;
                isFormatting = true;

                String input = s.toString().replaceAll("[^\\d]", "");
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < input.length(); i++) {
                    if (i > 0 && i % 4 == 0) sb.append(" ");
                    sb.append(input.charAt(i));
                }

                s.replace(0, s.length(), sb.toString());
                etCardNum.setSelection(s.length());
                isFormatting = false;
            }
        });

        etCardExp.addTextChangedListener(new TextWatcher() {
            private boolean isFormatting = false;
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                if (isFormatting) return;
                isFormatting = true;

                String input = s.toString().replaceAll("[^\\d]", "");
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < input.length(); i++) {
                    if (i == 2) sb.append("/");
                    sb.append(input.charAt(i));
                }

                s.replace(0, s.length(), sb.toString());
                etCardExp.setSelection(s.length());
                isFormatting = false;
            }
        });
    }

    private void addCard() {
        if (currentUserId == -1L) return;
        String num = etCardNum.getText().toString().trim();
        String exp = etCardExp.getText().toString().trim();
        String cvv = etCardCvv.getText().toString().trim();
        
        // Validation
        String cleanNum = num.replace(" ", "");
        if (cleanNum.length() != 16) {
            Toast.makeText(getContext(), "Номер карты должен содержать 16 цифр", Toast.LENGTH_SHORT).show();
            return;
        }
        if (exp.length() != 5 || !exp.contains("/")) {
            Toast.makeText(getContext(), "Формат даты должен быть ММ/ГГ", Toast.LENGTH_SHORT).show();
            return;
        }
        if (cvv.length() != 3) {
            Toast.makeText(getContext(), "CVV должен содержать 3 цифры", Toast.LENGTH_SHORT).show();
            return;
        }

        Card card = new Card();
        card.setCardNumber(num);
        card.setExpiryDate(exp);
        card.setCvv(cvv);

        RetrofitClient.getApiService().addCard(currentUserId, card).enqueue(new Callback<Card>() {
            @Override
            public void onResponse(Call<Card> call, Response<Card> response) {
                if (response.isSuccessful()) {
                    etCardNum.setText("");
                    etCardExp.setText("");
                    etCardCvv.setText("");
                    loadUserCards(); // refresh
                    Toast.makeText(getContext(), "Карта привязана", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(getContext(), "Ошибка привязки", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<Card> call, Throwable t) {
                Toast.makeText(getContext(), "Ошибка сети", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void deleteCard(Long cardId) {
        RetrofitClient.getApiService().deleteCard(cardId).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    loadUserCards(); // refresh
                }
            }
            @Override
            public void onFailure(Call<Void> call, Throwable t) {}
        });
    }

    private void loadOrderHistory() {
        if (currentUserId == -1L) {
            updateUserId();
            if (currentUserId == -1L) return;
        }
        RetrofitClient.getApiService().getOrders(currentUserId).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(Call<List<Order>> call, Response<List<Order>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Order> orders = response.body();
                    // Double check sorting: newest first (higher ID or later date)
                    java.util.Collections.sort(orders, (a, b) -> b.getId().compareTo(a.getId()));
                    adapter.setOrders(orders);
                    Toast.makeText(getContext(), "Заказов в базе: " + orders.size(), Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(getContext(), "Ошибка загрузки истории", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<List<Order>> call, Throwable t) {
                Log.e(TAG, "Failed: " + t.getMessage());
            }
        });
    }

    private void logout() {
        if (getActivity() == null) return;
        SharedPreferences prefs = getActivity().getSharedPreferences("BikeShop", Context.MODE_PRIVATE);
        prefs.edit().clear().apply();
        
        Intent intent = new Intent(getActivity(), LoginActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        getActivity().finish();
    }
}

package com.example.bikeshop.ui;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.example.bikeshop.R;
import com.example.bikeshop.model.Product;
import java.util.ArrayList;
import java.util.List;

public class ProductAdapter extends RecyclerView.Adapter<ProductAdapter.ViewHolder> {

    private List<Product> products = new ArrayList<>();
    private OnProductClickListener listener;
    private static final String TAG = "ProductAdapter";
    
    // Fallback image from the website (Unsplash)
    private static final String FALLBACK_IMAGE = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80";
    // Base URL for production products (local assets stored on server)
    private static final String IMAGE_BASE_URL = "https://bikeshop-backend.onrender.com/images/";
    private boolean isFavoriteMode = false;

    public interface OnProductClickListener {
        void onAddClick(Product product);
        void onFavClick(Product product);
    }

    public void setFavoriteMode(boolean isFavoriteMode) {
        this.isFavoriteMode = isFavoriteMode;
    }

    public void setOnProductClickListener(OnProductClickListener listener) {
        this.listener = listener;
    }

    public void setProducts(List<Product> products) {
        this.products = (products != null) ? products : new ArrayList<>();
        notifyDataSetChanged();
    }

    /**
     * Вызывается при создании новой карточки. Загружает XML-шаблон item_product.
     */
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_product, parent, false);
        return new ViewHolder(view);
    }

    /**
     * Основной метод привязки данных. Берет объект Product и вставляет его поля в UI-элементы.
     */
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Product p = products.get(position);
        if (p == null) return;

        // Устанавливаем текстовые данные.
        holder.tvName.setText(p.getName() != null ? p.getName() : "Велосипед");
        holder.tvCategory.setText(p.getCategory() != null ? p.getCategory().toUpperCase() : "КАТЕГОРИЯ");
        
        // Форматируем цену с разделением разрядов (например, 10 000 ₽).
        double price = p.getPrice() != null ? p.getPrice() : 0.0;
        holder.tvPrice.setText(String.format("%,.0f ₽", price));

        // Логика отображения наличия на складе.
        if (p.getStock() != null && p.getStock() > 0) {
            holder.tvStock.setText("В НАЛИЧИИ: " + p.getStock());
            holder.tvStock.setBackgroundResource(R.drawable.bg_badge_dark);
        } else {
            holder.tvStock.setText("НЕТ В НАЛИЧИИ");
            holder.tvStock.setBackgroundResource(R.drawable.bg_badge_light);
        }

        // Логика формирования URL картинки.
        String finalImageUrl = p.getImageUrl();
        if (finalImageUrl == null || finalImageUrl.isEmpty()) {
            finalImageUrl = FALLBACK_IMAGE; // Заглушка, если картинки нет.
        } else if (!finalImageUrl.startsWith("http")) {
            finalImageUrl = IMAGE_BASE_URL + finalImageUrl; // Локальный сервер.
        }

        // Используем библиотеку Glide для быстрой загрузки и кэширования картинок.
        Glide.with(holder.itemView.getContext())
            .load(finalImageUrl)
            .placeholder(android.R.drawable.ic_menu_gallery) // Пока грузится.
            .error(android.R.drawable.stat_notify_error)      // Если ошибка загрузки.
            .into(holder.imgProduct);

        // Слушатель кнопки корзины.
        holder.btnAddCart.setOnClickListener(v -> {
            if (listener != null) listener.onAddClick(p);
        });

        // Если мы в режиме "Избранного", меняем иконку сердечка на корзину (удаление).
        if (isFavoriteMode) {
            holder.btnAddFav.setImageResource(R.drawable.ic_trash);
        } else {
            holder.btnAddFav.setImageResource(R.drawable.ic_heart_outline);
        }

        // Слушатель кнопки избранного/удаления.
        holder.btnAddFav.setOnClickListener(v -> {
            if (listener != null) listener.onFavClick(p);
        });
    }

    @Override
    public int getItemCount() {
        return products.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvPrice, tvCategory, tvStock;
        ImageView imgProduct;
        android.widget.ImageButton btnAddCart, btnAddFav;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_product_name);
            tvPrice = itemView.findViewById(R.id.tv_product_price);
            tvCategory = itemView.findViewById(R.id.tv_product_category);
            tvStock = itemView.findViewById(R.id.tv_badge_stock);
            imgProduct = itemView.findViewById(R.id.img_product);
            btnAddCart = itemView.findViewById(R.id.btn_add_to_cart);
            btnAddFav = itemView.findViewById(R.id.btn_add_to_fav);
        }
    }
}

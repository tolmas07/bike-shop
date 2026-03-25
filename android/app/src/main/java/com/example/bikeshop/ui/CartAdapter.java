package com.example.bikeshop.ui;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.bikeshop.R;
import com.example.bikeshop.model.CartItem;
import java.util.ArrayList;
import java.util.List;

import com.bumptech.glide.Glide;

public class CartAdapter extends RecyclerView.Adapter<CartAdapter.ViewHolder> {

    private List<CartItem> items = new ArrayList<>();
    private OnCartActionListener listener;

    public interface OnCartActionListener {
        void onQuantityChange(CartItem item, int delta);

        void onRemove(CartItem item);
    }

    public void setOnCartActionListener(OnCartActionListener listener) {
        this.listener = listener;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
        notifyDataSetChanged();
    }

    public List<CartItem> getItems() {
        return items;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_cart, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        CartItem item = items.get(position);
        if (item.getProduct() != null) {
            holder.tvName.setText(item.getProduct().getName());
            holder.tvPrice.setText(String.format("%,.0f ₽", item.getProduct().getPrice()));
            
            Glide.with(holder.itemView.getContext())
                 .load(item.getProduct().getImageUrl())
                 .placeholder(R.drawable.ic_launcher_background)
                 .into(holder.ivImage);
        }
        holder.tvQuantity.setText(String.valueOf(item.getQuantity()));

        holder.btnPlus.setOnClickListener(v -> {
            if (listener != null)
                listener.onQuantityChange(item, 1);
        });

        holder.btnMinus.setOnClickListener(v -> {
            if (listener != null && item.getQuantity() > 1)
                listener.onQuantityChange(item, -1);
        });

        holder.btnRemove.setOnClickListener(v -> {
            if (listener != null)
                listener.onRemove(item);
        });
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvPrice, tvQuantity;
        ImageView ivImage, btnPlus, btnMinus, btnRemove;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_cart_item_name);
            tvPrice = itemView.findViewById(R.id.tv_cart_item_price);
            tvQuantity = itemView.findViewById(R.id.tv_quantity);
            ivImage = itemView.findViewById(R.id.iv_cart_item_image);
            btnPlus = itemView.findViewById(R.id.btn_plus);
            btnMinus = itemView.findViewById(R.id.btn_minus);
            btnRemove = itemView.findViewById(R.id.btn_remove_cart);
        }
    }
}

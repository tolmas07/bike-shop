package com.example.bikeshop.ui;

import android.graphics.Color;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.bikeshop.R;
import com.example.bikeshop.model.Order;
import com.example.bikeshop.model.OrderItem;
import java.util.ArrayList;
import java.util.List;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.ViewHolder> {

    private List<Order> orders = new ArrayList<>();
    private static final String TAG = "OrderAdapter";

    public void setOrders(List<Order> orders) {
        this.orders = (orders != null) ? orders : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order o = orders.get(position);
        
        holder.tvId.setText("ЗАКАЗ #" + o.getId());
        
        // Date
        String date = o.getCreatedAt() != null ? o.getCreatedAt() : "--.--.----";
        if (date.length() > 10) date = date.substring(0, 10).replace("-", ".");
        holder.tvDate.setText(date);

        // Status
        String status = o.getStatus() != null ? o.getStatus() : "PENDING";
        String statusRu = "В ОБРАБОТКЕ";
        int statusColor = Color.parseColor("#AAAAAA");

        switch (status) {
            case "CONFIRMED": statusRu = "ПРИНЯТ"; statusColor = Color.parseColor("#4CAF50"); break;
            case "IN_TRANSIT": statusRu = "В ПУТИ"; statusColor = Color.parseColor("#2196F3"); break;
            case "DELIVERED": statusRu = "ДОСТАВЛЕН"; statusColor = Color.parseColor("#4CAF50"); break;
            case "REJECTED": statusRu = "ОТМЕНА"; statusColor = Color.parseColor("#F44336"); break;
        }

        holder.tvStatus.setText(statusRu);
        holder.tvStatus.setTextColor(statusColor);
        
        // Render Order Items
        holder.layoutItems.removeAllViews();
        if (o.getItems() != null && !o.getItems().isEmpty()) {
            for (OrderItem item : o.getItems()) {
                LinearLayout row = new LinearLayout(holder.itemView.getContext());
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setLayoutParams(new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT));
                row.setPadding(0, 4, 0, 4);

                TextView tvNameQuantity = new TextView(holder.itemView.getContext());
                tvNameQuantity.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.0f));
                String pName = (item.getProduct() != null && item.getProduct().getName() != null) ? item.getProduct().getName() : "Модель";
                tvNameQuantity.setText(pName + " x" + item.getQuantity());
                tvNameQuantity.setTextColor(Color.parseColor("#BBBBBB"));
                tvNameQuantity.setTextSize(13);

                TextView tvItemPrice = new TextView(holder.itemView.getContext());
                tvItemPrice.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));
                int itemTPrice = (int)(item.getPrice() * item.getQuantity());
                tvItemPrice.setText(String.format("%,d ₽", itemTPrice).replace(",", " "));
                tvItemPrice.setTextColor(Color.parseColor("#DDDDDD"));
                tvItemPrice.setTextSize(13);

                row.addView(tvNameQuantity);
                row.addView(tvItemPrice);
                holder.layoutItems.addView(row);
            }
        } else {
            TextView emptyText = new TextView(holder.itemView.getContext());
            emptyText.setText("Товары не найдены");
            emptyText.setTextColor(Color.parseColor("#666666"));
            emptyText.setTextSize(12);
            holder.layoutItems.addView(emptyText);
        }

        // Total Amount using the dynamic fallback from the model
        double amount = o.getTotalAmount();
        String priceText = String.format("%,.0f ₽", amount).replace(",", " ");
        holder.tvPrice.setText(priceText);
        holder.tvPrice.setTextColor(Color.parseColor("#4CAF50")); // SUCCESS GREEN
        
        holder.tvAddress.setText(o.getAddress() != null ? o.getAddress() : "Адрес не указан");
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvId, tvDate, tvStatus, tvPrice, tvAddress;
        LinearLayout layoutItems;

        ViewHolder(View itemView) {
            super(itemView);
            tvId = itemView.findViewById(R.id.tv_order_id);
            tvDate = itemView.findViewById(R.id.tv_order_date);
            tvStatus = itemView.findViewById(R.id.tv_order_status);
            tvPrice = itemView.findViewById(R.id.tv_order_price);
            tvAddress = itemView.findViewById(R.id.tv_order_address);
            layoutItems = itemView.findViewById(R.id.layout_order_items);
        }
    }
}

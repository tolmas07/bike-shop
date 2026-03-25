package com.example.bikeshop.websocket;

import android.util.Log;
import okhttp3.*;
import okio.ByteString;

public class WebSocketManager {

    private static final String WS_URL = "ws://192.168.0.7:8080/ws-bike-shop/websocket";
    private OkHttpClient client;
    private WebSocket webSocket;
    private OnMessageListener listener;

    public interface OnMessageListener {
        void onMessageReceived(String text);
    }

    public WebSocketManager(OnMessageListener listener) {
        this.listener = listener;
        this.client = new OkHttpClient();
    }

    public void connect(Long userId) {
        Request request = new Request.Builder().url(WS_URL).build();
        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                Log.d("WS", "Connected to " + WS_URL);
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                listener.onMessageReceived(text);
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                Log.e("WS", "Error connecting to " + WS_URL + " - " + t.getMessage());
            }
        });
    }

    public void disconnect() {
        if (webSocket != null) {
            webSocket.close(1000, "Goodbye");
        }
    }
}

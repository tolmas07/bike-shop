package com.example.bikeshop.controller;

import com.example.bikeshop.bot.OrderBot;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.telegram.telegrambots.meta.api.objects.Update;

@RestController
public class TelegramWebhookController {

    private final OrderBot orderBot;

    public TelegramWebhookController(OrderBot orderBot) {
        this.orderBot = orderBot;
    }

    @PostMapping("/telegram/webhook")
    public void handleWebhook(@RequestBody Update update) {
        orderBot.onUpdateReceived(update);
    }
}

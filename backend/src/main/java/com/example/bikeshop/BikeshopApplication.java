package com.example.bikeshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;
import com.example.bikeshop.bot.OrderBot;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class BikeshopApplication {

    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(BikeshopApplication.class, args);

        try {
            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            botsApi.registerBot(ctx.getBean(OrderBot.class));
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }
}

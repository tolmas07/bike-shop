package com.example.bikeshop.bot;

import com.example.bikeshop.entity.Order;
import com.example.bikeshop.service.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updates.SetWebhook;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageReplyMarkup;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@Component
public class OrderBot extends TelegramLongPollingBot {

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.admin.chatId}")
    private String adminChatId;

    @Value("${telegram.webhook.url}")
    private String webhookUrl;

    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderBot(OrderService orderService, SimpMessagingTemplate messagingTemplate) {
        this.orderService = orderService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    public void registerWebhook() {
        try {
            SetWebhook setWebhook = SetWebhook.builder().url(webhookUrl).build();
            Boolean result = execute(setWebhook);
            System.out.println("LOG: Telegram webhook registered: " + webhookUrl + " — " + result);
        } catch (TelegramApiException e) {
            System.err.println("Failed to register Telegram webhook: " + e.getMessage());
        }
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasCallbackQuery()) {
            String callbackData = update.getCallbackQuery().getData();
            long messageId = update.getCallbackQuery().getMessage().getMessageId();
            long chatId = update.getCallbackQuery().getMessage().getChatId();

            String[] parts = callbackData.split("_");
            String action = parts[0];
            Long orderId = Long.parseLong(parts[1]);

            if ("confirm".equals(action)) {
                Order order = orderService.updateOrderStatus(orderId, Order.OrderStatus.IN_TRANSIT);
                notifyUser(order.getUser().getId());
                updateStatusWithButtons(chatId, (int) messageId,
                        "🚚 Заказ #" + orderId + " сейчас в пути.\nНажмите кнопку ниже, когда доставите его.",
                        createInTransitMarkup(orderId));
            } else if ("delivered".equals(action)) {
                Order order = orderService.updateOrderStatus(orderId, Order.OrderStatus.DELIVERED);
                notifyUser(order.getUser().getId());
                editStatus(chatId, (int) messageId, "✅ Заказ #" + orderId + " успешно завершен и доставлен.");
            } else if ("reject".equals(action)) {
                Order order = orderService.updateOrderStatus(orderId, Order.OrderStatus.REJECTED);
                notifyUser(order.getUser().getId());
                editStatus(chatId, (int) messageId, "❌ Заказ #" + orderId + " был отклонен администратором.");
            }
        }
    }

    private void notifyUser(Long userId) {
        if (userId != null) {
            messagingTemplate.convertAndSend("/topic/orders/" + userId, "updated");
        }
    }

    public void sendOrderNotification(Order order) {
        SendMessage message = new SendMessage();
        message.setChatId(adminChatId);
        message.setText(formatOrderMessage(order));
        message.setParseMode("Markdown");
        message.setReplyMarkup(createInitialMarkup(order.getId()));
        try {
            execute(message);
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }

    private InlineKeyboardMarkup createInitialMarkup(Long orderId) {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        List<InlineKeyboardButton> row = new ArrayList<>();

        InlineKeyboardButton btn1 = new InlineKeyboardButton();
        btn1.setText("✅ Принять");
        btn1.setCallbackData("confirm_" + orderId);

        InlineKeyboardButton btn2 = new InlineKeyboardButton();
        btn2.setText("❌ Отказать");
        btn2.setCallbackData("reject_" + orderId);

        row.add(btn1);
        row.add(btn2);
        rows.add(row);
        markup.setKeyboard(rows);
        return markup;
    }

    private InlineKeyboardMarkup createInTransitMarkup(Long orderId) {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        List<InlineKeyboardButton> row = new ArrayList<>();

        InlineKeyboardButton btn = new InlineKeyboardButton();
        btn.setText("📦 Доставлен");
        btn.setCallbackData("delivered_" + orderId);

        row.add(btn);
        rows.add(row);
        markup.setKeyboard(rows);
        return markup;
    }

    private void updateStatusWithButtons(long chatId, int messageId, String text, InlineKeyboardMarkup markup) {
        EditMessageText edit = new EditMessageText();
        edit.setChatId(String.valueOf(chatId));
        edit.setMessageId(messageId);
        edit.setText(text);

        EditMessageReplyMarkup editMarkup = new EditMessageReplyMarkup();
        editMarkup.setChatId(String.valueOf(chatId));
        editMarkup.setMessageId(messageId);
        editMarkup.setReplyMarkup(markup);

        try {
            execute(edit);
            execute(editMarkup);
        } catch (TelegramApiException e) {
            if (!e.getMessage().contains("message is not modified")) {
                e.printStackTrace();
            }
        }
    }

    private String formatOrderMessage(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("📦 *НОВЫЙ ЗАКАЗ #").append(order.getId()).append("*\n\n");
        sb.append("👤 Клиент: ").append(order.getUser().getFirstName()).append(" ")
                .append(order.getUser().getLastName()).append("\n");
        sb.append("📍 Адрес: ").append(order.getAddress()).append("\n");
        sb.append("💰 Сумма: *").append(order.getTotalAmount()).append(" ₽*\n\n");
        sb.append("🛒 Состав:\n");
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                sb.append("- ").append(item.getProduct().getName()).append(" x").append(item.getQuantity())
                        .append("\n");
            }
        }
        return sb.toString();
    }

    private void editStatus(long chatId, int messageId, String text) {
        EditMessageText edit = new EditMessageText();
        edit.setChatId(String.valueOf(chatId));
        edit.setMessageId(messageId);
        edit.setText(text);

        EditMessageReplyMarkup editMarkup = new EditMessageReplyMarkup();
        editMarkup.setChatId(String.valueOf(chatId));
        editMarkup.setMessageId(messageId);
        editMarkup.setReplyMarkup(null);

        try {
            execute(edit);
            execute(editMarkup);
        } catch (TelegramApiException e) {
            if (!e.getMessage().contains("message is not modified")) {
                e.printStackTrace();
            }
        }
    }
}

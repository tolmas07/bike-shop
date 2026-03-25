# Copilot Instructions for Bike Shop Diploma Project

## 1) Big picture
- Monorepo with 3 runtime components:
  - `backend` (Spring Boot, JPA, MySQL, STOMP WebSockets, Telegram bot)
  - `web` (React + Axios + @stomp/stompjs + SockJS)
  - `android` (Native Java, Retrofit2, STOMP WebSocket)
- Data model is in `backend/src/main/java/com/example/bikeshop/entity` and persisted by Spring Data repositories.
- Service boundary: REST + WebSocket from backend; frontend fetches `http://localhost:8080/api/*` and subscribes to `/topic/orders/{userId}`.
- Telegram flow: new order via `/api/orders/create` triggers `OrderBot.sendOrderNotification` -> admin callback updates order via `OrderService.updateOrderStatus`, then pushes to WebSocket.

## 2) Essential commands
- Backend: `cd backend && mvn clean install && mvn spring-boot:run` (or run `BikeshopApplication` in IDE).
- Web: `cd web && npm ci && npm run dev` (serves on `http://localhost:5173`).
- Android: open `android` in Android Studio; host points to `http://10.0.2.2:8080` in code.

## 3) Critical code paths + integration points
- WebSocket config: `backend/src/main/java/com/example/bikeshop/config/WebSocketConfig.java`:
  - endpoint `/ws` (`withSockJS()`, allowed origin `http://localhost:5173`)
  - broker `/topic`, application prefix `/app`.
- Order workflow:
  - controller: `OrderController.createOrderV2` (`/api/orders/create`) builds Order from raw payload Map and calls `orderService.createOrder`.
  - notifications: `OrderBot.sendOrderNotification` and `OrderService.updateOrderStatus` with `SimpMessagingTemplate.convertAndSend("/topic/orders/" + userId, order)`.
- Frontend consumer:
  - `web/src/hooks/useOrderUpdates.js` subscribes to `/topic/orders/${userId}`.
  - `web/src/components/Profile.jsx` updates orders on `lastUpdate`.

## 4) Project-specific conventions
- backend uses `Map<String, Object>` payload parsing (not formal DTO for create/order API). Keep this style when patching endpoints.
- `@CrossOrigin` is applied in controllers (e.g., `OrderController`), then `axios` calls rely on cookies not used now.
- `OrderService.fixZeroPricesInDatabase` has a `@PostConstruct` hotfix; do not remove without confirming test data expectations.
- `background Telegram bot` registered in `BikeshopApplication.main` with `TelegramBotsApi` and bean `OrderBot`.

## 5) Known pitfalls / TODO signals
- Web hook URL mismatch solved: frontend now uses `http://localhost:8080/ws` (backend endpoint is `/ws`).
- Order flow now clears user cart after successful creation via `CartRepository.deleteByUserId(userId)` in `OrderController.createOrderV2`.

## 6) What to avoid and what to keep
- Avoid changing core userId=1 test hardcoding in initial data (likely referenced elsewhere in legacy demo flows).
- Keep rocket path of async dispatch in `OrderService.updateOrderStatus` and Telegram callback button flow to prevent breaking live updates.

---

> If any section seems incomplete, point to the exact feature to expand (Android flows, JWT/Security, Telegram callback edge cases).
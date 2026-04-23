# Bike Shop Diploma Project - Client-Server System

Этот проект представляет собой законченное решение для продажи велосипедов с интеграцией Telegram, WebSockets и синхронизацией между Android и Веб-клиентом.

## Технологический стек
- **Backend**: Spring Boot, Spring Security (JWT), Spring Data JPA, WebSockets (STOMP), MySQL.
- **Android**: Native Java, Retrofit 2, WebSockets, Animator API.
- **Web**: React.js, STOMP.js, Axios.

## Структура проекта
- `/backend`: Серверное приложение на Java.
- `/android`: Исходный код Android-приложения.
- `/web`: Веб-интерфейс на React.
- `database.sql`: Схема базы данных.
- `data.sql`: Тестовые данные для наполнения БД.

## Инструкция по запуску и тестированию

### 1. Подготовка Базы Данных (MySQL)
1. Создайте базу данных `bike_shop`.
2. Выполните скрипт `database.sql` для создания таблиц.
3. Выполните скрипт `data.sql` для наполнения каталога.

### 2. Запуск Backend
1. Откройте папку `backend` в IntelliJ IDEA или VS Code.
2. В файле `src/main/resources/application.properties` введите ваш `BOT_TOKEN` и `admin.chatId` (от @userinfobot в Telegram).
3. Запустите `BikeshopApplication.java`.
4. Сервер будет доступен по адресу: `http://localhost:8080`.

### 3. Тестирование Telegram Бота
1. Напишите `/start` вашему боту.
2. Когда вы сделаете заказ (через Android или Web), бот пришлет уведомление.
3. Нажмите кнопку **«Подтвердить»** в Telegram.
4. Вы увидите мгновенное обновление статуса в приложении/на сайте.

### 4. Запуск Web-клиента
1. Перейдите в папку `web`.
2. Выполните `npm install`.
3. Запустите `npm run dev`.
4. Откройте `http://localhost:5173`. Вы сможете добавлять товары в корзину и делать заказы.

### 5. Запуск Android
1. Откройте папку `android` в Android Studio.
2. Убедитесь, что эмулятор запущен.
3. Запустите приложение. Приложение подключается к продакшн бэкенду `[https://bikeshop-backend-98es.onrender.com](https://dashboard.render.com/web/srv-d7kbr9favr4c73d50nqg)`.
4. Нажмите «Оплатить», чтобы увидеть анимацию платежа и создание заказа.

> Для сборки APK: **Build → Build APK(s)** → файл будет в `app/build/outputs/apk/debug/app-debug.apk`

## Основные возможности
- **Каталог**: Динамическая подгрузка из БД.
- **Синхронизация**: Избранное и корзина привязаны к аккаунту (ID: 1 для теста).
- **Живые уведомления**: Реализовано через WebSocket.
- **Минимализм**: Строгий дизайн с акцентом на контент.

## Дополнительная конфигурация (env vars)
Вместо `application.properties` можно использовать переменные окружения в `backend`:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=update`
- `SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MySQL8Dialect`
- `TELEGRAM_BOT_USERNAME`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHATID`

Пример запуска PowerShell:
```powershell
cd "c:\Users\coca cola\Desktop\bike-shop\backend"
$env:SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/bike_shop?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true'
$env:SPRING_DATASOURCE_USERNAME='root'
$env:SPRING_DATASOURCE_PASSWORD='root'
$env:SPRING_JPA_HIBERNATE_DDL_AUTO='update'
$env:SPRING_JPA_DATABASE_PLATFORM='org.hibernate.dialect.MySQL8Dialect'
$env:TELEGRAM_BOT_USERNAME='Diplom_zakazi_bot'
$env:TELEGRAM_BOT_TOKEN='<token>'
$env:TELEGRAM_ADMIN_CHATID='1039005229'
mvn spring-boot:run
```

## Продакшн (текущее развёртывание)

| Компонент | Сервис | URL |
|-----------|--------|-----|
| Фронтенд (React) | **Vercel** | https://bike-shop-flax.vercel.app |
| Бэкенд (Spring Boot) | **Render.com** | https://bikeshop-backend-98es.onrender.com |
| База данных (MySQL) | **Aiven.io** | mysql-6f15d11-tolmasofficial-bd91.f.aivencloud.com:13235 |

> ⚠️ Render.com (бесплатный план) засыпает после 15 мин неактивности — первый запрос может идти ~50 сек.

## Размещение в облаке (быстрый старт)
### 1) Render.com
1. Создайте сервис "Web Service" для `backend`.
2. Настройте Dockerfile или команду `mvn spring-boot:run`.
3. Добавьте Managed MySQL и env vars.
4. Для фронтенда можно отдельный Static Site (или `git push` в GitHub Pages) с адресом `http://localhost:5173`.

### 2) Railway.app
1. Импортируйте репозиторий.
2. Добавьте MySQL плагин.
3. В блоке `Service` задайте `mvn clean install && mvn spring-boot:run`.
4. Подставьте переменные окружения из секции выше.

### 3) Fly.io (Docker)

## Резервный вариант: Deploy на Render.com (из GitHub)

1. Убедитесь, что проект в репозитории на GitHub.
2. Render: New → **Blueprint** → выбрать репозиторий → `render.yaml` подтянется автоматически.
3. Заполнить переменные вручную:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `ALLOWED_ORIGINS=https://bike-shop-flax.vercel.app`
4. После деплоя бэкенда добавить в Vercel:
   - `VITE_API_BASE_URL=https://<backend>.onrender.com/api`
   - `VITE_STOMP_URL=https://<backend>.onrender.com/ws`

## Локально запуск

Backend:
```powershell
cd "c:\Users\coca cola\Desktop\bike-shop\backend"
mvn spring-boot:run
```

Frontend:
```powershell
cd "c:\Users\coca cola\Desktop\bike-shop\web"
npm install
npm run dev
```

Потом открыть `http://localhost:5173`.

---

### 3) Fly.io (Docker)
1. Создайте `Dockerfile`:
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```
2. `fly launch`, `fly deploy`.
3. Установите secrets: `fly secrets set SPRING_DATASOURCE_PASSWORD='root'` и т.д.

### 4) GitHub Actions (CI/CD)
- Настройте workflow для сборки `backend` (`mvn clean install`) и `web` (`npm ci && npm run build`).
- Для бэкенда deploy на Render/Railway/Fly/AWS.
- Для веба deploy на GitHub Pages/Netlify/Vercel (static build `web/dist`).

---

Проект готов к финальному тестированию!

-- Удаляем БД если она существует и создаем заново
DROP DATABASE IF EXISTS bike_shop;

CREATE DATABASE bike_shop;

USE bike_shop;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    address TEXT,
    phone VARCHAR(20),
    card_data VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров (велосипедов)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Избранное
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, product_id)
);

-- Заказы
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status ENUM(
        'PENDING',
        'CONFIRMED',
        'REJECTED',
        'IN_TRANSIT',
        'DELIVERED'
    ) DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Состав заказов
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Корзина (синхронизируемая)
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, product_id)
);

-- Наполнение данными (велосипеды)
INSERT INTO
    products (
        name,
        description,
        price,
        category,
        image_url
    )
VALUES (
        'Specialized Allez',
        'Шоссейный велосипед для начинающих и профессионалов. Легкий и быстрый.',
        85000.00,
        'Шоссейные',
        'https://example.com/allez.jpg'
    ),
    (
        'Trek Marlin 7',
        'Горный велосипед с отличной амортизацией и надежными тормозами.',
        72000.00,
        'Горные',
        'https://example.com/marlin7.jpg'
    ),
    (
        'Cannondale SuperSix',
        'Профессиональный карбоновый болид для побед на этапах.',
        320000.00,
        'Шоссейные',
        'https://example.com/supersix.jpg'
    ),
    (
        'Giant Stance',
        'Двухподвес для комфортного катания по пересеченной местности.',
        145000.00,
        'Горные',
        'https://example.com/stance.jpg'
    ),
    (
        'Specialized Turbo Vado',
        'Электрический велосипед для города с мощным мотором.',
        250000.00,
        'Электро',
        'https://example.com/vado.jpg'
    );

-- Наполнение данными (пользователь)
INSERT INTO
    users (
        username,
        password,
        role,
        first_name,
        last_name,
        email,
        phone
    )
VALUES (
        'user1',
        '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMG6C7l9E.uC',
        'USER',
        'Иван',
        'Иванов',
        'ivan@test.com',
        '+79991234567'
    );
-- Пароль pass1 (захеширован для Spring Security)
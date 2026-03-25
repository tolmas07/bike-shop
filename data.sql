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

-- Initial admin user
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
        'pass1',
        'USER',
        'Иван',
        'Иванов',
        'ivan@test.com',
        '+79991234567'
    );
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const Cart = ({ userId, onOrderCreated }) => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    const loadCart = () => {
        axios.get(`${API_BASE}/cart/${userId}`).then(res => {
            setCartItems(res.data);
            const sum = res.data.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
            setTotal(sum);
        });
    };

    useEffect(() => {
        loadCart();
    }, [userId]);

    const removeFromCart = (id) => {
        axios.delete(`${API_BASE}/cart/remove/${id}`).then(() => loadCart());
    };

    const checkout = () => {
        const address = prompt("Введите адрес доставки:");
        const phone = prompt("Введите номер телефона:");
        if (address && phone) {
            axios.post(`${API_BASE}/orders/create`, null, { params: { userId, address, phone } })
                .then(res => {
                    alert('Заказ создан! Ожидайте подтверждения.');
                    onOrderCreated(res.data);
                    setCartItems([]);
                    setTotal(0);
                });
        }
    };

    if (cartItems.length === 0) return <div>Корзина пуста</div>;

    return (
        <div className="cart-container">
            <h2>Корзина</h2>
            {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{item.product.price * item.quantity} руб.</span>
                    <button onClick={() => removeFromCart(item.id)}>Удалить</button>
                </div>
            ))}
            <div className="total">
                <strong>Итого: {total} руб.</strong>
            </div>
            <button className="pay-btn" onClick={checkout}>Оплатить</button>
        </div>
    );
};

export default Cart;

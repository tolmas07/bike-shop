import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOrderUpdates } from '../hooks/useOrderUpdates';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const Profile = ({ userId }) => {
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastUpdate = useOrderUpdates(userId);

    const loadOrders = () => {
        axios.get(`${API_BASE}/orders/user/${userId}`).then(res => {
            setOrders(res.data);
            setLoading(false);
        });
    };

    const loadFavorites = () => {
        axios.get(`${API_BASE}/favorites/${userId}`).then(res => setFavorites(res.data));
    };

    useEffect(() => {
        loadOrders();
        loadFavorites();
    }, [userId]);

    useEffect(() => {
        if (lastUpdate) {
            alert(`Статус заказа #${lastUpdate.id} изменился на: ${lastUpdate.status}`);
            setOrders(prev => prev.map(o => o.id === lastUpdate.id ? lastUpdate : o));
        }
    }, [lastUpdate]);

    const removeFavorite = (productId) => {
        axios.delete(`${API_BASE}/favorites/remove`, { params: { userId, productId } }).then(() => loadFavorites());
    };

    if (loading) return <div>Загрузка профиля...</div>;

    return (
        <div className="profile-container">
            <h2>Профиль</h2>
            <h3>📦 Ваши заказы</h3>
            <div className="order-list">
                {orders.map(o => (
                    <div key={o.id} className={`order-card status-${o.status}`}>
                        <span>Заказ #{o.id} - {o.totalAmount} руб.</span>
                        <strong> Статус: {o.status}</strong>
                    </div>
                ))}
            </div>

            <h3>❤️ Избранное</h3>
            <div className="favorite-list">
                {favorites.map(f => (
                    <div key={f.id} className="fav-item">
                        <span>{f.product.name}</span>
                        <button onClick={() => removeFavorite(f.product.id)}>❌</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;

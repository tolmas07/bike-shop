import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const Catalog = ({ userId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE}/products`).then(res => {
            setProducts(res.data);
            setLoading(false);
        });
    }, []);

    const addToCart = (productId) => {
        axios.post(`${API_BASE}/cart/add`, null, { params: { userId, productId } })
            .then(() => alert('Added to cart!'));
    };

    const addToFavorites = (productId) => {
        axios.post(`${API_BASE}/favorites/add`, null, { params: { userId, productId } })
            .then(() => alert('Added to favorites!'));
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="catalog-grid">
            {products.map(p => (
                <div key={p.id} className="bike-card">
                    <img src={p.imageUrl} alt={p.name} />
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <span className="price">{p.price} руб.</span>
                    <div className="actions">
                        <button onClick={() => addToCart(p.id)}>🛒 В корзину</button>
                        <button onClick={() => addToFavorites(p.id)}>❤️</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Catalog;

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User as UserIcon, CheckCircle, Trash2, Plus, Minus, CreditCard, LogOut, Package, Clock, Truck, XCircle, CheckCircle2, ChevronRight, X, ShieldCheck, Settings, PlusCircle, Edit3, Save, AlertCircle, Bell, Filter, ArrowUpWideNarrow, ArrowDownWideNarrow, Bike, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'stompjs';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const CATEGORIES = [
    { id: 'all', label: 'ВСЕ' },
    { id: 'city', label: 'ГОРОДСКИЕ' },
    { id: 'mountain', label: 'ГОРНЫЕ' },
    { id: 'electric', label: 'ЭЛЕКТРО' }
];

const getFullImgUrl = (url) => {
    if (!url) return `https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80`;
    if (url.startsWith('http')) return url;
    return API_BASE.replace('/api', '/images/') + url;
};

function App() {
    const stompClientRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('catalog');
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [userCards, setUserCards] = useState([]);
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [notification, setNotification] = useState(null);
    const [checkoutStatus, setCheckoutStatus] = useState('idle');
    const [showCardSelector, setShowCardSelector] = useState(false);
    const [showSecretAdmin, setShowSecretAdmin] = useState(false);

    const [selectedCat, setSelectedCat] = useState('all');
    const [sortOrder, setSortOrder] = useState('none');

    useEffect(() => {
        fetchProducts();
        const saved = localStorage.getItem('user');
        if (saved) {
            const u = JSON.parse(saved); setUser(u); fetchOrders(u.id); fetchCards(u.id);
        }

        const socket = new SockJS(API_BASE.replace('/api', '/ws'));
        const client = Stomp.over(socket);
        client.debug = null;
        client.connect({}, () => {
            stompClientRef.current = client;
            client.subscribe('/topic/products', (msg) => {
                if (msg.body === 'updated') fetchProducts();
            });
            // Initial subscription if user already exists
            if (saved) {
                const u = JSON.parse(saved);
                client.subscribe(`/topic/orders/${u.id}`, () => fetchOrders(u.id));
            }
        });

        return () => { if (client.connected) client.disconnect(); };
    }, []);

    useEffect(() => {
        if (user && stompClientRef.current && stompClientRef.current.connected) {
            const sub = stompClientRef.current.subscribe(`/topic/orders/${user.id}`, () => {
                fetchOrders(user.id);
                setNotification({ msg: "📦 Статус заказа обновлен!" });
                setTimeout(() => setNotification(null), 3000);
            });
            return () => sub.unsubscribe();
        }
    }, [user, stompClientRef.current?.connected]);

    useEffect(() => {
        const handleKD = (e) => { if (e.ctrlKey && e.altKey && (e.key === 'y' || e.key === 'н' || e.key === 'Y' || e.key === 'Н')) setShowSecretAdmin(p => !p); };
        window.addEventListener('keydown', handleKD);
        return () => window.removeEventListener('keydown', handleKD);
    }, []);

    const fetchProducts = async () => {
        try { const r = await axios.get(`${API_BASE}/products`); setProducts(r.data); }
        catch (e) { console.error('P-Fetch Error:', e); }
    };

    const fetchOrders = async (uid) => {
        try { const r = await axios.get(`${API_BASE}/orders/user/${uid}`); setOrders(r.data); }
        catch (e) { }
    };

    const fetchCards = async (uid) => {
        try { const r = await axios.get(`${API_BASE}/cards/user/${uid}`); setUserCards(r.data); }
        catch (e) { }
    };



    const formatStatus = (s) => {
        switch (s) {
            case 'PENDING': return { text: 'Ожидание', color: '#f39c12', icon: <Clock size={12} /> };
            case 'CONFIRMED': return { text: 'Принят', color: '#27ae60', icon: <CheckCircle size={12} /> };
            case 'IN_TRANSIT': return { text: 'В пути', color: '#2980b9', icon: <Truck size={12} /> };
            case 'DELIVERED': return { text: 'Доставлен', color: '#8e44ad', icon: <CheckCircle2 size={12} /> };
            case 'REJECTED': return { text: 'Отмена', color: '#e74c3c', icon: <XCircle size={12} /> };
            default: return { text: s, color: '#95a5a6' };
        }
    };

    const formatCardNum = (num) => num.replace(/\D/g, '').substring(0, 16).replace(/(\d{4})/g, '$1 ').trim();
    const formatPhoneBY = (num) => {
        let v = num.replace(/\D/g, ''); if (!v.startsWith('375')) v = '375' + v;
        v = v.substring(0, 12); let res = '+375 ';
        if (v.length > 3) res += '(' + v.substring(3, 5); if (v.length > 5) res += ') ' + v.substring(5, 8);
        if (v.length > 8) res += '-' + v.substring(8, 10); if (v.length > 10) res += '-' + v.substring(10, 12);
        return res;
    };

    const handlePay = async (cid) => {
        setShowCardSelector(false); setCheckoutStatus('processing');
        const ad = `${user.city || '-'}, ${user.street || '-'}, ${user.house || '-'}${user.apartment ? '/' + user.apartment : ''}`;
        setTimeout(async () => {
            try {
                const payload = {
                    userId: user.id,
                    address: ad,
                    phone: user.phone || '',
                    items: cart.map(i => ({ id: i.id, quantity: i.quantity }))
                };
                await axios.post(`${API_BASE}/orders/create`, payload);
                setCheckoutStatus('success'); setCart([]); fetchOrders(user.id);
                setTimeout(() => setCheckoutStatus('idle'), 3000);
            } catch (e) { alert("Ошибка банка или сервера!"); setCheckoutStatus('idle'); }
        }, 1500);
    };

    const filteredProducts = products
        .filter(p => selectedCat === 'all' || p.category === selectedCat)
        .sort((a, b) => {
            if (sortOrder === 'low') return a.price - b.price;
            if (sortOrder === 'high') return b.price - a.price;
            return 0;
        });

    return (
        <div className="app">
            <header className="container main-header">
                <div className="logo" onClick={() => { setActiveTab('catalog'); setSelectedCat('all'); }}>BIKE SHOP</div>
                <nav className="desktop-nav">
                    <a href="#" className={activeTab === 'catalog' ? 'active' : ''} onClick={() => setActiveTab('catalog')}>КАТАЛОГ</a>
                    <a href="#" className={activeTab === 'favorites' ? 'active' : ''} onClick={() => setActiveTab('favorites')}>ИЗБРАННОЕ</a>
                    <div className="cart-icon" onClick={() => setActiveTab('cart')}>
                        <ShoppingCart size={20} color={activeTab === 'cart' ? 'black' : '#ccc'} />
                        {cart.length > 0 && <span className="badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                    </div>
                    <UserIcon size={20} onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', opacity: activeTab === 'profile' ? 1 : 0.4 }} />
                </nav>
            </header>

            <div className="mobile-bottom-nav">
                <div className={`m-nav-item ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
                    <Bike size={24} />
                    <span>Каталог</span>
                </div>
                <div className={`m-nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
                    <Heart size={24} />
                    <span>Избранное</span>
                </div>
                <div className={`m-nav-item ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>
                    <div style={{ position: 'relative' }}>
                        <ShoppingCart size={24} />
                        {cart.length > 0 && <span className="m-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                    </div>
                    <span>Корзина</span>
                </div>
                <div className={`m-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    <UserIcon size={24} />
                    <span>Профиль</span>
                </div>
            </div>

            <main className="container" style={{ paddingBottom: '100px' }}>
                <AnimatePresence mode="wait">
                    {!user && activeTab === 'profile' ? (
                        <AuthPage mode={authMode} setMode={setAuthMode} onAuth={async (f) => {
                            const r = await axios.post(`${API_BASE}${authMode === 'login' ? '/auth/login' : '/auth/register'}`, f);
                            setUser(r.data); localStorage.setItem('user', JSON.stringify(r.data)); fetchOrders(r.data.id); fetchCards(r.data.id);
                        }} />
                    ) : (
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                            {activeTab === 'catalog' && (
                                <Catalog
                                    products={filteredProducts}
                                    selectedCat={selectedCat}
                                    setSelectedCat={setSelectedCat}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                    onAdd={p => setCart(c => c.find(i => i.id === p.id) ? c.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...c, { ...p, quantity: 1 }])}
                                    onFav={p => setFavorites(f => f.find(x => x.id === p.id) ? f.filter(x => x.id !== p.id) : [...f, p])}
                                    favs={favorites}
                                />
                            )}
                            {activeTab === 'cart' && <Cart items={cart} onUpdate={(id, d) => setCart(c => c.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} onRemove={id => setCart(c => c.filter(i => i.id !== id))} onCheckout={() => { if (!user) { setAuthMode('login'); setActiveTab('profile'); return; } if (userCards.length === 0) { alert("Добавьте карту!"); setActiveTab('profile'); return; } setShowCardSelector(true); }} />}
                            {activeTab === 'profile' && <Profile user={user} orders={orders} cards={userCards} onUpdateCards={() => fetchCards(user.id)} onUpdateUser={u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} onLogout={() => { setUser(null); localStorage.removeItem('user'); setActiveTab('catalog'); }} formatStatus={formatStatus} formatCardNum={formatCardNum} formatPhoneBY={formatPhoneBY} />}
                            {activeTab === 'favorites' && <Favorites items={favorites} onAdd={p => setCart(c => c.find(i => i.id === p.id) ? c.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...c, { ...p, quantity: 1 }])} onRemove={p => setFavorites(f => f.filter(x => x.id !== p.id))} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>{showSecretAdmin && (
                <div className="secret-admin-overlay">
                    <motion.div className="secret-admin-modal" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#000' }}>УПРАВЛЕНИЕ СКЛАДОМ</h2>
                            <button className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setShowSecretAdmin(false)}><XCircle size={16} /> ЗАКРЫТЬ</button>
                        </div>
                        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                            <AdminPanel products={products} onUpdate={fetchProducts} />
                        </div>
                    </motion.div>
                </div>
            )}</AnimatePresence>

            <AnimatePresence>{showCardSelector && (
                <div className="checkout-overlay">
                    <motion.div className="payment-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="payment-header">
                            <div>
                                <h3>Оплата заказа</h3>
                                <p>Выберите карту для списания</p>
                            </div>
                            <X size={20} style={{ cursor: 'pointer', opacity: 0.4 }} onClick={() => setShowCardSelector(false)} />
                        </div>

                        <div className="cards-list">
                            {userCards.map(card => (
                                <div key={card.id} className="payment-select-item" onClick={() => handlePay(card.id)}>
                                    <div className="card-viz-new">
                                        <div className="viz-chip-gold"></div>
                                        <div className="viz-number-text">•••• {card.cardNumber.slice(-4)}</div>
                                    </div>
                                    <div className="card-meta-new">
                                        <span className="card-lbl">Select Card</span>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            ))}
                            {userCards.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>У вас нет привязанных карт</p>}
                        </div>
                    </motion.div>
                </div>
            )}</AnimatePresence>

            <AnimatePresence>{checkoutStatus !== 'idle' && (
                <div className="checkout-overlay">{checkoutStatus === 'processing' ? (<div className="loader-box"><div className="spinner"></div><p>Обработка...</p></div>) : (<motion.div className="success-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }}><CheckCircle2 size={60} color="#27ae60" /><h3>Готово</h3></motion.div>)}</div>
            )}</AnimatePresence>

            <AnimatePresence>{notification && (
                <motion.div className="toast" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }}>
                    <Bell size={16} /> <span>{notification.msg}</span>
                </motion.div>
            )}</AnimatePresence>

            <style>{`
        .checkout-overlay, .secret-admin-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.92); backdrop-filter: blur(25px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .secret-admin-modal { background: #fff; width: 950px; padding: 48px; border-radius: 40px; box-shadow: 0 40px 120px rgba(0,0,0,0.15); border: 1px solid #eee; overflow: hidden; }
        .modal { background: #fff; width: 360px; padding: 32px; border-radius: 24px; border: 1px solid #f0f0f0; }
        .spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to {transform: rotate(360deg)} }
        .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
        .bike-card { background: #fff; border-radius: 24px; border: 1px solid #f2f2f2; overflow: hidden; padding-bottom: 24px; position: relative; transition: 0.3s; }
        .bike-card:hover { transform: translateY(-8px); border-color: #000; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .stock-badge { position: absolute; top: 15px; left: 15px; background: #000; color: #fff; font-size: 10px; padding: 5px 12px; border-radius: 20px; font-weight: 800; z-index: 10; }
        .bike-info { padding: 0 24px; margin-top: 16px; }
        .card-actions { display: flex; gap: 8px; margin-top: 12px; }
        .fav-heart { background: #f8f8f8; width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .fav-heart:hover { background: #eee; }
        .payment-modal { background: #fff; width: 440px; padding: 48px; border-radius: 40px; box-shadow: 0 60px 150px rgba(0,0,0,0.15); border: 1px solid #f0f0f0; }
        .payment-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .payment-header h3 { font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; }
        .payment-header p { font-size: 14px; color: #999; margin: 6px 0 0 0; }
        .cards-list { display: grid; gap: 16px; }
        .payment-select-item { background: #1a1a1a; color: #fff; padding: 28px; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid transparent; }
        .payment-select-item:hover { transform: translateY(-5px) scale(1.02); background: #000; box-shadow: 0 30px 60px rgba(0,0,0,0.3); border-color: #333; }
        .card-viz-new { display: flex; flex-direction: column; gap: 10px; }
        .viz-chip-gold { width: 40px; height: 30px; background: linear-gradient(135deg, #ffd700, #daa520); border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .viz-number-text { font-size: 18px; font-weight: 900; letter-spacing: 3px; font-family: 'Courier New', monospace; }
        .card-meta-new { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .card-lbl { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; opacity: 0.5; }
        .u-input, .u-select { outline: none; transition: 0.2s; border: 1px solid #eee; padding: 12px; border-radius: 12px; width: 100%; font-size: 13px; margin-top: 5px; background: #fff; color: #000; }
        .u-input:focus, .u-select:focus { border-color: #000 !important; }
        .toast { position: fixed; bottom: 30px; right: 30px; background: #111; color: #fff; padding: 15px 25px; border-radius: 16px; display: flex; gap: 12px; align-items: center; z-index: 3000; }
        
        .admin-form-box { background: #fafafa; padding: 32px; border-radius: 24px; margin-bottom: 40px; border: 1px solid #f0f0f0; }
        .admin-form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px; }
        .admin-section-title { margin-bottom: 24px; letter-spacing: 1.2px; font-size: 11px; font-weight: 900; color: #888; text-transform: uppercase; }
        .admin-submit-btn { margin-top: 20px; padding: 15px 40px; width: auto; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .admin-header-row { background: #f9f9f9; padding: 12px 20px; border-radius: 14px; display: grid; grid-template-columns: 80px 1fr 120px 80px 120px; gap: 20px; font-size: 10px; font-weight: 800; color: #bbb; margin-bottom: 15px; }
        .admin-row-v2 { display: grid; grid-template-columns: 80px 1fr 120px 80px 120px; gap: 20px; align-items: center; padding: 20px 0; border-bottom: 1px solid #f5f5f5; }
        .admin-edit-box { grid-column: 2 / span 4; display: grid; gap: 15px; }
        .admin-edit-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 10px; }
        .admin-edit-meta { display: flex; gap: 10px; margin-top: 10px; align-items: center; }
        .admin-edit-actions { display: flex; gap: 8px; }

        .profile-title-row { display: flex; justify-content: space-between; margin-bottom: 48px; align-items: center; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1.8fr; gap: 48px; }
        .profile-sidebar { background: #fcfcfc; padding: 32px; border-radius: 28px; border: 1px solid #f5f5f5; }
        .card-item-p { background: #111; color: #fff; padding: 18px; border-radius: 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .orders-box { max-height: 600px; overflow-y: auto; padding-right: 12px; }
        .order-hist-row { background: #fff; border: 1px solid #f0f0f0; padding: 24px; border-radius: 24px; margin-bottom: 16px; display: flex; }
        
        .cart-grid { display: grid; grid-template-columns: 1fr 340px; gap: 48px; margin-top: 48px; }
        .cart-items-box { background: #fff; border-radius: 28px; padding: 10px; border: 1px solid #f5f5f5; }
        .cart-row { display: flex; gap: 25px; padding: 24px; border-bottom: 1px solid #f9f9f9; align-items: center; }
        .cart-summary { background: #111; color: #fff; padding: 40px; border-radius: 32px; height: fit-content; box-shadow: 0 40px 100px rgba(0,0,0,0.15); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
        .cat-chips { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
        .cat-chip { padding: 10px 24px; border-radius: 30px; border: 1px solid #eee; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; background: #fff; }
        .cat-chip.active { background: #000; color: #fff; border-color: #000; }
        .sort-btn { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; cursor: pointer; opacity: 0.4; transition: 0.2s; }
        .sort-btn.active { opacity: 1; }

        .main-header { padding: 24px 0; border-bottom: 1px solid #f9f9f9; display: flex; justify-content: space-between; align-items: center; }
        .desktop-nav { display: flex; gap: 35px; align-items: center; }
        .desktop-nav a { font-size: 13px; font-weight: 700; color: #ccc; transition: 0.2s; }
        .desktop-nav a.active { color: #000; }
        .mobile-bottom-nav { display: none; }

        @media (max-width: 768px) {
            html, body { overflow-x: hidden !important; width: 100vw; position: relative; }
            .app { overflow-x: hidden !important; width: 100vw; }
            .container { padding: 0 16px !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
            .admin-header-row { display: none !important; }
            .admin-form-grid { grid-template-columns: 1fr !important; gap: 10px; }
            .admin-row-v2 { grid-template-columns: 1fr !important; gap: 15px; padding: 20px; background: #f9f9f9; border-radius: 20px; margin-bottom: 12px; width: 100%; box-sizing: border-box; }
            .admin-row-v2 img { width: 100% !important; height: 180px !important; object-fit: cover; }
            .secret-admin-modal { width: 100vw; height: 100vh; border-radius: 0; padding: 16px; }

            .desktop-nav { display: none; }
            .logo { width: 100%; text-align: center; font-size: 18px !important; }
            .mobile-bottom-nav { 
                display: flex; position: fixed; bottom: 0; left: 0; width: 100%; height: 75px; 
                background: #fff; border-top: 1px solid #f0f0f0; z-index: 1000; 
                justify-content: space-around; align-items: center; padding-bottom: env(safe-area-inset-bottom);
            }
            .m-nav-item { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #ccc; transition: 0.3s; }
            .m-nav-item.active { color: #000; transform: translateY(-3px); }
            .m-nav-item span { font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .m-badge { position: absolute; top: -5px; right: -10px; background: #000; color: #fff; font-size: 8px; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 900; }
            
            .catalog-container { padding: 16px 0 !important; width: 100%; overflow-x: hidden; }
            .catalog-header { flex-direction: column; align-items: flex-start !important; gap: 24px; margin-bottom: 24px !important; }
            .hero-title { font-size: 32px !important; letter-spacing: -2px !important; }
            .sort-box { flex-direction: column; align-items: flex-start !important; gap: 12px !important; width: 100%; }
            
            .catalog-grid { grid-template-columns: 1fr !important; gap: 20px; width: 100%; }
            .cat-chips { overflow-x: auto; white-space: nowrap; padding-bottom: 8px; margin: 0 -16px 20px -16px; padding-left: 16px; display: flex; gap: 10px; width: 100vw; }
            .cat-chips::-webkit-scrollbar { display: none; }
            .cat-chip { padding: 8px 16px; font-size: 10px; flex-shrink: 0; }
            
            .payment-modal { width: 100% !important; height: auto; min-height: 50vh; position: fixed; bottom: 0; left: 0; border-radius: 32px 32px 0 0; padding: 32px 16px; box-shadow: 0 -20px 50px rgba(0,0,0,0.1); }
            .payment-header h3 { font-size: 20px; }
            .payment-select-item { padding: 18px; }
            .viz-num-text { font-size: 14px; }
            
            .profile-grid { grid-template-columns: 1fr !important; gap: 32px; width: 100%; }
            .profile-sidebar { padding: 24px 16px; border-radius: 20px; }
            .profile-title-row { flex-direction: column; align-items: flex-start; gap: 16px; }
            .order-hist-row { padding: 20px 16px; }
            
            .cart-grid { grid-template-columns: 1fr !important; gap: 24px; }
            .cart-summary { padding: 30px 20px; border-radius: 24px; }
            .cart-row { flex-direction: column; align-items: flex-start; gap: 15px; padding: 20px; }
            
            .admin-container, .profile-container, .cart-container { padding-bottom: 100px; }
        }
      `}</style>
        </div>
    );
}

const AdminPanel = ({ products, onUpdate }) => {
    const [editMode, setEditMode] = useState(null);
    const [f, setF] = useState({ name: '', price: '', description: '', stock: 0, imageUrl: '', category: 'city' });
    const [editF, setEditF] = useState({});

    const add = async () => {
        if (!f.name) return;
        try {
            const payload = { ...f, price: Number(f.price), stock: Number(f.stock) };
            await axios.post(`${API_BASE}/products`, payload);
            setF({ name: '', price: '', description: '', stock: 0, imageUrl: '', category: 'city' }); onUpdate();
            alert("Товар добавлен!");
        } catch (err) { alert("ОШИБКА: " + (err.response?.data?.message || "Перезапустите Backend")); }
    };

    const save = async (id) => {
        try {
            const payload = { ...editF, price: Number(editF.price), stock: Number(editF.stock) };
            await axios.put(`${API_BASE}/products/${id}`, payload);
            setEditMode(null); onUpdate(); alert("Сохранено!");
        } catch (err) { alert("ОШИБКА Сохранения!"); }
    };

    const del = async (id) => { if (window.confirm("Удалить велосипед?")) { await axios.delete(`${API_BASE}/products/${id}`); onUpdate(); } };

    return (
        <div>
            <div style={{ background: '#fafafa', padding: '32px', borderRadius: '24px', marginBottom: '40px', border: '1px solid #f0f0f0' }}>
                <h4 style={{ marginBottom: '24px', letterSpacing: '1.2px', fontSize: '11px', fontWeight: 900, color: '#888' }}>ДОБАВИТЬ НОВУЮ МОДЕЛЬ</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px' }}>
                    <input className="u-input" placeholder="Название" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
                    <input className="u-input" type="number" placeholder="Цена" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
                    <input className="u-input" type="number" placeholder="Запас" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} />
                    <select className="u-select" style={{ marginTop: '5px' }} value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
                        {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>
                <input className="u-input" style={{ marginTop: '12px' }} placeholder="URL изображения" value={f.imageUrl} onChange={e => setF({ ...f, imageUrl: e.target.value })} />
                <textarea className="u-input" style={{ marginTop: '12px', minHeight: '60px' }} placeholder="Описание" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
                <button className="btn" style={{ marginTop: '20px', padding: '15px 40px' }} onClick={add}>ОПУБЛИКОВАТЬ В КАТАЛОГ</button>
            </div>

            <div className="admin-header-row" style={{ background: '#f9f9f9', padding: '12px 20px', borderRadius: '14px', display: 'grid', gridTemplateColumns: '80px 1fr 120px 80px 120px', gap: '20px', fontSize: '10px', fontWeight: 800, color: '#bbb', marginBottom: '15px' }}>
                <span>ПРЕВЬЮ</span><span>ИНФОРМАЦИЯ</span><span>ЦЕНА</span><span>ЗАПАС</span><span>ДЕЙСТВИЯ</span>
            </div>

            <div style={{ display: 'grid' }}>
                {products.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>Товаров пока нет</p> : products.map(p => (
                    <div key={p.id} className="admin-row-v2" style={{ alignItems: 'flex-start' }}>
                        <img src={getFullImgUrl(p.imageUrl)} style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #eee', marginTop: '10px' }} />
                        {editMode === p.id ? (
                            <div className="admin-edit-box">
                                <div className="admin-edit-grid">
                                    <input className="u-input" value={editF.name} onChange={e => setEditF({ ...editF, name: e.target.value })} placeholder="Название" />
                                    <select className="u-select" style={{ height: '44px', marginTop: '5px' }} value={editF.category} onChange={e => setEditF({ ...editF, category: e.target.value })}>
                                        {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                    <input className="u-input" type="number" value={editF.price} onChange={e => setEditF({ ...editF, price: e.target.value })} placeholder="Цена" />
                                    <input className="u-input" type="number" value={editF.stock} onChange={e => setEditF({ ...editF, stock: e.target.value })} placeholder="Склад" />
                                </div>
                                <div className="admin-edit-meta">
                                    <input className="u-input edit-url-input" value={editF.imageUrl} onChange={e => setEditF({ ...editF, imageUrl: e.target.value })} placeholder="URL картинки" />
                                    <div className="admin-edit-actions">
                                        <button className="btn" style={{ padding: '12px', background: '#000' }} onClick={() => save(p.id)}><Save size={18} /></button>
                                        <button className="btn btn-secondary" style={{ padding: '12px' }} onClick={() => setEditMode(null)}><X size={18} /></button>
                                    </div>
                                </div>
                                <textarea className="u-input" style={{ marginTop: '10px', minHeight: '60px' }} value={editF.description} onChange={e => setEditF({ ...editF, description: e.target.value })} placeholder="Описание модели"></textarea>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#999', textTransform: 'uppercase' }}>{p.category || 'city'}</div>
                                    <div style={{ fontWeight: '800', fontSize: '15px' }}>{p.name}</div>
                                    <div style={{ fontSize: '12px', color: '#bbb', marginTop: '4px', maxHeight: '18px', overflow: 'hidden' }}>{p.description || "Нет описания."}</div>
                                </div>
                                <div style={{ fontWeight: '900', fontSize: '16px' }}>{p.price.toLocaleString()} ₽</div>
                                <div style={{ fontWeight: 800, color: p.stock > 0 ? '#27ae60' : '#e74c3c' }}>{p.stock} шт</div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '14px', cursor: 'pointer' }} onClick={() => { setEditMode(p.id); setEditF({ ...p }); }}><Edit3 size={18} /></div>
                                    <div style={{ background: '#fff0f0', padding: '12px', borderRadius: '14px', cursor: 'pointer' }} onClick={() => del(p.id)}><Trash2 size={18} color="#e74c3c" /></div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Catalog = ({ products, selectedCat, setSelectedCat, sortOrder, setSortOrder, onAdd, onFav, favs }) => (
    <div className="catalog-container">
        <div className="catalog-header">
            <div className="cat-title-box">
                <h1 className="hero-title">COLLECTION.<br />2026.</h1>
                <p className="hero-sub">Найдите велосипед под свой стиль жизни.</p>
            </div>
            <div className="sort-box">
                <div className={`sort-btn ${sortOrder === 'low' ? 'active' : ''}`} onClick={() => setSortOrder(p => p === 'low' ? 'none' : 'low')}>
                    <ArrowUpWideNarrow size={18} /> СНАЧАЛА ДЕШЕВЫЕ
                </div>
                <div className={`sort-btn ${sortOrder === 'high' ? 'active' : ''}`} onClick={() => setSortOrder(p => p === 'high' ? 'none' : 'high')}>
                    <ArrowDownWideNarrow size={18} /> СНАЧАЛА ДОРОГИЕ
                </div>
            </div>
        </div>

        <div className="cat-chips">
            {CATEGORIES.map(cat => (
                <div key={cat.id} className={`cat-chip ${selectedCat === cat.id ? 'active' : ''}`} onClick={() => setSelectedCat(cat.id)}>
                    {cat.label}
                </div>
            ))}
        </div>

        <div className="catalog-grid">
            {products.length === 0 ? <p style={{ padding: '60px 0', fontSize: '18px', color: '#ccc' }}>В этой категории товаров пока нет</p> : products.map(p => (
                <div key={p.id} className="bike-card">
                    <div className="stock-badge">{p.stock > 0 ? `STOCK: ${p.stock}` : 'SOLD OUT'}</div>
                    <img src={getFullImgUrl(p.imageUrl)} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                    <div className="bike-info">
                        <span style={{ fontSize: '10px', color: '#999', fontWeight: 800, textTransform: 'uppercase' }}>{p.category || 'city'}</span>
                        <h3 style={{ margin: '4px 0 10px 0' }}>{p.name}</h3>
                        <p style={{ fontWeight: '900', fontSize: '19px' }}>{p.price.toLocaleString()} ₽</p>
                        <div className="card-actions">
                            <button className="btn" style={{ flex: 1, padding: '14px' }} onClick={() => onAdd(p)}>В КОРЗИНУ</button>
                            <div className="fav-heart" onClick={() => onFav(p)}><Heart size={18} fill={favs.find(f => f.id === p.id) ? "#000" : "none"} color={favs.find(f => f.id === p.id) ? "#000" : "#ddd"} /></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AuthPage = ({ mode, setMode, onAuth }) => (
    <div style={{ maxWidth: '360px', margin: '100px auto', padding: '40px', background: '#fff', borderRadius: '32px', border: '1px solid #eee' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: 900, fontSize: '24px' }}>BIKE SHOP</h2>
        <LoginForm onAuth={onAuth} mode={mode} setMode={setMode} />
    </div>
);

const LoginForm = ({ onAuth, mode, setMode }) => {
    const [f, setF] = useState({ username: '', password: '' });
    return (
        <>
            <div style={{ marginBottom: '18px' }}><span style={{ fontSize: '10px', fontWeight: 800, color: '#bbb' }}>ЛОГИН</span><input className="u-input" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} /></div>
            <div style={{ marginBottom: '35px' }}><span style={{ fontSize: '10px', fontWeight: 800, color: '#bbb' }}>ПАРОЛЬ</span><input className="u-input" type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
            <button className="btn" style={{ width: '100%', padding: '16px', fontWeight: 900, borderRadius: '16px' }} onClick={() => onAuth(f)}>{mode === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ'}</button>
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', cursor: 'pointer', color: '#888', fontWeight: 700 }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Нет аккаунта? Сюда' : 'Есть аккаунт? Войти'}</p>
        </>
    );
};

const Profile = ({ user, orders, cards, onUpdateCards, onUpdateUser, onLogout, formatStatus, formatCardNum, formatPhoneBY }) => {
    const [u, setU] = useState(user);
    const [c, setC] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
    const save = async () => { try { const r = await axios.put(`${API_BASE}/auth/profile/${user.id}`, u); onUpdateUser(r.data); alert("Данные обновлены!"); } catch (e) { alert("Ошибка!"); } };
    return (
        <div className="profile-container" style={{ padding: '40px 0' }}>
            <div className="profile-title-row">
                <div><h1 style={{ fontSize: '32px', fontWeight: '900' }}>Профиль.</h1></div>
                <button className="btn btn-secondary" style={{ height: '40px', padding: '0 25px' }} onClick={onLogout}><LogOut size={14} /> Выйти</button>
            </div>
            <div className="profile-grid">
                <div className="profile-sidebar">
                    <h4 className="profile-section-title">ДАННЫЕ ДОСТАВКИ</h4>
                    <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <input className="u-input" value={u.city || ''} placeholder="Город" onChange={e => setU({ ...u, city: e.target.value })} />
                        <input className="u-input" value={u.street || ''} placeholder="Улица" onChange={e => setU({ ...u, street: e.target.value })} />
                        <input className="u-input" value={u.house || ''} placeholder="Дом" onChange={e => setU({ ...u, house: e.target.value })} />
                        <input className="u-input" value={u.apartment || ''} placeholder="Кв" onChange={e => setU({ ...u, apartment: e.target.value })} />
                    </div>
                    <div className="phone-input-box">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#999' }}>ТЕЛЕФОН</span>
                        <input className="u-input" value={u.phone || ''} onChange={e => setU({ ...u, phone: formatPhoneBY(e.target.value) })} placeholder="+375" />
                    </div>
                    <button className="btn" style={{ width: '100%', marginTop: '20px', padding: '15px' }} onClick={save}>СОХРАНИТЬ АДРЕС</button>

                    <h4 className="profile-section-title" style={{ marginTop: '48px' }}>КАРТЫ</h4>
                    {cards.map(card => (
                        <div key={card.id} className="card-item-p">
                            <span style={{ fontSize: '13px', letterSpacing: '1.5px' }}>•••• {card.cardNumber.slice(-4)}</span>
                            <Trash2 size={14} color="#e74c3c" style={{ cursor: 'pointer', opacity: 0.6 }} onClick={async () => { await axios.delete(`${API_BASE}/cards/${card.id}`); onUpdateCards(); }} />
                        </div>
                    ))}
                    <div style={{ border: '1px dashed #ddd', padding: '15px', borderRadius: '18px', marginTop: '15px' }}>
                        <input className="u-input" style={{ padding: '10px' }} value={c.cardNumber} onChange={e => setC({ ...c, cardNumber: formatCardNum(e.target.value) })} placeholder="Номер карты" />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input className="u-input" style={{ padding: '10px' }} value={c.expiryDate} placeholder="ММ/ГГ" onChange={e => { let v = e.target.value.replace(/\D/g, ''); if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4); setC({ ...c, expiryDate: v }); }} />
                            <input className="u-input" style={{ width: '65px', padding: '10px' }} value={c.cvv} onChange={e => setC({ ...c, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) })} placeholder="CVV" />
                        </div>
                        <button className="btn" style={{ width: '100%', marginTop: '12px', fontSize: '12px', padding: '12px' }} onClick={async () => { await axios.post(`${API_BASE}/cards/add?userId=${user.id}`, c); setC({ cardNumber: '', expiryDate: '', cvv: '' }); onUpdateCards(); }}>ПРИВЯЗАТЬ КАРТУ</button>
                    </div>
                </div>
                <div>
                    <h4 className="profile-section-title">ИСТОРИЯ ЗАКАЗОВ</h4>
                    <div className="orders-box">
                        {orders.map(o => (
                            <div key={o.id} className="order-hist-row">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontWeight: 900 }}>Заказ #{o.id}</span>
                                        <div style={{ fontSize: '10px', color: formatStatus(o.status).color, background: formatStatus(o.status).color + '15', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>{formatStatus(o.status).text}</div>
                                    </div>
                                    <div style={{ display: 'grid', gap: '5px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
                                        {o.items && o.items.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                                                <span>{item.product?.name} x{item.quantity}</span>
                                                <span style={{ fontWeight: 700 }}>{item.price.toLocaleString()} ₽</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '11px', color: '#ccc' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '11px', display: 'block', color: '#999' }}>ИТОГО:</span>
                                            <span style={{ fontWeight: 900, fontSize: '20px' }}>{o.totalAmount.toLocaleString()} ₽</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Cart = ({ items, onUpdate, onRemove, onCheckout }) => {
    return (
        <div className="cart-container" style={{ padding: '40px 0' }}>
            <h1>Корзина.</h1>
            {items.length === 0 ? <p style={{ marginTop: '40px', fontSize: '18px', color: '#ccc' }}>Ваша корзина пуста</p> : (
                <div className="cart-grid">
                    <div className="cart-items-box">
                        {items.map(i => (
                            <div key={i.id} className="cart-row">
                                <div style={{ flex: 1 }}>
                                    <h3>{i.name}</h3>
                                    <p style={{ fontWeight: 800 }}>{i.price.toLocaleString()} ₽</p>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f9f9f9', padding: '8px 15px', borderRadius: '14px' }}>
                                    <Minus size={14} onClick={() => onUpdate(i.id, -1)} style={{ cursor: 'pointer', opacity: 0.5 }} />
                                    <span style={{ fontWeight: 900, width: '20px', textAlign: 'center' }}>{i.quantity}</span>
                                    <Plus size={14} onClick={() => onUpdate(i.id, 1)} style={{ cursor: 'pointer', opacity: 0.5 }} />
                                </div>
                                <Trash2 size={18} color="#e74c3c" onClick={() => onRemove(i.id)} style={{ cursor: 'pointer', opacity: 0.3 }} />
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <span style={{ fontSize: '12px', fontWeight: 800, opacity: 0.5 }}>ИТОГО К ОПЛАТЕ</span>
                        <h2 style={{ fontSize: '32px', margin: '10px 0 40px 0', fontWeight: 900 }}>{items.reduce((a, b) => a + b.price * b.quantity, 0).toLocaleString()} ₽</h2>
                        <button className="btn" style={{ width: '100%', background: '#fff', color: '#000', fontWeight: '900', padding: '18px', borderRadius: '18px' }} onClick={onCheckout}>ОФОРМИТЬ ЗАКАЗ</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Favorites = ({ items, onAdd, onRemove }) => (
    <div className="favorites-container" style={{ padding: '40px 0' }}>
        <h1>Избранное ({items.length})</h1>
        <div className="catalog-grid" style={{ marginTop: '48px' }}>
            {items.map(p => (
                <div key={p.id} className="bike-card">
                    <img src={getFullImgUrl(p.imageUrl)} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                    <div className="bike-info">
                        <h3>{p.name}</h3>
                        <p style={{ fontWeight: 800 }}>{p.price.toLocaleString()} ₽</p>
                        <div className="card-actions">
                            <button className="btn" style={{ width: '100%', marginTop: '10px', height: '45px', fontWeight: 900, borderRadius: '14px' }} onClick={() => onAdd(p)}>В КОРЗИНУ</button>
                            <div className="fav-heart" style={{ borderRadius: '14px' }} onClick={() => onRemove(p)}><X size={18} color="#e74c3c" /></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default App;

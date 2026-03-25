import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User as UserIcon, CheckCircle, Trash2, Plus, Minus, CreditCard, LogOut, Package, Clock, Truck, XCircle, CheckCircle2, ChevronRight, X, ShieldCheck, Settings, PlusCircle, Edit3, Save, AlertCircle, Bell, Filter, ArrowUpWideNarrow, ArrowDownWideNarrow, Bike, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
    }, []);

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
        try { const r = await axios.get(`${API_BASE}/orders/user/${uid}`); setOrders(r.data.reverse()); }
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
        <div className="app bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen">
            <nav className="fixed top-0 w-full z-50 glass-nav">
                <div className="flex justify-between items-center w-full px-8 py-6 max-w-[1920px] mx-auto">
                    <div className="text-2xl font-black tracking-tighter text-zinc-900 cursor-pointer" onClick={() => { setActiveTab('catalog'); setSelectedCat('all'); }}>KINETIC</div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a
                            className={`font-['Inter'] tracking-tight font-medium uppercase text-xs cursor-pointer transition-all ${activeTab === 'catalog' ? 'text-[#006d35] border-b-2 border-[#00e676] pb-1' : 'text-zinc-400 hover:text-zinc-900'}`}
                            onClick={() => setActiveTab('catalog')}
                        >
                            Каталог
                        </a>
                    </div>
                    <div className="flex gap-6 items-center">
                        <button className="hover:opacity-80 transition-opacity relative" onClick={() => setActiveTab('favorites')}>
                            <span className={`material-symbols-outlined text-xl ${activeTab === 'favorites' ? 'fill-1 text-primary' : ''}`}>favorite</span>
                            {favorites.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">{favorites.length}</span>}
                        </button>
                        <button className="hover:opacity-80 transition-opacity relative" onClick={() => setActiveTab('cart')}>
                            <span className={`material-symbols-outlined text-xl ${activeTab === 'cart' ? 'text-primary' : ''}`}>shopping_cart</span>
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                        </button>
                        <button className="hover:opacity-80 transition-opacity" onClick={() => setActiveTab('profile')}>
                            <span className={`material-symbols-outlined text-xl ${activeTab === 'profile' ? 'text-primary' : ''}`}>person</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-24">
                <AnimatePresence mode="wait">
                    {!user && activeTab === 'profile' ? (
                        <div className="container mx-auto px-8">
                            <AuthPage mode={authMode} setMode={setAuthMode} onAuth={async (f) => {
                                const r = await axios.post(`${API_BASE}${authMode === 'login' ? '/auth/login' : '/auth/register'}`, f);
                                setUser(r.data); localStorage.setItem('user', JSON.stringify(r.data)); fetchOrders(r.data.id); fetchCards(r.data.id);
                            }} />
                        </div>
                    ) : (
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                            {activeTab === 'catalog' && (
                                <Catalog
                                    products={filteredProducts}
                                    selectedCat={selectedCat}
                                    setSelectedCat={setSelectedCat}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                    onAdd={p => {
                                        setCart(c => c.find(i => i.id === p.id) ? c.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...c, { ...p, quantity: 1 }]);
                                        setNotification({ msg: `🚲 ${p.name} добавлен в корзину!` });
                                        setTimeout(() => setNotification(null), 3000);
                                    }}
                                    onFav={p => setFavorites(f => f.find(x => x.id === p.id) ? f.filter(x => x.id !== p.id) : [...f, p])}
                                    favs={favorites}
                                />
                            )}
                            <div className="max-w-[1920px] mx-auto px-8 md:px-20">
                                {activeTab === 'cart' && <Cart items={cart} onUpdate={(id, d) => setCart(c => c.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} onRemove={id => setCart(c => c.filter(i => i.id !== id))} onCheckout={() => { if (!user) { setAuthMode('login'); setActiveTab('profile'); return; } if (userCards.length === 0) { alert("Добавьте карту в профиле!"); setActiveTab('profile'); return; } setShowCardSelector(true); }} />}
                                {activeTab === 'profile' && <Profile user={user} orders={orders} cards={userCards} onUpdateCards={() => fetchCards(user.id)} onUpdateUser={u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} onLogout={() => { setUser(null); localStorage.removeItem('user'); setActiveTab('catalog'); }} formatStatus={formatStatus} formatCardNum={formatCardNum} formatPhoneBY={formatPhoneBY} />}
                                {activeTab === 'favorites' && <Favorites items={favorites} onAdd={p => setCart(c => c.find(i => i.id === p.id) ? c.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...c, { ...p, quantity: 1 }])} onRemove={p => setFavorites(f => f.filter(x => x.id !== p.id))} />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="w-full mt-20 bg-zinc-50">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-12 gap-8 bg-zinc-100">
                    <div className="text-lg font-black text-zinc-900 uppercase">KINETIC</div>
                    <div className="flex gap-10 items-center flex-wrap justify-center">
                        <a className="font-['Inter'] text-[10px] tracking-[0.05em] uppercase font-bold text-zinc-400 hover:text-[#00e676] transition-colors" href="#">Приватность</a>
                        <a className="font-['Inter'] text-[10px] tracking-[0.05em] uppercase font-bold text-zinc-400 hover:text-[#00e676] transition-colors" href="#">Условия</a>
                        <a className="font-['Inter'] text-[10px] tracking-[0.05em] uppercase font-bold text-zinc-400 hover:text-[#00e676] transition-colors" href="#">Доставка</a>
                        <span className="font-['Inter'] text-[10px] tracking-[0.05em] uppercase font-bold text-zinc-400">© 2024 KINETIC PRECISION.</span>
                    </div>
                </div>
            </footer>

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
                <div className="checkout-overlay"><motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}><h3>Оплата заказа</h3><X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowCardSelector(false)} /></div>{userCards.map(card => (<div key={card.id} className="selectable-card" style={{ padding: '16px', borderRadius: '14px' }} onClick={() => handlePay(card.id)}><div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><div className="mini-chip" style={{ width: '24px', height: '18px' }}></div><p>•••• {card.cardNumber.slice(-4)}</p></div><ChevronRight size={14} opacity={0.3} /></div>))}</motion.div></div>
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
        .u-input, .u-select { outline: none; transition: 0.2s; border: 1px solid #eee; padding: 12px; border-radius: 12px; width: 100%; font-size: 13px; margin-top: 5px; background: #fff; color: #000; }
        .u-input:focus, .u-select:focus { border-color: #000 !important; }
        .toast { position: fixed; bottom: 30px; right: 30px; background: #111; color: #fff; padding: 15px 25px; border-radius: 16px; display: flex; gap: 12px; align-items: center; z-index: 3000; }
        .admin-row-v2 { display: grid; grid-template-columns: 80px 1fr 120px 80px 120px; gap: 20px; align-items: center; padding: 20px 0; border-bottom: 1px solid #f5f5f5; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
        .fill-1 { font-variation-settings: 'FILL' 1; }
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

            <div style={{ background: '#f9f9f9', padding: '12px 20px', borderRadius: '14px', display: 'grid', gridTemplateColumns: '80px 1fr 120px 80px 120px', gap: '20px', fontSize: '10px', fontWeight: 800, color: '#bbb', marginBottom: '15px' }}>
                <span>ПРЕВЬЮ</span><span>ИНФОРМАЦИЯ</span><span>ЦЕНА</span><span>ЗАПАС</span><span>ДЕЙСТВИЯ</span>
            </div>

            <div style={{ display: 'grid' }}>
                {products.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>Товаров пока нет</p> : products.map(p => (
                    <div key={p.id} className="admin-row-v2" style={{ alignItems: 'flex-start' }}>
                        <img src={getFullImgUrl(p.imageUrl)} style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #eee', marginTop: '10px' }} />
                        {editMode === p.id ? (
                            <div style={{ gridColumn: '2 / span 4', display: 'grid' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '10px' }}>
                                    <input className="u-input" value={editF.name} onChange={e => setEditF({ ...editF, name: e.target.value })} placeholder="Название" />
                                    <select className="u-select" style={{ height: '44px', marginTop: '5px' }} value={editF.category} onChange={e => setEditF({ ...editF, category: e.target.value })}>
                                        {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                    <input className="u-input" type="number" value={editF.price} onChange={e => setEditF({ ...editF, price: e.target.value })} placeholder="Цена" />
                                    <input className="u-input" type="number" value={editF.stock} onChange={e => setEditF({ ...editF, stock: e.target.value })} placeholder="Склад" />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                                    <input className="u-input" style={{ flex: 1 }} value={editF.imageUrl} onChange={e => setEditF({ ...editF, imageUrl: e.target.value })} placeholder="URL картинки" />
                                    <div style={{ display: 'flex', gap: '8px' }}>
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
    <div className="catalog-wrapper">
        <section className="relative min-h-[921px] flex items-center px-8 md:px-20 hero-gradient">
            <div className="grid grid-cols-1 md:grid-cols-12 w-full max-w-[1920px] mx-auto items-center">
                <div className="md:col-span-6 z-10">
                    <span className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase font-bold text-primary mb-4 block">ИНЖЕНЕРНОЕ СОВЕРШЕНСТВО</span>
                    <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] text-on-surface mb-8">КОЛЛЕКЦИЯ<br />2026</h1>
                    <p className="max-w-md text-on-surface-variant font-medium text-lg leading-relaxed mb-10 opacity-70">Слияние аэродинамической точности и человеческого потенциала. Переосмысление возможностей на двух колесах.</p>
                    <button
                        className="primary-gradient text-white px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_40px_rgba(0,230,118,0.3)] transition-all active:scale-95"
                        onClick={() => document.getElementById('discovery').scrollIntoView({ behavior: 'smooth' })}
                    >
                        ИССЛЕДОВАТЬ СЕРИЮ
                    </button>
                </div>
                <div className="md:col-span-6 mt-12 md:mt-0 relative">
                    <img alt="Sleek modern bicycle" className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ4I_CBFgJGZZJGvISpiAueA1aWz0zvxP7VC04jll3q_oHRf4mQxhWxipz5xzj1QRlwPh0yPuwJI3P-spt9BisI0DxPaPm_U-4NuMBVtWsAQkLa285STlrjao1DVbjX0WxvBFUtmXbpX1zunwcXe27trpC2jkNU81PUT72ZZXKLDF54sVpUiWUm-NwviER0DY6TlJwitvem3Zw5gogQvA47uv0O0SBk7QEypkVRRyqmtSa_pG79K_oD9xDlN5MAAApg9zosMHwQJC2" />
                    <div className="absolute -bottom-10 -right-10 hidden lg:block">
                        <div className="bg-surface-container-highest p-8 rounded-xl backdrop-blur-xl bg-opacity-30">
                            <span className="block text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2">ВЕС</span>
                            <span className="text-4xl font-black">6.4 KG</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="discovery" className="px-8 md:px-20 py-32 bg-white">
            <div className="max-w-[1920px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">ТЕХНОЛОГИЧНОЕ СНАРЯЖЕНИЕ</h2>
                        <div className="flex gap-3 flex-wrap">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCat === cat.id ? 'bg-on-surface text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                                    onClick={() => setSelectedCat(cat.id)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex gap-4 mb-4 justify-end">
                            <button className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${sortOrder === 'low' ? 'text-primary' : 'text-zinc-400'}`} onClick={() => setSortOrder(p => p === 'low' ? 'none' : 'low')}>
                                <span className="material-symbols-outlined text-sm">arrow_upward</span> Дешевые
                            </button>
                            <button className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${sortOrder === 'high' ? 'text-primary' : 'text-zinc-400'}`} onClick={() => setSortOrder(p => p === 'high' ? 'none' : 'high')}>
                                <span className="material-symbols-outlined text-sm">arrow_downward</span> Дорогие
                            </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant opacity-40">ПОКАЗАНО {products.length} МОДЕЛЕЙ</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {products.length === 0 ? (
                        <p className="col-span-full py-20 text-center text-zinc-400 font-bold uppercase tracking-widest">В этой категории товаров пока нет</p>
                    ) : products.map(p => (
                        <div key={p.id} className="group cursor-pointer">
                            <div className="bg-surface-container-low rounded-xl p-8 mb-8 relative overflow-hidden">
                                <div className="absolute top-6 left-6 z-10">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${p.stock > 0 ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                                        {p.stock > 0 ? `В НАЛИЧИИ: ${p.stock}` : 'НЕТ В НАЛИЧИИ'}
                                    </span>
                                </div>
                                <button
                                    className={`absolute top-6 right-6 z-10 transition-all ${favs.find(x => x.id === p.id) ? 'text-error opacity-100' : 'text-on-surface opacity-30 group-hover:opacity-100 hover:text-error'}`}
                                    onClick={(e) => { e.stopPropagation(); onFav(p); }}
                                >
                                    <span className={`material-symbols-outlined ${favs.find(x => x.id === p.id) ? 'fill-1' : ''}`}>favorite</span>
                                </button>
                                <div className="aspect-[4/5] flex items-center justify-center">
                                    <img
                                        alt={p.name}
                                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                                        src={getFullImgUrl(p.imageUrl)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black tracking-tighter uppercase mb-1">{p.name}</h3>
                                    <p className="text-xs text-on-surface-variant opacity-60 font-medium uppercase">{p.category || 'Road'} • {p.description?.substring(0, 30)}...</p>
                                </div>
                                <span className="text-xl font-bold text-primary">{p.price.toLocaleString()} ₽</span>
                            </div>
                            <button
                                className="w-full bg-on-surface text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                                onClick={() => onAdd(p)}
                            >
                                В КОРЗИНУ
                                <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
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
        <div style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px', alignItems: 'center' }}><div><h1 style={{ fontSize: '32px', fontWeight: '900' }}>Профиль.</h1></div><button className="btn btn-secondary" style={{ height: '40px', padding: '0 25px' }} onClick={onLogout}><LogOut size={14} /> Выйти</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '48px' }}>
                <div style={{ background: '#fcfcfc', padding: '32px', borderRadius: '28px', border: '1px solid #f5f5f5' }}>
                    <h4 style={{ marginBottom: '20px', fontSize: '12px', fontWeight: 800, color: '#bbb' }}>ДАННЫЕ ДОСТАВКИ</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <input className="u-input" value={u.city || ''} placeholder="Город" onChange={e => setU({ ...u, city: e.target.value })} />
                        <input className="u-input" value={u.street || ''} placeholder="Улица" onChange={e => setU({ ...u, street: e.target.value })} />
                        <input className="u-input" value={u.house || ''} placeholder="Дом" onChange={e => setU({ ...u, house: e.target.value })} />
                        <input className="u-input" value={u.apartment || ''} placeholder="Кв" onChange={e => setU({ ...u, apartment: e.target.value })} />
                    </div>
                    <div style={{ marginTop: '16px' }}><span style={{ fontSize: '10px', fontWeight: 800, color: '#999' }}>ТЕЛЕФОН</span><input className="u-input" value={u.phone || ''} onChange={e => setU({ ...u, phone: formatPhoneBY(e.target.value) })} placeholder="+375" /></div>
                    <button className="btn" style={{ width: '100%', marginTop: '20px', padding: '15px' }} onClick={save}>СОХРАНИТЬ АДРЕС</button>
                    <h4 style={{ marginTop: '48px', marginBottom: '16px', fontSize: '12px', fontWeight: 800, color: '#bbb' }}>КАРТЫ</h4>
                    {cards.map(card => (<div key={card.id} style={{ background: '#111', color: '#fff', padding: '18px', borderRadius: '16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', letterSpacing: '1.5px' }}>•••• {card.cardNumber.slice(-4)}</span>
                        <Trash2 size={14} color="#e74c3c" style={{ cursor: 'pointer', opacity: 0.6 }} onClick={async () => { await axios.delete(`${API_BASE}/cards/${card.id}`); onUpdateCards(); }} />
                    </div>))}
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
                    <h4 style={{ marginBottom: '24px', fontSize: '12px', fontWeight: 800, color: '#bbb' }}>ИСТОРИЯ ЗАКАЗОВ</h4>
                    <div className="order-hist" style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
                        {orders.map(o => (
                            <div key={o.id} className="order-hist-row">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ fontWeight: 900 }}>Заказ #{o.id}</span><div style={{ fontSize: '10px', color: formatStatus(o.status).color, background: formatStatus(o.status).color + '15', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>{formatStatus(o.status).text}</div></div>
                                    <div style={{ display: 'grid', gap: '5px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
                                        {o.items && o.items.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}><span>{item.product?.name} x{item.quantity}</span><span style={{ fontWeight: 700 }}>{item.price.toLocaleString()} ₽</span></div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '11px', color: '#ccc' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                                        <div style={{ textAlign: 'right' }}><span style={{ fontSize: '11px', display: 'block', color: '#999' }}>ИТОГО:</span><span style={{ fontWeight: 900, fontSize: '20px' }}>{o.totalAmount.toLocaleString()} ₽</span></div>
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

const Cart = ({ items, onUpdate, onRemove, onCheckout }) => (
    <div style={{ padding: '40px 0' }}><h1>Корзина.</h1>{items.length === 0 ? <p style={{ marginTop: '40px', fontSize: '18px', color: '#ccc' }}>Ваша корзина пуста</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '48px', marginTop: '48px' }}>
            <div style={{ background: '#fff', borderRadius: '28px', padding: '10px' }}>{items.map(i => (<div key={i.id} style={{ display: 'flex', gap: '25px', padding: '20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}><div style={{ flex: 1 }}><h3>{i.name}</h3><p style={{ fontWeight: 800 }}>{i.price.toLocaleString()} ₽</p></div><div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f9f9f9', padding: '8px 15px', borderRadius: '14px' }}><Minus size={14} onClick={() => onUpdate(i.id, -1)} style={{ cursor: 'pointer', opacity: 0.5 }} /> <span style={{ fontWeight: 900, width: '20px', textAlign: 'center' }}>{i.quantity}</span> <Plus size={14} onClick={() => onUpdate(i.id, 1)} style={{ cursor: 'pointer', opacity: 0.5 }} /></div><Trash2 size={18} color="#e74c3c" onClick={() => onRemove(i.id)} style={{ cursor: 'pointer', opacity: 0.3 }} /></div>))}</div>
            <div style={{ background: '#111', color: '#fff', padding: '40px', borderRadius: '32px', height: 'fit-content' }}><span style={{ fontSize: '12px', fontWeight: 800, opacity: 0.5 }}>ИТОГО К ОПЛАТЕ</span><h2 style={{ fontSize: '32px', margin: '10px 0 40px 0', fontWeight: 900 }}>{items.reduce((a, b) => a + b.price * b.quantity, 0).toLocaleString()} ₽</h2><button className="btn" style={{ width: '100%', background: '#fff', color: '#000', fontWeight: '900', padding: '18px', borderRadius: '18px' }} onClick={onCheckout}>ОФОРМИТЬ ЗАКАЗ</button></div>
        </div>
    )}</div>
);

const Favorites = ({ items, onAdd, onRemove }) => (
    <div style={{ padding: '40px 0' }}><h1>Избранное ({items.length})</h1><div className="catalog-grid" style={{ marginTop: '48px' }}>{items.map(p => (<div key={p.id} className="bike-card"><img src={getFullImgUrl(p.imageUrl)} style={{ width: '100%', height: '220px', objectFit: 'cover' }} /><div className="bike-info"><h3>{p.name}</h3><p style={{ fontWeight: 800 }}>{p.price.toLocaleString()} ₽</p><div className="card-actions"><button className="btn" style={{ width: '100%', marginTop: '10px', height: '45px', fontWeight: 900, borderRadius: '14px' }} onClick={() => onAdd(p)}>В КОРЗИНУ</button><div className="fav-heart" style={{ borderRadius: '14px' }} onClick={() => onRemove(p)}><X size={18} color="#e74c3c" /></div></div></div></div>))}</div></div>
);

export default App;

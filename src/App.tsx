/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useMemo } from 'react';
import {
  Menu, ShoppingBag, Search, ArrowRight, Package, Zap,
  Layers, Award, Plus, Home, Gavel, User, X, ChevronRight,
  Heart, BarChart3, Wallet, Settings, HelpCircle, Truck, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreen from './SplashScreen';
import ProductDetailModal from './components/ProductDetailModal';
import CartView from './components/CartView';
import AdminDashboard from './components/AdminDashboard';
import { PRODUCTS, CATEGORIES, FEATURED_IMAGES } from './data/products';
import { Product, CartItem } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentView, setCurrentView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useMemo(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (product: Product, qty: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const changeQty = (productId: number, delta: number) => {
    setCartItems(prev => prev
      .map(i => i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    );
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS;
    if (currentView === 'favorites') list = PRODUCTS.filter(p => favorites.has(p.id));
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [activeCategory, searchQuery, favorites, currentView]);

  const renderProductCard = (product: Product) => (
    <motion.div
      key={product.id}
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      onClick={() => setSelectedProduct(product)}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 cursor-pointer transition-all hover:border-blue-500/30 shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 p-5 flex items-center justify-center">
        <img
          alt={product.name}
          className="relative z-10 h-full w-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
          src={product.image}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
          {product.badge ? (
            <span className="rounded-lg px-2.5 py-1 text-[10px] font-black border uppercase tracking-wider bg-blue-100 text-blue-600 border-blue-200 shadow-sm">
              {product.badge}
            </span>
          ) : <span />}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
            className={`p-2.5 rounded-2xl backdrop-blur-md transition-all active:scale-95 shadow-md ${favorites.has(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/40 transition-all hover:bg-blue-700 hover:scale-110 active:scale-90"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded mb-2 inline-block w-fit">
          {product.category}
        </span>
        <h3 className="line-clamp-2 text-sm font-bold text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</p>
          <span className={`flex items-center gap-1.5 text-[10px] font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [logoClicks, setLogoClicks] = useState(0);

  useMemo(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % FEATURED_IMAGES.length);
    }, 15000); // 15 seconds
    return () => clearInterval(timer);
  }, []);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    if (next >= 3) {
      setCurrentView('admin');
      setLogoClicks(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLogoClicks(next);
      // Reset clicks after 2 seconds
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  const renderHome = () => (
    <>
      {/* === PREMIUM HERO CAROUSEL === */}
      <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-blue-900/20 h-[24rem] md:h-[32rem] mb-12 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110"
              style={{ backgroundImage: `url('${FEATURED_IMAGES[currentHeroIndex]}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="mb-4 inline-block rounded-full bg-blue-600 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg border border-blue-400/30">
                  Premium Asset {currentHeroIndex + 1}
                </span>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white drop-shadow-2xl mb-6 leading-none">
                  UNLEASH THE<br />POWER OF TCG
                </h2>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="group flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-base font-black text-blue-600 hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                >
                  Shop the Vault <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 right-10 flex gap-2 z-20">
          {FEATURED_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentHeroIndex(i); }}
              className={`h-1.5 transition-all rounded-full ${currentHeroIndex === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>

      {/* === IMAGE SHOWCASE STRIP (all 5 images) === */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-2xl font-black text-slate-900 italic uppercase">Featured Collections</h3>
            <div className="h-1 w-10 bg-blue-600 rounded-full mt-1" />
          </div>
          <button onClick={() => setCurrentView('shop')} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {FEATURED_IMAGES.map((imgUrl, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              onClick={() => { setCurrentHeroIndex(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all border-2 ${currentHeroIndex === idx ? 'border-blue-500 bg-blue-50/10' : 'border-gray-100 bg-slate-50'}`}
            >
              <img
                src={imgUrl}
                alt={`Premium asset ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover p-1 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity px-1">
                <span className="text-[9px] font-black text-white uppercase tracking-tighter bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg border border-blue-400/20">
                  Featured #{idx + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* === QUICK FILTERS === */}
      <div className="mb-10">
        <h3 className="text-2xl font-black text-slate-900 italic uppercase mb-4">Quick Filters</h3>
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setCurrentView('shop'); }}
              className={`flex-none rounded-2xl px-5 py-3 text-sm font-bold transition-all border-2 ${activeCategory === cat.id && currentView === 'shop' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* === TRENDING GRID === */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-900 italic uppercase">Trending Now</h3>
          <button onClick={() => setCurrentView('shop')} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg">View all <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {PRODUCTS.filter(p => p.badge === 'HOT' || p.badge === 'NEW' || p.badge === 'RARE' || p.badge === 'VAULT' || p.badge === 'ELITE' || p.badge === 'LIMIT').slice(0, 8).map(renderProductCard)}
        </div>
      </div>
    </>
  );

  const renderShop = () => (
    <div className="mb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-900 italic uppercase">Full Marketplace</h3>
          <p className="text-sm font-bold text-slate-400">{filteredProducts.length} items available</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-none px-4 py-2 rounded-xl text-xs font-black uppercase border-2 transition-all ${activeCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-slate-400 hover:border-blue-100 hover:text-blue-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {filteredProducts.map(renderProductCard)}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="mb-24">
      <div className="mb-8">
        <h3 className="text-3xl font-black text-slate-900 italic uppercase">Your Favorites</h3>
        <p className="text-sm font-bold text-slate-400">{favorites.size} saved items</p>
      </div>
      {favorites.size > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts.map(renderProductCard)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-bold text-gray-500">Nothing saved yet.</p>
          <button onClick={() => setCurrentView('shop')} className="mt-4 text-blue-600 font-bold hover:underline">Browse the shop →</button>
        </div>
      )}
    </div>
  );

  const renderAuctions = () => (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="bg-blue-600 p-6 rounded-[2rem] shadow-2xl mb-8"><Gavel className="w-20 h-20 text-white animate-bounce" /></div>
      <h3 className="text-4xl font-black text-slate-900 italic uppercase mb-4">Live Auctions</h3>
      <p className="text-slate-500 font-bold text-center max-w-md">Join our Discord to get notified when the next live bidding session begins!</p>
      <button className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-all active:scale-95">Join Discord Community</button>
    </div>
  );

  const renderPortfolio = () => (
    <div className="mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { bg: 'bg-slate-900', icon: <Wallet className="w-20 h-20" />, label: 'Total Value', value: '$12,450.80', sub: '+12.5% this month', subColor: 'text-green-400' },
          { bg: 'bg-blue-600', icon: <BarChart3 className="w-20 h-20" />, label: 'Active Assets', value: '42 Items', sub: '12 Graded • 30 Sealed', subColor: 'text-white/80' },
        ].map((c, i) => (
          <div key={i} className={`${c.bg} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">{c.icon}</div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2">{c.label}</p>
            <h4 className="text-4xl font-black italic mb-3">{c.value}</h4>
            <p className={`text-sm font-bold ${c.subColor}`}>{c.sub}</p>
          </div>
        ))}
        <div className="bg-gray-100 rounded-[2.5rem] p-8 text-slate-900 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="w-20 h-20" /></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Member Tier</p>
          <h4 className="text-4xl font-black italic mb-3">Elite Gold</h4>
          <p className="text-sm font-bold text-blue-600">Top 1% Collector</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>

      <div className="relative flex min-h-screen w-full flex-col bg-white">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center gap-3">
                <button onClick={handleLogoClick} className="p-2.5 rounded-xl hover:bg-gray-100 transition-all active:scale-95 group">
                  <Menu className="w-6 h-6 text-slate-700 group-hover:text-blue-600" />
                </button>
                <div onClick={handleLogoClick} className="cursor-pointer">
                  <h1 className="text-lg md:text-xl font-black tracking-tighter text-blue-600 uppercase italic flex items-center gap-1">
                    <Zap className="w-5 h-5 fill-blue-600 flex-none" />
                    <span className="hidden sm:block">CHRIS TCG BOOSTER BOX</span>
                    <span className="sm:hidden">CHRIS TCG</span>
                  </h1>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                {[{ id: 'home', label: 'Home' }, { id: 'shop', label: 'Shop' }, { id: 'auctions', label: 'Auctions' }, { id: 'portfolio', label: 'Portfolio' }, { id: 'favorites', label: 'Favorites' }].map(item => (
                  <button key={item.id} onClick={() => setCurrentView(item.id)}
                    className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === item.id ? 'text-blue-600 underline underline-offset-8 decoration-2' : 'text-slate-500 hover:text-slate-900'}`}
                  >{item.label}</button>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentView('profile')} className="hidden sm:flex p-2.5 rounded-xl hover:bg-gray-100 transition-all active:scale-95 group">
                  <User className={`w-6 h-6 ${currentView === 'profile' ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'}`} />
                </button>
                <button onClick={() => setCurrentView('cart')} className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all active:scale-95 group">
                  <ShoppingBag className={`w-6 h-6 ${currentView === 'cart' ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'}`} />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white border-2 border-white"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white shadow-sm transition-all outline-none"
                placeholder="Search boosters, ETBs, collections..."
                type="text"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div key={currentView}
                initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}
              >
                {currentHeroIndex !== -1 && (
                  <>
                    {currentView === 'home' && renderHome()}
                    {currentView === 'shop' && renderShop()}
                    {currentView === 'favorites' && renderFavorites()}
                    {currentView === 'auctions' && renderAuctions()}
                    {currentView === 'portfolio' && renderPortfolio()}
                    {currentView === 'profile' && renderPortfolio()}
                    {currentView === 'cart' && (
                      <CartView cartItems={cartItems} onRemove={removeFromCart} onChangeQty={changeQty} onShop={() => setCurrentView('shop')} />
                    )}
                    {currentView === 'admin' && (
                      <AdminDashboard onClose={() => setCurrentView('home')} />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[93%] max-w-sm md:hidden z-50">
          <div className="bg-slate-950/95 backdrop-blur-2xl px-5 py-3.5 rounded-[2rem] shadow-2xl border border-white/10 flex justify-between items-center">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'shop', icon: Layers, label: 'Shop' },
              { id: 'favorites', icon: Heart, label: 'Favs' },
              { id: 'cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
              { id: 'portfolio', icon: BarChart3, label: 'Value' },
            ].map(item => (
              <button key={item.id} onClick={() => setCurrentView(item.id)}
                className={`relative flex flex-col items-center gap-1 transition-all ${currentView === item.id ? 'text-blue-400 scale-110' : 'text-slate-400 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.badge ? item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Side Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-[70] shadow-2xl p-7 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black italic text-blue-600">CHRIS TCG BOOSTER BOX</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-slate-700" />
                </button>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                {[
                  { icon: ShoppingBag, label: 'Storefront', id: 'shop' },
                  { icon: Gavel, label: 'Auctions', id: 'auctions' },
                  { icon: BarChart3, label: 'Portfolio', id: 'portfolio' },
                  { icon: Truck, label: 'Order Tracking' },
                  { icon: CreditCard, label: 'Payment Methods' },
                  { icon: HelpCircle, label: 'Help & Support' },
                  { icon: Settings, label: 'Settings' }
                ].map((item, idx) => (
                  <button key={idx}
                    onClick={() => { if (item.id) { setCurrentView(item.id); setIsMenuOpen(false); } }}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-600 transition-all" />
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="p-5 rounded-[1.5rem] bg-blue-600 text-white shadow-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Elite Member</p>
                  <p className="text-sm font-bold mb-3">0% seller fees for 12 days.</p>
                  <button className="w-full bg-white text-blue-600 text-xs font-black py-3 rounded-xl hover:bg-blue-50 transition-all active:scale-95">Manage Subscription</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => { addToCart(product, qty); }}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.has(selectedProduct.id)}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}

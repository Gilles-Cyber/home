/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useMemo, useEffect } from 'react';
import {
  Menu, ShoppingBag, Search, ArrowRight, Package, Zap,
  Layers, Award, Plus, Home, User, X, ChevronRight,
  Heart, BarChart3, Wallet, Settings, HelpCircle, CreditCard,
  Sun, Moon, LayoutGrid, Crown, Facebook, Gavel,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreen from './SplashScreen';
import ProductDetailModal from './components/ProductDetailModal';
import CartView from './components/CartView';
import AdminDashboard from './components/AdminDashboard';
import AdminAuthModal from './components/AdminAuthModal';
import HighEndHome from './components/HighEndHome';
import SettingsView from './components/SettingsView';
import ChatInterface from './components/ChatInterface';
import CheckoutModal from './components/CheckoutModal';
import { PRODUCTS, CATEGORIES, FEATURED_IMAGES } from './data/products';
import { Product, CartItem } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentView, setCurrentView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  // Supabase & Session State
  const [sessionId, setSessionId] = useState<string>('');

  // Phase 14: Dynamic Products & Theme
  const [liveProducts, setLiveProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tcg_vault_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tcg_vault_theme') as 'light' | 'dark') || 'dark';
  });

  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        // Fallback to static/local data if DB load fails
        const saved = localStorage.getItem('tcg_vault_products');
        setLiveProducts(saved ? JSON.parse(saved) : PRODUCTS);
        return;
      }

      if (data && data.length > 0) {
        setLiveProducts(data);
      } else {
        // If DB is empty, use default data
        setLiveProducts(PRODUCTS);
      }
    };

    fetchProducts();
    // Sync initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdminAuthenticated(!!session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('tcg_vault_theme', next);
    showToast(`Switched to ${next} mode`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Fetch error:', error);
        return;
      }
      if (data && data.length > 0) {
        setLiveProducts(data);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const initSession = async () => {
      let currentIp = '';
      let locationData = { city: '', country: '', lat: null as number | null, lon: null as number | null };

      // 1. IP Fallback / Initial Data
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        currentIp = geoData.ip;
        locationData.city = geoData.city;
        locationData.country = geoData.country_name;
      } catch (err) {
        console.warn('IP Geo-fetch failed');
      }

      // 2. Browser Geolocation (Permission requested)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          locationData.lat = latitude;
          locationData.lon = longitude;

          // Try to get city name from coordinates (Reverse Geocoding)
          try {
            const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const revData = await revRes.json();
            if (revData.address) {
              locationData.city = revData.address.city || revData.address.town || revData.address.village || locationData.city;
              locationData.country = revData.address.country || locationData.country;
            }
          } catch (e) {
            console.warn('Reverse geocoding failed');
          }

          // Update existing session with better data
          const sid = localStorage.getItem('tcg_vault_session');
          if (sid) {
            await supabase.from('visitors').update({
              location_city: locationData.city,
              location_country: locationData.country,
              latitude: locationData.lat,
              longitude: locationData.lon
            }).eq('session_id', sid);
          }
        }, (error) => {
          console.log('User denied or failed geolocation:', error.message);
        });
      }

      let id = localStorage.getItem('tcg_vault_session');
      if (currentIp && !id) {
        const { data: existingVisitor } = await supabase
          .from('visitors')
          .select('session_id')
          .eq('ip_address', currentIp)
          .single();
        if (existingVisitor) id = existingVisitor.session_id;
      }

      if (!id) id = crypto.randomUUID();
      localStorage.setItem('tcg_vault_session', id);
      setSessionId(id);

      await supabase.from('visitors').upsert({
        session_id: id,
        last_active: new Date().toISOString(),
        ip_address: currentIp,
        location_city: locationData.city,
        location_country: locationData.country,
        latitude: locationData.lat,
        longitude: locationData.lon
      }, { onConflict: 'session_id' });
    };

    initSession();
  }, []);


  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const cartTotal = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const discount = totalItems >= 20 ? subtotal * 0.1 : 0;
    const shipping = (subtotal - discount) > 150 ? 0 : 9.99;
    return (subtotal - discount) + shipping;
  }, [cartItems]);

  const renderSettings = () => (
    <SettingsView
      theme={theme}
      onToggleTheme={toggleTheme}
      onClose={() => setCurrentView('home')}
      onLockAdmin={handleLockAdmin}
    />
  );

  // Global Notification Listener
  useEffect(() => {
    const channel = supabase
      .channel('broadcast_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        const { message, type } = payload.new;
        showToast(message, type || 'info');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (p: Product) => {
    const newProduct = { ...p, id: undefined }; // Let DB handle ID if possible, or use Date.now()
    const { data, error } = await supabase.from('products').insert([newProduct]).select();

    if (error) {
      showToast('Error adding product', 'info');
      return;
    }

    if (data) {
      setLiveProducts(prev => [...prev, data[0]]);
      showToast(`Product ${p.name} created`);
    }
  };

  const updateProduct = async (p: Product) => {
    const { error } = await supabase.from('products').update(p).eq('id', p.id);

    if (error) {
      showToast('Error updating product', 'info');
      return;
    }

    setLiveProducts(prev => prev.map(item => item.id === p.id ? p : item));
    showToast(`Updated ${p.name}`);
  };

  const deleteProduct = async (id: number) => {
    const p = liveProducts.find(x => x.id === id);
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      showToast('Error deleting product', 'info');
      return;
    }

    setLiveProducts(prev => prev.filter(item => item.id !== id));
    if (p) showToast(`Deleted ${p.name}`, 'info');
  };

  const addToCart = (product: Product, qty: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      showToast(`Added ${product.name} to cart`);
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
      const product = liveProducts.find(p => p.id === id);
      if (next.has(id)) {
        next.delete(id);
        if (product) showToast(`Removed ${product.name} from favorites`);
      } else {
        next.add(id);
        if (product) showToast(`Added ${product.name} to favorites`);
      }
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    let list = liveProducts;
    if (currentView === 'favorites') list = liveProducts.filter(p => favorites.has(p.id));
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [liveProducts, activeCategory, searchQuery, favorites, currentView]);

  const renderProductCard = (product: Product) => (
    <motion.div
      key={product.id}
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      onClick={() => setSelectedProduct(product)}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border cursor-pointer transition-all shadow-sm hover:shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-white/5 hover:border-blue-500/30' : 'bg-white border-gray-100 hover:border-blue-300'}`}
    >
      <div className={`relative aspect-[4/5] w-full overflow-hidden p-5 flex items-center justify-center ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-50'}`}>
        <img
          alt={product.name}
          className="relative z-10 h-full w-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
          src={product.image}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
          {product.badge ? (
            <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black border uppercase tracking-wider ${theme === 'dark' ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
              {product.badge}
            </span>
          ) : <span />}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
            className={`p-2.5 rounded-2xl backdrop-blur-md transition-all active:scale-95 shadow-md ${favorites.has(product.id) ? 'bg-red-500 text-white' : theme === 'dark' ? 'bg-black/60 text-slate-400 hover:text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}
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
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-2 inline-block w-fit ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
          {product.category}
        </span>
        <h3 className={`line-clamp-2 text-sm font-bold leading-tight mb-3 transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <p className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${product.price.toFixed(2)}</p>
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % FEATURED_IMAGES.length);
    }, 15000); // 15 seconds
    return () => clearInterval(timer);
  }, []);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    if (next >= 7) {
      setLogoClicks(0);
      if (isAdminAuthenticated) {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setShowAdminAuth(true);
      }
    } else {
      setLogoClicks(next);
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('admin_authenticated', 'true');
    setShowAdminAuth(false);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLockAdmin = async () => {
    // Use 'local' scope so we only clear this browser's admin session.
    // Global signOut would revoke the token server-side and kill ALL
    // real-time subscriptions (visitor chat, notifications, etc.) for this client.
    await supabase.auth.signOut({ scope: 'local' });
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setCurrentView('home');
    showToast('Vault Secured 🔒', 'info');
  };

  const renderHome = () => (
    <HighEndHome
      products={liveProducts}
      onAddToCart={addToCart}
      onProductClick={setSelectedProduct}
      onToggleFavorite={(p) => toggleFavorite(p.id)}
      favorites={Array.from(favorites)}
      theme={theme}
      onShopClick={() => setCurrentView('shop')}
    />
  );

  const renderShop = () => (
    <div className="mb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className={`text-3xl font-black italic uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Full Marketplace</h3>
          <p className="text-sm font-bold text-slate-400">{filteredProducts.length} items available</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-none px-4 py-2 rounded-xl text-xs font-black uppercase border-2 transition-all ${activeCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white' : theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:border-blue-500/30' : 'bg-white border-gray-100 text-slate-400 hover:border-blue-100 hover:text-blue-600'}`}
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
        <h3 className={`text-3xl font-black italic uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Your Favorites</h3>
        <p className="text-sm font-bold text-slate-400">{favorites.size} saved items</p>
      </div>
      {favorites.size > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts.map(renderProductCard)}
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-gray-50 border-gray-200'}`}>
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-bold">Nothing saved yet.</p>
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
    <div className={`min-h-screen font-sans antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`} data-theme={theme}>
      <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>

      <div className="relative flex min-h-screen w-full flex-col">
        {/* Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all ${theme === 'dark' ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMenuOpen(true)} className={`p-2.5 rounded-xl transition-all active:scale-95 group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                  <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-700 group-hover:text-blue-600'}`} />
                </button>
                <div onClick={handleLogoClick} className="cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center animate-float">
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-xl rotate-6 group-hover:rotate-0 transition-transform duration-300 shadow-lg shadow-amber-500/30" />
                      <div className="absolute inset-0 bg-slate-900 rounded-xl -rotate-3 group-hover:rotate-0 transition-transform duration-300 border border-white/5" />
                      <Crown className="w-7 h-7 text-amber-400 relative z-10 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                    </div>
                    <div className="flex flex-col -gap-1">
                      <span className="text-xl font-black tracking-tighter holographic-text leading-tight">CHRIS TCG</span>
                      <div className="flex items-center gap-2">
                        <span className="h-[1px] w-4 bg-gradient-to-r from-transparent to-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 tracking-[0.2em] uppercase italic leading-none">King of TCG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                {[{ id: 'home', label: 'Home' }, { id: 'shop', label: 'Shop' }, { id: 'auctions', label: 'Auctions' }, { id: 'portfolio', label: 'Portfolio' }, { id: 'favorites', label: 'Favorites' }].map(item => (
                  <button key={item.id} onClick={() => setCurrentView(item.id)}
                    className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === item.id ? 'text-blue-600 underline underline-offset-8 decoration-2' : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >{item.label}</button>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all active:scale-95 group ${theme === 'dark' ? 'hover:bg-white/5 text-amber-400' : 'hover:bg-gray-100 text-slate-500'}`}>
                  {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>
                <button onClick={() => setCurrentView('favorites')} className={`hidden sm:flex p-2.5 rounded-xl transition-all active:scale-95 group relative ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                  <Heart className={`w-6 h-6 ${currentView === 'favorites' ? 'fill-red-500 text-red-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-700'} group-hover:text-red-500`} />
                  {favorites.size > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border-2 border-white">
                      {favorites.size}
                    </span>
                  )}
                </button>
                <button onClick={() => setCurrentView('profile')} className={`hidden sm:flex p-2.5 rounded-xl transition-all active:scale-95 group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                  <User className={`w-6 h-6 ${currentView === 'profile' ? 'text-blue-600' : theme === 'dark' ? 'text-slate-400' : 'text-slate-700'} group-hover:text-blue-600`} />
                </button>
                <button onClick={() => setCurrentView('cart')} className={`relative p-2.5 rounded-xl transition-all active:scale-95 group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                  <ShoppingBag className={`w-6 h-6 ${currentView === 'cart' ? 'text-blue-600' : theme === 'dark' ? 'text-slate-400' : 'text-slate-700'} group-hover:text-blue-600`} />
                  {cartCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white border-2 border-white">
                      {cartCount}
                    </div>
                  )}
                </button>
                <button onClick={() => setIsChatOpen(true)} className={`p-2.5 rounded-xl transition-all active:scale-95 group relative ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                  <MessageSquare className={`w-6 h-6 ${isChatOpen ? 'text-blue-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-700'} group-hover:text-blue-500`} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse" />
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
                className={`block w-full rounded-2xl border py-3 pl-12 pr-4 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-sm transition-all outline-none ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-gray-50/50 border-gray-100 text-slate-900 focus:bg-white'}`}
                placeholder="Search boosters, ETBs, collections..."
                type="text"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
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
                    {currentView === 'settings' && renderSettings()}
                    {currentView === 'profile' && renderPortfolio()}
                    {currentView === 'cart' && (
                      <CartView
                        cartItems={cartItems}
                        onRemove={removeFromCart}
                        onChangeQty={changeQty}
                        onShop={() => setCurrentView('shop')}
                        onCheckout={() => setIsCheckoutOpen(true)}
                      />
                    )}
                    {currentView === 'admin' && (
                      <AdminDashboard
                        products={liveProducts}
                        onAdd={addProduct}
                        onUpdate={updateProduct}
                        onDelete={deleteProduct}
                        onClose={() => setCurrentView('home')}
                        onLock={handleLockAdmin}
                        showToast={showToast}
                        theme={theme}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Overlays */}
            <AnimatePresence>
              {isCheckoutOpen && (
                <CheckoutModal
                  isOpen={isCheckoutOpen}
                  onClose={() => setIsCheckoutOpen(false)}
                  onOtherMethod={() => {
                    setIsCheckoutOpen(false);
                    setIsChatOpen(true);
                  }}
                  total={cartTotal}
                  theme={theme}
                />
              )}
              {isChatOpen && (
                <ChatInterface
                  theme={theme}
                  onClose={() => setIsChatOpen(false)}
                  sessionId={sessionId}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Nav - Fixed Under */}
        <nav className={`fixed bottom-0 left-0 right-0 md:hidden z-50 border-t safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.1)] ${theme === 'dark' ? 'bg-slate-950/95 border-white/5 backdrop-blur-xl' : 'bg-white/95 border-gray-100 backdrop-blur-xl'}`}>
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'chat', icon: MessageSquare, label: 'Support' },
              { id: 'favorites', icon: Heart, label: 'Favs' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <button key={item.id} onClick={() => item.id === 'chat' ? setIsChatOpen(true) : setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center gap-1 w-full transition-all active:scale-90 ${currentView === item.id ? (theme === 'dark' ? 'text-amber-400' : 'text-blue-600') : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${currentView === item.id ? 'fill-current opacity-20' : ''}`} />
                  {(item.id === 'cart' && cartCount > 0) || (item.id === 'favorites' && favorites.size > 0) ? (
                    <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white border border-slate-950 ${item.id === 'cart' ? 'bg-blue-600' : 'bg-red-500'}`}>
                      {item.id === 'cart' ? cartCount : favorites.size}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${currentView === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
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
              className={`fixed top-0 left-0 h-full w-72 z-[70] shadow-2xl p-7 flex flex-col ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black italic text-blue-600">CHRIS TCG BOOSTER BOX</h2>
                <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`} />
                </button>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                {[
                  { icon: ShoppingBag, label: 'Storefront', id: 'shop' },
                  { icon: BarChart3, label: 'Portfolio', id: 'portfolio' },
                  { icon: CreditCard, label: 'Payment Methods' },
                  { icon: HelpCircle, label: 'Help & Support' },
                  { icon: Settings, label: 'Settings' }
                ].map((item, idx) => (
                  <button key={idx}
                    onClick={() => { if (item.id) { setCurrentView(item.id); setIsMenuOpen(false); } }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-blue-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-blue-600'}`}>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-600 transition-all" />
                  </button>
                ))}

                {/* Social Links */}
                <div className="mt-6 px-3.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Follow the King</p>
                  <div className="flex gap-2">
                    <a
                      href="https://www.tiktok.com/@christcg_pokemon?_r=1&_t=ZT-946ZL8PzeGb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-gray-50 border-gray-100 hover:bg-blue-50 text-slate-700'}`}
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-tight">TikTok</span>
                    </a>
                    <a
                      href="https://www.facebook.com/share/1Hr39HLX5J/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-gray-50 border-gray-100 hover:bg-blue-50 text-slate-700'}`}
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-black uppercase tracking-tight">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
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

      {/* Admin Auth Modal */}
      <AnimatePresence>
        {showAdminAuth && (
          <AdminAuthModal
            onSuccess={handleAdminAuthSuccess}
            onClose={() => setShowAdminAuth(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* GLOBAL TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-24 left-1/2 z-[100] border px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <span className="material-symbols-outlined text-blue-500 text-lg">check_circle</span>
            </div>
            <p className={`text-sm font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}

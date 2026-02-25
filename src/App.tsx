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
  MessageSquare, CheckCircle2, Info
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
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('tcg_vault_session');
    if (saved) return saved;

    const generateUUID = () => {
      try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      } catch (e) { }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const newId = generateUUID();
    localStorage.setItem('tcg_vault_session', newId);
    return newId;
  });

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
      const { data: dbData, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      const merged = [...PRODUCTS];
      if (dbData) {
        dbData.forEach((dbItem: Product) => {
          const index = merged.findIndex(m => m.id === dbItem.id);
          if (index !== -1) {
            merged[index] = { ...merged[index], ...dbItem };
          } else {
            merged.push(dbItem);
          }
        });
      }
      setLiveProducts(merged);
    };

    fetchProducts();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdminAuthenticated(!!session);
    });
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
    const initSession = async () => {
      await supabase.from('visitors').upsert({
        session_id: sessionId,
        last_active: new Date().toISOString()
      }, { onConflict: 'session_id' });
    };
    initSession();
  }, [sessionId]);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const discount = totalItems >= 20 ? subtotal * 0.1 : 0;
    const shipping = (subtotal - discount) > 150 ? 0 : 9.99;
    return (subtotal - discount) + shipping;
  }, [cartItems]);

  const handleLockAdmin = async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setCurrentView('home');
    showToast('Admin session locked', 'info');
  };

  const renderSettings = () => (
    <SettingsView
      theme={theme}
      onToggleTheme={toggleTheme}
      onClose={() => setCurrentView('home')}
      onLockAdmin={handleLockAdmin}
    />
  );

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
    const { id, badge, ...cleanProduct } = p as any;
    const { data, error } = await supabase.from('products').insert([cleanProduct]).select();
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
    const { badge, ...cleanProduct } = p as any;
    const { error } = await supabase.from('products').update(cleanProduct).eq('id', p.id);
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
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + qty > product.stock) {
        showToast(`Only ${product.stock} items left in stock`, 'info');
        return prev;
      }
      showToast(`Added ${product.name} to cart`);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(i => i.product.id !== id));
    showToast('Removed from cart', 'info');
  };

  const changeQty = (productId: number, delta: number) => {
    setCartItems(prev => prev.map(i => {
      if (i.product.id === productId) {
        const nextQty = Math.max(1, i.quantity + delta);
        if (nextQty > i.product.stock) {
          showToast(`Only ${i.product.stock} items available`, 'info');
          return i;
        }
        return { ...i, quantity: nextQty };
      }
      return i;
    }));
  };

  const toggleFavorite = (productOrId: Product | number) => {
    const id = typeof productOrId === 'number' ? productOrId : productOrId.id;
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLogoClick = () => {
    if (isAdminAuthenticated) setCurrentView('admin');
    else setCurrentView('home');
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminAuth(false);
    setCurrentView('admin');
    showToast('Admin access granted');
  };

  const reduceStock = async (items: CartItem[]) => {
    const updates = items.map(async (item) => {
      const newStock = Math.max(0, item.product.stock - item.quantity);
      const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', item.product.id);
      if (error) console.error(`Error updating stock for ${item.product.name}:`, error);
      if (newStock === 0) {
        await supabase.from('notifications').insert([{
          message: `STOCK ALERT: ${item.product.name} is now out of stock!`,
          type: 'warning'
        }]);
      }
      return { id: item.product.id, stock: newStock };
    });
    const results = await Promise.all(updates);
    setLiveProducts(prev => prev.map(p => {
      const update = results.find(r => r.id === p.id);
      return update ? { ...p, stock: update.stock } : p;
    }));
    setCartItems([]);
  };

  const renderHome = () => (
    <HighEndHome
      theme={theme}
      products={liveProducts}
      onProductClick={setSelectedProduct}
      onAddToCart={addToCart}
      onToggleFavorite={toggleFavorite}
      favorites={[...favorites]}
      onShopClick={() => setCurrentView('shop')}
    />
  );

  const renderShop = () => renderHome();
  const renderFavorites = () => renderHome();
  const renderAuctions = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
        <Gavel className="w-10 h-10 text-amber-500" />
      </div>
      <h2 className="text-2xl font-black mb-2 uppercase tracking-tight holographic-text">Elite Auctions</h2>
      <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Weekly live-breaking events and high-end individual card auctions arriving next season.</p>
    </div>
  );
  const renderPortfolio = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
        <BarChart3 className="w-10 h-10 text-blue-500" />
      </div>
      <h2 className="text-2xl font-black mb-2 uppercase tracking-tight holographic-text">Collection Tracker</h2>
      <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Track your investment portfolio, see daily price changes, and manage your vault contents.</p>
    </div>
  );

  const currentHeroIndex = 0;

  return (
    <div className={`min-h-screen font-sans antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`} data-theme={theme}>
      <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>

      <div className="relative flex min-h-screen w-full flex-col">
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

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div key={currentView}
                initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}
              >
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
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {isCheckoutOpen && (
                <CheckoutModal
                  isOpen={isCheckoutOpen}
                  onClose={() => setIsCheckoutOpen(false)}
                  onOtherMethod={() => {
                    setIsCheckoutOpen(false);
                    setIsChatOpen(true);
                  }}
                  onSuccess={() => reduceStock(cartItems)}
                  total={cartTotal}
                  cartItems={cartItems}
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

        <nav className={`fixed bottom-0 left-0 right-0 md:hidden z-50 border-t safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.1)] ${theme === 'dark' ? 'bg-slate-950/95 border-white/5 backdrop-blur-xl' : 'bg-white/95 border-gray-100 backdrop-blur-xl'}`}>
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
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
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-blue-600'}`}>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-600 transition-all" />
                  </button>
                ))}

                <div className="mt-6 px-3.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Follow the King</p>
                  <div className="flex gap-2">
                    <a href="https://www.tiktok.com/@christcg_pokemon?_r=1&_t=ZT-946ZL8PzeGb" target="_blank" rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-gray-50 border-gray-100 hover:bg-blue-50 text-slate-700'}`}>
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-tight">TikTok</span>
                    </a>
                    <a href="https://www.facebook.com/share/1Hr39HLX5J/" target="_blank" rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-gray-50 border-gray-100 hover:bg-blue-50 text-slate-700'}`}>
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

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => { addToCart(product, qty); }}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.has(selectedProduct.id)}
        />
      )}

      <AnimatePresence>
        {showAdminAuth && (
          <AdminAuthModal
            onSuccess={handleAdminAuthSuccess}
            onClose={() => setShowAdminAuth(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-8 left-1/2 z-[200] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${theme === 'dark' ? 'bg-slate-900/90 border-white/10 shadow-black/50' : 'bg-white/90 border-gray-200 shadow-blue-900/10'}`}
          >
            <div className={`flex items-center justify-center p-2 rounded-xl ${toast.type === 'success'
              ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
              : (theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600')
              }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <p className={`text-sm font-bold tracking-tight pr-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}

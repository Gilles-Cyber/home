import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Package, LayoutDashboard, Settings, ShoppingCart,
    Plus, Search, SlidersHorizontal, Edit2, Trash2, Bell, TrendingUp, Users, DollarSign,
    X, Image as ImageIcon, Tag, Hash, Info, Check, ChevronDown, Lock, Globe, MessageSquare, Send, ShieldOff,
    Radio
} from 'lucide-react';
import { Product } from '../types';
import { POKEMART_ASSETS } from '../data/products';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
    products: Product[];
    onAdd: (product: Product) => void;
    onUpdate: (product: Product) => void;
    onDelete: (id: number) => void;
    onClose: () => void;
    onLock: () => void;
    showToast: (message: string, type?: 'success' | 'info') => void;
    theme: 'light' | 'dark';
}

export default function AdminDashboard({ products, onAdd, onUpdate, onDelete, onClose, onLock, showToast, theme }: AdminDashboardProps) {
    const isDark = theme === 'dark';
    const [searchQuery, setSearchQuery] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [activeTab, setActiveTab] = useState<'inventory' | 'visitors' | 'chats'>('inventory');

    // Stats & Data
    const [visitors, setVisitors] = useState<any[]>([]);
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [editingNickname, setEditingNickname] = useState<{ id: string, name: string } | null>(null);

    const handleUpdateNickname = async (sessionId: string, newName: string) => {
        const { error } = await supabase.from('visitors').update({ nickname: newName }).eq('session_id', sessionId);
        if (error) {
            showToast('Error updating nickname', 'info');
        } else {
            showToast('Nickname updated');
            setVisitors(prev => prev.map(v => v.session_id === sessionId ? { ...v, nickname: newName } : v));
            setEditingNickname(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Visitors
            const { data: vData } = await supabase.from('visitors').select('*').order('last_active', { ascending: false });
            if (vData) setVisitors(vData);

            // Fetch Chats (Latest message per session)
            const { data: cData } = await supabase.from('messages').select('session_id').order('created_at', { ascending: false });
            if (cData) {
                const uniqueSessions = Array.from(new Set(cData.map(m => m.session_id)));
                setChats(uniqueSessions);
            }
        };

        fetchData();

        // Subscriptions
        const visitorSub = supabase.channel('visitors_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, () => {
            fetchData();
        }).subscribe();

        const chatSub = supabase.channel('chats_admin').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            fetchData();
            if (payload.new.sender === 'user') {
                showToast(`New Message from ${payload.new.session_id.slice(0, 8)}`, 'info');
                // Play notification sound
                new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => console.log('Audio play failed:', e));
            }
        }).subscribe();

        return () => {
            supabase.removeChannel(visitorSub);
            supabase.removeChannel(chatSub);
        };
    }, []);

    useEffect(() => {
        if (selectedChat) {
            const fetchChatMessages = async () => {
                const { data } = await supabase.from('messages').select('*').eq('session_id', selectedChat).order('created_at', { ascending: true });
                if (data) {
                    setChatMessages(data);
                    // Mark as read when admin views
                    await supabase.from('messages').update({ is_read: true, delivered: true }).eq('session_id', selectedChat).eq('sender', 'user');
                }
            };
            fetchChatMessages();

            const sub = supabase.channel(`chat_admin_${selectedChat}`).on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${selectedChat}`
            }, (payload) => {
                setChatMessages(prev => [...prev, payload.new]);
                if (payload.new.sender === 'user') {
                    supabase.from('messages').update({ delivered: true, is_read: true }).eq('id', payload.new.id);
                }
            }).subscribe();

            return () => { supabase.removeChannel(sub); };
        }
    }, [selectedChat]);

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedChat) return;
        const text = replyText;
        setReplyText('');
        await supabase.from('messages').insert([{
            session_id: selectedChat,
            text: text,
            sender: 'admin'
        }]);
    };

    const metrics = useMemo(() => {
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        return [
            { label: 'Vault Value', value: `$${totalValue.toLocaleString()}`, change: 'Live', icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Live Visitors', value: visitors.length.toString(), change: 'Global', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
            { label: 'Open Chats', value: chats.length.toString(), change: 'Priority', icon: MessageSquare, color: 'text-purple-500 bg-purple-500/10' },
        ];
    }, [products, visitors, chats]);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = (p: Product) => {
        if (isAddingNew) {
            onAdd(p);
        } else {
            onUpdate(p);
        }
        setIsAddingNew(false);
        setEditingProduct(null);
    };

    return (
        <div className={`min-h-screen font-sans pb-24 transition-colors ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
            <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/10 p-2.5 rounded-2xl">
                            <LayoutDashboard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter uppercase">ADMIN PANEL</h1>
                            <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest leading-none">Vault Command Center</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={async () => {
                                const msg = prompt('Enter global notification message:');
                                if (msg) {
                                    await supabase.from('notifications').insert([{ message: msg, type: 'info' }]);
                                    showToast('Broadcast Sent', 'success');
                                }
                            }}
                            className={`p-2.5 rounded-2xl border shadow-sm transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                            title="Send Global Broadcast"
                        >
                            <Radio className="w-5 h-5 text-blue-500" />
                        </button>

                        <button
                            onClick={() => setActiveTab('chats')}
                            className={`relative p-2.5 rounded-2xl border shadow-sm transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                            title="Support Notifications"
                        >
                            <Bell className={`w-5 h-5 ${chats.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                            {chats.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-bounce">
                                    {chats.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={onLock}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'}`}
                        >
                            <ShieldOff className="w-4 h-4" />
                            Lock Vault
                        </button>
                        <button onClick={onClose} className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Exit
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Metrics */}
                <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 mb-4">
                    {metrics.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`min-w-[200px] flex-1 p-6 rounded-[2rem] shadow-sm border relative overflow-hidden group ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${m.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                    <m.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500">
                                    {m.change}
                                </span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{m.label}</p>
                            <h3 className="text-2xl font-black italic">{m.value}</h3>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-black/20 p-1.5 rounded-3xl w-fit border border-white/5">
                    {[
                        { id: 'inventory', label: 'Inventory', icon: Package },
                        { id: 'visitors', label: 'Visitors', icon: Globe },
                        { id: 'chats', label: 'Support', icon: MessageSquare }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'inventory' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Filter vault inventory..."
                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-slate-900'}`}
                                />
                            </div>
                            <button
                                onClick={() => { setIsAddingNew(true); setEditingProduct({ id: 0, name: '', price: 0, stock: 0, category: 'Singles', description: '', image: '' }); }}
                                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Add Asset
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {filtered.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    className={`p-4 rounded-[2rem] border shadow-sm flex items-center gap-4 group transition-all ${isDark ? 'bg-slate-900 border-white/5 hover:border-blue-500/30' : 'bg-white border-gray-100 hover:border-blue-200'}`}
                                >
                                    <div className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ${isDark ? 'bg-black/40' : 'bg-gray-50'}`}>
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-black italic truncate uppercase tracking-tight">{item.name}</h3>
                                        <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">{item.category}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => { setIsAddingNew(false); setEditingProduct(item); }} className="p-3 rounded-xl bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete(item.id)} className="p-3 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'visitors' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100'}`}>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        <th className="pb-6 pl-4">Session ID</th>
                                        <th className="pb-6">Location</th>
                                        <th className="pb-6">Last Active</th>
                                        <th className="pb-6">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {visitors.map((v, i) => (
                                        <tr key={i} className={`border-t group ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
                                            <td className="py-4 pl-4 font-mono text-[10px] text-blue-500 uppercase">
                                                <div className="flex items-center gap-2">
                                                    {editingNickname?.id === v.session_id ? (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                autoFocus
                                                                className={`bg-white/10 border border-white/20 rounded px-2 py-1 text-[10px] outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                                                                value={editingNickname.name}
                                                                onChange={(e) => setEditingNickname({ ...editingNickname, name: e.target.value })}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateNickname(v.session_id, editingNickname.name)}
                                                            />
                                                            <button onClick={() => handleUpdateNickname(v.session_id, editingNickname.name)} className="p-1 hover:text-emerald-500"><Check className="w-3 h-3" /></button>
                                                            <button onClick={() => setEditingNickname(null)} className="p-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="font-black text-blue-400">{v.nickname || v.session_id.slice(0, 8)}</span>
                                                            <button onClick={() => setEditingNickname({ id: v.session_id, name: v.nickname || '' })} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-blue-500 transition-opacity">
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-black uppercase tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{v.location_city || 'Unknown'}</span>
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{v.location_country || 'Earth'}</span>
                                                </div>
                                            </td>
                                            <td className={`py-4 font-black uppercase tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{new Date(v.last_active).toLocaleString()}</td>
                                            <td className="py-4">
                                                <span className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Online
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'chats' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 h-[600px]">
                        {/* Chat List */}
                        <div className={`md:col-span-1 rounded-[2.5rem] border overflow-hidden flex flex-col ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100'}`}>
                            <div className="p-6 border-b border-white/5 bg-white/5">
                                <h3 className="font-black uppercase italic tracking-tighter">Active Sessions</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                                {chats.map((cid, i) => {
                                    const visitor = visitors.find(v => v.session_id === cid);
                                    const name = visitor?.nickname || cid.slice(0, 8);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedChat(cid)}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedChat === cid ? 'bg-blue-600 border-blue-600 text-white' : isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-gray-50 border-gray-100 text-slate-600'}`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-black text-[10px] uppercase truncate">{name}</p>
                                                {visitor?.nickname && <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-tighter">Identified</span>}
                                            </div>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">Chat Participant</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chat Window */}
                        <div className={`md:col-span-2 rounded-[2.5rem] border overflow-hidden flex flex-col ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100'}`}>
                            {selectedChat ? (
                                <>
                                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <h3 className="font-black uppercase italic tracking-tighter">
                                            Live Session: {visitors.find(v => v.session_id === selectedChat)?.nickname || selectedChat.slice(0, 8)}
                                        </h3>
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                                        {chatMessages.map((m, i) => (
                                            <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-black uppercase tracking-tight relative ${m.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : isDark ? 'bg-white/5 text-slate-300 rounded-tl-none border border-white/10' : 'bg-gray-100 text-slate-700 rounded-tl-none'}`}>
                                                    {m.text}
                                                    {m.sender === 'admin' && (
                                                        <div className="absolute -bottom-4 right-0 flex items-center gap-0.5 opacity-40">
                                                            <Check className={`w-3 h-3 ${m.delivered || m.is_read ? 'text-blue-400' : 'text-slate-400'}`} />
                                                            {(m.delivered || m.is_read) && <Check className={`w-3 h-3 -ml-2 ${m.is_read ? 'text-blue-400' : 'text-slate-400'}`} />}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 border-t border-white/5 bg-white/5 flex gap-2">
                                        <input
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                                            placeholder="REPLY TO CLIENT..."
                                            className={`flex-1 p-4 rounded-xl outline-none font-black uppercase text-[10px] tracking-widest ${isDark ? 'bg-white/5 text-white' : 'bg-gray-100 text-slate-900'}`}
                                        />
                                        <button onClick={handleSendReply} className="p-4 rounded-xl bg-blue-600 text-white hover:scale-105 transition-all"><Send className="w-5 h-5" /></button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                                    <MessageSquare className="w-12 h-12 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Select a Chat to Begin Concierge Response</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {editingProduct && (
                    <ProductFormModal
                        product={editingProduct}
                        isNew={isAddingNew}
                        onClose={() => setEditingProduct(null)}
                        onSave={handleSave}
                        theme={theme}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ProductFormModal({ product, isNew, onClose, onSave, theme }: any) {
    const [form, setForm] = useState<Product>({ ...product });
    const isDark = theme === 'dark';

    const inputClasses = `w-full px-4 py-3 rounded-xl border outline-none transition-all placeholder-slate-500 ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:bg-white/10' : 'bg-gray-50 border-gray-200 text-slate-900 focus:border-blue-500 focus:bg-white'}`;
    const labelClasses = "text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5";

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className={`w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-gray-100'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">{isNew ? 'New Asset' : 'Edit Asset'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                    <div>
                        <label className={labelClasses}>Name</label>
                        <input className={inputClasses} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Price</label>
                            <input type="number" className={inputClasses} value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className={labelClasses}>Stock</label>
                            <input type="number" className={inputClasses} value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Image URL</label>
                        <input className={inputClasses} value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClasses}>Category</label>
                        <select className={inputClasses} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {['Singles', 'Booster Boxes', 'Elite Trainer Boxes', 'Slabs', 'Special Collections'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 font-black uppercase text-xs">Discard</button>
                    <button onClick={() => onSave(form)} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs shadow-xl">Save Asset</button>
                </div>
            </motion.div>
        </motion.div>
    );
}

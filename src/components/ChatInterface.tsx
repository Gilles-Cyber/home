import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, MessageSquare, ShieldCheck, Zap, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChatInterfaceProps {
    onClose: () => void;
    theme: 'light' | 'dark';
    sessionId: string;
}

interface Message {
    id: string | number;
    text: string;
    sender: 'user' | 'admin' | 'bot';
    timestamp: Date;
    delivered?: boolean;
    is_read?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, theme, sessionId }) => {
    const isDark = theme === 'dark';
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Welcome to the Royal Vault Concierge. How can we assist with your payment or transaction today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch existing messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Chat error:', error);
                return;
            }

            if (data) {
                const mapped = data.map(m => ({
                    id: m.id,
                    text: m.text,
                    sender: m.sender,
                    timestamp: new Date(m.created_at),
                    delivered: m.delivered,
                    is_read: m.is_read
                }));
                setMessages(prev => [prev[0], ...mapped]);
            }
        };

        fetchMessages();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`chat:${sessionId}`)
            .on('postgres_changes', {
                event: '*', // Listen for UPDATES too (for read receipts)
                schema: 'public',
                table: 'messages',
                filter: `session_id=eq.${sessionId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newMsg = payload.new;
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;

                        // Deduplicate optimistic messages
                        const optIdx = prev.findIndex(m => (m as any).optimistic && m.sender === newMsg.sender && m.text === newMsg.text);
                        if (optIdx !== -1) {
                            const next = [...prev];
                            next[optIdx] = {
                                id: newMsg.id,
                                text: newMsg.text,
                                sender: newMsg.sender,
                                timestamp: new Date(newMsg.created_at),
                                delivered: newMsg.delivered,
                                is_read: newMsg.is_read
                            };
                            return next;
                        }

                        return [...prev, {
                            id: newMsg.id,
                            text: newMsg.text,
                            sender: newMsg.sender,
                            timestamp: new Date(newMsg.created_at),
                            delivered: newMsg.delivered,
                            is_read: newMsg.is_read
                        }];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const updated = payload.new;
                    setMessages(prev => prev.map(m => m.id === updated.id ? {
                        ...m,
                        delivered: updated.delivered,
                        is_read: updated.is_read
                    } : m));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const text = input.trim();
        setInput('');

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            text,
            sender: 'user',
            timestamp: new Date(),
            delivered: false,
            is_read: false
        };
        (optimisticMsg as any).optimistic = true;
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            // Safety Upsert: Ensure the visitor record exists before sending the message
            // (Defense against potential App.tsx initSession delay/failure)
            await supabase.from('visitors').upsert({
                session_id: sessionId,
                last_active: new Date().toISOString()
            }, { onConflict: 'session_id' });

            const { error } = await supabase
                .from('messages')
                .insert([{
                    session_id: sessionId,
                    text: text,
                    sender: 'user'
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('Send error:', error);
            // Remove optimistic message if it failed to persist
            setMessages(prev => prev.filter(m => m.id !== tempId));
            // Provide visual feedback (could be a toast or integrated into message list)
            alert('Your message could not be sent. Please check your connection and try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40`}
        >
            <motion.div
                className={`w-full max-w-lg h-[80vh] rounded-[2.5rem] flex flex-col shadow-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm animate-pulse" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-black uppercase tracking-tight italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Elite Concierge</h3>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Live Support</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages Panel */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm font-medium relative ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : isDark ? 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none' : 'bg-gray-100 text-slate-700 rounded-tl-none'
                                }`}>
                                {msg.text}
                                <div className="flex items-center justify-between mt-1.5 gap-2">
                                    <p className={`text-[8px] font-bold uppercase tracking-widest opacity-40 ${msg.sender === 'user' ? 'text-white' : 'text-slate-500'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {msg.sender === 'user' && (
                                        <div className="flex items-center gap-0.5">
                                            <Check className={`w-3 h-3 ${msg.delivered || msg.is_read ? 'text-blue-300' : 'text-slate-300 opacity-40'}`} />
                                            {(msg.delivered || msg.is_read) && (
                                                <Check className={`w-3 h-3 -ml-2 ${msg.is_read ? 'text-blue-300' : 'text-slate-300 opacity-40'}`} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className={`p-4 rounded-2xl rounded-tl-none flex gap-1 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className={`p-6 border-t ${isDark ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type reaching our concierge..."
                            className={`flex-1 p-4 rounded-2xl border outline-none transition-all placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:text-slate-500 ${isDark ? 'bg-white/5 border-white/5 focus:bg-white/10 focus:border-blue-500 text-white' : 'bg-white border-gray-200 focus:border-blue-500'}`}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-40">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Powered by Royal Intelligence</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatInterface;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Wallet, CreditCard, ArrowRight, ShieldCheck,
    Bitcoin, MessageSquare, CheckCircle2, Lock
} from 'lucide-react';

import { createCoinbaseCharge } from '../lib/coinbase';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOtherMethod: () => void;
    total: number;
    theme: 'light' | 'dark';
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOtherMethod, total, theme }) => {
    const isDark = theme === 'dark';
    const [step, setStep] = useState<'methods' | 'coinbase'>('methods');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayCoinbase = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const checkoutUrl = await createCoinbaseCharge({
                name: 'TCG Vault Purchase',
                description: `Vault Transaction for ${total.toLocaleString()} USD`,
                amount: total.toString(),
                currency: 'USD',
                metadata: {
                    source: 'TCG Vault Web',
                    total: total
                }
            });

            // Redirect to real Coinbase hosted page
            window.location.href = checkoutUrl;
        } catch (err: any) {
            console.error('Coinbase Error:', err);
            setError(err.message || 'Payment initializing failed');
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-10 flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Order Confirmed</h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-8">Vault Transaction Successful</p>
                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-500/20"
                            >
                                Return to Vault
                            </button>
                        </motion.div>
                    ) : step === 'methods' ? (
                        <motion.div key="methods" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Checkout</h2>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Secure Amount: ${total.toLocaleString()}</p>
                                </div>
                                <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X /></button>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setStep('coinbase')}
                                    className={`w-full p-5 rounded-3xl border flex items-center justify-between transition-all group hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                                            <Bitcoin className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black uppercase tracking-tight">Coinbase Commerce</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pay with Crypto</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-all" />
                                </button>

                                <button
                                    onClick={onOtherMethod}
                                    className={`w-full p-5 rounded-3xl border flex items-center justify-between transition-all group hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black uppercase tracking-tight">Other Payment Method</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Direct Concierge Link</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-all" />
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-slate-500">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Enterprise-Grade Security</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="coinbase" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setStep('methods')} className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"><X className="rotate-90" /></button>
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Bitcoin className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-lg font-black uppercase italic tracking-tight">Coinbase Payment</h2>
                            </div>

                            <div className={`p-6 rounded-3xl border mb-8 ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Select Crypto Asset</p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {['BTC', 'ETH', 'USDC', 'SOL'].map(coin => (
                                        <div key={coin} className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer hover:border-blue-500/50 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                                            <span className="text-sm font-black tracking-tighter">{coin}</span>
                                            <div className="w-2 h-2 rounded-full bg-slate-700" />
                                        </div>
                                    ))}
                                </div>
                                {error && (
                                    <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                                        {error}
                                    </div>
                                )}
                                {isProcessing ? (
                                    <div className="py-8 flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs font-black uppercase tracking-widest text-blue-500 animate-pulse">Initializing Secure Checkout...</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handlePayCoinbase}
                                        className="w-full py-4 rounded-[1.5rem] bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                    >
                                        Place Transaction
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-3 text-slate-500 mb-2">
                                <Lock className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default CheckoutModal;

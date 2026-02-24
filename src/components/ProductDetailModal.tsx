import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Star, ShoppingCart, Heart, ChevronRight, Minus, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product, qty: number) => void;
    onToggleFavorite: (id: number) => void;
    isFavorite: boolean;
}

export default function ProductDetailModal({ product, onClose, onAddToCart, onToggleFavorite, isFavorite }: ProductDetailModalProps) {
    if (!product) return null;

    const BADGE_COLORS: Record<string, string> = {
        HOT: 'bg-orangered-400 bg-orange-500 text-white',
        NEW: 'bg-emerald-500 text-white',
        VAULT: 'bg-purple-700 text-white',
        RARE: 'bg-yellow-500 text-black',
        LIMIT: 'bg-red-600 text-white',
        ELITE: 'bg-blue-700 text-white',
    };

    const stockColor = product.stock <= 5 ? 'text-red-500' : product.stock <= 15 ? 'text-amber-500' : 'text-emerald-500';

    const [activeImg, setActiveImg] = useState(product.image);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4"
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full md:max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header image */}
                    <div className="relative w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-950 flex flex-col items-center pt-8"
                        style={{ height: 320 }}>
                        <div className="relative flex-1 flex items-center justify-center w-full">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImg}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    src={activeImg}
                                    alt={product.name}
                                    referrerPolicy="no-referrer"
                                    className="h-52 w-auto object-contain drop-shadow-2xl"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Thumbnails */}
                        {product.image2 && (
                            <div className="flex gap-2 pb-4">
                                {[product.image, product.image2].map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(img)}
                                        className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all ${activeImg === img ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </button>
                        {product.badge && (
                            <span className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow ${BADGE_COLORS[product.badge] ?? 'bg-blue-600 text-white'}`}>
                                {product.badge}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-600/20 dark:text-blue-400 px-2 py-0.5 rounded mb-2 inline-block">
                                    {product.category}
                                </span>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">{product.name}</h2>
                            </div>
                            <button
                                onClick={() => onToggleFavorite(product.id)}
                                className={`p-3 rounded-2xl border-2 transition-all active:scale-95 flex-none ${isFavorite ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-white/5 text-gray-400 hover:text-red-400'}`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                            <span className="text-xs font-bold text-slate-400 ml-2">5.0 (128 reviews)</span>
                        </div>

                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{product.description}</p>

                        {/* Stock */}
                        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Availability:</span>
                            <span className={`text-sm font-black ${stockColor}`}>
                                {product.stock <= 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                            </span>
                        </div>
                    </div>

                    {/* Sticky footer */}
                    <div className="p-6 md:p-8 pt-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Price</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">${product.price.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={() => { onAddToCart(product, 1); onClose(); }}
                                disabled={product.stock <= 0}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-blue-500/30 transition-all active:scale-95 hover:scale-105"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

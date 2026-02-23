import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
    cartItems: CartItem[];
    onRemove: (productId: number) => void;
    onChangeQty: (productId: number, delta: number) => void;
    onShop: () => void;
}

export default function CartView({ cartItems, onRemove, onChangeQty, onShop }: CartViewProps) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 9.99;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 mb-20">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
                    <ShoppingCart className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase mb-2">Your cart is empty</h3>
                <p className="text-slate-400 font-medium mb-8 text-center max-w-xs">
                    You haven't added anything yet. Head to the shop and find your next rare pull!
                </p>
                <button
                    onClick={onShop}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-blue-500/30 hover:scale-105 transition-all active:scale-95"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Browse Shop
                </button>
            </div>
        );
    }

    return (
        <div className="mb-28">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 italic uppercase">Your Cart</h2>
                    <p className="text-sm font-bold text-slate-400">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Item List */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.product.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.25 }}
                                className="group flex items-center gap-4 p-4 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
                            >
                                {/* Image */}
                                <div className="flex-none w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        referrerPolicy="no-referrer"
                                        className="h-full w-auto object-contain"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">{item.product.category}</p>
                                    <p className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{item.product.name}</p>
                                    <p className="text-base font-black text-slate-900 mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>

                                {/* Qty & Remove */}
                                <div className="flex flex-col items-end gap-3">
                                    <button
                                        onClick={() => onRemove(item.product.id)}
                                        className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                                        <button
                                            onClick={() => onChangeQty(item.product.id, -1)}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                        >
                                            <Minus className="w-3.5 h-3.5 text-slate-600" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                                        <button
                                            onClick={() => onChangeQty(item.product.id, 1)}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                        >
                                            <Plus className="w-3.5 h-3.5 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white sticky top-24 shadow-2xl">
                        <h3 className="text-lg font-black uppercase italic mb-6">Order Summary</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-slate-300">
                                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-300">
                                <span>Shipping</span>
                                <span className={`font-bold ${shipping === 0 ? 'text-emerald-400' : 'text-white'}`}>
                                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            {subtotal > 0 && subtotal < 150 && (
                                <p className="text-[10px] text-slate-400 bg-slate-800 p-2 rounded-lg">
                                    Add ${(150 - subtotal).toFixed(2)} more for free shipping!
                                </p>
                            )}
                            <div className="border-t border-slate-700 pt-3 flex justify-between">
                                <span className="font-black text-white">Total</span>
                                <span className="font-black text-xl text-white">${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                            Checkout
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-center text-[10px] text-slate-400 mt-4">🔒 Secure checkout • Insured shipping</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

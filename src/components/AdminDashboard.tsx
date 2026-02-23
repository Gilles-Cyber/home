import { motion } from 'motion/react';
import {
    Package, LayoutDashboard, Settings, ShoppingCart,
    Plus, Search, SlidersHorizontal, Edit2, Trash2, Bell, TrendingUp, Users, DollarSign
} from 'lucide-react';

interface Metric {
    label: string;
    value: string;
    change: string;
    icon: any;
    color: string;
}

const METRICS: Metric[] = [
    { label: 'Total Revenue', value: '$12,450.00', change: '+12%', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Active Orders', value: '24', change: '+4', icon: Package, color: 'text-blue-500 bg-blue-50' },
    { label: 'New Customers', value: '12', change: '+8', icon: Users, color: 'text-purple-500 bg-purple-50' },
];

const ITEMS = [
    {
        name: 'Pokémon 151 Ultra Premium Collection',
        category: 'Scarlet & Violet Special Set',
        stock: 15,
        price: 119.99,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxsSSCkmvethIR3xYPQKbUvG4r4rkZs93nL_U3GpN4IC6mE_Def1p-y8B3rpQqqvtgQFQV-iJ8rd_JjoM1rto5ytNArRhHINYQ7VME0fQzV9_GcrSx79FrQRDKVv9pkX1I4UbQDmmV4VVh-SsyrzUqRRYPSCOCnyKd5f4QB5XVhGoguYivGKwM-ZERnLSyhGG8X5o1DuifMwLsODnRUxFfiWII_Lk22dlzfqQXP80reXKw1dphluvZk1hG2qMtYXbz1UvrN53uI_u5'
    },
    {
        name: 'Charizard ex - 199/165 (SIR)',
        category: 'Scarlet & Violet 151',
        stock: 3,
        price: 115.00,
        lowStock: true,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIEnrKf5UkQEjyfHdYZ9nf1vJDw-Xtq8sxSJbZ8CpXXnwRADJemnCK7Ubd5XBKdMRg2V5UlJFR6qamf_b_r4J-yYZEW0apEdsFFjBUdDha2kKdiSgKyRs-UhB7-dIsj89RNKZ6Uj1rrI7XJEoEvRoGhQ6BeE05VoC8mUrfPGiWiBeadwXVnEIQaG9zfA86yO8I0aOnCX7B6SySD3S9Mx4FaTVLs5238HmAXaF58XjybU43nJO4PgEo3jzUZcPKkb5vEiHL8hUsOPyC'
    },
    {
        name: 'Booster Box: Paldea Evolved',
        category: 'Scarlet & Violet Base Set',
        stock: 42,
        price: 98.50,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRGCcd3jNzv4l0UYJtVfQMPEPe-fjNA6JJ0FWcNNiuESMXPahuDuo28drqbaxBn3p_5zrh6Ro39QYp8dQp8Vx5KKIqWCYxllqUrmnzS-fhTgWHaQ1KpcnGJrpkFkfu2KR7Fh5_nLkbcop4292iOnvf2f0Uh42X1IML_fG1KbHUtkmQmBVv_bIX6DOAs8YPMt5ao4KR8FQiUT4lKVpAiiNf4rMVKQB3ELgSyzjkn4CFo7T_I_P6n9Z5YiHQEUWdI15W9yeTQb1bswlc'
    },
    {
        name: 'Zapdos ex - 202/165 (SIR)',
        category: 'Scarlet & Violet 151',
        stock: 0,
        price: 45.00,
        outOfStock: true,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8Mo4fWXKxjhfdlU1aWs-XyCdTbPToPNlSOyLryAqoJUoHIh9dLtDS7W5bXzCJPACCud-i-UVvUioTCePQtTUITODzCrG3qxz3NMZOiyAUomN6gIZlezWMZ7OpE8G55i9cv_sdhYhWwSxGOsptAnRSPuJDOfhp4d_-AkIdHdzgBoPSor8fTnyavHChI5Keor2Y6citD2hSx9C7weGGpwXazL9rQNrTnpNb118L5L5GI36v5Zril84FVdj9EpZViHqGx7TbnFxSNw1B'
    },
];

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
    return (
        <div className="min-h-screen bg-[#f6f6f8] font-sans text-slate-900 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/10 p-2.5 rounded-2xl">
                            <LayoutDashboard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter text-slate-900">ADMIN PANEL</h1>
                            <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest leading-none">Inventory Control</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
                            <Bell className="w-5 h-5 text-slate-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Exit Admin
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Metrics */}
                <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {METRICS.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="min-w-[170px] flex-1 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${m.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                    <m.icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-black text-emerald-600 px-2 py-0.5 rounded-lg bg-emerald-50">{m.change}</span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{m.label}</p>
                            <h3 className="text-2xl font-black italic text-slate-900">{m.value}</h3>
                        </motion.div>
                    ))}
                </div>

                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter vault inventory..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-4 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
                            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                            <Plus className="w-5 h-5" />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Product List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Inventory Management</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {ITEMS.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all"
                            >
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black italic text-slate-900 truncate uppercase tracking-tight">{item.name}</h3>
                                    <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">{item.category}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${item.outOfStock ? 'bg-red-50 border-red-100 text-red-600' : item.lowStock ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                            {item.outOfStock ? 'OOS' : `Stock: ${item.stock}`}
                                        </span>
                                        <span className="text-sm font-black text-slate-900">${item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Secret Floating Nav */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm">
                <div className="bg-slate-900/95 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-2xl flex justify-around">
                    {[LayoutDashboard, ShoppingCart, TrendingUp, Settings].map((Icon, i) => (
                        <button key={i} className={`p-3 rounded-2xl transition-all ${i === 0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <Icon className="w-6 h-6" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

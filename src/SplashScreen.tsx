import React from 'react';
import { motion } from 'motion/react';
import splashBg from './assets/splash-bg.png';
import { PRODUCTS } from './data/products';

const SplashScreen: React.FC = () => {
    // Find the galaxy variant URL from the POKEMART_ASSETS (indirectly via products if needed, or just hardcode/import)
    // Actually, I can just hardcode the URL here or import the assets.
    // Let's just import the PRODUCTS or POKEMART_ASSETS if exported.
    // For simplicity, I'll use the URL directly since it's a "theme" constant.
    const splashImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuASuxP3_N7XeoPvnwY3Nw2Z5I9zVj_Ei37kCRkl1rbRUxLSB0QBy88uf3WQUom4MUf-IPDfjtbBlO-coZQGEEgrp48PABXvW0cEktFX7rDYY4uYBPbA-edy2ZHOoDXhNwt6LxlNa8Z_FD1fMC05EcYDdmZDS6s6tMhUl3b4nC9w16cO6U3axmOo7JUwgjab9KCGAP_YOmk4joAJ7CJCdmdn7OJ1e5Q9h19CwGzG9i5Ns3I3Fh4OKsDHeK6-pSXTkC6Mpt1uMrmURjk";

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Premium Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[15s] scale-110 motion-safe:animate-pulse"
                style={{
                    backgroundImage: `url(${splashImg})`,
                    filter: 'brightness(0.35) contrast(1.1) saturate(1.2)'
                }}
            />

            {/* Dark Overlay Gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(13,0,26,0.4) 0%, rgba(0,0,0,0.9) 100%)'
                }}
            />

            {/* Animated energy orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.28, 0.12] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
                />
            </div>

            {/* Card grid background pattern */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        45deg,
                        #a855f7 0px, #a855f7 1px,
                        transparent 1px, transparent 60px
                    ), repeating-linear-gradient(
                        -45deg,
                        #3b82f6 0px, #3b82f6 1px,
                        transparent 1px, transparent 60px
                    )`
                }}
            />

            {/* Floating booster pack shapes */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [i % 2 === 0 ? -8 : 8, i % 2 === 0 ? 8 : -8, i % 2 === 0 ? -8 : 8],
                        opacity: [0.08, 0.2, 0.08]
                    }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    className="absolute rounded-xl border border-purple-500/30"
                    style={{
                        width: `${40 + i * 15}px`,
                        height: `${60 + i * 20}px`,
                        top: `${10 + (i * 15) % 70}%`,
                        left: `${5 + (i * 18) % 85}%`,
                        background: `linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.1))`,
                        backdropFilter: 'blur(4px)',
                    }}
                />
            ))}

            {/* Main Logo Content */}
            <motion.div
                initial={{ scale: 0.6, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative z-10 flex flex-col items-center text-center px-8"
            >
                {/* Logo icon */}
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative mb-6"
                >
                    <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center relative shadow-2xl"
                        style={{
                            background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                            boxShadow: '0 0 60px rgba(168,85,247,0.6), 0 0 120px rgba(59,130,246,0.3)'
                        }}>
                        <span className="text-5xl" role="img" aria-label="booster">🃏</span>
                    </div>
                    <div className="absolute inset-0 rounded-[2rem] blur-xl opacity-60"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)' }}
                    />
                </motion.div>

                {/* Brand Name */}
                <h1
                    className="text-4xl md:text-6xl font-black uppercase italic tracking-tight leading-none"
                    style={{
                        background: 'linear-gradient(90deg, #f59e0b, #a855f7, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: 'none',
                        filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))'
                    }}
                >
                    CHRIS TCG
                </h1>
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-widest text-white mt-1">
                    BOOSTER BOX
                </h2>

                <div className="flex items-center gap-3 mt-4">
                    <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, #a855f7)' }} />
                    <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#c084fc' }}>
                        Authentic  •  Trusted  •  Premium
                    </p>
                    <div className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, #a855f7)' }} />
                </div>
            </motion.div>

            {/* Loading bar */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-56 h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(168,85,247,0.2)' }}>
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #a855f7, #f59e0b, #3b82f6)' }}
                />
            </div>

            <p className="absolute bottom-6 text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(168,85,247,0.5)' }}>
                Loading your vault...
            </p>
        </motion.div>
    );
};

export default SplashScreen;

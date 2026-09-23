import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, ChevronRight } from 'lucide-react';

// --- CORE DESIGN TOKENS ---
export const AdminTheme = {
    colors: {
        bgMain: '#050A15',
        bgPanel: 'rgba(13, 17, 33, 0.65)',
        bgPanelHover: 'rgba(20, 25, 45, 0.8)',
        border: 'rgba(255, 255, 255, 0.08)',
        borderGlow: 'rgba(139, 92, 246, 0.3)',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8',
        accentPurple: '#8B5CF6',
        accentBlue: '#3B82F6',
        accentCyan: '#06B6D4',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
    },
    shadows: {
        glowPurple: '0 0 20px rgba(139, 92, 246, 0.2)',
        glowCyan: '0 0 20px rgba(6, 182, 212, 0.2)',
        panel: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
    }
};

// --- REUSABLE COMPONENTS ---

export const AdminCard = ({ children, className, style, glow = false }) => (
    <div style={{
        background: AdminTheme.colors.bgPanel,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${AdminTheme.colors.border}`,
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: glow ? AdminTheme.shadows.glowPurple : AdminTheme.shadows.panel,
        ...style
    }} className={className}>
        {children}
    </div>
);

export const AdminBadge = ({ children, type = 'default', style }) => {
    let bg, color, border;
    switch(type) {
        case 'success': bg = `${AdminTheme.colors.success}15`; color = AdminTheme.colors.success; border = AdminTheme.colors.success; break;
        case 'warning': bg = `${AdminTheme.colors.warning}15`; color = AdminTheme.colors.warning; border = AdminTheme.colors.warning; break;
        case 'danger': bg = `${AdminTheme.colors.danger}15`; color = AdminTheme.colors.danger; border = AdminTheme.colors.danger; break;
        case 'purple': bg = `${AdminTheme.colors.accentPurple}15`; color = AdminTheme.colors.accentPurple; border = AdminTheme.colors.accentPurple; break;
        case 'cyan': bg = `${AdminTheme.colors.accentCyan}15`; color = AdminTheme.colors.accentCyan; border = AdminTheme.colors.accentCyan; break;
        default: bg = 'rgba(255,255,255,0.05)'; color = AdminTheme.colors.textMuted; border = AdminTheme.colors.border;
    }
    return (
        <span style={{
            background: bg, color: color, border: `1px solid ${border}40`,
            padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.5px', textTransform: 'uppercase', ...style
        }}>
            {children}
        </span>
    );
};

export const AdminButton = ({ children, onClick, variant = 'primary', style }) => {
    const isPrimary = variant === 'primary';
    return (
        <motion.button 
            whileHover={{ scale: 1.02, boxShadow: isPrimary ? AdminTheme.shadows.glowPurple : 'none', background: isPrimary ? `linear-gradient(135deg, ${AdminTheme.colors.accentPurple}, ${AdminTheme.colors.accentBlue})` : 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                background: isPrimary ? `linear-gradient(135deg, ${AdminTheme.colors.accentPurple}, ${AdminTheme.colors.accentBlue})` : 'rgba(255,255,255,0.03)',
                color: AdminTheme.colors.textMain,
                border: isPrimary ? 'none' : `1px solid ${AdminTheme.colors.border}`,
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'background 0.3s, border 0.3s', ...style
            }}
        >
            {children}
        </motion.button>
    );
};

export const AIGradientText = ({ children, style }) => (
    <span style={{
        background: `linear-gradient(135deg, ${AdminTheme.colors.accentCyan}, ${AdminTheme.colors.accentPurple})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        fontWeight: 'bold', ...style
    }}>
        {children}
    </span>
);

export const AIInsightPanel = ({ 
    title = "AI Platform Insight", 
    mainText, 
    subText, 
    buttonText = "View AI Analysis", 
    onButtonClick,
    style 
}) => {
    return (
        <div style={{
            background: `linear-gradient(135deg, rgba(13,17,33,0.9), rgba(15,23,42,0.8))`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${AdminTheme.colors.border}`,
            borderRadius: '20px', 
            padding: '2rem', 
            position: 'relative', 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px ${AdminTheme.colors.accentPurple}20`,
            ...style
        }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: `radial-gradient(circle, ${AdminTheme.colors.accentPurple}30, transparent 70%)`, filter: 'blur(40px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '300px', height: '300px', background: `radial-gradient(circle, ${AdminTheme.colors.accentCyan}20, transparent 70%)`, filter: 'blur(40px)', zIndex: 0 }} />
            
            {/* Left: AI Visual Container */}
            <div style={{ 
                position: 'relative', zIndex: 1, 
                minWidth: '110px', height: '110px', 
                borderRadius: '50%', 
                background: `linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))`,
                border: `1px solid ${AdminTheme.colors.accentCyan}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 30px ${AdminTheme.colors.accentPurple}30`
            }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: `1px dashed ${AdminTheme.colors.accentCyan}`, animation: 'spinDash 15s linear infinite' }} />
                <div style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', border: `1px solid ${AdminTheme.colors.accentPurple}`, animation: 'spinDash 10s linear infinite reverse', opacity: 0.5 }} />
                <BrainCircuit size={50} color={AdminTheme.colors.accentCyan} style={{ filter: `drop-shadow(0 0 10px ${AdminTheme.colors.accentCyan})` }} />
            </div>

            {/* Center: Content */}
            <div style={{ flex: 1, zIndex: 1 }}>
                <h3 style={{ color: AdminTheme.colors.accentPurple, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <Sparkles size={14} /> {title}
                </h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '10px', lineHeight: '1.4' }}>
                    {mainText}
                </div>
                <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {subText}
                </div>
            </div>

            {/* Right: Action Button */}
            <div style={{ zIndex: 1, paddingLeft: '2rem', borderLeft: `1px solid ${AdminTheme.colors.border}`, display: 'flex', alignItems: 'center' }}>
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${AdminTheme.colors.accentPurple}50` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onButtonClick}
                    style={{
                        background: `linear-gradient(135deg, ${AdminTheme.colors.accentPurple}, ${AdminTheme.colors.accentCyan})`,
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px', 
                        borderRadius: '12px', 
                        cursor: 'pointer',
                        fontWeight: 600, 
                        fontSize: '1rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        transition: 'box-shadow 0.3s'
                    }}
                >
                    {buttonText} <ChevronRight size={18} />
                </motion.button>
            </div>
            
            <style>
                {`
                @keyframes spinDash { 100% { transform: rotate(360deg); } }
                `}
            </style>
        </div>
    );
};

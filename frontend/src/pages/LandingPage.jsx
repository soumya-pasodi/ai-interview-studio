import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Fingerprint, ScanEye, Zap } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            {/* --- GRAND BACKGROUND --- */}
            <div style={styles.deepBg} />
            
            {/* Radiating Light Beams (Conic Gradient) */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                style={styles.lightBeams}
            />

            {/* --- THE GRAND CORE (Massive Centerpiece) --- */}
            <div style={styles.coreContainer}>
                {/* Outer Ring */}
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeOut" }}
                    style={{...styles.ring, width: '900px', height: '900px', border: '1px solid rgba(14, 165, 233, 0.1)'}} 
                />
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
                    style={{...styles.ring, width: '700px', height: '700px', border: '2px dashed rgba(14, 165, 233, 0.2)'}} 
                />
                {/* Spinning Rings */}
                <motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    style={{...styles.ring, width: '550px', height: '550px', border: '2px solid rgba(139, 92, 246, 0.3)', borderTopColor: 'transparent', borderBottomColor: 'transparent'}} 
                />
                <motion.div 
                    animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{...styles.ring, width: '450px', height: '450px', border: '3px dashed #0ea5e9', opacity: 0.5}} 
                />
                
                {/* Core Glow */}
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={styles.coreGlow}
                />
            </div>

            {/* --- GRAND CONTENT OVERLAY --- */}
            <div style={styles.contentWrapper}>
                
                {/* Epic Title Sequence */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    style={styles.header}
                >
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 1 }}
                        style={styles.topBadge}
                    >
                        <Zap size={16} color="#0ea5e9" /> SYSTEM ONLINE
                    </motion.div>
                    
                    <h1 style={styles.grandTitle}>
                        AI INTERVIEW
                        <br/>
                        <span style={styles.titleHighlight}>STUDIO</span>
                    </h1>
                    <p style={styles.grandSubtitle}>
                        THE PINNACLE OF COGNITIVE ASSESSMENT & CAREER INTELLIGENCE
                    </p>
                </motion.div>

                {/* Grand Portal Choices */}
                <div style={styles.portalsContainer}>
                    
                    {/* Student Portal (Left) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 1, type: "spring", bounce: 0.3 }}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(14,165,233,0.4)', borderColor: 'rgba(14,165,233,1)' }}
                        style={{...styles.portalCard, background: 'linear-gradient(180deg, rgba(14,165,233,0.1), rgba(0,0,0,0.8))'}}
                        onClick={() => navigate('/login')}
                    >
                        <div style={styles.cardIconGlowBlue} />
                        <ScanEye size={48} color="#0ea5e9" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 2 }} />
                        <h2 style={styles.portalTitle}>STUDENT PORTAL</h2>
                        <p style={styles.portalDesc}>Initialize candidate assessment, mock interviews, and cognitive readiness analytics.</p>
                        <div style={styles.portalActionBlue}>ENTER CANDIDATE MATRIX</div>
                    </motion.div>

                    {/* Admin Portal (Right) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 1.2, type: "spring", bounce: 0.3 }}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(239,68,68,0.4)', borderColor: 'rgba(239,68,68,1)' }}
                        style={{...styles.portalCard, background: 'linear-gradient(180deg, rgba(239,68,68,0.1), rgba(0,0,0,0.8))'}}
                        onClick={() => navigate('/admin/login')}
                    >
                        <div style={styles.cardIconGlowRed} />
                        <Fingerprint size={48} color="#ef4444" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 2 }} />
                        <h2 style={styles.portalTitle}>ADMIN PORTAL</h2>
                        <p style={styles.portalDesc}>Highly restricted institutional oversight. Manage operations, verify credentials, and audit systems.</p>
                        <div style={styles.portalActionRed}>AUTHORIZE OVERSEER ACCESS</div>
                    </motion.div>

                </div>

            </div>
            
            <style>
                {`
                @media (max-width: 900px) {
                    .portalsContainer { flex-direction: column !important; }
                    .grandTitle { font-size: 3.5rem !important; }
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        width: '100%', minHeight: '100vh',
        backgroundColor: '#020617', // Very dark slate
        fontFamily: "'Inter', sans-serif",
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    },
    deepBg: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at center, #0a1329 0%, #020617 100%)',
        zIndex: 0
    },
    lightBeams: {
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(14,165,233,0.05) 60deg, transparent 120deg, rgba(139,92,246,0.05) 180deg, transparent 240deg, rgba(14,165,233,0.05) 300deg, transparent 360deg)',
        zIndex: 1, pointerEvents: 'none'
    },

    // EPIC CORE
    coreContainer: {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2, pointerEvents: 'none'
    },
    ring: {
        position: 'absolute', borderRadius: '50%',
    },
    coreGlow: {
        position: 'absolute', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(14,165,233,0.4) 0%, rgba(139,92,246,0.2) 50%, transparent 80%)',
        borderRadius: '50%', filter: 'blur(30px)'
    },

    // CONTENT OVERLAY
    contentWrapper: {
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '1200px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '2rem'
    },
    header: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', marginBottom: '5rem',
        textShadow: '0 10px 40px rgba(0,0,0,0.8)'
    },
    topBadge: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.4)',
        padding: '8px 20px', borderRadius: '30px',
        color: '#0ea5e9', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.2em',
        marginBottom: '2rem', boxShadow: '0 0 20px rgba(14,165,233,0.2)'
    },
    grandTitle: {
        fontSize: '5.5rem', fontWeight: 900, color: 'white',
        lineHeight: 1.1, letterSpacing: '0.05em', margin: '0 0 1rem 0'
    },
    titleHighlight: {
        background: 'linear-gradient(to right, #0ea5e9, #a855f7)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 20px rgba(14,165,233,0.5))'
    },
    grandSubtitle: {
        color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600,
        letterSpacing: '0.3em', textTransform: 'uppercase'
    },

    // PORTALS
    portalsContainer: {
        display: 'flex', gap: '3rem', width: '100%', justifyContent: 'center',
        className: 'portalsContainer'
    },
    portalCard: {
        flex: 1, maxWidth: '450px',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', padding: '3rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    cardIconGlowBlue: {
        position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
        width: '150px', height: '150px', background: 'rgba(14,165,233,0.4)',
        borderRadius: '50%', filter: 'blur(50px)', zIndex: 1
    },
    cardIconGlowRed: {
        position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
        width: '150px', height: '150px', background: 'rgba(239,68,68,0.4)',
        borderRadius: '50%', filter: 'blur(50px)', zIndex: 1
    },
    portalTitle: {
        fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '0.1em',
        marginBottom: '1rem', position: 'relative', zIndex: 2
    },
    portalDesc: {
        color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.6', fontWeight: 500,
        marginBottom: '2.5rem', position: 'relative', zIndex: 2
    },
    portalActionBlue: {
        color: '#0ea5e9', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.2em',
        padding: '12px 24px', border: '1px solid rgba(14,165,233,0.4)', borderRadius: '8px',
        background: 'rgba(14,165,233,0.1)', position: 'relative', zIndex: 2, width: '100%'
    },
    portalActionRed: {
        color: '#ef4444', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.2em',
        padding: '12px 24px', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px',
        background: 'rgba(239,68,68,0.1)', position: 'relative', zIndex: 2, width: '100%'
    }
};

export default LandingPage;

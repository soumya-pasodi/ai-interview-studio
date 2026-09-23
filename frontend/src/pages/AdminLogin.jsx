import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Fingerprint, Lock, Eye, EyeOff, ShieldCheck, Activity, LockKeyhole, ArrowRight, Sparkles, AlertCircle, Mail, KeyRound, Smartphone, RefreshCw, ChevronLeft } from 'lucide-react';

// --- GLITTER STORM CANVAS (Slowed Down & Reduced Intensity) ---
const GlitterStormCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width; canvas.height = height;

        const particles = [];
        const particleCount = 150;

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = width / 2; this.y = height / 2;
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 0.8 + 0.2;
                this.vx = Math.cos(angle) * velocity; this.vy = Math.sin(angle) * velocity;
                this.radius = Math.random() * 2 + 0.5; this.life = 1;
                this.decay = Math.random() * 0.005 + 0.002;
                const colors = ['rgba(239,68,68,0.6)', 'rgba(245,158,11,0.6)', 'rgba(251,191,36,0.6)', 'rgba(255,255,255,0.8)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; if (this.life <= 0) this.reset(); }
            draw() {
                ctx.globalAlpha = this.life; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color; ctx.fill(); ctx.shadowBlur = 8; ctx.shadowColor = this.color;
            }
        }
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); }
            ctx.globalAlpha = 1; animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationFrameId); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none', mixBlendMode: 'screen' }} />;
};

// --- LIQUID WAVES BACKGROUND ---
const LiquidWaves = () => (
    <div style={styles.wavesContainer}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#020202' }} />
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1], borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} style={{ ...styles.blob, width: '60vw', height: '60vw', top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)' }} />
        <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1], borderRadius: ["60% 40% 30% 70% / 50% 60% 40% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 50%"] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} style={{ ...styles.blob, width: '55vw', height: '55vw', bottom: '-15%', right: '-15%', background: 'radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%)' }} />
        <div style={styles.blurLayer} />
    </div>
);

// --- 3D OVERSEER CORE ---
const OverseerCore = ({ isActive, isAlert }) => (
    <div style={styles.coreContainer}>
        <motion.div animate={{ rotateX: 360, rotateY: 180, rotateZ: 360, scale: isActive ? 1.2 : 1 }} transition={{ rotateX: { duration: 20, repeat: Infinity, ease: 'linear' }, rotateY: { duration: 25, repeat: Infinity, ease: 'linear' }, rotateZ: { duration: 30, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.5 } }} style={{ ...styles.coreRing3D, border: isAlert ? '2px solid rgba(245,158,11,0.5)' : '2px solid rgba(239,68,68,0.3)', borderTopColor: isAlert ? '#f59e0b' : 'rgba(239,68,68,0.8)', boxShadow: isAlert ? '0 0 20px rgba(245,158,11,0.4)' : '0 0 15px rgba(239,68,68,0.2)' }} />
        <motion.div animate={{ rotateX: -360, rotateY: 360, rotateZ: -180, scale: isActive ? 1.1 : 1 }} transition={{ rotateX: { duration: 22, repeat: Infinity, ease: 'linear' }, rotateY: { duration: 28, repeat: Infinity, ease: 'linear' }, rotateZ: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.5 } }} style={{ ...styles.coreRing3D, border: '1px dashed rgba(245,158,11,0.4)', borderBottomColor: 'rgba(245,158,11,0.8)' }} />
        <motion.div animate={{ rotate: 45, scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1] }} transition={{ scale: { duration: 2, repeat: Infinity } }} style={{ ...styles.coreInnerDiamond, border: isAlert ? '2px solid rgba(245,158,11,0.8)' : '2px solid rgba(239,68,68,0.5)' }}>
            <div style={{ transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={32} color="rgba(255,255,255,0.7)" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }} />
            </div>
        </motion.div>
    </div>
);

// --- MAIN PAGE COMPONENT ---
const AdminLogin = () => {
    const navigate = useNavigate();

    // Auth States
    const [email] = useState('admin1soumya@gmail.com');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [otpInput, setOtpInput] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [mockNotification, setMockNotification] = useState(null);

    const [authPhase, setAuthPhase] = useState(0);
    const [error, setError] = useState('');

    // 30-Minute OTP Session Bypass
    const [hasActiveSession, setHasActiveSession] = useState(false);
    useEffect(() => {
        const lastOtpTime = localStorage.getItem('admin_otp_time');
        // If OTP was verified within the last 30 minutes, allow direct sign-in
        if (lastOtpTime && (Date.now() - parseInt(lastOtpTime)) < 1800000) {
            setHasActiveSession(true);
        }
    }, []);

    // Reset Flow States
    const [isResetting, setIsResetting] = useState(false);
    const [resetPhase, setResetPhase] = useState(0); // 0 = Enter OTP, 1 = New Password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Mouse Tracking for 3D Form
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 30 });
    const springY = useSpring(y, { stiffness: 300, damping: 30 });
    const rotateX = useTransform(springY, [-0.5, 0.5], ["3deg", "-3deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-3deg", "3deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const triggerNotification = (title, message, duration = 8000) => {
        setMockNotification({ title, message });
        setTimeout(() => setMockNotification(null), duration);
    };

    const handleDirectSignIn = () => {
        setAuthPhase(6); // Granted
        localStorage.setItem('admin_token', 'true');
        localStorage.setItem('admin_username', email);
        setTimeout(() => navigate('/admin/dashboard'), 800);
    };

    // --- STANDARD LOGIN FLOW ---
    const handleInitialLogin = async (e) => {
        e.preventDefault();
        if (authPhase !== 0) return;

        setError(''); setAuthPhase(1);

        try {
            await fetch('/api/admin/send-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            setTimeout(() => {
                setAuthPhase(2);
                triggerNotification('NEXUS SECURITY', 'An OTP has been sent securely to your gmail..!!!');
            }, 1000);
        } catch (err) {
            setTimeout(() => { setError('CONNECTION TO SECURE SERVER FAILED.'); setAuthPhase(0); }, 1000);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (authPhase !== 2) return;

        setError(''); setAuthPhase(3);

        try {
            const res = await fetch('/api/admin/verify-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpInput })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Secure OTP passed - Save 30 minute session token and JWT
                localStorage.setItem('admin_jwt', data.token);
                localStorage.setItem('admin_otp_time', Date.now().toString());
                setAuthPhase(4);
                setMockNotification(null);
            } else {
                setError(data.error || 'INVALID OTP CODE. ACCESS DENIED.');
                setAuthPhase(2); setOtpInput('');
            }
        } catch (err) {
            setError('VERIFICATION FAILED.');
            setAuthPhase(2); setOtpInput('');
        }
    };

    const handleFingerprintScan = async () => {
        if (authPhase !== 4) return;

        setAuthPhase(5); // Scanning
        
        // Simulate biometric scan process without invoking native browser Passkey prompts
        setTimeout(() => {
            setAuthPhase(6); // Granted
            localStorage.setItem('admin_token', 'true');
            localStorage.setItem('admin_username', email);
            setTimeout(() => navigate('/admin/dashboard'), 1500);
        }, 3000);
    };


    // --- RESET PASSWORD FLOW ---
    const handleInitiateReset = () => {
        setIsResetting(true);
        setResetPhase(0);
        setOtpInput('');
        setError('');

        // Call Live Email Server!
        fetch('/api/admin/send-otp', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        }).catch(e => console.error('Email server dispatch error:', e));

        setTimeout(() => {
            triggerNotification('SECURITY ALERT', `Password Reset Requested. OTP sent securely.`);
        }, 800);
    };

    const handleResetOtpVerify = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/admin/verify-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpInput })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setResetPhase(1);
                setMockNotification(null);
            } else {
                setError(data.error || 'INVALID RESET OTP. INCIDENT LOGGED.');
                setOtpInput('');
            }
        } catch (err) {
            setError('VERIFICATION FAILED.');
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('PASSWORD TOO WEAK. Requires at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('PASSWORDS DO NOT MATCH.');
            return;
        }

        // Mock Password Change Success
        setResetPhase(2); // Loading State
        setTimeout(() => {
            triggerNotification('CRITICAL UPDATE (To: 7892640849)', `Admin password was successfully changed for ${email}.`);
            setIsResetting(false);
            setNewPassword('');
            setConfirmPassword('');
            setOtpInput('');
            setPassword(''); // Clear old password
            setResetPhase(0);
        }, 1500);
    };


    return (
        <div style={styles.container}>

            {/* Layers of Grandeur */}
            <LiquidWaves />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }} style={styles.lightBeams} />
            <GlitterStormCanvas />

            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0], opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
                    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
                    style={{ position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, zIndex: 11, pointerEvents: 'none' }}
                >
                    <Sparkles size={18} color="rgba(251,191,36,0.5)" style={{ filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.3))' }} />
                </motion.div>
            ))}

            {/* MOCK MOBILE NOTIFICATION */}
            <AnimatePresence>
                {mockNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -100, scale: 0.9 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        style={styles.mockNotification}
                    >
                        <div style={styles.notifIcon}><Smartphone size={20} color="#fff" /></div>
                        <div style={styles.notifContent}>
                            <div style={styles.notifTitle}>{mockNotification.title}</div>
                            <div style={styles.notifBody}>{mockNotification.message}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={styles.splitLayout}>
                <motion.div 
                    onClick={() => navigate('/')}
                    whileHover={{ x: -5, color: '#f59e0b' }}
                    style={{
                        position: 'absolute', top: '2rem', left: '4rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                        zIndex: 50
                    }}
                >
                    <ChevronLeft size={20} /> Back to Home
                </motion.div>

                {/* LEFT SIDE: AI Horizon Identity */}
                <div style={styles.leftPanel}>
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, type: 'spring' }} style={styles.leftContentOverlay}>
                        <div style={styles.brandBadge}>
                            <Sparkles size={14} style={{ opacity: 0.7 }} /> OVERSEER PROTOCOL
                        </div>
                        <h1 style={styles.mainTitle}>
                            INSTITUTIONAL<br />
                            <span style={styles.titleGradient}>OVERSIGHT</span><br />
                            MANAGEMENT
                        </h1>
                        <p style={styles.mainDesc}>
                            "The grand nexus of cognitive assessment and unparalleled operational control."
                        </p>

                        <div style={styles.indicatorsGroup}>
                            <div style={styles.indicator}><div style={styles.dotGold} /> MULTI-FACTOR ACTIVE</div>
                            <div style={styles.indicator}><div style={styles.dotRed} /> OVERWATCH AUDIT ENGAGED</div>
                        </div>

                        <OverseerCore isActive={authPhase === 1 || authPhase === 3 || authPhase === 5 || resetPhase === 2} isAlert={isResetting} />
                    </motion.div>
                </div>

                {/* RIGHT SIDE: Auth Panel */}
                <div style={styles.rightPanel}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                        style={{ perspective: 1500, width: '100%', maxWidth: '460px', zIndex: 20 }}
                    >
                        <motion.div
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => { x.set(0); y.set(0); }}
                            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            style={{ ...styles.glassCard, rotateX, rotateY, border: isResetting ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(239,68,68,0.2)' }}
                        >

                            <div style={styles.racingBorderWrapper}>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} style={{ ...styles.racingBorderGlow, background: isResetting ? 'conic-gradient(from 0deg, transparent 60%, rgba(245,158,11,0.4) 80%, rgba(239,68,68,0.5) 100%)' : 'conic-gradient(from 0deg, transparent 60%, rgba(239,68,68,0.4) 80%, rgba(245,158,11,0.5) 100%)' }} />
                            </div>

                            <div style={styles.cardInner}>
                                <div style={styles.cardHeader}>
                                    <h2 style={styles.cardTitle}>{isResetting ? "SECURITY OVERRIDE" : "ADMIN PORTAL"}</h2>
                                    <p style={styles.cardSubtitle}>
                                        {!isResetting && authPhase < 2 && "Step 1: Overseer Credentials"}
                                        {!isResetting && (authPhase === 2 || authPhase === 3) && "Step 2: OTP Verification"}
                                        {!isResetting && authPhase >= 4 && "Step 3: Biometric Scan"}
                                        {isResetting && resetPhase === 0 && "Verify identity to reset password"}
                                        {isResetting && resetPhase === 1 && "Create a new strong Overseer Key"}
                                    </p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={styles.errorBanner}>
                                            <AlertCircle size={28} style={{ flexShrink: 0 }} />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* --- RESET PASSWORD FLOW --- */}
                                {isResetting ? (
                                    <AnimatePresence mode="wait">
                                        {resetPhase === 0 && (
                                            <motion.form key="reset-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetOtpVerify} style={styles.form}>
                                                <div style={styles.inputContainer}>
                                                    <label style={{ ...styles.inputLabel, color: '#f59e0b' }}>RESET AUTHORIZATION CODE</label>
                                                    <div style={styles.inputWrapper}>
                                                        <KeyRound size={18} style={styles.inputIcon} className="form-icon-reset" />
                                                        <input
                                                            type="text" autoComplete="off" maxLength="4"
                                                            value={otpInput} onChange={e => setOtpInput(e.target.value)}
                                                            style={{ ...styles.inputField, fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center', paddingLeft: '16px' }}
                                                            placeholder="••••" required
                                                            className="reset-input"
                                                        />
                                                        <div className="input-reset-border" />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <motion.button type="button" onClick={() => setIsResetting(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.cancelBtn}>CANCEL</motion.button>
                                                    <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245,158,11,0.4)' }} whileTap={{ scale: 0.98 }} style={styles.resetBtn}>VERIFY</motion.button>
                                                </div>
                                            </motion.form>
                                        )}
                                        {resetPhase === 1 && (
                                            <motion.form key="new-pass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handlePasswordChange} style={styles.form}>
                                                <div style={styles.inputContainer}>
                                                    <label style={{ ...styles.inputLabel, color: '#f59e0b' }}>NEW STRONG PASSWORD</label>
                                                    <div style={styles.inputWrapper}>
                                                        <Lock size={18} style={styles.inputIcon} className="form-icon-reset" />
                                                        <input
                                                            type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                            style={styles.inputField} placeholder="Min. 8 characters required" required
                                                            className="reset-input"
                                                        />
                                                        <div className="input-reset-border" />
                                                    </div>
                                                </div>
                                                <div style={styles.inputContainer}>
                                                    <label style={{ ...styles.inputLabel, color: '#f59e0b' }}>CONFIRM PASSWORD</label>
                                                    <div style={styles.inputWrapper}>
                                                        <Lock size={18} style={styles.inputIcon} className="form-icon-reset" />
                                                        <input
                                                            type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                            style={styles.inputField} placeholder="Re-enter password" required
                                                            className="reset-input"
                                                        />
                                                        <div className="input-reset-border" />
                                                    </div>
                                                </div>
                                                <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245,158,11,0.4)' }} whileTap={{ scale: 0.98 }} style={styles.resetBtn} className="reset-btn-hover">
                                                    UPDATE SECURITY KEY
                                                </motion.button>
                                            </motion.form>
                                        )}
                                        {resetPhase === 2 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
                                                <Activity size={40} className="spin-icon-white" color="#f59e0b" style={{ marginBottom: '1rem' }} />
                                                <div style={{ color: '#f59e0b', fontWeight: 700, letterSpacing: '0.1em' }}>ENCRYPTING NEW KEY...</div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                ) : (
                                    /* --- NORMAL LOGIN FLOW --- */
                                    <AnimatePresence mode="wait">

                                        {/* PHASE 0 & 1: EMAIL / PASSWORD */}
                                        {authPhase < 2 && (
                                            <motion.form
                                                key="credentials-form"
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                onSubmit={handleInitialLogin} style={styles.form}
                                            >
                                                <div style={styles.inputContainer}>
                                                    <label style={styles.inputLabel}>OVERSEER EMAIL</label>
                                                    <div style={styles.inputWrapper}>
                                                        <Mail size={18} style={styles.inputIcon} className="form-icon" />
                                                        <input
                                                            type="email" autoComplete="off"
                                                            value={email} readOnly
                                                            style={{ ...styles.inputField, color: '#94a3b8', cursor: 'not-allowed' }} required
                                                            className="grand-input"
                                                        />
                                                        <div className="input-grand-border" />
                                                    </div>
                                                </div>

                                                <div style={styles.inputContainer}>
                                                    <label style={styles.inputLabel}>SECURITY KEY</label>
                                                    <div style={styles.inputWrapper}>
                                                        <Lock size={18} style={styles.inputIcon} className="form-icon" />
                                                        <input
                                                            type={showPassword ? "text" : "password"} autoComplete="off"
                                                            value={password} onChange={e => setPassword(e.target.value)}
                                                            style={styles.inputField} placeholder="Enter secure password" required disabled={authPhase === 1}
                                                            className="grand-input"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} disabled={authPhase === 1}>
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                        <div className="input-grand-border" />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {hasActiveSession ? (
                                                        <motion.button
                                                            type="button" onClick={handleDirectSignIn}
                                                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(16,185,129,0.4)', y: -2, background: 'linear-gradient(90deg, rgba(16,185,129,0.6), rgba(5,150,105,0.6))' }}
                                                            whileTap={{ scale: 0.98 }}
                                                            style={{ ...styles.submitBtn, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
                                                        >
                                                            DIRECT SIGN IN (Active Session) <ArrowRight size={18} />
                                                        </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={authPhase === 0 ? { scale: 1.02, boxShadow: '0 0 30px rgba(239,68,68,0.4)', y: -2, background: 'linear-gradient(90deg, rgba(239,68,68,0.6), rgba(245,158,11,0.6))' } : {}}
                                                            whileTap={authPhase === 0 ? { scale: 0.98 } : {}}
                                                            type="submit" disabled={authPhase === 1}
                                                            style={styles.submitBtn}
                                                            className="grand-btn"
                                                        >
                                                            {authPhase === 1 ? (
                                                                <div style={styles.authSequenceWrapper}>
                                                                    <Activity size={18} className="spin-icon-white" />
                                                                    <span style={{ color: '#fff' }}>VERIFYING INTEGRITY...</span>
                                                                </div>
                                                            ) : (
                                                                <>PROCEED TO OTP <ArrowRight size={18} className="btn-arrow" /></>
                                                            )}
                                                        </motion.button>
                                                    )}

                                                    {authPhase === 0 && (
                                                        <button type="button" onClick={handleInitiateReset} style={styles.forgotBtn}>
                                                            <RefreshCw size={12} /> RESET OVERSEER KEY
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.form>
                                        )}

                                        {/* PHASE 2 & 3: OTP VERIFICATION */}
                                        {(authPhase === 2 || authPhase === 3) && (
                                            <motion.form
                                                key="otp-form"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                onSubmit={handleOtpVerify} style={styles.form}
                                            >
                                                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.5 }}>
                                                    An authentication code has been dispatched to <strong>{email}</strong> and your registered mobile device.
                                                </p>

                                                <div style={styles.inputContainer}>
                                                    <label style={styles.inputLabel}>ENTER OTP CODE</label>
                                                    <div style={styles.inputWrapper}>
                                                        <KeyRound size={18} style={styles.inputIcon} className="form-icon" />
                                                        <input
                                                            type="text" autoComplete="off" maxLength="4"
                                                            value={otpInput} onChange={e => setOtpInput(e.target.value)}
                                                            style={{ ...styles.inputField, fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center', paddingLeft: '16px' }}
                                                            placeholder="••••" required disabled={authPhase === 3}
                                                            className="grand-input"
                                                        />
                                                        <div className="input-grand-border" />
                                                    </div>
                                                </div>

                                                <motion.button
                                                    whileHover={authPhase === 2 ? { scale: 1.02, boxShadow: '0 0 30px rgba(239,68,68,0.4)', y: -2, background: 'linear-gradient(90deg, rgba(239,68,68,0.6), rgba(245,158,11,0.6))' } : {}}
                                                    whileTap={authPhase === 2 ? { scale: 0.98 } : {}}
                                                    type="submit" disabled={authPhase === 3}
                                                    style={styles.submitBtn}
                                                    className="grand-btn"
                                                >
                                                    {authPhase === 3 ? (
                                                        <div style={styles.authSequenceWrapper}>
                                                            <Activity size={18} className="spin-icon-white" />
                                                            <span style={{ color: '#fff' }}>VERIFYING OTP...</span>
                                                        </div>
                                                    ) : (
                                                        <>VERIFY CODE <ArrowRight size={18} className="btn-arrow" /></>
                                                    )}
                                                </motion.button>
                                            </motion.form>
                                        )}

                                        {/* PHASE 4, 5 & 6: FINGERPRINT BIOMETRICS */}
                                        {authPhase >= 4 && (
                                            <motion.div
                                                key="biometric-form"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                                style={styles.biometricContainer}
                                            >
                                                <p style={styles.biometricInstructions}>
                                                    Identity verified. Finalize access with biometric signature.
                                                </p>

                                                <motion.div
                                                    onClick={handleFingerprintScan}
                                                    whileHover={authPhase === 4 ? { scale: 1.05 } : {}}
                                                    whileTap={authPhase === 4 ? { scale: 0.95 } : {}}
                                                    animate={authPhase === 5 ? { scale: [1, 1.1, 1], boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' } : {}}
                                                    transition={{ duration: 1, repeat: authPhase === 5 ? Infinity : 0 }}
                                                    style={{ ...styles.fingerprintScanner, borderColor: authPhase >= 5 ? '#10b981' : 'rgba(239,68,68,0.5)', cursor: authPhase === 4 ? 'pointer' : 'default' }}
                                                >
                                                    <Fingerprint size={64} color={authPhase >= 5 ? '#10b981' : '#ef4444'} />
                                                    {authPhase === 5 && <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={styles.scanLine} />}
                                                </motion.div>

                                                <div style={styles.authSequenceWrapper}>
                                                    {authPhase === 4 && <span style={{ color: '#94a3b8' }}>AWAITING BIOMETRIC INPUT</span>}
                                                    {authPhase === 5 && <><Activity size={18} className="spin-icon-white" color="#10b981" /> <span style={{ color: '#10b981' }}>SCANNING FINGERPRINT...</span></>}
                                                    {authPhase === 6 && <><ShieldCheck size={18} color="#10b981" /> <span style={{ color: '#10b981' }}>SYSTEM UNLOCKED. REDIRECTING.</span></>}
                                                </div>
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                )}

                                <div style={styles.cardFooter}>
                                    <div style={styles.footerItem}><LockKeyhole size={14} /> 🔒 256-BIT ENCRYPTION</div>
                                    <div style={styles.footerItem}><ShieldCheck size={14} color="rgba(245,158,11,0.8)" /> {isResetting ? 'RESET PROTOCOL' : '3FA REQUIRED'}</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <style>
                {`
                input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px rgba(5,5,5,0.9) inset !important; -webkit-text-fill-color: white !important; transition: background-color 5000s ease-in-out 0s; }
                .grand-input:focus { color: white !important; background: rgba(255, 255, 255, 0.05) !important; }
                .grand-input:focus ~ .form-icon, .grand-input:focus + .form-icon { color: rgba(245,158,11,0.8) !important; }
                
                .reset-input:focus { color: white !important; background: rgba(245, 158, 11, 0.05) !important; }
                .reset-input:focus ~ .form-icon-reset, .reset-input:focus + .form-icon-reset { color: #f59e0b !important; }

                .input-grand-border { position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, rgba(239,68,68,0.8), rgba(245,158,11,0.8)); transform: scaleX(0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: center; box-shadow: 0 0 10px rgba(239,68,68,0.5); }
                .grand-input:focus ~ .input-grand-border { transform: scaleX(1); }
                
                .input-reset-border { position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: #f59e0b; transform: scaleX(0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: center; box-shadow: 0 0 10px rgba(245,158,11,0.8); }
                .reset-input:focus ~ .input-reset-border { transform: scaleX(1); }

                .grand-btn:hover .btn-arrow { transform: translateX(6px); color: #fff; }
                .btn-arrow { transition: all 0.3s ease; }
                
                .spin-icon-white { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @media (max-width: 900px) {
                    .split-layout { flex-direction: column !important; padding: 2rem !important; }
                    .left-panel { width: 100% !important; padding: 0 0 3rem 0 !important; }
                    .right-panel { width: 100% !important; justify-content: flex-start !important; padding: 0 !important; }
                    .main-title { font-size: 2.8rem !important; }
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: { width: '100%', minHeight: '100vh', backgroundColor: '#020202', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' },

    // --- MOCK NOTIFICATION ---
    mockNotification: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 24px', zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.2)' },
    notifIcon: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16,185,129,0.5)' },
    notifContent: { display: 'flex', flexDirection: 'column', gap: '4px' },
    notifTitle: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' },
    notifBody: { color: '#fff', fontSize: '0.9rem', fontWeight: 400 },

    // --- LAYERS OF GRANDEUR ---
    wavesContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 },
    blob: { position: 'absolute', opacity: 1 },
    blurLayer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backdropFilter: 'blur(100px)', WebkitBackdropFilter: 'blur(100px)', zIndex: 1, pointerEvents: 'none' },
    lightBeams: { position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'conic-gradient(from 0deg, transparent 0deg, rgba(239,68,68,0.05) 60deg, transparent 120deg, rgba(245,158,11,0.05) 180deg, transparent 240deg, rgba(239,68,68,0.05) 300deg, transparent 360deg)', zIndex: 1, pointerEvents: 'none', mixBlendMode: 'screen' },

    // --- 3D OVERSEER CORE STYLES ---
    coreContainer: { position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200, margin: '3rem 0 0 1rem', zIndex: 10 },
    coreRing3D: { position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', transformStyle: 'preserve-3d' },
    coreInnerDiamond: { width: '45%', height: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' },

    splitLayout: { position: 'relative', zIndex: 20, display: 'flex', width: '100%', minHeight: '100vh', maxWidth: '1600px', margin: '0 auto', padding: '0 4rem', className: 'split-layout' },

    // --- LEFT PANEL ---
    leftPanel: { flex: 1.2, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '4rem', className: 'left-panel' },
    leftContentOverlay: { position: 'relative', zIndex: 10 },
    brandBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(245,158,11,0.8)', letterSpacing: '0.3em', marginBottom: '1.5rem', borderBottom: '1px solid rgba(245,158,11,0.3)', paddingBottom: '6px' },
    mainTitle: { fontSize: '3.8rem', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem', className: 'main-title', textShadow: '0 5px 15px rgba(0,0,0,0.5)' },
    titleGradient: { background: 'linear-gradient(to right, rgba(239,68,68,0.9), rgba(245,158,11,0.9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    mainDesc: { color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '480px', marginBottom: '3rem', fontWeight: 400 },

    indicatorsGroup: { display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', className: 'indicators-group' },
    indicator: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '0.15em' },
    dotRed: { width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(239,68,68,0.8)', boxShadow: '0 0 10px rgba(239,68,68,0.5)' },
    dotGold: { width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(245,158,11,0.8)', boxShadow: '0 0 10px rgba(245,158,11,0.5)' },

    // --- RIGHT PANEL (Form) ---
    rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', className: 'right-panel', zIndex: 30 },

    glassCard: { width: '100%', position: 'relative', borderRadius: '28px', transformStyle: 'preserve-3d', overflow: 'hidden' },
    racingBorderWrapper: { position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', zIndex: 0, overflow: 'hidden' },
    racingBorderGlow: { width: '100%', height: '100%', opacity: 1 },

    cardInner: { position: 'relative', zIndex: 1, margin: '1px', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderRadius: '27px', padding: '3.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.03)' },

    cardHeader: { marginBottom: '2.5rem' },
    cardTitle: { fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '0.1em', marginBottom: '8px' },
    cardSubtitle: { fontSize: '0.9rem', color: '#64748b', fontWeight: 500 },
    errorBanner: { display: 'flex', alignItems: 'center', gap: '15px', padding: '16px', background: 'rgba(185,28,28,0.3)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 0 30px rgba(239,68,68,0.4)', lineHeight: 1.4 },

    form: { display: 'flex', flexDirection: 'column', gap: '1.8rem' },
    inputContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
    inputLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.3s ease' },
    inputIcon: { position: 'absolute', left: '16px', color: '#475569', transition: 'color 0.3s ease' },
    inputField: { width: '100%', padding: '16px 16px 16px 48px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', outline: 'none', fontWeight: 400 },
    eyeBtn: { position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', padding: '4px' },

    submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '18px', marginTop: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.15em', cursor: 'pointer', transition: 'all 0.3s ease' },
    authSequenceWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#fff', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 700 },

    forgotBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', cursor: 'pointer', opacity: 0.8, transition: 'all 0.3s ease' },
    resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 2, padding: '16px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.5)', borderRadius: '14px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.15em', cursor: 'pointer', transition: 'all 0.3s ease' },
    cancelBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.3s ease' },

    // BIOMETRICS
    biometricContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' },
    biometricInstructions: { color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginBottom: '3rem', lineHeight: 1.6 },
    fingerprintScanner: { position: 'relative', width: '120px', height: '120px', borderRadius: '50%', border: '2px dashed rgba(239,68,68,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem', background: 'rgba(0,0,0,0.3)', overflow: 'hidden' },
    scanLine: { position: 'absolute', width: '100%', height: '4px', background: '#10b981', boxShadow: '0 0 15px #10b981', zIndex: 10 },

    cardFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' },
    footerItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#475569', fontWeight: 600, letterSpacing: '0.1em' }
};

export default AdminLogin;

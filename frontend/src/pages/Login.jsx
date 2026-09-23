import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, Lock, Mail, Phone, Calendar, 
    ChevronRight, ChevronLeft, Book, EyeOff, Eye, BookOpen,
    BrainCircuit, Activity, FileText, Network, Code, Users, Brain, Zap, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import educationData from '../data/educationData.json';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
);

const MicrosoftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 23 23">
        <path fill="#f35325" d="M1 1h10v10H1z"/>
        <path fill="#81bc06" d="M12 1h10v10H12z"/>
        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
        <path fill="#ffba08" d="M12 12h10v10H12z"/>
    </svg>
);

const LinkedinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077b5">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
);

// PURE CODE Grid and Lighting Animation
const GlowingGrid = () => (
    <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.8,
        zIndex: 0,
        pointerEvents: 'none'
    }}>
        <motion.div animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at 35% 50%, rgba(14,165,233,0.15) 0%, transparent 50%)' }} />
        <motion.div animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.3, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 1, ease: "easeInOut" }} style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at 65% 30%, rgba(168,85,247,0.15) 0%, transparent 50%)' }} />
        
        {/* Floating Code Particles */}
        {[...Array(15)].map((_, i) => (
            <motion.div
                key={i}
                style={{
                    position: 'absolute', width: '3px', height: '3px',
                    background: i % 2 === 0 ? '#0ea5e9' : '#a855f7',
                    borderRadius: '50%', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
                    opacity: 0.5, boxShadow: '0 0 10px ' + (i % 2 === 0 ? '#0ea5e9' : '#a855f7')
                }}
                animate={{ y: [0, -40], opacity: [0, 0.8, 0] }}
                transition={{ duration: Math.random() * 3 + 3, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
            />
        ))}
    </div>
);

const FeatureCard = ({ icon: Icon, title, subtitle, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px ' + color + '40', backgroundColor: 'rgba(15,23,42,0.8)' }}
        style={{
            display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px', 
            background: 'rgba(15,23,42,0.5)', border: '1px solid ' + color + '30', borderRadius: '12px', 
            borderLeft: '4px solid ' + color, backdropFilter: 'blur(10px)', marginBottom: '15px',
            cursor: 'default', transition: 'background-color 0.3s'
        }}
    >
        <div style={{ color: color, padding: '10px', background: color + '15', borderRadius: '10px', boxShadow: 'inset 0 0 10px ' + color + '20' }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>{title}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>{subtitle}</div>
        </div>
    </motion.div>
);

const AnimatedBrain = () => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
        style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '380px', height: '380px' }}
    >
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }} 
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} 
            style={{ position: 'absolute', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(14,165,233,0.35) 0%, transparent 65%)', filter: 'blur(25px)', zIndex: 1 }} 
        />
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '280px', height: '280px', border: '2px dashed rgba(14,165,233,0.3)', borderRadius: '50%', zIndex: 2 }}
        />
        <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '320px', height: '320px', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '50%', zIndex: 2 }}
        />
        
        {/* Massive Glowing AI Brain */}
        <BrainCircuit size={200} color="#0ea5e9" style={{ filter: 'drop-shadow(0 0 35px rgba(14,165,233,0.9))', zIndex: 3 }} />
        
        <motion.div 
            animate={{ boxShadow: ['0 0 15px #0ea5e9', '0 0 40px #0ea5e9', '0 0 15px #0ea5e9'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', zIndex: 4, background: 'rgba(2,6,23,0.95)', border: '2px solid #0ea5e9', padding: '12px 30px', borderRadius: '12px' }}
        >
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', letterSpacing: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={24} color="#0ea5e9" /> AI
            </span>
        </motion.div>
    </motion.div>
);

const FlowchartPath = () => {
    const steps = [
        {name: 'APTITUDE', icon: BrainCircuit, color: '#a855f7'},
        {name: 'TECHNICAL', icon: Code, color: '#0ea5e9'},
        {name: 'GROUP DISCUSSION', icon: Users, color: '#a855f7'},
        {name: 'HR INTERVIEW', icon: User, color: '#0ea5e9'}
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + (idx*0.2) }}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px ' + step.color + '50' }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 25px', borderRadius: '30px', border: '1px solid ' + step.color + '60', background: 'rgba(15,23,42,0.85)', color: 'white', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', width: '220px', backdropFilter: 'blur(8px)', cursor: 'default' }}
                    >
                        <step.icon size={20} color={step.color} /> {step.name}
                    </motion.div>
                    {idx < steps.length - 1 && (
                        <motion.div 
                            initial={{ height: 0 }} animate={{ height: 45 }} transition={{ delay: 0.8 + (idx*0.2), duration: 0.5 }}
                            style={{ width: '2px', borderLeft: '2px dashed ' + step.color + '80', margin: '6px 0' }} 
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '', password: '', confirmPassword: '',
        firstName: '', lastName: '', dob: '', gender: '',
        email: '', phone: '', university: '', collegeName: ''
    });
    const [availableColleges, setAvailableColleges] = useState([]);

    useEffect(() => {
        if (formData.university) {
            const uni = educationData.universities.find(u => u.name === formData.university);
            setAvailableColleges(uni ? uni.colleges : []);
        } else {
            setAvailableColleges([]);
        }
    }, [formData.university]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/send-registration-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();
            if (res.ok) {
                setShowOTPModal(true);
            } else {
                alert(data.error || 'Failed to send OTP');
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to Server');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTPAndRegister = async () => {
        if (otp.length !== 6) return alert("Enter complete 6-digit OTP");
        
        setLoading(true);
        try {
            // 1. Verify OTP
            const verifyRes = await fetch('/api/verify-registration-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otp })
            });
            
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                alert(verifyData.error || 'Invalid OTP');
                setLoading(false);
                return;
            }
            
            // 2. Proceed with registration
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                alert('Email validated! Account created successfully and is pending admin approval.');
                setShowOTPModal(false);
                setIsLogin(true);
                setStep(1);
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error verifying OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!isLogin) {
            return handleSendOTP(e);
        }

        setLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('ai_portal_username', data.username);
                if (data.profile?.email) localStorage.setItem('ai_portal_user_email', data.profile.email);
                navigate('/dashboard');
            } else alert(data.error || 'Authentication failed');
        } catch (error) {
            console.error('API Error', error); alert('Error connecting to Server');
        } finally {
            setLoading(false);
        }
    };

    const slideVar = {
        initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="auth-container">
            <GlowingGrid />
            
            <div className="auth-wrapper">
                <motion.div 
                    onClick={() => navigate('/')}
                    whileHover={{ x: -5, color: '#0ea5e9' }}
                    style={{
                        position: 'absolute', top: '2rem', left: '2rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                        zIndex: 50
                    }}
                >
                    <ChevronLeft size={20} /> Back to Home
                </motion.div>
                {/* 100% PURE HTML/CSS/REACT CODE - NO BACKGROUND IMAGES */}
                <div className="auth-left-panel">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={styles.headerArea}>
                        <h3 style={styles.superTitle}>AI POWERED</h3>
                        <h1 style={styles.mainTitle}>
                            <span style={styles.gradientTextCyan}>HOLISTIC INTERVIEW</span><br/>
                            AND PERSONAL DEVELOPMENT<br/>
                            INTELLIGENCE SYSTEM
                        </h1>
                        <p style={styles.subTitle}>Analyze &nbsp;&bull;&nbsp; Evaluate &nbsp;&bull;&nbsp; Improve &nbsp;&bull;&nbsp; Succeed</p>
                    </motion.div>

                    <div style={styles.centerVisualArea}>
                        {/* Left HUD Feature Cards */}
                        <div style={styles.featuresCol}>
                            <FeatureCard icon={User} title="AI INTERVIEW" subtitle="Smart Interviewer" color="#0ea5e9" delay={0.2} />
                            <FeatureCard icon={FileText} title="RESUME ANALYZER" subtitle="Intelligent Screening" color="#a855f7" delay={0.4} />
                            <FeatureCard icon={Network} title="SKILL DEVELOPMENT" subtitle="Personalized Learning" color="#f97316" delay={0.6} />
                            <FeatureCard icon={Activity} title="PERFORMANCE INSIGHTS" subtitle="Data Driven Growth" color="#2dd4bf" delay={0.8} />
                        </div>

                        {/* Center Glowing Brain - Recreated in Code */}
                        <AnimatedBrain />

                        {/* Right HUD Flowchart */}
                        <div style={styles.flowchartCol}>
                            <FlowchartPath />
                        </div>
                    </div>

                    {/* Bottom Holographic HUD */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} style={styles.holographicHUD}>
                        <div style={styles.hudArc} />
                        <div style={styles.hudCard}>
                            <Zap size={26} color="#0ea5e9" />
                            <div>
                                <div style={{fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 600}}>COMMUNICATION AI</div>
                                <div style={{fontWeight: 900, color: '#f8fafc', fontSize: '1.2rem'}}>85% Match</div>
                            </div>
                            <div style={{width: '80px', height: '6px', background: 'rgba(14,165,233,0.2)', borderRadius: '3px', marginLeft: '10px'}}>
                                <motion.div initial={{width: 0}} animate={{width: '85%'}} transition={{duration: 1.5, delay: 1.2}} style={{height: '100%', background: '#0ea5e9', borderRadius: '3px', boxShadow: '0 0 10px #0ea5e9'}} />
                            </div>
                        </div>
                        <div style={{...styles.hudCard, background: 'rgba(168,85,247,0.15)', borderColor: 'rgba(168,85,247,0.4)'}}>
                            <Code size={26} color="#a855f7" />
                            <div>
                                <div style={{fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 600}}>TECHNICAL LOGIC</div>
                                <div style={{fontWeight: 900, color: '#f8fafc', fontSize: '1.2rem'}}>92% Accuracy</div>
                            </div>
                            <div style={{width: '80px', height: '6px', background: 'rgba(168,85,247,0.2)', borderRadius: '3px', marginLeft: '10px'}}>
                                <motion.div initial={{width: 0}} animate={{width: '92%'}} transition={{duration: 1.5, delay: 1.2}} style={{height: '100%', background: '#a855f7', borderRadius: '3px', boxShadow: '0 0 10px #a855f7'}} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT SIDE - PURE CODE LOGIN PANEL */}
                <div className="auth-right-panel">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={styles.authCard}
                    >
                        <div style={styles.cardHeader}>
                            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} style={styles.logoCircle}>
                                <Brain size={40} color="#0ea5e9" />
                            </motion.div>
                            <h2 style={styles.panelBrandTitle}>AI INTERVIEW <span style={styles.gradientTextPurple}>STUDIO</span></h2>
                            <p style={styles.panelBrandSub}>Smart Interviews | Stronger You</p>
                        </div>

                        <div style={styles.welcomeSection}>
                            <h3 style={styles.welcomeTitle}>{isLogin ? 'Welcome Back!' : 'Create Account'}</h3>
                            <p style={styles.welcomeSub}>{isLogin ? 'Login to continue your journey' : 'Join the intelligence system'}</p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); if(isLogin || step === 3) handleSubmit(); else nextStep(); }} style={styles.form}>
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div key="login" {...slideVar} style={styles.formFields}>
                                        <div style={styles.inputGroup}>
                                            <User size={18} style={styles.fieldIcon} />
                                            <input 
                                                className="auth-input" style={styles.input} type="text" name="username" 
                                                placeholder="Username / Email / USN" 
                                                value={formData.username} onChange={handleInputChange} required 
                                            />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <Lock size={18} style={styles.fieldIcon} />
                                            <input 
                                                className="auth-input" style={styles.input} type={showPassword ? "text" : "password"} name="password" 
                                                placeholder="Password" 
                                                value={formData.password} onChange={handleInputChange} required 
                                            />
                                            <div style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <Eye size={18}/> : <EyeOff size={18}/>}
                                            </div>
                                        </div>
                                        
                                        <div style={styles.formOptions}>
                                            <label style={styles.checkboxLabel}>
                                                <input type="checkbox" style={styles.checkbox} />
                                                <span>Remember Me</span>
                                            </label>
                                            <span style={styles.forgotPass}>Forgot Password?</span>
                                        </div>

                                        <motion.button 
                                            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(14,165,233,0.6)" }}
                                            whileTap={{ scale: 0.98 }}
                                            style={styles.loginBtn} disabled={loading}
                                        >
                                            {loading ? <div className="spinner"></div> : 'LOGIN'}
                                        </motion.button>

                                        <div style={styles.dividerContainer}>
                                            <div style={styles.dividerLine}></div>
                                            <span style={styles.dividerText}>Or continue with</span>
                                            <div style={styles.dividerLine}></div>
                                        </div>

                                        <div style={styles.socialLogins}>
                                            <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }} style={styles.socialBtn} title="Google"><GoogleIcon /></motion.div>
                                            <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }} style={styles.socialBtn} title="Microsoft"><MicrosoftIcon /></motion.div>
                                            <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }} style={styles.socialBtn} title="LinkedIn"><LinkedinIcon /></motion.div>
                                        </div>

                                        <div style={styles.switchMode}>
                                            Don't have an account? <span style={styles.switchLink} onClick={() => setIsLogin(false)}>Register Now</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key={`reg-step-${step}`} {...slideVar} style={styles.formFields}>
                                        <div style={styles.stepBubble}>Step {step} of 3</div>

                                        {step === 1 && (
                                            <>
                                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                    <div style={styles.inputGroup}>
                                                        <input className="auth-input" style={{...styles.input, paddingLeft: '1rem'}} name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
                                                    </div>
                                                    <div style={styles.inputGroup}>
                                                        <input className="auth-input" style={{...styles.input, paddingLeft: '1rem'}} name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
                                                    </div>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <Calendar size={18} style={styles.fieldIcon} />
                                                    <input className="auth-input" style={styles.input} type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
                                                </div>
                                                <div style={styles.genderRow}>
                                                    {['Male', 'Female', 'Other'].map(g => (
                                                        <div key={g} style={{...styles.genderBtn, ...(formData.gender === g ? styles.genderActive : {})}} onClick={() => setFormData({...formData, gender: g})}>{g}</div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {step === 2 && (
                                            <>
                                                <div style={styles.inputGroup}>
                                                    <Book size={18} style={styles.fieldIcon} />
                                                    <input className="auth-input" style={styles.input} name="university" value={formData.university} onChange={handleInputChange} required placeholder="University" list="university-list" autoComplete="off" />
                                                    <datalist id="university-list">{educationData.universities.map(u => <option key={u.id} value={u.name}/>)}</datalist>
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <Book size={18} style={styles.fieldIcon} />
                                                    <input className="auth-input" style={styles.input} name="collegeName" value={formData.collegeName} onChange={handleInputChange} required placeholder="College" list="college-list" autoComplete="off" />
                                                    <datalist id="college-list">{availableColleges.map((c, i) => <option key={c} value={c}/>)}</datalist>
                                                </div>
                                            </>
                                        )}

                                        {step === 3 && (
                                            <>
                                                <div style={styles.inputGroup}>
                                                    <Mail size={18} style={styles.fieldIcon} />
                                                    <input className="auth-input" style={styles.input} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <Phone size={18} style={styles.fieldIcon} />
                                                    <input className="auth-input" style={styles.input} type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <User size={18} style={styles.fieldIcon} />
                                                    <input className="auth-input" style={styles.input} name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required />
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                    <div style={styles.inputGroup}>
                                                        <input className="auth-input" style={{...styles.input, paddingLeft: '1rem'}} type="password" name="password" placeholder="Pass" value={formData.password} onChange={handleInputChange} required />
                                                    </div>
                                                    <div style={styles.inputGroup}>
                                                        <input className="auth-input" style={{...styles.input, paddingLeft: '1rem'}} type="password" name="confirmPassword" placeholder="Confirm" value={formData.confirmPassword} onChange={handleInputChange} required />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div style={styles.btnRow}>
                                            {step > 1 && <motion.div whileTap={{scale:0.95}} style={styles.backBtn} onClick={prevStep}><ChevronLeft size={20}/></motion.div>}
                                            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} style={{...styles.loginBtn, flex: 1, marginTop: 0}} disabled={loading}>
                                                {loading ? <div className="spinner"></div> : step === 3 ? 'CREATE ACCOUNT' : 'CONTINUE'}
                                            </motion.button>
                                        </div>
                                        
                                        <div style={{...styles.switchMode, marginTop: '1rem'}}>
                                            Already have an account? <span style={styles.switchLink} onClick={() => {setIsLogin(true); setStep(1);}}>Login</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>

            {showOTPModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.otpModal}>
                        <h3 style={{color: 'white', marginBottom: '0.5rem', fontWeight: 800}}>Verify Email</h3>
                        <p style={{color: '#94a3b8', marginBottom: '1.2rem', fontSize: '0.9rem', lineHeight: 1.5}}>
                            A 6-digit verification code has been sent to your registered email address:<br/>
                            <strong style={{color: '#0ea5e9'}}>{formData.email}</strong><br/>
                            <span style={{fontSize: '0.8rem', color: '#64748b'}}>(Please check your Inbox and Spam/Junk folder)</span>
                        </p>

                        <input 
                            style={styles.otpInput} 
                            maxLength="6" 
                            value={otp}
                            placeholder="6-digit"
                            onChange={(e) => setOtp(e.target.value)} 
                        />

                        <div style={{marginTop: '1.8rem', display: 'flex', gap: '12px', justifyContent: 'center'}}>
                            <button
                                type="button"
                                style={{
                                    padding: '0.9rem 1.4rem',
                                    borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#94a3b8',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                }}
                                onClick={() => setShowOTPModal(false)}
                            >
                                Cancel
                            </button>
                            <motion.button 
                                whileHover={{scale:1.02}} 
                                style={{...styles.loginBtn, marginTop: 0, flex: 1}} 
                                onClick={handleVerifyOTPAndRegister}
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify & Create'}
                            </motion.button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>
                {`
                .auth-input:focus {
                    border-color: #0ea5e9 !important;
                    box-shadow: 0 0 15px rgba(14,165,233,0.5) !important;
                    background: rgba(14,165,233,0.1) !important;
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: { 
        width: '100%', minHeight: '100vh', 
        display: 'flex', 
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
        backgroundColor: '#020617', 
        position: 'relative', overflow: 'hidden'
    },
    wrapper: { 
        width: '100%', maxWidth: '1600px', margin: '0 auto',
        display: 'flex', zIndex: 10, position: 'relative',
        minHeight: '100vh'
    },
    
    // PURE HTML/CSS LEFT PANEL
    leftPanel: {
        flex: 1.8, padding: '3rem 4rem', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', position: 'relative',
        '@media (max-width: 1000px)': { display: 'none' }
    },
    headerArea: { marginBottom: '3rem', textAlign: 'center', zIndex: 10 },
    superTitle: { color: '#0ea5e9', fontSize: '1rem', letterSpacing: '0.4em', fontWeight: 900, marginBottom: '1rem', textShadow: '0 0 15px rgba(14,165,233,0.8)' },
    mainTitle: { color: '#f8fafc', fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '0.02em', textShadow: '0 5px 20px rgba(0,0,0,0.8)' },
    gradientTextCyan: { background: 'linear-gradient(to right, #0ea5e9, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 25px rgba(14,165,233,0.5))' },
    subTitle: { color: '#94a3b8', fontSize: '1.2rem', letterSpacing: '0.15em', fontWeight: 700 },
    
    centerVisualArea: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', zIndex: 10 },
    
    featuresCol: { display: 'flex', flexDirection: 'column', flex: 1, zIndex: 5 },
    flowchartCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', flex: 1, zIndex: 5 },
    
    holographicHUD: { 
        display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', 
        position: 'relative', zIndex: 10 
    },
    hudArc: { 
        position: 'absolute', top: '-25px', left: '15%', right: '15%', height: '120px', 
        borderTop: '2px dashed rgba(14,165,233,0.4)', borderRadius: '50% 50% 0 0', filter: 'blur(0.5px)' 
    },
    hudCard: {
        background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.4)', padding: '18px 30px', 
        borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', backdropFilter: 'blur(15px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },

    // PURE HTML/CSS RIGHT PANEL
    rightPanel: { 
        flex: 1, minWidth: '440px', maxWidth: '540px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        padding: '2rem 3rem', zIndex: 10,
        backgroundColor: 'rgba(4,9,20,0.85)', 
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-30px 0 60px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(25px)'
    },
    
    authCard: { 
        width: '100%', position: 'relative', zIndex: 5,
        display: 'flex', flexDirection: 'column'
    },
    cardHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' },
    logoCircle: { 
        width: '84px', height: '84px', borderRadius: '50%', 
        position: 'relative', marginBottom: '1.2rem',
        background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(14,165,233,0.5)', boxShadow: '0 0 30px rgba(14,165,233,0.4)'
    },
    
    panelBrandTitle: { color: '#f8fafc', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.08em' },
    gradientTextPurple: { background: 'linear-gradient(to right, #0ea5e9, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    panelBrandSub: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 700 },

    welcomeSection: { textAlign: 'center', marginBottom: '2rem' },
    welcomeTitle: { color: '#a855f7', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' },
    welcomeSub: { color: '#94a3b8', fontSize: '0.95rem' },

    form: { display: 'flex', flexDirection: 'column' },
    formFields: { display: 'flex', flexDirection: 'column', gap: '1.4rem' },
    inputGroup: { position: 'relative', width: '100%' },
    fieldIcon: { position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
    eyeIcon: { position: 'absolute', right: '1.4rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer' },
    input: { 
        width: '100%', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)',
        padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '14px', color: '#f8fafc', 
        fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
    },
    
    formOptions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 },
    checkbox: { accentColor: '#0ea5e9', cursor: 'pointer', width: '18px', height: '18px' },
    forgotPass: { color: '#0ea5e9', cursor: 'pointer', fontWeight: 800, transition: 'color 0.2s' },

    loginBtn: {
        width: '100%', padding: '1.1rem', borderRadius: '14px', border: 'none',
        background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', color: 'white',
        fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', marginTop: '0.8rem',
        boxShadow: '0 10px 35px rgba(14,165,233,0.4)', transition: 'all 0.3s ease',
        letterSpacing: '0.08em'
    },

    dividerContainer: { display: 'flex', alignItems: 'center', margin: '1.5rem 0' },
    dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' },
    dividerText: { margin: '0 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 },
    
    socialLogins: { display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '1.2rem' },
    socialBtn: { 
        width: '52px', height: '52px', borderRadius: '50%', background: '#0a0f1d',
        border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    },

    switchMode: { textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 },
    switchLink: { color: '#0ea5e9', fontWeight: 900, cursor: 'pointer', marginLeft: '0.4rem', textDecoration: 'underline' },

    stepBubble: { alignSelf: 'center', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', padding: '0.5rem 1.4rem', borderRadius: '25px', fontSize: '0.8rem', fontWeight: 900, marginBottom: '0.6rem', border: '1px solid rgba(14,165,233,0.4)' },
    genderRow: { display: 'flex', gap: '0.6rem' },
    genderBtn: { flex: 1, padding: '0.9rem', textAlign: 'center', background: '#0a0f1d', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' },
    genderActive: { borderColor: '#0ea5e9', background: 'rgba(14,165,233,0.2)', color: '#0ea5e9' },
    btnRow: { display: 'flex', gap: '1rem', marginTop: '1.2rem' },
    backBtn: { width: '56px', height: '56px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' },
    stepIndicatorActive: { width: 30, height: 4, borderRadius: 2, background: '#0ea5e9', transition: 'all 0.3s' },
    
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    otpModal: { background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '30px', width: '90%', maxWidth: '400px', textAlign: 'center', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    otpInput: { width: '150px', height: '55px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1.5rem', textAlign: 'center', outline: 'none', letterSpacing: '0.2em' }
};

export default Login;

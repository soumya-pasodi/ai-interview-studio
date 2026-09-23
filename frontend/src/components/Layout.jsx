import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    Bot, BarChart, Layout as LayoutIcon, 
    User, LogOut, Settings, Bell, Search,
    Award, MessageSquare, Code, Users, ArrowLeft, FileText, BookOpen, Briefcase,
    Menu, X, Film, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMentor from './ChatMentor';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('Student');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('student_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        localStorage.setItem('student_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        const user = localStorage.getItem('ai_portal_username');
        if (!user) {
            navigate('/');
        } else {
            setUsername(user);
        }

        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        const routesList = [
            '/dashboard',
            '/dashboard?view=academic',
            '/dashboard?view=skills',
            '/learning-hub',
            '/career-intelligence',
            '/code-studio',
            '/peer-interview',
            '/resume',
            '/performance'
        ];

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const currentRoute = location.pathname + location.search;
                const currentIndex = routesList.indexOf(currentRoute);
                
                if (currentIndex !== -1) {
                    if (e.key === 'ArrowRight' && currentIndex < routesList.length - 1) {
                        navigate(routesList[currentIndex + 1]);
                    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                        navigate(routesList[currentIndex - 1]);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        
        const handleStorage = (e) => {
            if (e.key === 'student_broadcast' && e.newValue) {
                setNotifications(prev => [{ id: Date.now(), text: e.newValue, time: new Date().toLocaleTimeString(), read: false }, ...prev]);
                localStorage.removeItem('student_broadcast');
            }
        };
        window.addEventListener('storage', handleStorage);
        
        const pendingBroadcast = localStorage.getItem('student_broadcast');
        if (pendingBroadcast) {
            setNotifications(prev => [{ id: Date.now(), text: pendingBroadcast, time: new Date().toLocaleTimeString(), read: false }, ...prev]);
            localStorage.removeItem('student_broadcast');
        }
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate, location]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const fullCurrent = location.pathname + location.search;
        const isActive = to.includes('?') 
            ? fullCurrent === to 
            : location.pathname === to && !location.search;
        return (
            <div 
                onClick={() => { navigate(to); setIsSidebarOpen(false); }}
                style={{...styles.sidebarNavItem, ...(isActive ? styles.sidebarNavItemActive : {})}}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1, position: 'relative' }}>
                    <Icon size={20} color={isActive ? "white" : "var(--text-sub)"} />
                    <span style={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'white' : 'var(--text-sub)' }}>{label}</span>
                </div>
                {isActive && <motion.div layoutId="sidebar-pill" style={styles.sidebarNavPill} />}
            </div>
        );
    };

    return (
        <div style={styles.appShell}>
            {/* Header */}
            <header style={{...styles.header, ...(isScrolled ? styles.headerScrolled : {})}}>
                <div style={styles.headerLeft}>
                    <button onClick={() => setIsSidebarOpen(true)} style={styles.hamburgerBtn}>
                        <Menu size={24} color="white" />
                    </button>
                    <div style={styles.navLogo} onClick={() => navigate('/dashboard')}>
                        <div style={styles.navIcon}>
                            <Bot size={22} color="white" />
                        </div>
                        <h2 style={styles.platformName}>AI Interview <span style={{ color: 'var(--primary)' }}>Studio</span></h2>
                    </div>
                </div>

                <div style={styles.headerRight}>
                    <div style={styles.searchBar}>
                        <Search size={18} color="var(--text-sub)" />
                        <input placeholder="Search mock interviews..." style={styles.searchInput} />
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowNotifications(!showNotifications)} style={{ ...styles.iconBtn, background: notifications.some(n => !n.read) ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)' }}>
                            <Bell size={20} color={notifications.some(n => !n.read) ? 'var(--danger)' : 'var(--text-sub)'} />
                            {notifications.some(n => !n.read) && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} />}
                        </button>
                        
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: '60px', right: '0', width: '320px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1001, overflow: 'hidden' }}>
                                    <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>Notifications</h4>
                                        {notifications.length > 0 && <span onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>Mark all read</span>}
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px 0' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.85rem' }}>No new notifications</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n))} style={{ padding: '12px 20px', display: 'flex', gap: '12px', cursor: 'pointer', background: notif.read ? 'transparent' : 'rgba(255,255,255,0.03)', borderLeft: notif.read ? '3px solid transparent' : '3px solid var(--primary)', transition: 'background 0.2s' }}>
                                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bell size={14} /></div>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', color: 'white', lineHeight: 1.4 }}>{notif.text}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', marginTop: '4px' }}>{notif.time}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <div style={styles.userProfile} onClick={() => navigate('/profile')}>
                        <div style={styles.avatar}>
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.userDetails}>
                            <span style={styles.userName}>{username}</span>
                            <span style={styles.userStatus}>Student Pro</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={styles.logoutBtn}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar Navigation */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            style={styles.sidebarOverlay} 
                        />
                        <motion.div 
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={styles.sidebar}
                        >
                            <div style={styles.sidebarHeader}>
                                <div style={styles.navLogo} onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }}>
                                    <div style={styles.navIcon}><Bot size={22} color="white" /></div>
                                    <h2 style={styles.platformName}>AI <span style={{ color: 'var(--primary)' }}>Studio</span></h2>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} style={styles.closeBtn}>
                                    <X size={24} color="var(--text-sub)" />
                                </button>
                            </div>
                            
                            <div style={styles.sidebarNav}>
                                {(location.pathname !== '/dashboard' || location.search !== '') && (
                                    <motion.button 
                                        whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.1)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { navigate(-1); setIsSidebarOpen(false); }}
                                        style={styles.goBackBtn}
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Go Back</span>
                                    </motion.button>
                                )}
                                <NavItem to="/dashboard" icon={LayoutIcon} label="Home" />
                                <NavItem to="/classes" icon={Film} label="Classes & Live" />
                                <NavItem to="/dashboard?view=academic" icon={Award} label="Academic Lab" />
                                <NavItem to="/dashboard?view=skills" icon={MessageSquare} label="Skills Hub" />
                                <NavItem to="/learning-hub" icon={BookOpen} label="Learning Hub" />
                                <NavItem to="/career-intelligence" icon={Briefcase} label="Jobs Hub" />
                                <NavItem to="/code-studio" icon={Code} label="Code Editor" />
                                <NavItem to="/peer-interview" icon={Users} label="Peer to Peer" />
                                <NavItem to="/resume" icon={FileText} label="Resume AI" />
                                <NavItem to="/performance" icon={BarChart} label="Performance" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main style={styles.mainContent}>
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={styles.pageContainer}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            
            {/* Hide chatbot during proctored assessments */}
            {['/dashboard', '/code-studio', '/live-code'].includes(location.pathname) && <ChatMentor />}
        </div>
    );
};

const styles = {
    appShell: { width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: {
        height: 'var(--nav-height)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 2rem', position: 'fixed',
        top: 0, left: 0, right: 0, zIndex: 1000, background: 'transparent',
        transition: 'all 0.3s ease'
    },
    headerScrolled: {
        background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)'
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
    hamburgerBtn: { 
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
        padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', 
        alignItems: 'center', justifyContent: 'center' 
    },
    navLogo: { display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' },
    navIcon: {
        width: 44, height: 44, borderRadius: 14,
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 20px -5px var(--primary-glow)'
    },
    platformName: { fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' },
    
    // Sidebar Styles
    sidebarOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000
    },
    sidebar: {
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '320px',
        background: '#0a0f1c', borderRight: '1px solid var(--glass-border)',
        zIndex: 2001, display: 'flex', flexDirection: 'column', boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
    },
    sidebarHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)'
    },
    closeBtn: {
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s'
    },
    sidebarNav: {
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
        overflowY: 'auto'
    },
    sidebarNavItem: {
        display: 'flex', alignItems: 'center', padding: '1rem 1.2rem',
        borderRadius: '12px', cursor: 'pointer', position: 'relative',
        transition: 'all 0.2s ease', background: 'transparent'
    },
    sidebarNavItemActive: {
        background: 'rgba(255,255,255,0.05)'
    },
    sidebarNavPill: {
        position: 'absolute', left: 0, top: '15%', bottom: '15%', width: '4px',
        background: 'var(--primary)', borderRadius: '0 4px 4px 0',
        boxShadow: '0 0 10px var(--primary)'
    },
    goBackBtn: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
        color: 'white', padding: '1rem 1.2rem', borderRadius: '12px',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem'
    },

    headerRight: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
    searchBar: {
        background: 'rgba(255,255,255,0.05)', borderRadius: 14,
        display: 'flex', alignItems: 'center', padding: '0 1rem',
        gap: '0.5rem', border: '1px solid var(--glass-border)', width: 280
    },
    searchInput: {
        background: 'transparent', border: 'none', color: 'white', padding: '0.8rem 0',
        fontSize: '0.85rem', outline: 'none', width: '100%'
    },
    iconBtn: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
        width: 44, height: 44, borderRadius: 14, color: 'var(--text-sub)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    userProfile: {
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.5rem 0.4rem 1.2rem',
        borderRadius: 16, border: '1px solid var(--glass-border)',
        cursor: 'pointer', transition: 'all 0.2s'
    },
    avatar: {
        width: 32, height: 32, borderRadius: 10,
        background: 'var(--primary)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.9rem'
    },
    userDetails: { display: 'flex', flexDirection: 'column' },
    userName: { fontSize: '0.85rem', fontWeight: 700, color: 'white' },
    userStatus: { fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 600 },
    logoutBtn: {
        padding: '0.5rem', background: 'transparent', border: 'none',
        color: 'var(--danger)', cursor: 'pointer', opacity: 0.7
    },
    mainContent: {
        paddingTop: 'calc(var(--nav-height) + 1.5rem)',
        flex: 1, display: 'flex', flexDirection: 'column'
    },
    pageContainer: {
        maxWidth: '1280px', margin: '0 auto', width: '95%',
        flex: 1, display: 'flex', flexDirection: 'column'
    }
};

export default Layout;

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, FileCheck, BrainCircuit, Activity, Settings, LogOut, Bell, FileText, Search, Edit, Trash2, TrendingUp, AlertCircle, Sparkles, ChevronRight, BarChart2, LayoutDashboard, Mic, Layers, Trophy, FileBadge, Menu, RefreshCw, ChevronDown, Cpu, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle, Info, UserPlus, Award, Clock, Film, Radio, Video, Upload, Play, Send, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminTheme, AdminCard, AdminBadge, AdminButton, AIGradientText, AIInsightPanel } from '../components/AdminDesignSystem';
import { adminService } from '../services/adminService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dashboardRef = useRef(null);
    const [adminUser, setAdminUser] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Data States
    const [stats, setStats] = useState({ totalStudents: 0, pendingRegistrations: 0, interviewsCompleted: 0, certificatesIssued: 0 });
    const [students, setStudents] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [popularDomains, setPopularDomains] = useState([]);
    const [skillGaps, setSkillGaps] = useState([]);
    const [topImprovers, setTopImprovers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [placementReadiness, setPlacementReadiness] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingRegistrationsList, setPendingRegistrationsList] = useState([]);
    const [pendingCertificatesList, setPendingCertificatesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentFilter, setStudentFilter] = useState('All');
    const [studentPage, setStudentPage] = useState(1);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(() => {
        const saved = sessionStorage.getItem('adminNavOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [showAdminProfile, setShowAdminProfile] = useState(false);
    const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);

    // Video & Live Studio States
    const [videoForm, setVideoForm] = useState({
        title: '', domain: 'Core Java', description: '', videoUrl: '', thumbnailUrl: '', quality: '1080p Full HD'
    });
    const [uploadSourceType, setUploadSourceType] = useState('file'); // 'file' or 'url'
    const [selectedVideoFile, setSelectedVideoFile] = useState(null);
    const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
    const [adminVideos, setAdminVideos] = useState([]);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    
    // Live Stream States
    const [isLiveStreaming, setIsLiveStreaming] = useState(false);
    const [liveForm, setLiveForm] = useState({
        title: 'Live System Architecture & Mock Review',
        domain: 'Full Stack Engineering',
        description: 'Interactive live code breakdown and student Q&A.'
    });
    const [liveViewerCount, setLiveViewerCount] = useState(1);
    const [adminChatMessages, setAdminChatMessages] = useState([]);
    const [adminChatInput, setAdminChatInput] = useState('');

    const fetchAdminVideos = async () => {
        try {
            const res = await fetch('/api/videos');
            const data = await res.json();
            if (data.videos) setAdminVideos(data.videos);
        } catch(e) {}
    };

    const fetchActiveLive = async () => {
        try {
            const res = await fetch('/api/live-sessions/active');
            const data = await res.json();
            if (data.activeLive) {
                setIsLiveStreaming(true);
                setLiveForm({
                    title: data.activeLive.title,
                    domain: data.activeLive.domain,
                    description: data.activeLive.description
                });
            }
        } catch(e) {}
    };

    useEffect(() => {
        fetchAdminVideos();
        fetchActiveLive();
    }, []);

    const handleUploadVideo = async (e) => {
        e.preventDefault();
        if (!videoForm.title) {
            return alert("Video Title is required.");
        }
        if (uploadSourceType === 'file' && !selectedVideoFile) {
            return alert("Please select a video file from your device.");
        }
        if (uploadSourceType === 'url' && !videoForm.videoUrl) {
            return alert("Please enter a valid Video Link / URL.");
        }

        setUploadingVideo(true);
        try {
            const formData = new FormData();
            formData.append('title', videoForm.title);
            formData.append('domain', videoForm.domain);
            formData.append('description', videoForm.description);
            formData.append('quality', videoForm.quality);

            if (uploadSourceType === 'file' && selectedVideoFile) {
                formData.append('videoFile', selectedVideoFile);
            } else {
                formData.append('videoUrl', videoForm.videoUrl);
            }

            if (selectedThumbnailFile) {
                formData.append('thumbnailFile', selectedThumbnailFile);
            } else {
                formData.append('thumbnailUrl', videoForm.thumbnailUrl);
            }

            const res = await fetch('/api/admin/upload-video-file', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                alert("🎉 High-Quality Video Uploaded Successfully! All students have been notified on the website and sent email alerts.");
                setVideoForm({ title: '', domain: 'Core Java', description: '', videoUrl: '', thumbnailUrl: '', quality: '1080p Full HD' });
                setSelectedVideoFile(null);
                setSelectedThumbnailFile(null);
                fetchAdminVideos();
            } else {
                alert(data.error || "Failed to upload video");
            }
        } catch(err) {
            alert("Error connecting to server");
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm("Permanently delete this video lecture?")) return;
        try {
            const res = await fetch(`/api/admin/delete-video/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAdminVideos(prev => prev.filter(v => v.id !== id));
            }
        } catch(e) {}
    };

    const handleStartLiveStream = async (e) => {
        e.preventDefault();
        if (!liveForm.title) return alert("Stream title required");
        try {
            const res = await fetch('/api/admin/start-live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(liveForm)
            });
            const data = await res.json();
            if (res.ok) {
                setIsLiveStreaming(true);
                alert("🔴 LIVE STREAM STARTED! Real-time alerts and email notifications sent to all students.");
            }
        } catch(e) {
            alert("Error starting live stream");
        }
    };

    const handleEndLiveStream = async () => {
        if (!window.confirm("End active live session?")) return;
        try {
            const res = await fetch('/api/admin/end-live', { method: 'POST' });
            if (res.ok) {
                setIsLiveStreaming(false);
                alert("Live stream ended gracefully.");
            }
        } catch(e) {}
    };

    useEffect(() => {
        sessionStorage.setItem('adminNavOpen', JSON.stringify(isNavOpen));
    }, [isNavOpen]);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
        } else {
            setAdminUser(localStorage.getItem('admin_username') || 'Admin');
            fetchDashboardData();
        }
    }, [navigate]);

    // GSAP Boot-up Animation
    useEffect(() => {
        if (activeTab === 'dashboard' && !loading && dashboardRef.current) {
            let ctx = gsap.context(() => {
                const tl = gsap.timeline();
                
                // Sidebar & Topbar
                gsap.fromTo('.sidebar-anim', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
                gsap.fromTo('.topbar-anim', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });

                // Dashboard Elements
                tl.fromTo('.ai-insight-panel', 
                    { opacity: 0, y: -20, scale: 0.98 }, 
                    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
                )
                .fromTo('.stat-card-anim', 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
                    "-=0.2"
                )
                .fromTo('.content-card-anim', 
                    { opacity: 0, y: 30 }, 
                    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
                    "-=0.3"
                );

                // Progress Bars Animation
                gsap.utils.toArray('.progress-bar-anim').forEach(el => {
                    gsap.fromTo(el, 
                        { width: '0%' }, 
                        { width: el.dataset.width, duration: 1, ease: 'power3.out', delay: 0.6 }
                    );
                });

                // Circular Readiness Chart Animation
                if (document.querySelector('.circular-chart-anim')) {
                    gsap.fromTo('.circular-chart-anim',
                        { rotate: -90, scale: 0.8, opacity: 0 },
                        { rotate: 0, scale: 1, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
                    );
                }
                
                // List Items (Alerts, Activity, Top Improvers)
                if (document.querySelectorAll('.list-item-anim').length > 0) {
                    gsap.fromTo('.list-item-anim',
                        { opacity: 0, x: -10 },
                        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, delay: 0.7, ease: 'power2.out' }
                    );
                }

                // Chart Reveal Animation
                if (document.querySelector('.chart-reveal-anim')) {
                    gsap.fromTo('.chart-reveal-anim',
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: 'power3.out' }
                    );
                }
            }, dashboardRef);

            return () => ctx.revert();
        }
    }, [activeTab, loading]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                overview, studentsData, pendingRegData, pendingCertData, performance, domainsRes, gapsRes, topRes, alertsRes, readinessRes, activityRes
            ] = await Promise.all([
                adminService.getOverview(),
                adminService.getStudents(),
                adminService.getPendingRegistrations(),
                adminService.getPendingCertificates(),
                adminService.getPerformance(),
                adminService.getDomains(),
                adminService.getSkillGaps(),
                adminService.getTopImprovers(),
                adminService.getAlerts(),
                adminService.getReadiness(),
                adminService.getActivity()
            ]);
            
            setStats(overview || { totalStudents: 0, pendingRegistrations: 0, interviewsCompleted: 0, certificatesIssued: 0 });
            setStudents(studentsData || []);
            setPendingRegistrationsList(pendingRegData || []);
            setPendingCertificatesList(pendingCertData || []);
            setTrendData(performance?.trendData || []);
            setPopularDomains(domainsRes?.domains || []);
            setSkillGaps(gapsRes?.skillGaps || []);
            setTopImprovers(topRes?.topImprovers || []);
            setAlerts(alertsRes?.alerts || []);
            setPlacementReadiness(readinessRes?.readiness || null);
            setRecentActivity(activityRes?.recentActivity || []);
        } catch (err) {
            if (err.message === 'Unauthorized') {
                handleLogout(); // Token expired or invalid
                return;
            }
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        // We do NOT remove admin_jwt or admin_otp_time here, 
        // allowing the 30-minute session bypass to function on the login page.
        navigate('/admin/login');
    };

    const uniqueUniversities = ['All', ...new Set(students.map(s => s.university).filter(Boolean))];
    
    const filteredStudents = students.filter(s => {
        const matchesSearch = (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase())) || 
                              (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (s.firstName && s.firstName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = studentFilter === 'All' || s.university === studentFilter;
        return matchesSearch && matchesFilter;
    });

    const studentsPerPage = 10;
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
    const paginatedStudents = filteredStudents.slice((studentPage - 1) * studentsPerPage, studentPage * studentsPerPage);

    return (
        <div style={styles.container}>
            <GlobalStyles />
            {/* SIDEBAR OVERLAY FOR MOBILE */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

            {/* SIDEBAR */}
            <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''} ${!isNavOpen ? 'compact' : ''}`} style={{...styles.sidebar, width: isNavOpen ? '280px' : '88px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'}}>
                <div style={styles.sidebarHeader}>
                    <div style={{...styles.brandBadge, padding: '5px'}}>
                        <Sparkles size={20} color="#fff" />
                    </div>
                    <div className="compact-hide" style={{ overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 0.2s, width 0.3s' }}>
                        <div style={styles.brandTitle}>AI INTERVIEW STUDIO</div>
                        <div style={styles.brandSub}>Admin Command Center</div>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div 
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '1.2rem 1.5rem', cursor: 'pointer', 
                            color: AdminTheme.colors.textMuted, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' 
                        }}
                    >
                        <span className="compact-hide" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            NAVIGATION
                        </span>
                        <motion.div animate={{ rotate: isNavOpen ? 180 : -90 }} transition={{ duration: 0.3 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isNavOpen ? 'auto' : '100%' }}>
                            <ChevronDown size={14} />
                        </motion.div>
                    </div>

                    <AnimatePresence initial={false}>
                        {isNavOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}
                            >
                                <div style={{...styles.navMenu, overflowY: 'auto', flex: 1, padding: '0 1rem 1.5rem 1rem'}}>
                                    <div 
                                        className="sidebar-anim"
                                        style={{...styles.navItem, ...(activeTab === 'dashboard' ? styles.navItemActive : {})}}
                                        onClick={() => setActiveTab('dashboard')}
                                    >
                                        <LayoutDashboard size={18} /> Command Center
                                    </div>
                                    <div 
                                        className="sidebar-anim"
                                        style={{...styles.navItem, ...(activeTab === 'students' ? styles.navItemActive : {})}}
                                        onClick={() => setActiveTab('students')}
                                    >
                                        <Users size={18} /> Students
                                    </div>
                                    <div 
                                        className="sidebar-anim"
                                        style={{...styles.navItem, ...(activeTab === 'Pending Registrations' ? styles.navItemActive : {})}}
                                        onClick={() => setActiveTab('Pending Registrations')}
                                    >
                                        <UserPlus size={18} /> Pending Registrations
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'Interview Intelligence' ? styles.navItemActive : {})}} onClick={() => setActiveTab('Interview Intelligence')}>
                                        <Mic size={18} /> Interview Intelligence
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'Performance Analytics' ? styles.navItemActive : {})}} onClick={() => setActiveTab('Performance Analytics')}>
                                        <BarChart2 size={18} /> Performance Analytics
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'Skill Intelligence' ? styles.navItemActive : {})}} onClick={() => setActiveTab('Skill Intelligence')}>
                                        <BrainCircuit size={18} /> Skill Intelligence
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'AI Insights' ? styles.navItemActive : {})}} onClick={() => setActiveTab('AI Insights')}>
                                        <Sparkles size={18} /> AI Insights
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'Interview Domains' ? styles.navItemActive : {})}} onClick={() => setActiveTab('Interview Domains')}>
                                        <Layers size={18} /> Interview Domains
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'Achievements' ? styles.navItemActive : {})}} onClick={() => setActiveTab('Achievements')}>
                                        <Trophy size={18} /> Achievements
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'VideoStudio' ? styles.navItemActive : {})}} onClick={() => setActiveTab('VideoStudio')}>
                                        <Film size={18} /> Video & Live Studio
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'certificates' ? styles.navItemActive : {})}} onClick={() => setActiveTab('certificates')}>
                                        <FileBadge size={18} /> Certificates
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, justifyContent: 'space-between', ...(activeTab === 'Alerts' ? styles.navItemActive : {})}} onClick={() => setActiveTab('Alerts')}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><Bell size={18} /> Alerts</div>
                                        <AdminBadge type="danger" style={{padding: '2px 8px'}}>12</AdminBadge>
                                    </div>
                                    <div className="sidebar-anim" style={{...styles.navItem, ...(activeTab === 'System Settings' ? styles.navItemActive : {})}} onClick={() => setActiveTab('System Settings')}>
                                        <Settings size={18} /> System Settings
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!isNavOpen && <div style={{ flex: 1 }} />}
                </div>

                <div style={{ padding: '1.5rem', borderTop: `1px solid ${AdminTheme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isNavOpen ? 'flex-start' : 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: `1px solid ${AdminTheme.colors.border}`, position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: AdminTheme.colors.success }} />
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: AdminTheme.colors.success, position: 'absolute', boxShadow: `0 0 10px ${AdminTheme.colors.success}` }} />
                            <div className="status-ping" style={{ width: '100%', height: '100%', borderRadius: '50%', background: AdminTheme.colors.success, position: 'absolute', opacity: 0.5 }} />
                        </div>
                        <div className="compact-hide" style={{ marginLeft: '5px', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 0.2s, width 0.3s' }}>
                            <div style={{ color: AdminTheme.colors.success, fontSize: '0.85rem', fontWeight: 600 }}>AI System Online</div>
                            <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.7rem' }}>All services operational</div>
                        </div>
                    </div>
                    <div style={{...styles.sidebarFooter, padding: '0', borderTop: 'none', justifyContent: isNavOpen ? 'flex-start' : 'center'}} onClick={handleLogout} className="icon-btn-hover" title="Secure Logout">
                        <LogOut size={18} /> <span className="compact-hide" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>Secure Logout</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={styles.mainContent} className="main-content-area">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: `1px solid ${AdminTheme.colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} className="topbar-anim">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={styles.iconBtn} onClick={() => setIsSidebarOpen(true)} className="mobile-menu-btn icon-btn-hover"><Menu size={20} /></div>
                    </div>
                    <div style={styles.topbarRight}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginRight: '5px' }} className="topbar-right-info">
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: AdminTheme.colors.success, position: 'absolute', boxShadow: `0 0 10px ${AdminTheme.colors.success}` }} />
                                <div className="status-ping" style={{ width: '100%', height: '100%', borderRadius: '50%', background: AdminTheme.colors.success, position: 'absolute', opacity: 0.5 }} />
                            </div>
                            <span style={{ fontWeight: 500 }}>Last synced: Just now</span>
                        </div>
                        
                        <div className="topbar-right-info" style={{ width: '1px', height: '24px', background: AdminTheme.colors.border, margin: '0 5px' }} />
                        
                        <div style={styles.iconBtn} className="icon-btn-hover" onClick={fetchDashboardData} title="Refresh Dashboard"><RefreshCw size={18} /></div>
                        
                        <div onClick={() => setActiveTab('Alerts')} style={{ ...styles.iconBtn, position: 'relative' }} className="icon-btn-hover">
                            <Bell size={18} />
                            <div style={{ position: 'absolute', top: '0px', right: '0px', width: '8px', height: '8px', borderRadius: '50%', background: AdminTheme.colors.danger, border: `2px solid ${AdminTheme.colors.panel}` }} />
                        </div>
                        
                        <div style={{ width: '1px', height: '24px', background: AdminTheme.colors.border, margin: '0 5px' }} />
                        
                            <div 
                                onClick={() => setShowAdminProfile(!showAdminProfile)}
                                title="Admin Profile"
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '6px 15px 6px 6px', borderRadius: '30px', border: `1px solid ${AdminTheme.colors.border}`, cursor: 'pointer', transition: 'all 0.2s' }}
                                className="icon-btn-hover"
                            >
                                <div style={styles.avatar}>{adminUser ? adminUser.substring(0, 2).toUpperCase() : 'AD'}</div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: AdminTheme.colors.textMain, lineHeight: '1.2' }}>{adminUser || 'Admin'}</span>
                                    <span style={{ fontSize: '0.7rem', color: AdminTheme.colors.accentCyan, fontWeight: 500 }}>Super Admin</span>
                                </div>
                                <ChevronDown size={14} style={{ color: AdminTheme.colors.textMuted, marginLeft: '5px' }} />
                            </div>
                    </div>
                </div>

                <div className="topbar-anim" style={{ marginBottom: '2.5rem' }}>
                    <h1 style={styles.pageTitle}>
                        {activeTab === 'dashboard' ? `Good afternoon, ${adminUser || 'Admin'}! 👋` : activeTab}
                    </h1>
                    <p style={{ color: AdminTheme.colors.textMuted, marginTop: '5px', fontSize: '0.95rem' }}>
                        {activeTab === 'dashboard' 
                            ? "Here's what is happening across your interview ecosystem today."
                            : "Manage and oversee the selected system module below."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{display:'flex', justifyContent:'center', padding:'5rem'}}>
                            <div className="spinner" style={{width:'40px', height:'40px', borderTopColor:'#ef4444'}}></div>
                        </motion.div>
                    ) : (
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            
                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && (
                                <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    
                                    <div className="ai-insight-panel">
                                        <AIInsightPanel 
                                            title={stats.aiInsight?.title || "AI Platform Insight"}
                                            mainText={
                                                <>
                                                    <AIGradientText>{stats.aiInsight?.highlightText || "Java Full Stack"}</AIGradientText> 
                                                    {stats.aiInsight?.mainTextSuffix || " candidates are showing the highest improvement this week."}
                                                </>
                                            }
                                            subText={stats.aiInsight?.subText || "Average performance increased 18.6% after adaptive interview practice across all domains."}
                                            buttonText="Detailed AI Analysis"
                                            onButtonClick={() => setShowAIAnalysisModal(true)}
                                        />
                                    </div>

                                    <div className="stats-grid-override" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.2rem' }}>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Active Students</div>
                                            <div style={styles.statValue}>{stats.totalStudents ?? 248}</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14}/> 12.4% this month</div>
                                        </AdminCard>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Interviews Completed</div>
                                            <div style={styles.statValue}>{stats.interviewsCompleted ?? 1426}</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14}/> 18.7% this month</div>
                                        </AdminCard>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>AI Evaluations</div>
                                            <div style={styles.statValue}>{stats.interviewsCompleted ?? 1426}</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14}/> 18.7% this month</div>
                                        </AdminCard>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Avg. Improvement</div>
                                            <div style={styles.statValue}>24.8%</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14}/> 6.3% this month</div>
                                        </AdminCard>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Certificates Issued</div>
                                            <div style={styles.statValue}>{stats.certificatesIssued ?? 186}</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14}/> 15.2% this month</div>
                                        </AdminCard>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {/* Row 1 */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                            <AdminCard className="content-card-anim" style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <div>
                                                        <h3 style={styles.cardTitle}>Student Performance Trend</h3>
                                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.85rem' }}>Performance Score over Last 4 Weeks</p>
                                                    </div>
                                                    <select style={{ background: AdminTheme.colors.bgMain, color: AdminTheme.colors.textMain, border: `1px solid ${AdminTheme.colors.border}`, padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}>
                                                        <option>Last 4 Weeks</option>
                                                        <option>Last 3 Months</option>
                                                        <option>All Time</option>
                                                    </select>
                                                </div>
                                                <div className="chart-reveal-anim" style={{ height: '300px', width: '100%', position: 'relative', zIndex: 1 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke={AdminTheme.colors.border} vertical={false} />
                                                            <XAxis dataKey="name" stroke={AdminTheme.colors.textMuted} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                                            <YAxis stroke={AdminTheme.colors.textMuted} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                            <Tooltip 
                                                                contentStyle={{ backgroundColor: 'rgba(13, 17, 33, 0.95)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '12px', boxShadow: AdminTheme.shadows.panel, backdropFilter: 'blur(10px)' }}
                                                                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                                                                labelStyle={{ color: AdminTheme.colors.textMuted, marginBottom: '5px' }}
                                                            />
                                                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} iconType="circle" />
                                                            <Line type="monotone" dataKey="technical" name="Technical" stroke={AdminTheme.colors.accentPurple} strokeWidth={3} dot={{ r: 4, fill: AdminTheme.colors.accentPurple, strokeWidth: 2, stroke: AdminTheme.colors.bgPanel }} activeDot={{ r: 6, strokeWidth: 0, fill: AdminTheme.colors.accentPurple, filter: `drop-shadow(0 0 8px ${AdminTheme.colors.accentPurple})` }} />
                                                            <Line type="monotone" dataKey="communication" name="Communication" stroke={AdminTheme.colors.accentCyan} strokeWidth={3} dot={{ r: 4, fill: AdminTheme.colors.accentCyan, strokeWidth: 2, stroke: AdminTheme.colors.bgPanel }} activeDot={{ r: 6, strokeWidth: 0, fill: AdminTheme.colors.accentCyan, filter: `drop-shadow(0 0 8px ${AdminTheme.colors.accentCyan})` }} />
                                                            <Line type="monotone" dataKey="problemSolving" name="Problem Solving" stroke={AdminTheme.colors.success} strokeWidth={3} dot={{ r: 4, fill: AdminTheme.colors.success, strokeWidth: 2, stroke: AdminTheme.colors.bgPanel }} activeDot={{ r: 6, strokeWidth: 0, fill: AdminTheme.colors.success, filter: `drop-shadow(0 0 8px ${AdminTheme.colors.success})` }} />
                                                            <Line type="monotone" dataKey="Confidence" stroke={AdminTheme.colors.warning} strokeWidth={3} dot={{ r: 4, fill: AdminTheme.colors.warning, strokeWidth: 2, stroke: AdminTheme.colors.bgPanel }} activeDot={{ r: 6, strokeWidth: 0, fill: AdminTheme.colors.warning, filter: `drop-shadow(0 0 8px ${AdminTheme.colors.warning})` }} />
                                                            <Line type="monotone" dataKey="DomainKnowledge" name="Domain Knowledge" stroke="#EC4899" strokeWidth={3} dot={{ r: 4, fill: "#EC4899", strokeWidth: 2, stroke: AdminTheme.colors.bgPanel }} activeDot={{ r: 6, strokeWidth: 0, fill: "#EC4899", filter: `drop-shadow(0 0 8px #EC4899)` }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </AdminCard>
                                            
                                            <AdminCard className="content-card-anim" style={{ flex: '1 1 300px' }}>
                                                <h3 style={styles.cardTitle}>Popular Interview Domains</h3>
                                                <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.75rem', marginBottom: '1.2rem' }}>By active students</p>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    {popularDomains.map((domain, index) => {
                                                        const IconMap = { Layers, BarChart2, ShieldCheck, Sparkles, Cpu, BrainCircuit };
                                                        const IconComp = IconMap[domain.icon] || BrainCircuit;
                                                        return (
                                                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <div style={{ padding: '6px', borderRadius: '6px', background: `${domain.color}20`, color: domain.color }}>
                                                                            <IconComp size={14} />
                                                                        </div>
                                                                        <span style={{ fontSize: '0.85rem', color: AdminTheme.colors.textMain }}>{domain.name}</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                                        <span style={{ color: AdminTheme.colors.textMain, fontWeight: 'bold' }}>{domain.count}</span>
                                                                        <span style={{ color: AdminTheme.colors.textMuted }}>—</span>
                                                                        <span style={{ color: domain.color, fontWeight: 'bold' }}>{domain.percentage}%</span>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: '100%', height: '6px', background: AdminTheme.colors.border, borderRadius: '4px', overflow: 'hidden' }}>
                                                                    <div 
                                                                        className="progress-bar-anim"
                                                                        data-width={`${domain.percent || 10}%`}
                                                                        style={{ height: '100%', background: domain.color || AdminTheme.colors.accentCyan, borderRadius: '4px', boxShadow: `0 0 10px ${domain.color || AdminTheme.colors.accentCyan}80`, width: `${domain.percent || 10}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                                    <span onClick={() => setActiveTab('Interview Domains')} style={{ color: AdminTheme.colors.accentCyan, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'text-shadow 0.2s' }} onMouseEnter={(e) => e.target.style.textShadow = AdminTheme.shadows.glowCyan} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
                                                        View All Domains <ArrowRight size={14} />
                                                    </span>
                                                </div>
                                            </AdminCard>
                                        </div>

                                        {/* Row 2 */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                            <AdminCard className="content-card-anim" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <h3 style={styles.cardTitle}>AI Detected Skill Gaps</h3>
                                                <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.75rem', marginBottom: '1.2rem' }}>Skills that need more attention</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                                                    {skillGaps.map((skill, index) => (
                                                        <div key={index}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                                                                <span style={{ color: AdminTheme.colors.textMain }}>{skill.skill || skill.name}</span> 
                                                                <span style={{ color: AdminTheme.colors.textMuted, fontWeight: 500 }}>{skill.count || 0} students</span>
                                                            </div>
                                                            <div style={{ width: '100%', height: '5px', background: AdminTheme.colors.border, borderRadius: '4px', overflow: 'hidden' }}>
                                                                <div 
                                                                    className="progress-bar-anim"
                                                                    data-width={`${(skill.count / skill.max) * 100}%`}
                                                                    style={{ height: '100%', background: AdminTheme.colors.accentCyan, borderRadius: '4px', boxShadow: `0 0 10px ${AdminTheme.colors.accentCyan}90`, width: `${(skill.count / skill.max) * 100}%` }} 
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                                    <span onClick={() => setActiveTab('Skill Intelligence')} style={{ color: AdminTheme.colors.accentPurple, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'text-shadow 0.2s' }} onMouseEnter={(e) => e.target.style.textShadow = AdminTheme.shadows.glowPurple} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
                                                        View Detailed Report <ArrowRight size={14} />
                                                    </span>
                                                </div>
                                            </AdminCard>

                                            <AdminCard className="content-card-anim" style={{ flex: '1 1 400px' }}>
                                                <h3 style={styles.cardTitle}>Placement Readiness Score</h3>
                                                {placementReadiness ? (
                                                    <>
                                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '2.5rem 0' }}>
                                                        <div 
                                                            className="circular-chart-anim"
                                                            style={{ width: '150px', height: '150px', borderRadius: '50%', border: `12px solid ${AdminTheme.colors.border}`, borderTopColor: AdminTheme.colors.accentPurple, borderRightColor: AdminTheme.colors.accentCyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
                                                        >
                                                            <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: AdminTheme.colors.textMain }}>{placementReadiness.score}%</span>
                                                            <span style={{ fontSize: '0.7rem', color: AdminTheme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Ready</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: AdminTheme.colors.success, fontSize: '0.85rem', fontWeight: 500 }}>
                                                        ↑ {placementReadiness.trend} from last month
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                            <span style={{ color: AdminTheme.colors.textMuted }}>Ready</span> <span style={{ color: AdminTheme.colors.success, fontWeight: 'bold' }}>{placementReadiness.ready}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                            <span style={{ color: AdminTheme.colors.textMuted }}>Needs Improvement</span> <span style={{ color: AdminTheme.colors.warning, fontWeight: 'bold' }}>{placementReadiness.needsImprovement}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                            <span style={{ color: AdminTheme.colors.textMuted }}>High Priority</span> <span style={{ color: AdminTheme.colors.danger, fontWeight: 'bold' }}>{placementReadiness.highPriority}</span>
                                                        </div>
                                                    </div>
                                                    </>
                                                ) : <div style={{color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2rem'}}>Loading score...</div>}
                                            </AdminCard>
                                        </div>

                                        {/* Row 3 */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                            <AdminCard className="content-card-anim" style={{ flex: '1 1 300px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div>
                                                        <h3 style={styles.cardTitle}>Top Improvers</h3>
                                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.75rem' }}>Students with highest improvement</p>
                                                    </div>
                                                    <span onClick={() => setActiveTab('Performance Analytics')} style={{ color: AdminTheme.colors.accentPurple, fontSize: '0.8rem', cursor: 'pointer' }}>View All</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    {topImprovers.map((student, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: student.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                                    {student.initial}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.85rem', color: AdminTheme.colors.textMain, fontWeight: 500 }}>{student.name}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: AdminTheme.colors.textMuted }}>{student.domain}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ color: AdminTheme.colors.success, fontSize: '0.85rem', fontWeight: 600 }}>+{student.improvement}%</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AdminCard>

                                            <AdminCard className="content-card-anim" style={{ flex: '1 1 300px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                                    <div>
                                                        <h3 style={styles.cardTitle}>AI Alerts</h3>
                                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.75rem' }}>Critical alerts and notifications</p>
                                                    </div>
                                                    <span onClick={() => setActiveTab('Alerts')} style={{ color: AdminTheme.colors.accentCyan, fontSize: '0.8rem', cursor: 'pointer' }}>View All</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {alerts.map((alert, i) => {
                                                        let iconColor = AdminTheme.colors.textMain;
                                                        let Icon = Info;
                                                        if (alert.type === 'critical') { iconColor = AdminTheme.colors.danger; Icon = AlertCircle; }
                                                        if (alert.type === 'warning') { iconColor = AdminTheme.colors.warning; Icon = AlertTriangle; }
                                                        if (alert.type === 'success') { iconColor = AdminTheme.colors.success; Icon = CheckCircle; }
                                                        if (alert.type === 'info') { iconColor = AdminTheme.colors.accentCyan; Icon = Info; }
                                                        
                                                        return (
                                                            <div key={i} className="list-item-anim" style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${iconColor}` }}>
                                                                <div style={{ color: iconColor, marginTop: '2px' }}><Icon size={16} /></div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.textMain, lineHeight: '1.4' }}>{alert.message}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: AdminTheme.colors.textMuted, marginTop: '4px' }}>{alert.time}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </AdminCard>

                                            <AdminCard className="content-card-anim" style={{ flex: '1 1 300px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                                    <div>
                                                        <h3 style={styles.cardTitle}>Recent Activity</h3>
                                                    </div>
                                                    <span onClick={() => alert('Loading complete activity logs...')} style={{ color: AdminTheme.colors.accentCyan, fontSize: '0.8rem', cursor: 'pointer' }}>View All</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {recentActivity.map((activity, i) => {
                                                        const IconMap = { UserPlus, FileCheck, Award, Layers };
                                                        const Icon = IconMap[activity.icon] || Info;
                                                        
                                                        return (
                                                            <div 
                                                                key={i} 
                                                                className="list-item-anim"
                                                                style={{ display: 'flex', gap: '12px', position: 'relative' }}
                                                            >
                                                                <div style={{ position: 'absolute', left: '15px', top: '30px', bottom: '-16px', width: '2px', background: AdminTheme.colors.border, zIndex: 0, display: i === recentActivity.length - 1 ? 'none' : 'block' }} />
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${activity.color || AdminTheme.colors.accentCyan}20`, color: activity.color || AdminTheme.colors.accentCyan, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                                                    <Icon size={16} />
                                                                </div>
                                                                <div style={{ flex: 1, paddingBottom: i === recentActivity.length - 1 ? '0' : '8px' }}>
                                                                    <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.textMain, fontWeight: 500 }}>{activity.user}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: AdminTheme.colors.textMuted, marginTop: '2px' }}>{activity.action}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: AdminTheme.colors.textMuted, marginTop: '4px' }}>{new Date(activity.time).toLocaleString()}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </AdminCard>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STUDENTS TAB */}
                            {activeTab === 'students' && (
                                <AdminCard className="content-card-anim" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', flexWrap: 'wrap', gap: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: AdminTheme.colors.textMain }}>All Registered Students</h3>
                                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${AdminTheme.colors.border}`, padding: '10px 15px', borderRadius: '10px', transition: 'all 0.3s' }}>
                                                <Search size={18} style={{color: AdminTheme.colors.accentCyan}} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search name, email, or USN..." 
                                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '220px', fontSize: '0.9rem', color: AdminTheme.colors.textMain }}
                                                    value={searchQuery}
                                                    onChange={(e) => { setSearchQuery(e.target.value); setStudentPage(1); }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${AdminTheme.colors.border}`, padding: '10px 15px', borderRadius: '10px' }}>
                                                <Layers size={18} style={{color: AdminTheme.colors.accentPurple}} />
                                                <select 
                                                    value={studentFilter}
                                                    onChange={(e) => { setStudentFilter(e.target.value); setStudentPage(1); }}
                                                    style={{ border: 'none', background: 'transparent', outline: 'none', color: AdminTheme.colors.textMain, fontSize: '0.9rem', cursor: 'pointer' }}
                                                >
                                                    {uniqueUniversities.map(u => <option key={u} value={u} style={{ background: '#0a0f1c' }}>{u}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>ID</th>
                                                    <th style={styles.th}>Student Name</th>
                                                    <th style={styles.th}>Username / USN</th>
                                                    <th style={styles.th}>Email Address</th>
                                                    <th style={styles.th}>University</th>
                                                    <th style={styles.th}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedStudents.length > 0 ? paginatedStudents.map((student, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <tr style={{ borderBottom: `1px solid ${AdminTheme.colors.border}`, transition: 'background-color 0.2s', background: expandedStudent === student.id ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                                            <td style={styles.td}>
                                                                <span style={{ color: AdminTheme.colors.accentPurple, fontFamily: "'JetBrains Mono', monospace" }}>#{student.id}</span>
                                                            </td>
                                                            <td style={{...styles.td, fontWeight: 600, color: AdminTheme.colors.textMain}}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: AdminTheme.colors.bgMain, border: `1px solid ${AdminTheme.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: AdminTheme.colors.accentCyan, boxShadow: `inset 0 0 10px ${AdminTheme.colors.accentCyan}20` }}>
                                                                        {(student.firstName?.[0] || 'S') + (student.lastName?.[0] || 'T')}
                                                                    </div>
                                                                    {student.firstName} {student.lastName}
                                                                </div>
                                                            </td>
                                                            <td style={{...styles.td, color: AdminTheme.colors.textMuted}}>{student.username}</td>
                                                            <td style={styles.td}>{student.email}</td>
                                                            <td style={styles.td}>{student.university || 'N/A'}</td>
                                                            <td style={styles.td}>
                                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                                    <button onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)} style={{...styles.iconButton, background: expandedStudent === student.id ? `${AdminTheme.colors.accentCyan}20` : 'rgba(255,255,255,0.05)', color: expandedStudent === student.id ? AdminTheme.colors.accentCyan : AdminTheme.colors.textMuted}} title="View Details"><Info size={16}/></button>
                                                                    <button onClick={() => { const newEmail = prompt(`Enter new email for ${student.username || 'Student'}:`, student.email); if(newEmail) alert(`Email updated to ${newEmail}`); }} style={styles.iconButton} title="Edit Student"><Edit size={16}/></button>
                                                                    <button onClick={() => { if(window.confirm(`Delete student ${student.username || 'Student'}?`)) { setStudents(prev => prev.filter(s => s.id !== student.id)); } }} style={{...styles.iconButton, color: AdminTheme.colors.danger, background: `${AdminTheme.colors.danger}10`, border: `1px solid ${AdminTheme.colors.danger}30`}} title="Delete Student"><Trash2 size={16}/></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {expandedStudent === student.id && (
                                                            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                                <td colSpan="6" style={{ padding: '1.5rem', borderBottom: `1px solid ${AdminTheme.colors.border}` }}>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                                                        <div>
                                                                            <h4 style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', margin: 0 }}>Identity & Access</h4>
                                                                            <div style={{ fontSize: '0.9rem', color: AdminTheme.colors.textMain, marginBottom: '5px' }}><strong>Status:</strong> <AdminBadge type="success" style={{marginLeft: '5px'}}>Verified & Active</AdminBadge></div>
                                                                            <div style={{ fontSize: '0.9rem', color: AdminTheme.colors.textMain }}><strong>Account ID:</strong> {student.id}</div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', margin: 0 }}>Academic Info</h4>
                                                                            <div style={{ fontSize: '0.9rem', color: AdminTheme.colors.textMain, marginBottom: '5px' }}><strong>University:</strong> {student.university || 'Not specified'}</div>
                                                                            <div style={{ fontSize: '0.9rem', color: AdminTheme.colors.textMain }}><strong>USN:</strong> {student.username}</div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', margin: 0 }}>System Activity</h4>
                                                                            <div style={{ fontSize: '0.9rem', color: AdminTheme.colors.textMain, marginBottom: '5px' }}><strong>Platform Usage:</strong> Logged via API</div>
                                                                            <div style={{ fontSize: '0.9rem', color: AdminTheme.colors.textMain }}><strong>Contact:</strong> {student.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                )) : (
                                                    <tr><td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '4rem', color: AdminTheme.colors.textMuted}}>No students found matching your criteria.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)' }}>
                                        <div style={{ fontSize: '0.85rem', color: AdminTheme.colors.textMuted }}>
                                            Showing {Math.min((studentPage - 1) * studentsPerPage + 1, filteredStudents.length)} to {Math.min(studentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                                                disabled={studentPage === 1}
                                                style={{ padding: '6px 12px', background: studentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.1)', color: studentPage === 1 ? AdminTheme.colors.textMuted : AdminTheme.colors.textMain, border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '6px', cursor: studentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                            >Prev</button>
                                            <button 
                                                onClick={() => setStudentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={studentPage === totalPages}
                                                style={{ padding: '6px 12px', background: studentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.1)', color: studentPage === totalPages ? AdminTheme.colors.textMuted : AdminTheme.colors.textMain, border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '6px', cursor: studentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                            >Next</button>
                                        </div>
                                    </div>
                                </AdminCard>
                            )}

                            {/* PENDING REGISTRATIONS TAB */}
                            {activeTab === 'Pending Registrations' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <UserPlus size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Pending Registrations
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Approve new student accounts to grant platform access.
                                        </p>
                                    </div>
                                    {pendingRegistrationsList.length === 0 ? (
                                        <AdminCard className="content-card-anim" style={{ padding: '5rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                            <CheckCircle size={40} style={{ color: AdminTheme.colors.accentGreen, opacity: 0.8, marginBottom: '1.5rem' }} />
                                            <h3 style={{ fontSize: '1.4rem', color: AdminTheme.colors.textMain, marginBottom: '10px' }}>All Caught Up</h3>
                                            <p style={{ color: AdminTheme.colors.textMuted }}>There are no pending registrations awaiting approval.</p>
                                        </AdminCard>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                            {pendingRegistrationsList.map(student => (
                                                <AdminCard key={student.id} className="content-card-anim" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: AdminTheme.colors.accentCyan + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: AdminTheme.colors.accentCyan, fontWeight: 700, fontSize: '1.2rem' }}>
                                                            {student.firstName?.charAt(0) || student.username.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>{student.firstName} {student.lastName}</h4>
                                                            <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.85rem' }}>{student.email}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                        <div style={{ color: AdminTheme.colors.textMuted, marginBottom: '4px' }}><strong>University:</strong> {student.university}</div>
                                                        <div style={{ color: AdminTheme.colors.textMuted }}><strong>Username:</strong> {student.username}</div>
                                                    </div>
                                                    <AdminButton onClick={async () => {
                                                        const success = await adminService.approveRegistration(student.id);
                                                        if(success) fetchDashboardData();
                                                    }} style={{ width: '100%', justifyContent: 'center' }}>
                                                        Approve Registration
                                                    </AdminButton>
                                                </AdminCard>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VIDEO & LIVE STUDIO TAB */}
                            {activeTab === 'VideoStudio' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Film size={24} style={{ color: AdminTheme.colors.accentPurple }} /> Video Upload & Live Broadcast Studio
                                            </h3>
                                            <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '6px', margin: 0 }}>
                                                Upload high-definition video lectures, launch live streaming sessions, and broadcast real-time website & email notifications to all students.
                                            </p>
                                        </div>
                                        {isLiveStreaming ? (
                                            <button onClick={handleEndLiveStream} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.8rem 1.6rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
                                                <Radio size={18} className="spinner" /> ⬛ END LIVE STREAM
                                            </button>
                                        ) : (
                                            <button onClick={() => window.scrollTo({top: 200, behavior: 'smooth'})} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', padding: '0.8rem 1.6rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}>
                                                <Radio size={18} /> 🔴 LIVE STUDIO CONTROL
                                            </button>
                                        )}
                                    </div>

                                    {/* 1. START LIVE STREAM CONTROL ROOM CARD */}
                                    <AdminCard style={{ padding: '2rem', border: `1px solid ${isLiveStreaming ? '#ef4444' : AdminTheme.colors.border}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h4 style={{ color: AdminTheme.colors.textMain, fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Radio size={20} color={isLiveStreaming ? "#ef4444" : "var(--text-sub)"} />
                                                Live Broadcast Studio Control Room
                                            </h4>
                                            {isLiveStreaming && (
                                                <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #ef4444', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    🔴 LIVE STREAM ACTIVE NOW
                                                </span>
                                            )}
                                        </div>

                                        <form onSubmit={handleStartLiveStream} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Stream Title *</label>
                                                <input 
                                                    type="text" 
                                                    value={liveForm.title}
                                                    onChange={(e) => setLiveForm({...liveForm, title: e.target.value})}
                                                    placeholder="e.g. Masterclass: System Architecture & Live Code Review"
                                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Course Domain</label>
                                                <select 
                                                    value={liveForm.domain}
                                                    onChange={(e) => setLiveForm({...liveForm, domain: e.target.value})}
                                                    style={{ width: '100%', padding: '0.8rem', background: '#0a0f1d', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                >
                                                    <option value="Full Stack Engineering">Full Stack Engineering</option>
                                                    <option value="Core Java & Spring Boot">Core Java & Spring Boot</option>
                                                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                                                    <option value="Python & AI/ML">Python & AI/ML</option>
                                                    <option value="Cybersecurity">Cybersecurity</option>
                                                </select>
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Stream Description / Announcement</label>
                                                <textarea 
                                                    rows="2"
                                                    value={liveForm.description}
                                                    onChange={(e) => setLiveForm({...liveForm, description: e.target.value})}
                                                    placeholder="Describe what will be covered in this live session..."
                                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                />
                                            </div>
                                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                                                {!isLiveStreaming ? (
                                                    <button type="submit" style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}>
                                                        <Radio size={18} /> Start Live & Notify All Students (Website + Email)
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={handleEndLiveStream} style={{ padding: '0.9rem 2rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        ⬛ End Current Live Stream
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </AdminCard>

                                     {/* 2. HIGH-QUALITY VIDEO UPLOADER CARD */}
                                     <AdminCard style={{ padding: '2rem' }}>
                                         <h4 style={{ color: AdminTheme.colors.textMain, fontSize: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                             <Upload size={20} color={AdminTheme.colors.accentCyan} />
                                             Upload High-Quality Recorded Video Lecture
                                         </h4>

                                         {/* Source Selector Toggle */}
                                         <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                             <button
                                                 type="button"
                                                 onClick={() => setUploadSourceType('file')}
                                                 style={{
                                                     flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
                                                     background: uploadSourceType === 'file' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.03)',
                                                     border: uploadSourceType === 'file' ? '1px solid #0ea5e9' : `1px solid ${AdminTheme.colors.border}`,
                                                     color: uploadSourceType === 'file' ? '#38bdf8' : AdminTheme.colors.textMuted,
                                                     fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                                                 }}
                                             >
                                                 📁 Upload Video File from Device
                                             </button>
                                             <button
                                                 type="button"
                                                 onClick={() => setUploadSourceType('url')}
                                                 style={{
                                                     flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
                                                     background: uploadSourceType === 'url' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                                                     border: uploadSourceType === 'url' ? '1px solid #a855f7' : `1px solid ${AdminTheme.colors.border}`,
                                                     color: uploadSourceType === 'url' ? '#c084fc' : AdminTheme.colors.textMuted,
                                                     fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                                                 }}
                                             >
                                                 🔗 External Video Link / URL
                                             </button>
                                         </div>

                                         <form onSubmit={handleUploadVideo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                             <div>
                                                 <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Video Title *</label>
                                                 <input 
                                                     type="text"
                                                     value={videoForm.title}
                                                     onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                                                     placeholder="e.g. Core Java Multithreading & Concurrency Utilities"
                                                     style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                     required
                                                 />
                                             </div>
                                             <div>
                                                 <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Domain / Course Topic</label>
                                                 <select 
                                                     value={videoForm.domain}
                                                     onChange={(e) => setVideoForm({...videoForm, domain: e.target.value})}
                                                     style={{ width: '100%', padding: '0.8rem', background: '#0a0f1d', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                 >
                                                     <option value="Core Java">Core Java</option>
                                                     <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                                                     <option value="Python & AI">Python & AI</option>
                                                     <option value="Cybersecurity">Cybersecurity</option>
                                                     <option value="Web Development">Web Development</option>
                                                     <option value="System Design">System Design</option>
                                                 </select>
                                             </div>

                                             {/* Video Source Field */}
                                             <div style={{ gridColumn: 'span 2' }}>
                                                 {uploadSourceType === 'file' ? (
                                                     <div>
                                                         <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>
                                                             Select High-Quality Video File from Device (.mp4, .webm, .mov, .mkv max 500MB) *
                                                         </label>
                                                         <div style={{
                                                             padding: '1.5rem', border: '2px dashed rgba(14,165,233,0.4)', borderRadius: '12px',
                                                             background: 'rgba(14,165,233,0.03)', textAlign: 'center', cursor: 'pointer', position: 'relative'
                                                         }}>
                                                             <input 
                                                                 type="file"
                                                                 accept="video/mp4,video/webm,video/ogg,video/quicktime,video/mkv,video/*"
                                                                 onChange={(e) => setSelectedVideoFile(e.target.files[0] || null)}
                                                                 style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                                                             />
                                                             <Film size={32} color="#0ea5e9" style={{ marginBottom: '8px' }} />
                                                             {selectedVideoFile ? (
                                                                 <div>
                                                                     <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1rem' }}>Selected: {selectedVideoFile.name}</div>
                                                                     <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>
                                                                         Size: {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB • Type: {selectedVideoFile.type || 'video/mp4'}
                                                                     </div>
                                                                     <button 
                                                                         type="button" 
                                                                         onClick={(e) => { e.stopPropagation(); setSelectedVideoFile(null); }}
                                                                         style={{ marginTop: '8px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                                     >
                                                                         Change / Remove File
                                                                     </button>
                                                                 </div>
                                                             ) : (
                                                                 <div>
                                                                     <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Click or Drag & Drop Video File Here</div>
                                                                     <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>Supports 1080p and 4K MP4, WebM, MOV video files</div>
                                                                 </div>
                                                             )}
                                                         </div>
                                                     </div>
                                                 ) : (
                                                     <div>
                                                         <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Video URL / Link (YouTube or MP4 Direct URL) *</label>
                                                         <input 
                                                             type="text"
                                                             value={videoForm.videoUrl}
                                                             onChange={(e) => setVideoForm({...videoForm, videoUrl: e.target.value})}
                                                             placeholder="https://www.youtube.com/watch?v=... or https://domain.com/video.mp4"
                                                             style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                         />
                                                     </div>
                                                 )}
                                             </div>

                                             <div>
                                                 <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Video Quality Preset</label>
                                                 <select 
                                                     value={videoForm.quality}
                                                     onChange={(e) => setVideoForm({...videoForm, quality: e.target.value})}
                                                     style={{ width: '100%', padding: '0.8rem', background: '#0a0f1d', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                 >
                                                     <option value="1080p Full HD">1080p Full HD</option>
                                                     <option value="4K Ultra HD">4K Ultra HD</option>
                                                     <option value="720p HD">720p HD</option>
                                                 </select>
                                             </div>

                                             <div>
                                                 <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Thumbnail Image (Upload File or Enter URL)</label>
                                                 <div style={{ display: 'flex', gap: '8px' }}>
                                                     <input 
                                                         type="file"
                                                         accept="image/*"
                                                         id="thumbnailFileInput"
                                                         onChange={(e) => setSelectedThumbnailFile(e.target.files[0] || null)}
                                                         style={{ display: 'none' }}
                                                     />
                                                     <button 
                                                         type="button"
                                                         onClick={() => document.getElementById('thumbnailFileInput').click()}
                                                         style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                     >
                                                         🖼️ {selectedThumbnailFile ? selectedThumbnailFile.name.substring(0, 15) + '...' : 'Upload Image'}
                                                     </button>
                                                     <input 
                                                         type="text"
                                                         value={videoForm.thumbnailUrl}
                                                         onChange={(e) => setVideoForm({...videoForm, thumbnailUrl: e.target.value})}
                                                         placeholder="Or paste image URL (optional)"
                                                         style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                     />
                                                 </div>
                                             </div>

                                             <div style={{ gridColumn: 'span 2' }}>
                                                 <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '6px' }}>Lecture Description</label>
                                                 <textarea 
                                                     rows="2"
                                                     value={videoForm.description}
                                                     onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                                                     placeholder="Explain key concepts covered in this video lecture..."
                                                     style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px', color: 'white', outline: 'none' }}
                                                 />
                                             </div>

                                             <div style={{ gridColumn: 'span 2' }}>
                                                 <button type="submit" disabled={uploadingVideo} style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(14,165,233,0.4)' }}>
                                                     <Upload size={18} /> {uploadingVideo ? 'Uploading & Publishing Video...' : 'Publish Video & Broadcast Email Alerts'}
                                                 </button>
                                             </div>
                                         </form>
                                     </AdminCard>
                                    {/* 3. UPLOADED VIDEOS LIBRARY CARD */}
                                    <AdminCard style={{ padding: '2rem' }}>
                                        <h4 style={{ color: AdminTheme.colors.textMain, fontSize: '1.2rem', margin: '0 0 1.5rem 0' }}>
                                            Uploaded Video Lectures ({adminVideos.length})
                                        </h4>

                                        {adminVideos.length === 0 ? (
                                            <div style={{ textAlignment: 'center', padding: '3rem', color: AdminTheme.colors.textMuted }}>
                                                No video lectures uploaded yet. Use the form above to publish your first video lecture!
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                {adminVideos.map(video => (
                                                    <div key={video.id} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                                                        <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                                                            <img src={video.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 800 }}>{video.quality}</span>
                                                        </div>
                                                        <div style={{ padding: '1rem' }}>
                                                            <div style={{ fontSize: '0.75rem', color: AdminTheme.colors.accentPurple, fontWeight: 700 }}>{video.domain}</div>
                                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', margin: '4px 0 6px 0' }}>{video.title}</div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                                                <span style={{ fontSize: '0.75rem', color: AdminTheme.colors.textMuted }}>{new Date(video.date_uploaded).toLocaleDateString()}</span>
                                                                <button onClick={() => handleDeleteVideo(video.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                                                                    <Trash2 size={14} /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </AdminCard>
                                </div>
                            )}

                            {/* CERTIFICATES TAB */}
                            {activeTab === 'certificates' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FileBadge size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Certificate Registry
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Approve and issue cryptographic completion certificates.
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>Pending Certificate Requests</h4>
                                            {pendingCertificatesList.length === 0 ? (
                                                <AdminCard className="content-card-anim" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                                    <CheckCircle size={30} style={{ color: AdminTheme.colors.accentGreen, opacity: 0.8, marginBottom: '1rem' }} />
                                                    <h3 style={{ fontSize: '1.1rem', color: AdminTheme.colors.textMain, marginBottom: '5px' }}>No Pending Requests</h3>
                                                    <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.85rem' }}>All eligible students have been issued certificates.</p>
                                                </AdminCard>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {pendingCertificatesList.map(cert => (
                                                        <AdminCard key={cert.id} className="content-card-anim" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: AdminTheme.colors.accentPurple + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Award size={20} color={AdminTheme.colors.accentPurple} />
                                                                </div>
                                                                <div>
                                                                    <h4 style={{ margin: 0, color: AdminTheme.colors.textMain, fontSize: '1rem' }}>{cert.domain} Mastery</h4>
                                                                    <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>
                                                                        {cert.firstName} {cert.lastName} • Eligibility Score: <span style={{ color: AdminTheme.colors.accentCyan, fontWeight: 'bold' }}>{cert.score}/10</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={async (e) => {
                                                                    e.target.closest('.content-card-anim').style.display = 'none';
                                                                    alert(`Certificate Issued! ID: CERT-${Math.floor(Math.random()*1000000)}`);
                                                                }} style={{ ...styles.iconButton, background: `${AdminTheme.colors.success}20`, color: AdminTheme.colors.success, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}>Approve</button>
                                                                <button onClick={(e) => { e.target.closest('.content-card-anim').style.display = 'none'; alert('Certificate request rejected.'); }} style={{ ...styles.iconButton, background: `${AdminTheme.colors.danger}20`, color: AdminTheme.colors.danger, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}>Reject</button>
                                                            </div>
                                                        </AdminCard>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>Recent Issued Certificates</h4>
                                            <AdminCard className="content-card-anim" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[
                                                    { id: 'CERT-982374', name: 'John Doe', domain: 'React Frontend', date: '2026-08-25' },
                                                    { id: 'CERT-102934', name: 'Jane Smith', domain: 'Data Science', date: '2026-08-22' },
                                                    { id: 'CERT-564738', name: 'Alice Ray', domain: 'Core Java', date: '2026-08-18' }
                                                ].map((cert, i) => (
                                                    <div key={i} style={{ paddingBottom: '10px', borderBottom: i === 2 ? 'none' : `1px solid ${AdminTheme.colors.border}` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: AdminTheme.colors.textMain, fontWeight: 500, fontSize: '0.85rem' }}>{cert.name}</span>
                                                            <span style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem' }}>{cert.date}</span>
                                                        </div>
                                                        <div style={{ color: AdminTheme.colors.accentCyan, fontSize: '0.75rem', marginTop: '4px' }}>{cert.domain} • ID: {cert.id}</div>
                                                        <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                                                            <span onClick={() => alert('Opening PDF viewer...')} style={{ color: AdminTheme.colors.textMuted, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>View PDF</span>
                                                            <span onClick={(e) => { e.target.parentElement.parentElement.style.display = 'none'; alert('Certificate revoked successfully.'); }} style={{ color: AdminTheme.colors.danger, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Revoke</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </AdminCard>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INTERVIEW INTELLIGENCE TAB */}
                            {activeTab === 'Interview Intelligence' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <BrainCircuit size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Interview Intelligence
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Monitor the interview ecosystem. How are students performing in interviews?
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="stats-grid-override" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }}>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Total Interviews Conducted</div>
                                            <div style={styles.statValue}>3,420</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14}/> 15% this week</div>
                                        </AdminCard>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Completed</div>
                                            <div style={styles.statValue}>2,850</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.success, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14}/> 12% this week</div>
                                        </AdminCard>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Ongoing</div>
                                            <div style={styles.statValue}>420</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.warning, marginTop: '8px' }}>Active sessions</div>
                                        </AdminCard>
                                        <AdminCard className="stat-card-anim">
                                            <div style={styles.statTitle}>Not Started</div>
                                            <div style={styles.statValue}>150</div>
                                            <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.danger, marginTop: '8px' }}>Action required</div>
                                        </AdminCard>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                        {/* Round-wise Statistics */}
                                        <AdminCard className="content-card-anim" style={{ flex: '1 1 350px' }}>
                                            <h3 style={styles.cardTitle}>Round-wise Statistics & Average Scores</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {[ 
                                                    { name: 'Aptitude', score: 78, color: AdminTheme.colors.accentCyan },
                                                    { name: 'Technical', score: 65, color: AdminTheme.colors.accentPurple },
                                                    { name: 'Group Discussion (GD)', score: 72, color: AdminTheme.colors.warning },
                                                    { name: 'HR', score: 85, color: AdminTheme.colors.success }
                                                ].map((round, idx) => (
                                                    <div key={idx}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                                            <span style={{ color: AdminTheme.colors.textMain }}>{round.name}</span>
                                                            <span style={{ color: round.color, fontWeight: 'bold' }}>{round.score}% Avg</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div className="progress-bar-anim" data-width={`${round.score}%`} style={{ height: '100%', background: round.color, width: `${round.score}%`, borderRadius: '4px', transition: 'width 1s ease-out' }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AdminCard>

                                        {/* Frequently Difficult Topics */}
                                        <AdminCard className="content-card-anim" style={{ flex: '1 1 350px' }}>
                                            <h3 style={styles.cardTitle}>Frequently Difficult Questions/Topics</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {[
                                                    { topic: 'Dynamic Programming (Knapsack)', domain: 'Technical', failRate: '68%' },
                                                    { topic: 'System Design: Scalability', domain: 'Technical', failRate: '62%' },
                                                    { topic: 'Conflict Resolution Scenarios', domain: 'HR', failRate: '45%' },
                                                    { topic: 'Quantitative: Permutations', domain: 'Aptitude', failRate: '55%' }
                                                ].map((item, idx) => (
                                                    <div key={idx} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${AdminTheme.colors.danger}` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: AdminTheme.colors.textMain, fontWeight: 500, fontSize: '0.9rem' }}>{item.topic}</span>
                                                            <span style={{ color: AdminTheme.colors.danger, fontSize: '0.85rem', fontWeight: 'bold' }}>{item.failRate} Fail Rate</span>
                                                        </div>
                                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>Domain: {item.domain}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AdminCard>
                                    </div>
                                    
                                    {/* Domain-wise Performance & Participation */}
                                    <AdminCard className="content-card-anim">
                                        <h3 style={styles.cardTitle}>Domain-wise Interview Performance & Participation</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                            {[
                                                { name: 'Software Engineering', part: 850, score: 76 },
                                                { name: 'Data Science', part: 420, score: 82 },
                                                { name: 'Cyber Security', part: 310, score: 68 },
                                                { name: 'Product Management', part: 240, score: 79 }
                                            ].map((domain, idx) => (
                                                <div key={idx} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${AdminTheme.colors.border}` }}>
                                                    <h4 style={{ margin: '0 0 10px 0', color: AdminTheme.colors.accentCyan, fontSize: '1rem' }}>{domain.name}</h4>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                                        <span style={{ color: AdminTheme.colors.textMuted }}>Participation</span>
                                                        <span style={{ color: AdminTheme.colors.textMain }}>{domain.part} Students</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                        <span style={{ color: AdminTheme.colors.textMuted }}>Avg Score</span>
                                                        <span style={{ color: AdminTheme.colors.success, fontWeight: 'bold' }}>{domain.score}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AdminCard>
                                </div>
                            )}

                            {/* PERFORMANCE ANALYTICS TAB */}
                            {activeTab === 'Performance Analytics' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <BarChart2 size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Performance Analytics
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Analyze overall student performance. How well are students performing overall?
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        {/* Performance Breakdown */}
                                        <AdminCard className="content-card-anim" style={{ flex: '2 1 500px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <h3 style={styles.cardTitle}>Performance Breakdown</h3>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <select style={{ background: AdminTheme.colors.bgMain, color: AdminTheme.colors.textMain, border: `1px solid ${AdminTheme.colors.border}`, padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                                        <option>Department-wise</option>
                                                        <option>Specialization-wise</option>
                                                        <option>Semester/Year-wise</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{ height: '300px', width: '100%' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={[
                                                        { name: 'Computer Science', score: 82, prevScore: 78 },
                                                        { name: 'Information Sci', score: 76, prevScore: 72 },
                                                        { name: 'Electronics', score: 68, prevScore: 65 },
                                                        { name: 'Mechanical', score: 55, prevScore: 50 },
                                                        { name: 'Civil', score: 48, prevScore: 45 }
                                                    ]}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                        <XAxis dataKey="name" stroke={AdminTheme.colors.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke={AdminTheme.colors.textMuted} domain={[0, 100]} tickLine={false} axisLine={false} />
                                                        <Tooltip contentStyle={{ background: AdminTheme.colors.panel, border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '8px' }} />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="score" name="Current Semester" stroke={AdminTheme.colors.accentCyan} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                        <Line type="monotone" dataKey="prevScore" name="Previous Semester" stroke={AdminTheme.colors.textMuted} strokeDasharray="5 5" strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </AdminCard>

                                        {/* Readiness & Trends */}
                                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <AdminCard className="content-card-anim">
                                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: AdminTheme.colors.textMain }}>Average Readiness</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div className="circular-chart-anim" style={{ width: '80px', height: '80px', borderRadius: '50%', border: `8px solid ${AdminTheme.colors.border}`, borderTopColor: AdminTheme.colors.success, borderRightColor: AdminTheme.colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: AdminTheme.colors.textMain }}>72%</span>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: AdminTheme.colors.success, fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <TrendingUp size={16} /> +8% Improvement Trend
                                                        </div>
                                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>Platform average across all years.</div>
                                                    </div>
                                                </div>
                                            </AdminCard>

                                            <AdminCard className="content-card-anim" style={{ flex: 1 }}>
                                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: AdminTheme.colors.textMain }}>Performance Groups</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: `3px solid ${AdminTheme.colors.success}`, borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '0.85rem', color: AdminTheme.colors.success, fontWeight: 600 }}>Top Performing</div>
                                                        <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.textMain, marginTop: '2px' }}>CS - AIML Specialization (88% Avg)</div>
                                                    </div>
                                                    <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: `3px solid ${AdminTheme.colors.danger}`, borderRadius: '6px' }}>
                                                        <div style={{ fontSize: '0.85rem', color: AdminTheme.colors.danger, fontWeight: 600 }}>Struggling Group</div>
                                                        <div style={{ fontSize: '0.8rem', color: AdminTheme.colors.textMain, marginTop: '2px' }}>Mech - 3rd Year (42% Avg)</div>
                                                    </div>
                                                </div>
                                            </AdminCard>
                                        </div>
                                    </div>
                                    
                                    {/* Round-wise Overview */}
                                    <AdminCard className="content-card-anim">
                                        <h3 style={styles.cardTitle}>Round-wise Performance Averages</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                            {[
                                                { round: 'Aptitude Test', score: '74%', color: '#3b82f6' },
                                                { round: 'Coding Assessment', score: '62%', color: '#8b5cf6' },
                                                { round: 'Technical Interview', score: '68%', color: '#ec4899' },
                                                { round: 'HR Interview', score: '85%', color: '#10b981' }
                                            ].map((r, i) => (
                                                <div key={i} style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', textAlign: 'center', border: `1px solid ${AdminTheme.colors.border}` }}>
                                                    <div style={{ fontSize: '0.85rem', color: AdminTheme.colors.textMuted, marginBottom: '8px' }}>{r.round}</div>
                                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: r.color }}>{r.score}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </AdminCard>
                                </div>
                            )}

                            {/* SKILL INTELLIGENCE TAB */}
                            {activeTab === 'Skill Intelligence' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <BrainCircuit size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Skill Intelligence
                                                </h3>
                                                <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                                    Identify the skills students are strong or weak in. What are the major skill gaps?
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <select style={{ background: AdminTheme.colors.bgMain, color: AdminTheme.colors.textMain, border: `1px solid ${AdminTheme.colors.border}`, padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}>
                                                    <option>All Degrees</option>
                                                    <option>B.Tech</option>
                                                    <option>M.Tech</option>
                                                    <option>MCA</option>
                                                </select>
                                                <select style={{ background: AdminTheme.colors.bgMain, color: AdminTheme.colors.textMain, border: `1px solid ${AdminTheme.colors.border}`, padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}>
                                                    <option>All Departments</option>
                                                    <option>Computer Science</option>
                                                    <option>Information Science</option>
                                                </select>
                                                <select style={{ background: AdminTheme.colors.bgMain, color: AdminTheme.colors.textMain, border: `1px solid ${AdminTheme.colors.border}`, padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}>
                                                    <option>All Semesters</option>
                                                    <option>Semester 6</option>
                                                    <option>Semester 7</option>
                                                    <option>Semester 8</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                        {/* Strong Skills */}
                                        <AdminCard className="content-card-anim">
                                            <h3 style={{ ...styles.cardTitle, color: AdminTheme.colors.success }}>
                                                <CheckCircle size={20} /> Strong Skills (Mastered)
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[
                                                    { name: 'Java Programming', score: 88, users: 1240 },
                                                    { name: 'Communication', score: 82, users: 1560 },
                                                    { name: 'SQL & Databases', score: 79, users: 1100 },
                                                    { name: 'React.js Fundamentals', score: 76, users: 850 }
                                                ].map((skill, idx) => (
                                                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: `1px solid ${AdminTheme.colors.border}` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ color: AdminTheme.colors.textMain, fontWeight: 500 }}>{skill.name}</span>
                                                            <span style={{ color: AdminTheme.colors.success, fontWeight: 'bold' }}>{skill.score}% Avg</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                                                            <div className="progress-bar-anim" data-width={`${skill.score}%`} style={{ height: '100%', background: AdminTheme.colors.success, width: `${skill.score}%`, transition: 'width 1s ease-out' }} />
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: AdminTheme.colors.textMuted }}>Mastered by {skill.users} students</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AdminCard>

                                        {/* Common Skill Gaps */}
                                        <AdminCard className="content-card-anim">
                                            <h3 style={{ ...styles.cardTitle, color: AdminTheme.colors.danger }}>
                                                <AlertTriangle size={20} /> Common Skill Gaps (Needs Improvement)
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[
                                                    { name: 'Data Structures (Trees/Graphs)', score: 42, users: 1800 },
                                                    { name: 'Advanced DBMS (Normalization)', score: 45, users: 1450 },
                                                    { name: 'Complex Problem Solving', score: 38, users: 2100 },
                                                    { name: 'System Design Basics', score: 35, users: 1950 }
                                                ].map((skill, idx) => (
                                                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: `1px solid ${AdminTheme.colors.border}` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ color: AdminTheme.colors.textMain, fontWeight: 500 }}>{skill.name}</span>
                                                            <span style={{ color: AdminTheme.colors.danger, fontWeight: 'bold' }}>{skill.score}% Avg</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                                                            <div className="progress-bar-anim" data-width={`${skill.score}%`} style={{ height: '100%', background: AdminTheme.colors.danger, width: `${skill.score}%`, transition: 'width 1s ease-out' }} />
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: AdminTheme.colors.textMuted }}>Identified as weak in {skill.users} students</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AdminCard>
                                    </div>
                                </div>
                            )}

                            {/* AI INSIGHTS TAB */}
                            {activeTab === 'AI Insights' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Sparkles size={24} style={{ color: AdminTheme.colors.accentCyan }} /> AI Insights
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            System-wide AI recommendations and generative feedback.
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                        <AdminCard className="content-card-anim" style={{ padding: '1.5rem', borderLeft: `4px solid ${AdminTheme.colors.accentCyan}` }}>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                                                    <BrainCircuit size={24} color={AdminTheme.colors.accentCyan} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: '0 0 8px 0', color: AdminTheme.colors.textMain, fontSize: '1.05rem' }}>Departmental Performance</h3>
                                                    <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                                        <strong style={{ color: AdminTheme.colors.textMain }}>CSE students</strong> show exceptionally strong <strong style={{ color: AdminTheme.colors.success }}>Java performance</strong> (88% avg) but exhibit relatively <strong style={{ color: AdminTheme.colors.warning }}>low performance in DBMS</strong> (45% avg).
                                                    </p>
                                                </div>
                                            </div>
                                        </AdminCard>
                                        
                                        <AdminCard className="content-card-anim" style={{ padding: '1.5rem', borderLeft: `4px solid ${AdminTheme.colors.success}` }}>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                                                    <TrendingUp size={24} color={AdminTheme.colors.success} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: '0 0 8px 0', color: AdminTheme.colors.textMain, fontSize: '1.05rem' }}>Semester Growth Trends</h3>
                                                    <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                                        Students in the <strong style={{ color: AdminTheme.colors.textMain }}>6th semester</strong> have improved their technical scores by <strong style={{ color: AdminTheme.colors.success }}>12%</strong> over the previous assessment cycle.
                                                    </p>
                                                </div>
                                            </div>
                                        </AdminCard>

                                        <AdminCard className="content-card-anim" style={{ padding: '1.5rem', borderLeft: `4px solid ${AdminTheme.colors.danger}` }}>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                                                    <AlertCircle size={24} color={AdminTheme.colors.danger} />
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: '0 0 8px 0', color: AdminTheme.colors.textMain, fontSize: '1.05rem' }}>Critical Weakness Detected</h3>
                                                    <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                                        <strong style={{ color: AdminTheme.colors.danger }}>Group Discussion (GD)</strong> is consistently the weakest interview round for the majority of students across all departments.
                                                    </p>
                                                </div>
                                            </div>
                                        </AdminCard>
                                    </div>
                                    
                                    <AIInsightPanel className="content-card-anim">
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px' }}>
                                                <Sparkles size={32} color={AdminTheme.colors.textMain} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: '0 0 10px 0', color: AdminTheme.colors.textMain, fontSize: '1.2rem' }}>AI Actionable Recommendations</h3>
                                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div><strong style={{ color: AdminTheme.colors.accentCyan }}>1. DBMS Bootcamp:</strong> The system recommends initiating a mandatory 3-day DBMS optimization bootcamp for 3rd-year CSE students before the placement season.</div>
                                                    <div><strong style={{ color: AdminTheme.colors.warning }}>2. Soft Skills Intervention:</strong> Organize peer-to-peer mock Group Discussions. AI models show a 24% boost in confidence when students practice GDs in randomized cohorts.</div>
                                                    <div><strong style={{ color: AdminTheme.colors.success }}>3. Adaptive Assessments:</strong> Automatically increase the difficulty of Java algorithms for 6th-semester students to capitalize on their recent 12% performance surge.</div>
                                                </div>
                                                <AdminButton style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)' }} onClick={() => alert('Automated training schedule generated based on AI recommendations.')}>
                                                    Generate Training Plan
                                                </AdminButton>
                                            </div>
                                        </div>
                                    </AIInsightPanel>
                                </div>
                            )}

                            {/* INTERVIEW DOMAINS TAB */}
                            {activeTab === 'Interview Domains' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Layers size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Interview Domains
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Configuration and mapping of assessment topics.
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {popularDomains.map((domain, idx) => (
                                            <AdminCard key={idx} className="content-card-anim" style={{ padding: '1.5rem' }}>
                                                <h4 style={{ margin: '0 0 10px 0', color: AdminTheme.colors.textMain, fontSize: '1.1rem' }}>{domain.name}</h4>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: AdminTheme.colors.textMuted, fontSize: '0.9rem', marginBottom: '15px' }}>
                                                    <span>{domain.count} Interviews</span>
                                                    <span>{domain.percent}% of Total</span>
                                                </div>
                                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div className="progress-bar-anim" data-width={`${domain.percent}%`} style={{ height: '100%', background: AdminTheme.colors.accentCyan, width: `${domain.percent}%`, transition: 'width 1s ease-out' }} />
                                                </div>
                                            </AdminCard>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ACHIEVEMENTS TAB */}
                            {activeTab === 'Achievements' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Trophy size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Achievements
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Gamified milestones and competency badging.
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>Pending Achievement Claims</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {[
                                                    { student: 'Alex Johnson', type: 'Coding Mastery', desc: 'Completed 50 Hard LeetCode problems', date: '2 hours ago', icon: Cpu },
                                                    { student: 'Maria Garcia', type: 'Interview Elite', desc: 'Scored 95% in mock tech interview', date: '5 hours ago', icon: BrainCircuit },
                                                    { student: 'David Chen', type: 'Learning Milestone', desc: 'Completed 100 hours of active learning', date: '1 day ago', icon: Clock }
                                                ].map((claim, idx) => (
                                                    <AdminCard key={idx} className="content-card-anim" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <claim.icon size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, color: AdminTheme.colors.textMain, fontSize: '0.95rem' }}>{claim.type}</h4>
                                                                <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>{claim.student} • {claim.desc}</div>
                                                                <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.7rem', marginTop: '4px' }}>Submitted {claim.date}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => alert('Claim verified and approved!')} style={{ ...styles.iconButton, background: `${AdminTheme.colors.success}20`, color: AdminTheme.colors.success, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}>Verify</button>
                                                            <button onClick={() => alert('Claim rejected.')} style={{ ...styles.iconButton, background: `${AdminTheme.colors.danger}20`, color: AdminTheme.colors.danger, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}>Reject</button>
                                                        </div>
                                                    </AdminCard>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>Achievement Categories</h4>
                                            <AdminCard className="content-card-anim" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[
                                                    { name: 'Coding Achievement', count: 142, color: AdminTheme.colors.accentCyan },
                                                    { name: 'Interview Completion', count: 350, color: AdminTheme.colors.accentPurple },
                                                    { name: 'Skill Mastery', count: 89, color: AdminTheme.colors.success },
                                                    { name: 'Learning Milestone', count: 215, color: '#f59e0b' }
                                                ].map((cat, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: i === 3 ? 'none' : `1px solid ${AdminTheme.colors.border}` }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }} />
                                                            <span style={{ color: AdminTheme.colors.textMain, fontSize: '0.9rem' }}>{cat.name}</span>
                                                        </div>
                                                        <span style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', fontWeight: 'bold' }}>{cat.count} Earned</span>
                                                    </div>
                                                ))}
                                                <button onClick={() => alert('Category management opened.')} style={{ ...styles.iconButton, width: '100%', marginTop: '10px', justifyContent: 'center', padding: '10px', color: AdminTheme.colors.accentCyan }}>Manage Categories</button>
                                            </AdminCard>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ALERTS TAB */}
                            {activeTab === 'Alerts' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Bell size={24} style={{ color: AdminTheme.colors.accentCyan }} /> Alerts
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Critical system notifications and anomaly detection.
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>System Notifications</h4>
                                            {alerts.length === 0 ? (
                                                <AdminCard className="content-card-anim" style={{ padding: '3rem', textAlign: 'center' }}>
                                                    <CheckCircle size={40} color={AdminTheme.colors.accentGreen} style={{ marginBottom: '15px' }} />
                                                    <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>System Healthy</h4>
                                                    <p style={{ color: AdminTheme.colors.textMuted }}>No active alerts or anomalies detected.</p>
                                                </AdminCard>
                                            ) : (
                                                alerts.map(alert => (
                                                    <AdminCard key={alert.id} className="content-card-anim" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '15px', borderLeft: `4px solid ${alert.type === 'warning' ? '#f59e0b' : alert.type === 'danger' ? '#ef4444' : alert.type === 'success' ? '#10b981' : '#3b82f6'}` }}>
                                                        <AlertCircle size={20} color={alert.type === 'warning' ? '#f59e0b' : alert.type === 'danger' ? '#ef4444' : alert.type === 'success' ? '#10b981' : '#3b82f6'} />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ color: AdminTheme.colors.textMain, fontSize: '0.95rem' }}>{alert.message}</div>
                                                            <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.75rem', marginTop: '4px' }}>{alert.time || 'Just now'}</div>
                                                        </div>
                                                        <button onClick={() => alert('Alert dismissed.')} style={{ ...styles.iconButton, padding: '4px 8px', fontSize: '0.75rem' }}>Dismiss</button>
                                                    </AdminCard>
                                                ))
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <h4 style={{ margin: 0, color: AdminTheme.colors.textMain }}>Broadcast Announcement</h4>
                                            <AdminCard className="content-card-anim" style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginBottom: '5px' }}>Target Audience</label>
                                                        <select style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: `1px solid ${AdminTheme.colors.border}`, color: AdminTheme.colors.textMain, padding: '10px', borderRadius: '8px', outline: 'none' }}>
                                                            <option>All Students</option>
                                                            <option>Pending Registrations</option>
                                                            <option>Completed Interviews Only</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginBottom: '5px' }}>Announcement Message</label>
                                                        <textarea id="broadcastMsg" rows={4} placeholder="Type your broadcast message here..." style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: `1px solid ${AdminTheme.colors.border}`, color: AdminTheme.colors.textMain, padding: '10px', borderRadius: '8px', outline: 'none', resize: 'vertical' }}></textarea>
                                                    </div>
                                                    <AdminButton onClick={() => { const msg = document.getElementById('broadcastMsg').value; if(msg) { localStorage.setItem('student_broadcast', msg); alert('Announcement broadcasted to student platforms!'); document.getElementById('broadcastMsg').value = ''; } else { alert('Please enter a message first.'); } }} style={{ justifyContent: 'center' }}>
                                                        <Bell size={16} style={{ marginRight: '8px' }} /> Send Notification
                                                    </AdminButton>
                                                </div>
                                            </AdminCard>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SYSTEM SETTINGS TAB */}
                            {activeTab === 'System Settings' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem 2rem', border: `1px solid ${AdminTheme.colors.border}`, background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Settings size={24} style={{ color: AdminTheme.colors.accentCyan }} /> System Settings
                                        </h3>
                                        <p style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem', marginTop: '8px' }}>
                                            Runtime configuration and administrative controls.
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                        {/* Security & Proctoring */}
                                        <AdminCard className="content-card-anim">
                                            <h3 style={{ margin: '0 0 1.2rem 0', color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                <ShieldCheck size={20} color={AdminTheme.colors.accentPurple} /> Security & Proctoring
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[
                                                    { label: 'Strict Proctoring Mode', desc: 'Enforces webcam & tab-lock for assessments', on: true },
                                                    { label: 'Biometric 3FA Requirement', desc: 'Require fingerprint auth for admin logins', on: true },
                                                    { label: 'Automated Anomaly Detection', desc: 'AI flags suspicious interview behaviors', on: true }
                                                ].map((setting, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                        <div>
                                                            <div style={{ color: AdminTheme.colors.textMain, fontWeight: 500, fontSize: '0.9rem' }}>{setting.label}</div>
                                                            <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>{setting.desc}</div>
                                                        </div>
                                                        <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: setting.on ? AdminTheme.colors.success : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                                                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: setting.on ? '20px' : '2px', transition: '0.3s' }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AdminCard>

                                        {/* Platform & Student Access */}
                                        <AdminCard className="content-card-anim">
                                            <h3 style={{ margin: '0 0 1.2rem 0', color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                <Users size={20} color={AdminTheme.colors.accentCyan} /> Platform & Access Rules
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[
                                                    { label: 'Auto-Approve Registrations', desc: 'Allow students to join without manual approval', on: false },
                                                    { label: 'Maintenance Mode', desc: 'Disables student logins for platform updates', on: false },
                                                    { label: 'Public Leaderboard', desc: 'Allow students to see overall platform rankings', on: true }
                                                ].map((setting, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                        <div>
                                                            <div style={{ color: AdminTheme.colors.textMain, fontWeight: 500, fontSize: '0.9rem' }}>{setting.label}</div>
                                                            <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>{setting.desc}</div>
                                                        </div>
                                                        <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: setting.on ? AdminTheme.colors.success : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                                                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: setting.on ? '20px' : '2px', transition: '0.3s' }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AdminCard>

                                        {/* Interview & Certificate Settings */}
                                        <AdminCard className="content-card-anim">
                                            <h3 style={{ margin: '0 0 1.2rem 0', color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                <BrainCircuit size={20} color={AdminTheme.colors.warning} /> Interview & Certificates
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {[
                                                    { label: 'Dynamic Difficulty Scaling', desc: 'AI adapts question difficulty in real-time', on: true },
                                                    { label: 'Auto-Issue Certificates', desc: 'Bypass admin approval for scores > 80%', on: false },
                                                    { label: 'Detailed AI Logging', desc: 'Save full conversational transcripts', on: true }
                                                ].map((setting, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                        <div>
                                                            <div style={{ color: AdminTheme.colors.textMain, fontWeight: 500, fontSize: '0.9rem' }}>{setting.label}</div>
                                                            <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>{setting.desc}</div>
                                                        </div>
                                                        <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: setting.on ? AdminTheme.colors.success : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                                                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: setting.on ? '20px' : '2px', transition: '0.3s' }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AdminCard>

                                        {/* Academic & Data Management */}
                                        <AdminCard className="content-card-anim">
                                            <h3 style={{ margin: '0 0 1.2rem 0', color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                <Settings size={20} color="#ec4899" /> Academic & Data Config
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                    <div>
                                                        <div style={{ color: AdminTheme.colors.textMain, fontWeight: 500, fontSize: '0.9rem' }}>Current Academic Year</div>
                                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>2025-2026 Session</div>
                                                    </div>
                                                    <button onClick={() => alert('Academic Year config locked in demo.')} style={{ ...styles.iconButton, padding: '4px 10px', fontSize: '0.8rem' }}>Change</button>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                    <div>
                                                        <div style={{ color: AdminTheme.colors.textMain, fontWeight: 500, fontSize: '0.9rem' }}>System Backup Data</div>
                                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>Last backup: Today, 3:00 AM</div>
                                                    </div>
                                                    <button onClick={() => alert('Backup initiated.')} style={{ ...styles.iconButton, padding: '4px 10px', fontSize: '0.8rem' }}>Backup Now</button>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${AdminTheme.colors.danger}40`, borderRadius: '8px' }}>
                                                    <div>
                                                        <div style={{ color: AdminTheme.colors.danger, fontWeight: 500, fontSize: '0.9rem' }}>AI API Secrets & Keys</div>
                                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>Hidden in frontend (Server .env only)</div>
                                                    </div>
                                                    <ShieldCheck size={20} color={AdminTheme.colors.danger} />
                                                </div>
                                            </div>
                                        </AdminCard>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <AnimatePresence>
                {showAdminProfile && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 8, 18, 0.9)', backdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setShowAdminProfile(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.9, y: 30 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: AdminTheme.colors.bgPanel, border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '24px', padding: '40px', width: '450px', maxWidth: '90%', boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px ${AdminTheme.colors.border} inset`, position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Decorative Glows */}
                            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: AdminTheme.colors.accentPurple, filter: 'blur(80px)', opacity: 0.3, zIndex: 0 }} />
                            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: AdminTheme.colors.accentCyan, filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }} />

                            <button onClick={() => setShowAdminProfile(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: AdminTheme.colors.textMuted, cursor: 'pointer', zIndex: 10, padding: '5px' }}>
                                <X size={20} />
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 1, position: 'relative' }}>
                                <div style={{ ...styles.avatar, width: '90px', height: '90px', fontSize: '2.5rem', boxShadow: `0 0 30px ${AdminTheme.colors.accentPurple}40` }}>
                                    {adminUser ? adminUser.substring(0, 2).toUpperCase() : 'AD'}
                                </div>
                                
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: 'white', fontWeight: 800 }}>{adminUser || 'Administrator'}</h2>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${AdminTheme.colors.accentCyan}20`, color: AdminTheme.colors.accentCyan, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                                        <ShieldCheck size={14} /> SYSTEM OVERSEER
                                    </div>
                                </div>

                                <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: `1px solid ${AdminTheme.colors.border}`, padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${AdminTheme.colors.border}`, marginBottom: '12px', fontSize: '0.9rem' }}>
                                        <span style={{ color: AdminTheme.colors.textMuted }}>Registered Email</span>
                                        <span style={{ color: AdminTheme.colors.textMain, fontWeight: 500 }}>{adminUser || 'admin'}@ai.edu</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${AdminTheme.colors.border}`, marginBottom: '12px', fontSize: '0.9rem' }}>
                                        <span style={{ color: AdminTheme.colors.textMuted }}>Security Clearance</span>
                                        <span style={{ color: AdminTheme.colors.warning, fontWeight: 500 }}>Level 5 (Max)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${AdminTheme.colors.border}`, marginBottom: '12px', fontSize: '0.9rem' }}>
                                        <span style={{ color: AdminTheme.colors.textMuted }}>Session Encryption</span>
                                        <span style={{ color: AdminTheme.colors.success, fontWeight: 500 }}>Active (256-bit AES)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: AdminTheme.colors.textMuted }}>Last Login</span>
                                        <span style={{ color: AdminTheme.colors.textMain, fontWeight: 500 }}>{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { if(window.confirm('Are you sure you want to completely log out?')) handleLogout(); }}
                                    style={{ width: '100%', marginTop: '10px', padding: '15px', background: `linear-gradient(135deg, ${AdminTheme.colors.danger}dd, ${AdminTheme.colors.danger})`, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: `0 10px 20px ${AdminTheme.colors.danger}40` }}
                                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'none'}
                                >
                                    <LogOut size={18} /> Disconnect & Secure Logout
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Analysis Detailed Modal */}
            <AnimatePresence>
                {showAIAnalysisModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 8, 18, 0.95)', backdropFilter: 'blur(25px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setShowAIAnalysisModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: AdminTheme.colors.bgPanel, border: `1px solid ${AdminTheme.colors.border}`, borderRadius: '24px', padding: '40px', width: '750px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px ${AdminTheme.colors.accentCyan}40 inset`, position: 'relative' }}
                        >
                            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: AdminTheme.colors.accentCyan, filter: 'blur(120px)', opacity: 0.15, zIndex: 0 }} />

                            <button onClick={() => setShowAIAnalysisModal(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${AdminTheme.colors.border}`, color: AdminTheme.colors.textMain, cursor: 'pointer', zIndex: 10, padding: '8px', borderRadius: '50%', transition: 'all 0.2s' }} className="icon-btn-hover">
                                <X size={20} />
                            </button>

                            <div style={{ zIndex: 1, position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px' }}>
                                    <div style={{ padding: '18px', background: `linear-gradient(135deg, ${AdminTheme.colors.accentCyan}30, ${AdminTheme.colors.accentPurple}30)`, borderRadius: '18px', color: AdminTheme.colors.accentCyan, border: `1px solid ${AdminTheme.colors.accentCyan}50` }}>
                                        <BrainCircuit size={36} />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: 'white', fontWeight: 800 }}>Comprehensive AI Analysis</h2>
                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.95rem' }}>Deep-dive into cohort behavioral and technical telemetry.</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '16px', border: `1px solid ${AdminTheme.colors.border}`, position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: AdminTheme.colors.accentPurple, filter: 'blur(50px)', opacity: 0.1 }} />
                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={16} color={AdminTheme.colors.accentPurple} /> Cognitive Load Index</div>
                                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', marginBottom: '5px', letterSpacing: '-1px' }}>High <span style={{ fontSize: '1.1rem', color: AdminTheme.colors.warning, fontWeight: 600 }}>(68%)</span></div>
                                        <div style={{ fontSize: '0.85rem', color: AdminTheme.colors.textMuted, lineHeight: 1.5 }}>Students exhibit notable hesitation and prolonged silences during System Design architecture rounds.</div>
                                    </div>
                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '16px', border: `1px solid ${AdminTheme.colors.border}`, position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: AdminTheme.colors.success, filter: 'blur(50px)', opacity: 0.1 }} />
                                        <div style={{ color: AdminTheme.colors.textMuted, fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} color={AdminTheme.colors.success} /> Sentiment Trajectory</div>
                                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', marginBottom: '5px', letterSpacing: '-1px' }}>Positive <span style={{ fontSize: '1.1rem', color: AdminTheme.colors.success, fontWeight: 600 }}>(+14%)</span></div>
                                        <div style={{ fontSize: '0.85rem', color: AdminTheme.colors.textMuted, lineHeight: 1.5 }}>Confidence markers increase significantly during practical LeetCode-style algorithm debugging tasks.</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '35px', padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: `1px solid ${AdminTheme.colors.border}` }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: AdminTheme.colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={18}/> Key Technical Weaknesses</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {[
                                            { skill: 'React State Management (Redux/Zustand)', gap: '42%', color: AdminTheme.colors.danger },
                                            { skill: 'SQL Joins & Index Optimization', gap: '35%', color: AdminTheme.colors.warning },
                                            { skill: 'REST API Security & OAuth', gap: '18%', color: AdminTheme.colors.success }
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                    <span style={{ color: AdminTheme.colors.textMain, fontWeight: 500 }}>{item.skill}</span>
                                                    <span style={{ color: item.color, fontWeight: 700 }}>{item.gap} Failure Rate</span>
                                                </div>
                                                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: item.color, width: item.gap, borderRadius: '4px', boxShadow: `0 0 10px ${item.color}80` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ background: `linear-gradient(to right, ${AdminTheme.colors.accentCyan}15, transparent)`, borderLeft: `4px solid ${AdminTheme.colors.accentCyan}`, padding: '25px', borderRadius: '0 16px 16px 0' }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: AdminTheme.colors.accentCyan, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={18} /> Auto-Generated Strategy
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                                        Based on the telemetry of 1,240 recent mock interviews, the AI Engine strongly recommends injecting a mandatory <strong>"System Design Fundamentals"</strong> micro-module into the active Placement Drive workflow before Week 4 begins.
                                    </p>
                                    <button 
                                        onClick={() => { alert('Strategy injected into active placement drive successfully.'); setShowAIAnalysisModal(false); }}
                                        style={{ marginTop: '20px', padding: '12px 24px', background: AdminTheme.colors.accentCyan, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 0 20px ${AdminTheme.colors.accentCyan}40` }}
                                        onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.target.style.transform = 'none'}
                                    >
                                        Deploy Strategy Automatically
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style>
                {`
                .spinner { border: 3px solid rgba(0,0,0,0.1); width: 24px; height: 24px; border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                `}
            </style>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div whileHover={{ y: -5 }} style={{...styles.statCard, borderTop: `4px solid ${color}`}}>
        <div style={styles.statInfo}>
            <div style={styles.statTitle}>{title}</div>
            <div style={styles.statValue}>{value}</div>
        </div>
        <div style={{...styles.statIconWrapper, background: `${color}15`, color: color}}>
            <Icon size={24} />
        </div>
    </motion.div>
);

const ActivityItem = ({ time, text, type }) => {
    const colors = { info: '#3b82f6', warning: '#f59e0b', success: '#10b981' };
    return (
        <div style={styles.activityItem}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', background: colors[type]}} />
            <div style={styles.activityTime}>{time}</div>
            <div style={styles.activityText}>{text}</div>
        </div>
    );
};

const colors = {
    bg: '#050A15',
    panel: 'rgba(13, 17, 33, 0.7)',
    panelBorder: 'rgba(255, 255, 255, 0.06)',
    textMain: '#F8FAFC',
    textMuted: '#94A3B8',
    accent1: '#8B5CF6', // Purple
    accent2: '#0EA5E9', // Cyan/Blue
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
};

const styles = {
    container: { display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: colors.bg, fontFamily: "'Inter', sans-serif", color: colors.textMain, overflow: 'hidden' },
    sidebar: {
        width: '280px', backgroundColor: 'rgba(9, 14, 28, 0.8)', backdropFilter: 'blur(12px)', borderRight: `1px solid ${colors.panelBorder}`, display: 'flex', flexDirection: 'column', zIndex: 10
    },
    sidebarHeader: { padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: `1px solid ${colors.panelBorder}` },
    brandBadge: { width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${colors.accent1}, ${colors.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', boxShadow: `0 0 20px ${colors.accent1}40` },
    brandTitle: { fontWeight: 800, letterSpacing: '1px', fontSize: '1.1rem', color: colors.textMain },
    brandSub: { fontSize: '0.75rem', color: colors.accent2, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' },
    navMenu: { padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', color: colors.textMuted, cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.9rem', fontWeight: 500, border: '1px solid transparent' },
    navItemActive: { background: `linear-gradient(90deg, ${colors.accent1}20, transparent)`, color: colors.textMain, border: `1px solid ${colors.accent1}30`, borderLeft: `3px solid ${colors.accent1}`, boxShadow: `inset 10px 0 20px -10px ${colors.accent1}40` },
    sidebarFooter: { padding: '1.5rem', borderTop: `1px solid ${colors.panelBorder}`, display: 'flex', alignItems: 'center', gap: '10px', color: colors.textMuted, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', transition: 'color 0.2s' },
    
    mainContent: { flex: 1, padding: '2rem 3rem', overflowY: 'auto', position: 'relative' },
    topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
    pageTitle: { margin: 0, fontSize: '1.8rem', fontWeight: 800, color: colors.textMain, letterSpacing: '-0.5px' },
    topbarRight: { display: 'flex', alignItems: 'center', gap: '20px' },
    iconBtn: { color: colors.textMuted, cursor: 'pointer', background: colors.panel, padding: '10px', borderRadius: '50%', border: `1px solid ${colors.panelBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    profileBtn: { display: 'flex', alignItems: 'center', gap: '12px', background: colors.panel, padding: '6px 15px 6px 6px', borderRadius: '30px', border: `1px solid ${colors.panelBorder}`, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: colors.textMain },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${colors.accent2}, ${colors.accent1})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' },
    
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' },
    statCard: { background: colors.panel, padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${colors.panelBorder}`, backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' },
    statInfo: { zIndex: 2 },
    statTitle: { fontSize: '0.85rem', color: colors.textMuted, fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    statValue: { fontSize: '2rem', fontWeight: 800, color: colors.textMain, fontFamily: "'JetBrains Mono', monospace" },
    statIconWrapper: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    
    contentGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' },
    activityCard: { background: colors.panel, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${colors.panelBorder}`, backdropFilter: 'blur(10px)' },
    analyticsCard: { background: colors.panel, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${colors.panelBorder}`, backdropFilter: 'blur(10px)' },
    cardTitle: { margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' },
    
    activityList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    activityItem: { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '1rem', borderBottom: `1px solid ${colors.panelBorder}` },
    activityTime: { fontSize: '0.8rem', color: colors.textMuted, width: '70px', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" },
    activityText: { fontSize: '0.9rem', color: colors.textMain, fontWeight: 400 },
    
    progressRow: { marginBottom: '1.2rem' },
    progressLabel: { fontSize: '0.85rem', fontWeight: 500, color: colors.textMuted, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' },
    progressBar: { width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '10px', boxShadow: '0 0 10px currentColor' },

    /* Student Management Table Styles */
    tableCard: { background: colors.panel, borderRadius: '16px', border: `1px solid ${colors.panelBorder}`, overflow: 'hidden', backdropFilter: 'blur(10px)' },
    tableHeader: { padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.panelBorder}` },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.panelBorder}`, padding: '8px 15px', borderRadius: '8px', width: '300px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: colors.textMain },
    tableContainer: { width: '100%', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: colors.textMuted, fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: `1px solid ${colors.panelBorder}`, letterSpacing: '0.5px' },
    tr: { borderBottom: `1px solid ${colors.panelBorder}`, transition: 'background-color 0.2s' },
    td: { padding: '1rem 1.5rem', fontSize: '0.9rem', color: colors.textMain, verticalAlign: 'middle' },
    statusBadgeActive: { background: `${colors.success}20`, color: colors.success, border: `1px solid ${colors.success}40`, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
    actionBtns: { display: 'flex', gap: '10px' },
    iconButton: { background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.panelBorder}`, cursor: 'pointer', color: colors.textMuted, padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
};

const GlobalStyles = () => (
    <style>
        {`
        @keyframes statusPing {
            0% { transform: scale(1); opacity: 0.8; }
            70% { transform: scale(2.5); opacity: 0; }
            100% { transform: scale(2.5); opacity: 0; }
        }
        .status-ping {
            animation: statusPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        /* Responsive Breakpoints & UI Polish */
        .mobile-menu-btn { display: none !important; }
        .sidebar-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
            z-index: 999; display: none; opacity: 0; transition: opacity 0.3s;
        }
        .sidebar-overlay.open { display: block; opacity: 1; }
        
        .admin-sidebar.compact .compact-hide { opacity: 0; width: 0; margin: 0; padding: 0; pointer-events: none; }
        
        .list-item-anim { transition: background 0.2s, transform 0.2s; cursor: pointer; }
        .list-item-anim:hover { background: rgba(255,255,255,0.05) !important; transform: translateX(4px); }
        .icon-btn-hover { transition: all 0.2s; }
        .icon-btn-hover:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }

        @media (max-width: 1440px) {
            .stats-grid-override { grid-template-columns: repeat(3, 1fr) !important; }
        }
        
        @media (max-width: 1280px) {
            .main-content-area { padding: 1.5rem 2rem !important; }
        }

        @media (max-width: 1024px) {
            .mobile-menu-btn { display: flex !important; }
            .admin-sidebar {
                position: fixed !important; left: -300px; top: 0; bottom: 0; height: 100vh;
                transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1000 !important; width: 280px !important;
            }
            .admin-sidebar.open { left: 0; }
            .stats-grid-override { grid-template-columns: repeat(2, 1fr) !important; }
        }
        
        @media (max-width: 768px) {
            .topbar-right-info { display: none !important; }
            .main-content-area { padding: 1rem !important; }
        }
        
        @media (max-width: 480px) {
            .stats-grid-override { grid-template-columns: 1fr !important; }
        }
        `}
    </style>
);

export default AdminDashboard;

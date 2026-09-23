import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, Video, Radio, Users, Send, Heart, Flame, Sparkles, 
    MessageSquare, Eye, Pin, Volume2, Maximize2, CheckCircle, 
    Filter, Search, Clock, Film, Award, ArrowRight, ShieldCheck, X
} from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io();

const LiveClasses = () => {
    const [activeTab, setActiveTab] = useState('recorded'); // recorded, live
    const [videos, setVideos] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Live Stream States
    const [activeLive, setActiveLive] = useState(null);
    const [viewerCount, setViewerCount] = useState(1);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [reactions, setReactions] = useState([]);
    const [pinnedComment, setPinnedComment] = useState('Welcome everyone to the Live Session! Ask questions in live chat below.');
    const [studentName, setStudentName] = useState('Student');

    const chatEndRef = useRef(null);

    useEffect(() => {
        const username = localStorage.getItem('ai_portal_username') || 'Student';
        setStudentName(username);

        // Fetch videos
        fetch('/api/videos')
            .then(res => res.json())
            .then(data => {
                if (data.videos) setVideos(data.videos);
            })
            .catch(() => {});

        // Fetch active live stream
        fetch('/api/live-sessions/active')
            .then(res => res.json())
            .then(data => {
                if (data.activeLive) {
                    setActiveLive(data.activeLive);
                }
            })
            .catch(() => {});

        // Socket listeners
        socket.emit('join_live_room', { username });

        socket.on('new_video_published', (newVideo) => {
            setVideos(prev => [newVideo, ...prev]);
        });

        socket.on('live_session_started', (session) => {
            setActiveLive(session);
            setActiveTab('live');
        });

        socket.on('live_session_ended', () => {
            setActiveLive(null);
        });

        socket.on('viewer_count_update', (data) => {
            if (data.count) setViewerCount(data.count);
        });

        socket.on('receive_live_chat', (msg) => {
            setChatMessages(prev => [...prev, msg]);
        });

        socket.on('receive_live_reaction', (reactionData) => {
            const id = Date.now() + Math.random();
            setReactions(prev => [...prev, { ...reactionData, id }]);
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 3000);
        });

        return () => {
            socket.emit('leave_live_room');
            socket.off('new_video_published');
            socket.off('live_session_started');
            socket.off('live_session_ended');
            socket.off('viewer_count_update');
            socket.off('receive_live_chat');
            socket.off('receive_live_reaction');
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendChat = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const msgObj = {
            id: Date.now(),
            user: studentName,
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdmin: false
        };
        socket.emit('send_live_chat', msgObj);
        setChatInput('');
    };

    const handleSendReaction = (type, emoji) => {
        const reactionObj = {
            type,
            emoji,
            left: Math.floor(Math.random() * 80) + 10 // random percentage across video
        };
        socket.emit('send_live_reaction', reactionObj);
    };

    const domains = ['All', 'Core Java', 'Data Structures & Algorithms', 'Python & AI', 'Cybersecurity', 'Web Development', 'System Design'];

    const filteredVideos = videos.filter(v => {
        const matchDomain = selectedDomain === 'All' || (v.domain && v.domain.toLowerCase().includes(selectedDomain.toLowerCase()));
        const matchSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchDomain && matchSearch;
    });

    return (
        <div style={styles.container}>
            {/* Header Banner */}
            <header style={styles.header}>
                <div>
                    <h1 style={styles.headerTitle}>
                        Recorded & Live <span className="text-gradient">Classes Studio</span>
                    </h1>
                    <p style={styles.headerSub}>
                        High-Definition Video Lectures, Live Interactive Broadcasts, and Real-Time Chat & Reactions.
                    </p>
                </div>
                {activeLive && (
                    <motion.div 
                        initial={{ scale: 0.9 }} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        onClick={() => setActiveTab('live')}
                        style={styles.liveBannerBadge}
                    >
                        <span style={styles.livePulseDot} /> 🔴 LIVE NOW: {activeLive.title}
                    </motion.div>
                )}
            </header>

            {/* Navigation Tabs */}
            <div style={styles.tabsRow}>
                <button 
                    onClick={() => setActiveTab('recorded')}
                    style={{...styles.navTab, ...(activeTab === 'recorded' ? styles.navTabActive : {})}}
                >
                    <Film size={18} /> Recorded Lectures ({videos.length})
                </button>
                <button 
                    onClick={() => setActiveTab('live')}
                    style={{...styles.navTab, ...(activeTab === 'live' ? styles.navTabActiveLive : {})}}
                >
                    <Radio size={18} color={activeLive ? "#ef4444" : "inherit"} /> 
                    Live Session {activeLive ? "🔴 (ACTIVE NOW)" : ""}
                </button>
            </div>

            {/* LIVE SESSION INSTAGRAM / YOUTUBE STYLE ROOM */}
            {activeTab === 'live' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.liveRoomContainer}>
                    {!activeLive ? (
                        <div className="glass-card" style={styles.noLiveCard}>
                            <Radio size={56} color="var(--text-sub)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>No Active Live Stream Right Now</h2>
                            <p style={{ color: 'var(--text-sub)', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                                When an Admin starts a live session, you will get an instant notification on the platform and via email. You will be able to join live stream broadcasts, chat, and react in real-time!
                            </p>
                            <button onClick={() => setActiveTab('recorded')} style={styles.watchRecordedBtn}>
                                Browse Recorded Lectures
                            </button>
                        </div>
                    ) : (
                        <div style={styles.liveStudioGrid}>
                            {/* Main Video Stream Container */}
                            <div style={styles.streamMainCol}>
                                <div style={styles.videoPlayerFrame}>
                                    {/* Live Header Overlay */}
                                    <div style={styles.streamTopOverlay}>
                                        <div style={styles.liveBadgeGroup}>
                                            <span style={styles.liveRedTag}>🔴 LIVE</span>
                                            <span style={styles.viewerBadge}><Eye size={14} /> {viewerCount} Watching</span>
                                        </div>
                                        <div style={styles.domainTag}>{activeLive.domain || 'General'}</div>
                                    </div>

                                    {/* Video Screen / Stream Broadcast */}
                                    {activeLive.stream_url && activeLive.stream_url.includes('youtube') ? (
                                        <iframe 
                                            src={activeLive.stream_url.replace('watch?v=', 'embed/')} 
                                            title="Live Stream" 
                                            style={{ width: '100%', height: '100%', border: 'none' }} 
                                            allow="autoplay; encrypted-media" 
                                            allowFullScreen 
                                        />
                                    ) : (
                                        <div style={styles.simulatedWebcamStream}>
                                            <div style={styles.streamBgGlow} />
                                            <Video size={72} color="#ef4444" style={{ filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.8))' }} />
                                            <h3 style={{ color: 'white', margin: '1rem 0 0.25rem 0' }}>{activeLive.title}</h3>
                                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Admin Live Broadcast Stream Active</p>
                                        </div>
                                    )}

                                    {/* Floating Animated Emojis (Insta Live Style) */}
                                    <div style={styles.floatingReactionsContainer}>
                                        <AnimatePresence>
                                            {reactions.map(r => (
                                                <motion.div
                                                    key={r.id}
                                                    initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                                    animate={{ opacity: 0, y: -250, scale: 1.5 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 2.5, ease: 'easeOut' }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '20px',
                                                        left: `${r.left}%`,
                                                        fontSize: '2rem',
                                                        pointerEvents: 'none',
                                                        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
                                                    }}
                                                >
                                                    {r.emoji}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {/* Bottom Control Bar & Reaction Bar */}
                                    <div style={styles.streamBottomBar}>
                                        <div style={styles.reactionButtonsGroup}>
                                            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => handleSendReaction('heart', '❤️')} style={{...styles.reactionBtn, background: 'rgba(239,68,68,0.2)', color: '#ef4444'}}>
                                                ❤️
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => handleSendReaction('fire', '🔥')} style={{...styles.reactionBtn, background: 'rgba(245,158,11,0.2)', color: '#f59e0b'}}>
                                                🔥
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => handleSendReaction('clap', '👏')} style={{...styles.reactionBtn, background: 'rgba(16,185,129,0.2)', color: '#10b981'}}>
                                                👏
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => handleSendReaction('rocket', '🚀')} style={{...styles.reactionBtn, background: 'rgba(14,165,233,0.2)', color: '#0ea5e9'}}>
                                                🚀
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.liveDetailsBox} className="glass-card">
                                    <h2 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>{activeLive.title}</h2>
                                    <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: 0 }}>{activeLive.description}</p>
                                </div>
                            </div>

                            {/* Live Chat Side Col */}
                            <div style={styles.chatSideCol} className="glass-card">
                                <div style={styles.chatHeader}>
                                    <MessageSquare size={18} color="var(--primary)" />
                                    <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>Live Stream Chat</h3>
                                </div>

                                {/* Pinned Comment Banner */}
                                {pinnedComment && (
                                    <div style={styles.pinnedBanner}>
                                        <Pin size={14} color="#d4af37" />
                                        <div style={{ fontSize: '0.8rem', color: '#fef08a' }}>
                                            <strong>Admin Pinned:</strong> {pinnedComment}
                                        </div>
                                    </div>
                                )}

                                {/* Chat Messages List */}
                                <div style={styles.chatMessagesArea}>
                                    {chatMessages.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '2rem 1rem', fontSize: '0.85rem' }}>
                                            No chat messages yet. Be the first to say hi to the Admin! 👋
                                        </div>
                                    ) : (
                                        chatMessages.map(msg => (
                                            <div key={msg.id} style={{
                                                ...styles.chatBubble,
                                                background: msg.isAdmin ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.05)',
                                                borderColor: msg.isAdmin ? 'var(--primary)' : 'transparent'
                                            }}>
                                                <div style={styles.chatUserRow}>
                                                    <span style={{ fontWeight: 800, color: msg.isAdmin ? '#38bdf8' : '#e2e8f0', fontSize: '0.85rem' }}>
                                                        {msg.user} {msg.isAdmin && '👑 (Admin)'}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{msg.time}</span>
                                                </div>
                                                <div style={{ color: 'white', fontSize: '0.9rem', marginTop: '0.2rem', wordBreak: 'break-word' }}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Chat Input Form */}
                                <form onSubmit={handleSendChat} style={styles.chatInputForm}>
                                    <input 
                                        type="text" 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Send a live message..."
                                        style={styles.chatInput}
                                    />
                                    <button type="submit" style={styles.chatSendBtn}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* RECORDED CLASSES HUB */}
            {activeTab === 'recorded' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Controls Bar */}
                    <div style={styles.controlsBar}>
                        <div style={styles.searchWrap}>
                            <Search size={18} color="var(--text-sub)" style={styles.searchIcon} />
                            <input 
                                type="text"
                                placeholder="Search high-definition video lectures..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>

                        <div style={styles.domainFilterRow}>
                            {domains.map(d => (
                                <button 
                                    key={d}
                                    onClick={() => setSelectedDomain(d)}
                                    style={{...styles.filterChip, ...(selectedDomain === d ? styles.filterChipActive : {})}}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video Grid */}
                    {filteredVideos.length === 0 ? (
                        <div className="glass-card" style={styles.emptyGrid}>
                            <Film size={48} color="var(--text-sub)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>No Videos Found</h3>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                                {searchQuery || selectedDomain !== 'All' ? 'Try adjusting your search or domain filter.' : 'Admin will be uploading high-quality lectures soon! Check back or check your email.'}
                            </p>
                        </div>
                    ) : (
                        <div style={styles.videoGrid}>
                            {filteredVideos.map(video => (
                                <motion.div 
                                    key={video.id}
                                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                    className="glass-card"
                                    style={styles.videoCard}
                                >
                                    {/* Thumbnail Frame */}
                                    <div style={styles.thumbFrame} onClick={() => setSelectedVideo(video)}>
                                        <img src={video.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt={video.title} style={styles.thumbImg} />
                                        <div style={styles.thumbOverlay}>
                                            <div style={styles.playIconCircle}>
                                                <Play size={24} color="#000" style={{ marginLeft: 3 }} />
                                            </div>
                                        </div>
                                        <span style={styles.qualityBadge}>{video.quality || '1080p Full HD'}</span>
                                        <span style={styles.durationBadge}>{video.duration || '15:00'}</span>
                                    </div>

                                    {/* Details */}
                                    <div style={styles.videoDetails}>
                                        <div style={styles.videoDomainTag}>{video.domain}</div>
                                        <h3 style={video.titleStyle || styles.videoTitle}>{video.title}</h3>
                                        <p style={styles.videoDesc}>{video.description}</p>
                                        <div style={styles.videoFooter}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                                                {new Date(video.date_uploaded).toLocaleDateString()}
                                            </span>
                                            <button onClick={() => setSelectedVideo(video)} style={styles.watchNowBtn}>
                                                Watch HD <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* VIDEO PLAYER MODAL */}
            {selectedVideo && (
                <div style={styles.modalOverlay} onClick={() => setSelectedVideo(null)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.playerModal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{selectedVideo.title}</h3>
                            <button onClick={() => setSelectedVideo(null)} style={styles.closeBtn}><X size={20}/></button>
                        </div>
                        <div style={styles.modalBody}>
                            {selectedVideo.video_url.includes('youtube') ? (
                                <iframe 
                                    src={selectedVideo.video_url.replace('watch?v=', 'embed/')} 
                                    title={selectedVideo.title}
                                    style={{ width: '100%', height: '480px', border: 'none', borderRadius: 12 }}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                            ) : (
                                <video controls autoPlay style={{ width: '100%', maxHeight: '480px', borderRadius: 12, background: '#000' }}>
                                    <source src={selectedVideo.video_url} type="video/mp4" />
                                    Your browser does not support video playback.
                                </video>
                            )}
                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: '#090d16' }}>
                            <div style={{ color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 700 }}>{selectedVideo.domain} • {selectedVideo.quality}</div>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.4rem', margin: 0 }}>{selectedVideo.description}</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { width: '100%', paddingBottom: '4rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
    headerTitle: { fontSize: '2.2rem', fontWeight: 900, color: 'white', margin: '0 0 0.5rem 0' },
    headerSub: { color: 'var(--text-sub)', fontSize: '0.95rem', margin: 0 },
    
    liveBannerBadge: { 
        background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', 
        color: '#f87171', padding: '0.6rem 1.2rem', borderRadius: 25, 
        fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', 
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
    },
    livePulseDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' },

    tabsRow: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
    navTab: { 
        padding: '0.8rem 1.5rem', borderRadius: 12, background: 'rgba(255,255,255,0.05)', 
        border: '1px solid var(--glass-border)', color: 'var(--text-sub)', fontWeight: 700, 
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' 
    },
    navTabActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)', boxShadow: '0 4px 15px rgba(14,165,233,0.4)' },
    navTabActiveLive: { background: '#ef4444', color: 'white', borderColor: '#ef4444', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' },

    // Recorded Grid Controls
    controlsBar: { display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' },
    searchWrap: { position: 'relative', width: '100%', maxWidth: 500 },
    searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' },
    searchInput: { 
        width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(15,23,42,0.8)', 
        border: '1px solid var(--glass-border)', borderRadius: 12, color: 'white', outline: 'none' 
    },
    domainFilterRow: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
    filterChip: { 
        padding: '0.5rem 1rem', borderRadius: 20, background: 'rgba(255,255,255,0.05)', 
        border: '1px solid var(--glass-border)', color: 'var(--text-sub)', fontSize: '0.85rem', 
        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
    },
    filterChipActive: { background: 'rgba(14,165,233,0.2)', borderColor: '#0ea5e9', color: '#38bdf8' },

    videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    videoCard: { borderRadius: 16, overflow: 'hidden', border: '1px solid var(--glass-border)' },
    thumbFrame: { position: 'relative', width: '100%', height: 180, cursor: 'pointer', overflow: 'hidden' },
    thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
    thumbOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 0.3s' },
    playIconCircle: { width: 54, height: 54, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,255,255,0.8)' },
    qualityBadge: { position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.8)', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(14,165,233,0.5)' },
    durationBadge: { position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 },
    
    videoDetails: { padding: '1.25rem' },
    videoDomainTag: { fontSize: '0.75rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' },
    videoTitle: { color: 'white', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.3 },
    videoDesc: { color: 'var(--text-sub)', fontSize: '0.85rem', margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    videoFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    watchNowBtn: { background: 'transparent', border: 'none', color: '#0ea5e9', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' },

    emptyGrid: { textAlign: 'center', padding: '4rem 2rem' },

    // LIVE STREAM STUDIO
    liveRoomContainer: { width: '100%' },
    noLiveCard: { textAlign: 'center', padding: '4rem 2rem' },
    watchRecordedBtn: { padding: '0.8rem 1.6rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' },

    liveStudioGrid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' },
    streamMainCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    videoPlayerFrame: { position: 'relative', width: '100%', height: 480, background: '#020617', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' },
    streamTopOverlay: { position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
    liveBadgeGroup: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
    liveRedTag: { background: '#ef4444', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 6, fontWeight: 900, fontSize: '0.8rem', boxShadow: '0 0 15px rgba(239,68,68,0.8)' },
    viewerBadge: { background: 'rgba(0,0,0,0.75)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' },
    domainTag: { background: 'rgba(14,165,233,0.2)', color: '#38bdf8', padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(14,165,233,0.4)' },

    simulatedWebcamStream: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)' },
    streamBgGlow: { position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)', filter: 'blur(30px)' },

    floatingReactionsContainer: { position: 'absolute', right: 20, bottom: 80, width: 100, height: 300, pointerEvents: 'none', zIndex: 20 },
    streamBottomBar: { position: 'absolute', bottom: 16, right: 16, zIndex: 25 },
    reactionButtonsGroup: { display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: 30, border: '1px solid rgba(255,255,255,0.1)' },
    reactionBtn: { width: 42, height: 42, borderRadius: '50%', border: 'none', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    liveDetailsBox: { padding: '1.5rem' },

    // Chat Side Column
    chatSideCol: { height: 560, display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden' },
    chatHeader: { padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.6rem' },
    pinnedBanner: { background: 'rgba(234,179,8,0.15)', borderBottom: '1px solid rgba(234,179,8,0.3)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' },
    chatMessagesArea: { flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
    chatBubble: { padding: '0.6rem 0.8rem', borderRadius: 10, border: '1px solid transparent' },
    chatUserRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chatInputForm: { padding: '0.8rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' },
    chatInput: { flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'white', padding: '0.6rem 0.8rem', outline: 'none', fontSize: '0.85rem' },
    chatSendBtn: { background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

    // Modal
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
    playerModal: { width: '100%', maxWidth: 840, background: '#0f172a', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--glass-border)' },
    modalHeader: { padding: '1rem 1.5rem', background: '#090d16', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' },
    modalBody: { position: 'relative', width: '100%' },
    closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }
};

export default LiveClasses;

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Send, User, Star, 
    BookOpen, Award, Mic, MicOff,
    ChevronDown, Minus, Square, Paperclip, Image
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ChatMentor = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([{ 
        role: "assistant", 
        content: "Hello! I am your Academic Mentor. I can help you with engineering concepts, interview preparation, or course doubts. You can type, use voice 🎙️, or send images/documents 📎. How can I assist you today?" 
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);
    const location = useLocation();

    // Setup speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (e) => {
                let final = '';
                let interim = '';
                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) final += e.results[i][0].transcript;
                    else interim += e.results[i][0].transcript;
                }
                if (final) {
                    setInput(prev => prev + (prev ? ' ' : '') + final);
                    setVoiceText('');
                } else {
                    setVoiceText(interim);
                }
            };

            recognitionRef.current.onend = () => {
                setIsVoiceActive(false);
                setVoiceText('');
            };

            recognitionRef.current.onerror = () => {
                setIsVoiceActive(false);
                setVoiceText('');
            };
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) scrollToBottom();
    }, [messages, isOpen, isMinimized]);

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            alert('Speech Recognition not supported. Please use Chrome.');
            return;
        }
        if (isVoiceActive) {
            recognitionRef.current.stop();
            setIsVoiceActive(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsVoiceActive(true);
            } catch (e) {
                console.error('Voice error:', e);
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('File too large. Max 5MB allowed.');
            return;
        }

        // Show file as a message
        const fileType = file.type;
        const reader = new FileReader();

        reader.onload = () => {
            if (fileType.startsWith('image/')) {
                // Show image preview in chat
                setMessages(prev => [...prev, { 
                    role: "user", 
                    content: `📎 Sent an image: ${file.name}`,
                    image: reader.result
                }]);
                // Send to AI with description
                sendToAI(`[User uploaded an image: ${file.name}]. Please acknowledge the image and ask what they need help with regarding it.`);
            } else {
                // PDF, DOC etc
                setMessages(prev => [...prev, { 
                    role: "user", 
                    content: `📄 Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                }]);
                sendToAI(`[User uploaded a document: ${file.name}, type: ${fileType}]. Please acknowledge the document and ask what specific help they need with it.`);
            }
        };

        if (fileType.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }

        // Reset file input
        e.target.value = '';
    };

    const sendToAI = async (userMsg) => {
        setIsTyping(true);
        try {
            const res = await fetch('/api/mentor_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    context: `User is viewing: ${location.pathname}. They are asking about: ${userMsg}`,
                    message: userMsg,
                    memory: messages.slice(-6) 
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                // Speak the reply if voice was recently used
                if (isVoiceActive || voiceText) {
                    speakReply(data.reply);
                }
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "I encountered a minor logic glitch. Could you try rephrasing?" }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "My connection to the AI core is currently weak. Please check your internet." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const speakReply = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 1.0;
            u.pitch = 1.0;
            window.speechSynthesis.speak(u);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput('');
        await sendToAI(userMsg);
    };

    return (
        <div style={styles.container}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            height: isMinimized ? 64 : 540 
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={styles.chatWindow}
                    >
                        {/* Custom Unique Header */}
                        <div style={styles.header}>
                            <div style={styles.headerInfo}>
                                <div style={styles.logoBadge}>
                                    <Award size={20} color="white" />
                                </div>
                                <div style={styles.headerText}>
                                    <span style={styles.botName}>AI Academic Mentor</span>
                                    <span style={styles.botStatus}>Online • Ready to Teach</span>
                                </div>
                            </div>
                            <div style={styles.headerActions}>
                                <button 
                                    onClick={() => setIsMinimized(!isMinimized)} 
                                    style={styles.actionBtn}
                                >
                                    {!isMinimized ? <Minus size={18} /> : <Square size={16} />}
                                </button>
                                <button 
                                    onClick={() => { setIsOpen(false); setIsMinimized(false); }} 
                                    style={styles.actionBtn}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Chat Interface */}
                                <div style={styles.chatBody}>
                                    {messages.map((msg, idx) => (
                                        <div key={idx} style={{ 
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '90%'
                                        }}>
                                            <div style={{
                                                ...styles.bubble,
                                                ...(msg.role === 'user' ? styles.userBubble : styles.botBubble)
                                            }}>
                                                {msg.image && (
                                                    <img src={msg.image} alt="uploaded" style={styles.chatImage} />
                                                )}
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div style={styles.typingIndicator}>
                                            <div className="spinner" style={{ width: 14, height: 14 }}></div>
                                            <span>Analyzing query...</span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Voice indicator */}
                                {isVoiceActive && (
                                    <div style={styles.voiceBar}>
                                        <div style={styles.voicePulse}></div>
                                        <span>{voiceText || 'Listening...'}</span>
                                    </div>
                                )}

                                {/* Footer/Input */}
                                <form onSubmit={handleSend} style={styles.footer}>
                                    <div style={styles.inputWrapper}>
                                        {/* File Upload */}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                            style={{ display: 'none' }} 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()} 
                                            style={styles.toolBtn}
                                            title="Send photo or document"
                                        >
                                            <Paperclip size={16} />
                                        </button>

                                        <input 
                                            type="text"
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            placeholder="Ask about VLSI, Java, DSA..."
                                            style={styles.input}
                                        />

                                        {/* Voice Button */}
                                        <button 
                                            type="button" 
                                            onClick={toggleVoice} 
                                            style={{
                                                ...styles.toolBtn, 
                                                color: isVoiceActive ? 'var(--danger)' : 'var(--text-sub)',
                                                background: isVoiceActive ? 'rgba(239,68,68,0.15)' : 'transparent'
                                            }}
                                            title="Voice input"
                                        >
                                            {isVoiceActive ? <MicOff size={16} /> : <Mic size={16} />}
                                        </button>

                                        <button type="submit" disabled={!input.trim() || isTyping} style={styles.sendBtn}>
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    style={styles.launcher}
                >
                    <div style={styles.launcherLogo}>
                        <Star size={32} color="white" />
                    </div>
                </motion.button>
            )}
        </div>
    );
};

const styles = {
    container: { position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 },
    chatWindow: {
        width: 400,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)',
        overflow: 'hidden'
    },
    header: { 
        padding: '1.25rem 1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(14, 165, 233, 0.2))',
        borderBottom: '1px solid var(--glass-border)'
    },
    headerInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
    logoBadge: { 
        width: 40, height: 40, borderRadius: 12, 
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 15px -5px var(--primary)'
    },
    headerText: { display: 'flex', flexDirection: 'column' },
    botName: { fontSize: '0.95rem', fontWeight: 800, color: 'white' },
    botStatus: { fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 },
    headerActions: { display: 'flex', gap: '0.5rem' },
    actionBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', padding: '0.25rem' },
    chatBody: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    bubble: { 
        padding: '0.8rem 1.2rem', 
        fontSize: '0.9rem', 
        lineHeight: 1.6, 
        maxWidth: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    botBubble: { 
        background: 'rgba(255,255,255,0.05)', 
        color: 'white', 
        borderRadius: '16px 16px 16px 4px',
        border: '1px solid var(--glass-border)'
    },
    userBubble: { 
        background: 'var(--primary)', 
        color: 'white', 
        borderRadius: '16px 16px 4px 16px',
        fontWeight: 500
    },
    chatImage: {
        maxWidth: '100%', maxHeight: 150, borderRadius: 12, marginBottom: '0.5rem', display: 'block'
    },
    typingIndicator: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.75rem', fontWeight: 600 },
    voiceBar: {
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.5rem 1.5rem',
        background: 'rgba(239, 68, 68, 0.08)',
        borderTop: '1px solid rgba(239,68,68,0.2)',
        color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600
    },
    voicePulse: {
        width: 10, height: 10, borderRadius: '50%',
        background: 'var(--danger)',
        animation: 'pulse 1.5s infinite'
    },
    footer: { padding: '1rem 1.25rem', borderTop: '1px solid var(--glass-border)' },
    inputWrapper: {
        background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', padding: '0 0.5rem', gap: '0.25rem'
    },
    input: { flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0.8rem 0.5rem', outline: 'none', fontSize: '0.9rem' },
    toolBtn: {
        background: 'transparent', border: 'none', color: 'var(--text-sub)',
        cursor: 'pointer', padding: '0.4rem', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
    },
    sendBtn: { 
        width: 36, height: 36, borderRadius: 10, 
        background: 'var(--primary)', color: 'white', 
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        cursor: 'pointer', transition: 'all 0.2s'
    },
    launcher: { 
        background: 'transparent', border: 'none', cursor: 'pointer',
        width: 80, height: 80, padding: 0
    },
    launcherLogo: {
        width: 80, height: 80, borderRadius: 24,
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 15px 35px -5px var(--primary-glow)',
        border: '2px solid rgba(255,255,255,0.2)'
    }
};

export default ChatMentor;

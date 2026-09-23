import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Eye, Shield, X } from 'lucide-react';

/**
 * ProctoringGuard — AI Anti-Cheating Engine
 * Wraps the Interview component and enforces proctoring rules.
 * 
 * Props:
 *   onAutoSubmit()     — Called when violations exceed threshold to force-submit
 *   onViolation(type)  — Called on each violation for logging
 *   children           — The Interview UI to render inside the guard
 */
const ProctoringGuard = ({ onAutoSubmit, onViolation, children }) => {
    const [violations, setViolations] = useState([]);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeAlert, setActiveAlert] = useState(null);
    const [showWarningOverlay, setShowWarningOverlay] = useState(false);
    const [pasteAttempts, setPasteAttempts] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [multiVoiceDetected, setMultiVoiceDetected] = useState(false);
    
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const audioStreamRef = useRef(null);
    const alertTimeoutRef = useRef(null);
    const MAX_TAB_SWITCHES = 2;
    const lastViolationTime = useRef({ type: null, time: 0 });

    // ─── Violation Logger ───
    const addViolation = useCallback((type, message) => {
        const now = Date.now();
        // Prevent spamming the same violation type more than once every 5 seconds
        if (lastViolationTime.current.type === type && (now - lastViolationTime.current.time) < 5000) {
            return;
        }
        lastViolationTime.current = { type, time: now };

        const v = { type, message, time: new Date().toLocaleTimeString() };
        setViolations(prev => [...prev, v]);
        onViolation?.(v);
        
        // Show alert safely
        setActiveAlert({ type, message });
        setShowWarningOverlay(true);
        
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => {
            setShowWarningOverlay(false);
            // Allow exit animation to run before wiping alert data
            setTimeout(() => setActiveAlert(null), 300);
        }, 3500);
    }, [onViolation]);

    // ─── 1. TAB SWITCH / WINDOW BLUR DETECTION ───
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount(prev => {
                    const newCount = prev + 1;
                    if (newCount >= MAX_TAB_SWITCHES) {
                        addViolation('TAB_SWITCH_FINAL', 
                            `Assessment auto-submitted! You switched tabs ${newCount} times.`);
                        setTimeout(() => onAutoSubmit?.(), 1000);
                    } else if (newCount === 1) {
                        addViolation('TAB_SWITCH_WARNING', 
                            `Warning: Tab switch detected (${newCount}/${MAX_TAB_SWITCHES}). Next switch = auto-submit!`);
                    }
                    return newCount;
                });
            }
        };

        const handleForceSubmit = () => {
            addViolation('PHONE_DETECTED', 'Phone or unauthorized device detected. Auto-submitting...');
            setTimeout(() => onAutoSubmit?.(), 500);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('force_auto_submit', handleForceSubmit);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('force_auto_submit', handleForceSubmit);
        };
    }, [addViolation, onAutoSubmit]);

    // ─── 2. COPY / PASTE / CUT BLOCKING ───
    useEffect(() => {
        const blockCopy = (e) => {
            e.preventDefault();
            addViolation('COPY_BLOCKED', 'Copy attempt blocked — this is flagged.');
        };
        const blockPaste = (e) => {
            e.preventDefault();
            setPasteAttempts(p => p + 1);
            addViolation('PASTE_PLAGIARISM', 'Paste attempt detected — PLAGIARISM FLAGGED!');
        };
        const blockCut = (e) => {
            e.preventDefault();
            addViolation('CUT_BLOCKED', 'Cut attempt blocked.');
        };

        document.addEventListener('copy', blockCopy);
        document.addEventListener('paste', blockPaste);
        document.addEventListener('cut', blockCut);

        return () => {
            document.removeEventListener('copy', blockCopy);
            document.removeEventListener('paste', blockPaste);
            document.removeEventListener('cut', blockCut);
        };
    }, [addViolation]);

    // ─── 3. RIGHT-CLICK DISABLE ───
    useEffect(() => {
        const blockRightClick = (e) => {
            e.preventDefault();
            addViolation('RIGHT_CLICK', 'Right-click blocked during assessment.');
        };
        document.addEventListener('contextmenu', blockRightClick);
        return () => document.removeEventListener('contextmenu', blockRightClick);
    }, [addViolation]);

    // ─── 4. FULLSCREEN ENFORCEMENT ───
    useEffect(() => {
        const enterFullscreen = async () => {
            try {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } catch (e) {
                console.warn('Fullscreen denied by browser');
            }
        };
        
        // Enter fullscreen on mount
        enterFullscreen();

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                addViolation('FULLSCREEN_EXIT', 'Fullscreen exited! Please click the window to return.');
            } else {
                setIsFullscreen(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, [addViolation]);

    // ─── 5. KEYBOARD SHORTCUT BLOCKING ───
    useEffect(() => {
        const blockShortcuts = (e) => {
            // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U, F12, PrintScreen
            if (e.ctrlKey && ['c','v','x','a','s','u'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                addViolation('SHORTCUT_BLOCKED', `Keyboard shortcut Ctrl+${e.key.toUpperCase()} blocked.`);
            }
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                addViolation('DEVTOOLS_BLOCKED', 'Developer tools shortcut blocked.');
            }
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                addViolation('SCREENSHOT_BLOCKED', 'Screenshot attempt detected!');
            }
        };
        
        document.addEventListener('keydown', blockShortcuts);
        return () => document.removeEventListener('keydown', blockShortcuts);
    }, [addViolation]);

    // ─── 6. VOICE ACTIVITY DETECTION (VAD) ───
    useEffect(() => {
        let animationFrameId;
        
        const teardownAudio = () => {
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
            if(audioStreamRef.current) audioStreamRef.current.getTracks().forEach(t => t.stop());
            if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(()=>{});
            }
            audioStreamRef.current = null;
        };

        const setupAudio = async () => {
            if(audioStreamRef.current) return; // already running
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStreamRef.current = stream;
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;
                
                const source = audioContextRef.current.createMediaStreamSource(stream);
                source.connect(analyserRef.current);
                
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                let highVolumeStreak = 0;
                let lastWhisperDetect = 0;
                
                const checkAudio = () => {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    
                    // Calculate average volume
                    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                    setAudioLevel(avg);
                    
                    // Detect unusual audio (multiple voices / whispering)
                    // High frequencies with moderate volume = whispering
                    const highFreqAvg = dataArray.slice(64).reduce((a, b) => a + b, 0) / (dataArray.length - 64);
                    const now = Date.now();
                    
                    if (avg > 60) {
                        highVolumeStreak++;
                        if (highVolumeStreak > 30) { // ~1 second of sustained loud audio
                            setMultiVoiceDetected(true);
                            if (now - lastWhisperDetect > 5000) {
                                addViolation('MULTI_VOICE', 'Multiple voices or background conversation detected!');
                                lastWhisperDetect = now;
                            }
                            highVolumeStreak = 0;
                        }
                    } else {
                        highVolumeStreak = Math.max(0, highVolumeStreak - 1);
                    }
                    
                    // Whispering / Keyboard Clicking detection
                    if (highFreqAvg > 20 && avg < 30 && avg > 8) {
                        if (now - lastWhisperDetect > 8000) { // 8 second debounce for typing noise
                            addViolation('WHISPER_DETECTED', 'Whispering or background typing pattern detected.');
                            lastWhisperDetect = now;
                        }
                    }
                    
                    animationFrameId = requestAnimationFrame(checkAudio);
                };
                
                checkAudio();
            } catch (e) {
                console.warn('Audio monitoring unavailable:', e.message);
            }
        };
        
        const handleToggle = (e) => {
            if(e.detail?.isRecording) teardownAudio();
            else setupAudio();
        };

        window.addEventListener('speech_toggle', handleToggle);
        setupAudio();
        
        return () => {
            window.removeEventListener('speech_toggle', handleToggle);
            teardownAudio();
        };
    }, [addViolation]);

    // ─── RENDER ───
    return (
        <div style={styles.guard}>
            {/* Proctoring Status Bar */}
            <div style={styles.statusBar}>
                <div style={styles.statusLeft}>
                    <Shield size={16} color="#10b981" />
                    <span style={styles.statusText}>AI Proctor Active</span>
                    <div style={{...styles.statusDot, background: isFullscreen ? '#10b981' : '#ef4444'}}></div>
                </div>
                <div style={styles.statusRight}>
                    <div style={styles.metricBadge}>
                        <Eye size={12} /> Monitoring
                    </div>
                    {tabSwitchCount > 0 && (
                        <div style={{...styles.metricBadge, background: 'rgba(239,68,68,0.15)', color: '#ef4444'}}>
                            Tab: {tabSwitchCount}/{MAX_TAB_SWITCHES}
                        </div>
                    )}
                    {pasteAttempts > 0 && (
                        <div style={{...styles.metricBadge, background: 'rgba(239,68,68,0.15)', color: '#ef4444'}}>
                            Plagiarism: {pasteAttempts}
                        </div>
                    )}
                    {violations.length > 0 && (
                        <div style={{...styles.metricBadge, background: 'rgba(245,158,11,0.15)', color: '#f59e0b'}}>
                            Flags: {violations.length}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            {children}

            {/* ─── TOAST WARNING NOTIFICATION ─── */}
            <AnimatePresence>
                {showWarningOverlay && activeAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        style={styles.toastAlert}
                    >
                        <div style={styles.toastIcon}>
                            <AlertTriangle size={24} color={
                                activeAlert.type.includes('PLAGIARISM') || activeAlert.type.includes('FINAL') 
                                    ? '#ef4444' : '#f59e0b'
                            } />
                        </div>
                        <div style={styles.toastContent}>
                            <h4 style={styles.toastTitle}>Suspicious Activity Detected</h4>
                            <p style={styles.toastMessage}>{activeAlert.message}</p>
                        </div>
                        <button onClick={() => setShowWarningOverlay(false)} style={styles.toastClose}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    guard: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' },
    statusBar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.5rem 1rem', marginBottom: '0.5rem',
        background: 'rgba(16, 185, 129, 0.06)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: 12
    },
    statusLeft: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statusText: { fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' },
    statusDot: { width: 8, height: 8, borderRadius: '50%', animation: 'pulse 2s infinite' },
    statusRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    metricBadge: {
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
        padding: '0.3rem 0.6rem', borderRadius: 8,
        fontSize: '0.7rem', fontWeight: 700
    },
    toastAlert: {
        position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #f59e0b',
        borderRadius: 16,
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(239, 68, 68, 0.2)',
        minWidth: 400,
        backdropFilter: 'blur(12px)'
    },
    toastIcon: { flexShrink: 0 },
    toastContent: { flex: 1 },
    toastTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 0.25rem 0' },
    toastMessage: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', margin: 0 },
    toastClose: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.25rem' }
};

export default ProctoringGuard;

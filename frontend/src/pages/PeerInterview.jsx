import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Users, Video, Mic, MicOff, VideoOff, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const PeerInterview = () => {
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    
    // Peer Connection & Sockets
    const socketRef = useRef(null);
    const myVideoRef = useRef(null);
    const peerVideoRef = useRef(null);
    
    // Simple UI state for demo
    const [camOn, setCamOn] = useState(false);
    const [micOn, setMicOn] = useState(false);

    useEffect(() => {
        // Setup Socket.IO connection
        socketRef.current = io();
        
        socketRef.current.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const joinRoom = () => {
        if (roomId.trim() !== '') {
            socketRef.current.emit('join_room', roomId);
            setJoined(true);
        }
    };

    const sendMessage = () => {
        if (messageInput.trim()) {
            const msgData = { room: roomId, text: messageInput, sender: 'You' };
            socketRef.current.emit('send_message', msgData);
            setMessages((prev) => [...prev, msgData]);
            setMessageInput('');
        }
    };

    const toggleCam = async () => {
        setCamOn(!camOn);
        if (!camOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
                if (myVideoRef.current) myVideoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Camera access denied", err);
            }
        } else {
            const stream = myVideoRef.current?.srcObject;
            stream?.getTracks().forEach(track => { if (track.kind === 'video') track.stop(); });
            if (myVideoRef.current) myVideoRef.current.srcObject = null;
        }
    };

    if (!joined) {
        return (
            <div style={styles.containerCenter}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={styles.joinCard}>
                    <Users size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Peer-to-Peer Interview</h2>
                    <p style={{ color: 'var(--text-sub)', marginBottom: '2rem', textAlign: 'center' }}>
                        Join a room to practice mock interviews with your friends or classmates in real-time.
                    </p>
                    <input 
                        style={styles.input}
                        placeholder="Enter Room Code (e.g. 1234)"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button onClick={joinRoom} style={styles.joinBtn}>Join Interview Room</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={styles.roomContainer}>
            <div style={styles.videoSection}>
                <div style={styles.videoHeader}>
                    <h3 style={{ color: 'white', margin: 0 }}>Room: {roomId}</h3>
                    <div style={styles.controls}>
                        <button onClick={toggleCam} style={{...styles.controlBtn, background: camOn ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}}>
                            {camOn ? <Video size={18}/> : <VideoOff size={18}/>}
                        </button>
                        <button onClick={() => setMicOn(!micOn)} style={{...styles.controlBtn, background: micOn ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}}>
                            {micOn ? <Mic size={18}/> : <MicOff size={18}/>}
                        </button>
                    </div>
                </div>
                
                <div style={styles.videoGrid}>
                    <div style={styles.videoWrapper}>
                        <video ref={myVideoRef} autoPlay playsInline muted style={styles.videoElem} />
                        {!camOn && <div style={styles.noVideo}>Camera Off</div>}
                        <div style={styles.nameTag}>You</div>
                    </div>
                    <div style={styles.videoWrapper}>
                        <video ref={peerVideoRef} autoPlay playsInline style={styles.videoElem} />
                        <div style={styles.noVideo}>Waiting for peer...</div>
                        <div style={styles.nameTag}>Peer</div>
                    </div>
                </div>
            </div>

            <div style={styles.chatSection}>
                <div style={styles.chatHeader}>
                    <MessageCircle size={18} /> Chat
                </div>
                <div style={styles.messages}>
                    {messages.map((m, i) => (
                        <div key={i} style={{...styles.messageItem, alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start', background: m.sender === 'You' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}}>
                            {m.text}
                        </div>
                    ))}
                </div>
                <div style={styles.chatInputArea}>
                    <input 
                        style={styles.chatInput}
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} style={styles.sendBtn}><Send size={16}/></button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    containerCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)' },
    joinCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', maxWidth: '400px', width: '100%' },
    input: { width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', marginBottom: '1.5rem', outline: 'none' },
    joinBtn: { width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' },
    
    roomContainer: { display: 'flex', gap: '1.5rem', height: 'calc(100vh - 120px)', width: '100%' },
    videoSection: { flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' },
    videoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' },
    controls: { display: 'flex', gap: '1rem' },
    controlBtn: { width: 44, height: 44, borderRadius: '50%', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' },
    
    videoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 },
    videoWrapper: { position: 'relative', background: 'black', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' },
    videoElem: { width: '100%', height: '100%', objectFit: 'cover' },
    noVideo: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: '1.1rem' },
    nameTag: { position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 1rem', borderRadius: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 600 },
    
    chatSection: { flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    chatHeader: { padding: '1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    messages: { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    messageItem: { padding: '0.6rem 1rem', borderRadius: '12px', color: 'white', maxWidth: '80%', fontSize: '0.9rem' },
    chatInputArea: { padding: '1rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--glass-border)' },
    chatInput: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' },
    sendBtn: { background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }
};

export default PeerInterview;

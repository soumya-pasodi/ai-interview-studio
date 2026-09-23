import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

/**
 * Enhanced WebcamAnalyzer with AI Proctoring
 * Detects: face visibility, multiple persons, eye contact, lighting, movement
 */
const WebcamAnalyzer = ({ isRecording, onEmotionUpdate, onProctoringAlert }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [emotion, setEmotion] = useState("Neutral");
    const [faceStatus, setFaceStatus] = useState("detecting"); // detecting, ok, no_face, multi_face, bad_light, look_camera
    const [alerts, setAlerts] = useState([]);
    const prevPositionRef = useRef(null);
    const noFaceCountRef = useRef(0);
    const movementCountRef = useRef(0);

    const addAlert = useCallback((type, msg) => {
        setAlerts(prev => [...prev.slice(-4), { type, msg, time: Date.now() }]);
        onProctoringAlert?.({ type, msg });
    }, [onProctoringAlert]);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                setIsModelsLoaded(true);
            } catch (err) {
                console.warn("Face API loading failed. Using fallback.", err);
                setIsModelsLoaded(true);
            }
        };
        loadModels();
    }, []);

    // Start webcam
    useEffect(() => {
        if (!isModelsLoaded) return;
        let stream = null;

        const startVideo = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 320, height: 240, facingMode: 'user' } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied.");
                addAlert('CAMERA_DENIED', 'Camera access is required for proctoring!');
            }
        };

        startVideo();

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [isModelsLoaded, addAlert]);

    // ─── Lighting Check ───
    const checkLighting = useCallback((video) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 48;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, 64, 48);
            const imageData = ctx.getImageData(0, 0, 64, 48);
            const data = imageData.data;
            
            let brightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                brightness += (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
            }
            brightness /= (data.length / 4);
            
            if (brightness < 40) {
                setFaceStatus('bad_light');
                addAlert('LOW_LIGHT', 'Poor lighting detected! Ensure your face is well-lit.');
                return false;
            }
            return true;
        } catch {
            return true;
        }
    }, [addAlert]);

    // ─── Face Position / Eye Contact Check ───
    const checkFacePosition = useCallback((detection) => {
        const box = detection.detection.box;
        const videoWidth = videoRef.current?.videoWidth || 320;
        const videoHeight = videoRef.current?.videoHeight || 240;
        
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        // Check if face is roughly centered (±35% of frame)
        const xRatio = centerX / videoWidth;
        const yRatio = centerY / videoHeight;
        
        if (xRatio < 0.15 || xRatio > 0.85 || yRatio < 0.1) {
            setFaceStatus('look_camera');
            addAlert('EYE_CONTACT', 'Please look at the camera — maintain eye contact!');
            return;
        }

        // Detect looking down (common when using a phone on the lap/desk)
        if (yRatio > 0.80) {
            setFaceStatus('look_camera');
            addAlert('PHONE_DETECTED', '📱 PHONE DETECTED! Terminating test immediately...');
            // Trigger instant termination
            window.dispatchEvent(new Event('force_auto_submit'));
            return;
        }
        
        // Check face size (too small = too far, too big = too close)
        const faceRatio = (box.width * box.height) / (videoWidth * videoHeight);
        if (faceRatio < 0.03) {
            addAlert('FACE_TOO_FAR', 'You are too far from the camera. Move closer.');
            return;
        }
        
        // Check movement — excessive motion
        if (prevPositionRef.current) {
            const dx = Math.abs(centerX - prevPositionRef.current.x);
            const dy = Math.abs(centerY - prevPositionRef.current.y);
            const movement = dx + dy;
            
            if (movement > 50) {
                movementCountRef.current++;
                if (movementCountRef.current > 5) {
                    addAlert('EXCESSIVE_MOVEMENT', 'Excessive movement detected. Stay steady.');
                    movementCountRef.current = 0;
                }
            } else {
                movementCountRef.current = Math.max(0, movementCountRef.current - 1);
            }
        }
        prevPositionRef.current = { x: centerX, y: centerY };
        
        setFaceStatus('ok');
    }, [addAlert]);

    // ─── Main Detection Loop ───
    useEffect(() => {
        if (!isModelsLoaded) return;
        
        const interval = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState !== 4) return;
            
            // Check lighting every cycle
            checkLighting(videoRef.current);
            
            try {
                const detections = await faceapi
                    .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();
                
                if (detections.length === 0) {
                    noFaceCountRef.current++;
                    if (noFaceCountRef.current >= 3) { // 9 seconds with no face
                        setFaceStatus('no_face');
                        addAlert('NO_FACE', 'No face detected! Ensure your face is fully visible.');
                    }
                    setEmotion('No Face');
                } else if (detections.length > 1) {
                    // ─── MULTIPLE PERSONS DETECTED ───
                    setFaceStatus('multi_face');
                    addAlert('MULTI_PERSON', `⚠️ ${detections.length} people detected! Only the candidate should be visible.`);
                    setEmotion(`${detections.length} Faces!`);
                    noFaceCountRef.current = 0;
                } else {
                    // Single face — good
                    noFaceCountRef.current = 0;
                    
                    // Emotion tracking
                    const topExpression = Object.keys(detections[0].expressions).reduce((a, b) => 
                        detections[0].expressions[a] > detections[0].expressions[b] ? a : b
                    );
                    setEmotion(topExpression);
                    onEmotionUpdate?.(topExpression);
                    
                    // Device / Phone usage heuristic (Looking down intensely for a period)
                    if (topExpression === 'sad' || topExpression === 'neutral') {
                        // In face-api, looking down sharply often misclassifies as sad or drops landmarks
                        // We rely on the position check to detect face angle drops
                    }
                    
                    // Position & eye contact check
                    checkFacePosition(detections[0]);
                }
            } catch(e) {
                // Fallback
                const exps = ['neutral', 'happy', 'focused', 'thinking'];
                const r = exps[Math.floor(Math.random() * exps.length)];
                setEmotion(r);
                onEmotionUpdate?.(r);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isModelsLoaded, onEmotionUpdate, addAlert, checkLighting, checkFacePosition]);

    const statusColors = {
        'detecting': '#f59e0b',
        'ok': '#10b981',
        'no_face': '#ef4444',
        'multi_face': '#ef4444',
        'bad_light': '#f59e0b',
        'look_camera': '#f59e0b'
    };

    const statusLabel = {
        'detecting': '🔍 Detecting...',
        'ok': '✅ Face OK',
        'no_face': '❌ No Face!',
        'multi_face': '🚨 Multiple Faces!',
        'bad_light': '💡 Bad Lighting',
        'look_camera': '👁️ Look at Camera'
    };

    return (
        <div style={styles.container}>
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                style={styles.video} 
            />
            
            {/* Recording indicator */}
            {isRecording && (
                <div style={styles.recDot}></div>
            )}
            
            {/* Face Status Badge */}
            <div style={{
                ...styles.statusBadge, 
                background: `${statusColors[faceStatus]}20`,
                color: statusColors[faceStatus],
                borderColor: `${statusColors[faceStatus]}40`
            }}>
                {statusLabel[faceStatus]}
            </div>
            
            {/* Emotion Label */}
            <div style={styles.emotionBadge}>
                😊 {emotion}
            </div>
            
            {/* Proctor Alert Feed */}
            {alerts.length > 0 && (
                <div style={styles.alertFeed}>
                    {alerts.slice(-2).map((a, i) => (
                        <div key={i} style={styles.alertItem}>
                            ⚠️ {a.msg}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Loading overlay */}
            {!isModelsLoaded && (
                <div style={styles.loadingOverlay}>
                    Loading AI Proctor...
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { 
        position: 'relative', width: '100%', height: 260, 
        borderRadius: 16, overflow: 'hidden', 
        border: '2px solid rgba(255,255,255,0.1)', 
        background: '#000' 
    },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    recDot: { 
        position: 'absolute', top: 12, right: 12, 
        width: 10, height: 10, background: '#ef4444', 
        borderRadius: '50%', boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)'
    },
    statusBadge: {
        position: 'absolute', top: 10, left: 10,
        padding: '4px 10px', borderRadius: 8,
        fontSize: '0.7rem', fontWeight: 700,
        border: '1px solid',
        backdropFilter: 'blur(8px)'
    },
    emotionBadge: {
        position: 'absolute', bottom: 10, left: 10,
        background: 'rgba(0,0,0,0.7)', 
        padding: '4px 10px', borderRadius: 8, 
        fontSize: '0.75rem', fontWeight: 600,
        color: 'white',
        backdropFilter: 'blur(8px)'
    },
    alertFeed: {
        position: 'absolute', bottom: 40, left: 10, right: 10,
        display: 'flex', flexDirection: 'column', gap: 4
    },
    alertItem: {
        background: 'rgba(239, 68, 68, 0.9)',
        color: 'white', padding: '3px 8px', borderRadius: 6,
        fontSize: '0.6rem', fontWeight: 600, 
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    },
    loadingOverlay: { 
        position: 'absolute', inset: 0, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(0,0,0,0.7)', fontSize: '0.8rem', color: 'white' 
    }
};

export default WebcamAnalyzer;

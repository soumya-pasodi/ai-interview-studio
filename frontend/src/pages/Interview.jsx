import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, CheckCircle, Code, 
    Save, XCircle, Info, Star,
    Cpu, Volume2, Clock, MessageSquare, Award
} from 'lucide-react';
import WebcamAnalyzer from '../components/WebcamAnalyzer';
import ProctoringGuard from '../components/ProctoringGuard';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

const MAX_QUESTIONS = 15;

const Interview = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const domain = searchParams.get('domain') || 'General';
    const resumeId = searchParams.get('resume_id');
    const isCodingDomain = domain === 'Coding Interview' || domain === 'Web Development';

    // Interview State
    const [interviewId, setInterviewId] = useState("id_" + Date.now());
    const [currentQNum, setCurrentQNum] = useState(1);
    const [currentQText, setCurrentQText] = useState("");
    const [askedQuestions, setAskedQuestions] = useState([]);
    const [skippedQuestions, setSkippedQuestions] = useState([]);
    const [totalScore, setTotalScore] = useState(0);
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [qaHistory, setQaHistory] = useState([]); // Memory of Q&A
    const [techScoreTotal, setTechScoreTotal] = useState(0);
    const [commScoreTotal, setCommScoreTotal] = useState(0);
    const [qualScoreTotal, setQualScoreTotal] = useState(0);
    
    // UI State
    const [answerData, setAnswerData] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [isAnsweringSkipped, setIsAnsweringSkipped] = useState(false);
    const [status, setStatus] = useState('loading_q'); // loading_q, answering, loading_eval, evaluating, summary
    const [isVoiceOnly, setIsVoiceOnly] = useState(false);
    
    const [evalData, setEvalData] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [fillerCount, setFillerCount] = useState(0);
    const [emotionsTracking, setEmotionsTracking] = useState([]);
    const [proctoringViolations, setProctoringViolations] = useState([]);
    
    const [interimText, setInterimText] = useState("");

    // Auto-submit on proctoring violation
    const handleProctoringAutoSubmit = useCallback(() => {
        const data = {
            id: interviewId, domain,
            currentQuestionNum: currentQNum,
            totalScore, askedQuestions, skippedQuestions,
            allStrengths: strengths, allWeaknesses: weaknesses, allSuggestions: suggestions,
            techScoreTotal, commScoreTotal, qualScoreTotal,
            terminatedBy: 'PROCTOR',
            violations: proctoringViolations,
            date: new Date().toLocaleDateString()
        };
        const inc = JSON.parse(localStorage.getItem('ai_portal_incomplete_interviews') || '[]');
        inc.unshift(data);
        localStorage.setItem('ai_portal_incomplete_interviews', JSON.stringify(inc));
        navigate('/performance');
    }, [interviewId, domain, currentQNum, totalScore, askedQuestions, skippedQuestions, strengths, weaknesses, proctoringViolations, navigate]);

    const handleProctoringViolation = useCallback((v) => {
        setProctoringViolations(prev => [...prev, v]);
    }, []);
    
    // Refs for intervals & APIs
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialization
    useEffect(() => {
        if (resumeId) {
            const inc = JSON.parse(localStorage.getItem('ai_portal_incomplete_interviews') || '[]');
            const state = inc.find(i => i.id === resumeId);
            if(state) {
                setInterviewId(state.id);
                setCurrentQNum(state.currentQuestionNum);
                setAskedQuestions(state.askedQuestions || []);
                setSkippedQuestions(state.skippedQuestions || []);
                setTotalScore(state.totalScore || 0);
                setQaHistory(state.qaHistory || []);
                setStrengths(state.allStrengths || []);
                setWeaknesses(state.allWeaknesses || []);
                setSuggestions(state.allSuggestions || []);
                setTechScoreTotal(state.techScoreTotal || 0);
                setCommScoreTotal(state.commScoreTotal || 0);
                setQualScoreTotal(state.qualScoreTotal || 0);
            }
        }
        
        // Setup Speech Recog
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if(SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (e) => {
                let finalT = '';
                let interimT = '';
                for(let i = e.resultIndex; i < e.results.length; ++i) {
                    if(e.results[i].isFinal) finalT += e.results[i][0].transcript;
                    else interimT += e.results[i][0].transcript;
                }
                
                setInterimText(interimT);

                if(finalT) {
                    const fillers = finalT.match(/\b(um|uh|like|you know|basically)\b/gi);
                    if (fillers) setFillerCount(p => p + fillers.length);
                    setAnswerData(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalT);
                }
            };
            recognitionRef.current.onerror = (event) => {
                console.warn("Speech recognition error:", event.error);
                if (event.error === 'not-allowed' || event.error === 'not-allowed') {
                    setIsRecording(false);
                    setIsVoiceOnly(false);
                    alert("Microphone access denied or unavailable. Voice-only mode disabled, you can now type your answer.");
                } else if (event.error === 'network') {
                    setIsRecording(false);
                    setIsVoiceOnly(false);
                    alert("Speech recognition network error. Your browser could not connect to the transcription servers. Voice-only mode disabled, you can now type your answer.");
                } else {
                    setIsRecording(false);
                    setIsVoiceOnly(false);
                }
            };
            recognitionRef.current.onend = () => {
                // If it ends but button wasn't explicitly turned off, we restart it.
                // However, since we can't easily access the latest isRecording state within this 
                // empty-dependency useEffect closure, we use a custom attribute or just check if we want it running.
                setIsRecording(prev => {
                    if (prev) {
                        try { recognitionRef.current.start(); } catch(e){}
                        return true;
                    }
                    return false;
                });
            };
        }

        fetchQuestion();
        
        return () => {
            clearInterval(timerRef.current);
            window.speechSynthesis.cancel();
        };
        // eslint-disable-next-line
    }, []);

    // Timer Logic
    useEffect(() => {
        if(status === 'answering' && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(p => {
                    if(p <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmitAuto();
                        return 0;
                    }
                    return p - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line
    }, [status]);
    const toggleSpeech = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setInterimText("");
            window.dispatchEvent(new CustomEvent('speech_toggle', { detail: { isRecording: false } }));
        } else {
            try {
                // Suspend conflicting hardware locks if possible
                window.dispatchEvent(new CustomEvent('speech_toggle', { detail: { isRecording: true } }));
                
                // Invoke synchronously - browser security policies reject async speech triggers
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (e) {
                console.warn('Speech recognition already started', e);
            }
        }
    };

    const handleSubmitAuto = () => {
        setAnswerData(prev => {
            const finalAns = prev || "No answer provided within time limit.";
            executeSubmit(finalAns);
            return finalAns;
        });
    };

    const fetchQuestion = async () => {
        setStatus('loading_q');
        setAnswerData('');

        if (currentQNum > MAX_QUESTIONS) {
            handleCompletionEmail();
            setStatus('summary');
            return;
        }

        let level = currentQNum > 8 ? 'hard' : (currentQNum > 4 ? 'medium' : 'easy');
        const prevScore = evalData && evalData.score ? parseFloat(evalData.score.split('/')[0]) : undefined;
        const mode = searchParams.get('mode') || 'Moderate';
        const resumeData = localStorage.getItem('ai_portal_resume_text') || '';

        try {
            const res = await fetch('/api/generate_question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    domain, 
                    level, 
                    askedQuestions, 
                    previousScore: prevScore,
                    qaHistory,
                    mode,
                    resumeData
                })
            });
            const data = await res.json();
            if(res.ok) {
                setCurrentQText(data.question);
                setAskedQuestions(prev => [...prev, data.question]);
                
                // GD and HR rounds should be mostly voice-based (90% chance)
                const isGDorHR = domain.includes('Group Discussion') || domain.includes('HR Interview');
                const voiceThreshold = isGDorHR ? 0.1 : 0.6;
                setIsVoiceOnly(!isCodingDomain && Math.random() > voiceThreshold);
                
                // Dynamic time allocation based on question type and length
                let timeLimit = 120;
                if (isCodingDomain) timeLimit = 300; // 5 mins for coding
                else if (data.question.length > 250) timeLimit = 180; // 3 mins for long questions
                else if (data.question.length > 100) timeLimit = 150; // 2.5 mins for medium questions
                
                setTimeRemaining(timeLimit);
                
                speakText(data.question);
                setStatus('answering');
            } else {
                setCurrentQText("Failed to load question.");
                setStatus('answering');
            }
        } catch(e) {
            setCurrentQText("Network Error connecting to server.");
            setStatus('answering');
        }
    };

    const evaluateResponseLocally = async (ans) => {
        setStatus('loading_eval');
        if(isRecording) toggleSpeech();
        
        try {
            const res = await fetch('/api/evaluate_answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: currentQText, answer: ans, isCode: isCodingDomain })
            });
            const data = await res.json();
            if(res.ok) {
                parseEval(data.evaluation);
                setStatus('evaluating');
            } else {
                alert("Evaluation failed");
                setStatus('answering');
            }
        } catch(e) {
            alert("Network error.");
            setStatus('answering');
        }
    };

    const handleSkip = () => {
        if (isRecording) {
            try { recognitionRef.current.stop(); } catch(e){}
            setIsRecording(false);
            setInterimText("");
        }

        setTotalScore(p => p + 0);
        setWeaknesses(p => [...p, "Skipped a question."]);
        setQaHistory(prev => [...prev, { q: currentQText, a: "[SKIPPED]" }]);
        
        setEvalData({ 
            score: "0/10", 
            techScore: 0, 
            commScore: 0, 
            qualScore: 0, 
            strength: "None", 
            missing: "The candidate chose to skip this question without attempting an answer.", 
            suggestion: "Always attempt to provide some reasoning or logic, even if you are unsure of the final answer." 
        });
        
        setCurrentQNum(p => p + 1);
        setStatus('evaluating');
    };

    const executeSubmit = (overrideAns = null) => {
        let finalCheck = overrideAns !== null ? overrideAns : answerData;
        
        if (isRecording) {
            finalCheck += " " + interimText;
            try { recognitionRef.current.stop(); } catch(e){}
            setIsRecording(false);
            setInterimText("");
        }
        
        finalCheck = finalCheck.trim();
        
        if(!finalCheck && timeRemaining > 0) return alert("Please provide an answer.");
        
        // Confidence Analysis for Voice-Only Questions
        if (isVoiceOnly) {
            if (fillerCount > 2) {
                setWeaknesses(p => [...p, "Excessive use of filler words (um, uh) during voice response. Work on speech confidence."]);
            } else if (finalCheck.length > 40) {
                setStrengths(p => [...p, "Excellent vocal confidence with clear, articulate presentation."]);
            }
        }

        evaluateResponseLocally(finalCheck);
        
        // Save to Q&A Memory for Cross-Questioning
        setQaHistory(prev => [...prev, { q: currentQText, a: finalCheck }]);
        
        if(!isAnsweringSkipped) setCurrentQNum(p => p + 1);
        setIsAnsweringSkipped(false);
        setFillerCount(0);
    };

    const parseEval = (text) => {
        let scoreStr = "--/10", strength = "", missing = "", suggestion = "";
        let tScore = 0, cScore = 0, qScore = 0;
        text.split('\n').forEach(l => {
            const tl = l.trim().toLowerCase();
            if(tl.startsWith('technical score:')) {
                scoreStr = l.substring(16).trim();
                let n = parseInt(scoreStr.split('/')[0]);
                if(!isNaN(n)) { tScore = n; setTechScoreTotal(p => p + n); }
            }
            if(tl.startsWith('communication score:')) {
                let n = parseInt(l.substring(20).trim().split('/')[0]);
                if(!isNaN(n)) { cScore = n; setCommScoreTotal(p => p + n); }
            }
            if(tl.startsWith('answer quality:')) {
                let n = parseInt(l.substring(15).trim().split('/')[0]);
                if(!isNaN(n)) { qScore = n; setQualScoreTotal(p => p + n); }
            }
            if(tl.startsWith('strength:')) strength = l.substring(9).trim();
            if(tl.startsWith('missing:')) missing = l.substring(8).trim();
            if(tl.startsWith('suggestion:')) suggestion = l.substring(11).trim();
        });
        
        let avgScore = Math.round((tScore + cScore + qScore) / 3);
        if (isNaN(avgScore)) avgScore = 0;
        setTotalScore(p => p + avgScore);

        if(strength) setStrengths(p => [...p, strength]);
        if(missing) setWeaknesses(p => [...p, missing]);
        if(suggestion) setSuggestions(p => [...p, suggestion]);
        setEvalData({ score: avgScore + "/10", techScore: tScore, commScore: cScore, qualScore: qScore, strength, missing, suggestion });
    };

    const handleCompletionEmail = async () => {
        try {
            const user = localStorage.getItem('ai_portal_username') || 'Student';
            const email = localStorage.getItem('ai_portal_user_email');

            // Construct and Save the Final Performance Record
            const userKey = `ai_portal_interviews_${user}`;
            const hist = JSON.parse(localStorage.getItem(userKey) || '[]');
            const percentage = Math.min(100, Math.round((totalScore / (MAX_QUESTIONS * 10)) * 100)).toString();
            const normalizedScore = (totalScore / MAX_QUESTIONS).toFixed(1);
            
            const finalRecord = {
                id: interviewId,
                domain: domain,
                date: new Date().toLocaleDateString(),
                score: normalizedScore,
                percentage: percentage,
                techScoreTotal, commScoreTotal, qualScoreTotal,
                strengths: strengths,
                weaknesses: weaknesses,
                suggestions: suggestions
            };
            
            hist.unshift(finalRecord);
            localStorage.setItem(userKey, JSON.stringify(hist));

            // Save to Backend Database & Auto-Check Topic Certificate Request
            fetch('/api/user/save-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user,
                    domain: domain,
                    score: normalizedScore,
                    feedback: `Completed assessment with score ${normalizedScore}/10`
                })
            }).catch(() => {});

            // Remove from incomplete queue if it existed
            const inc = JSON.parse(localStorage.getItem(`ai_portal_incomplete_interviews_${user}`) || '[]');
            const fil = inc.filter(i => i.id !== interviewId);
            localStorage.setItem(`ai_portal_incomplete_interviews_${user}`, JSON.stringify(fil));

            // Check Placement Drive Logic
            const params = new URLSearchParams(location.search);
            if (params.get('isPlacement') === 'true') {
                const roundName = params.get('round') || 'technical';
                let pScores = JSON.parse(localStorage.getItem('placement_round_scores') || '{}');
                pScores[roundName] = parseInt(percentage);
                localStorage.setItem('placement_round_scores', JSON.stringify(pScores));
                if (parseInt(percentage) < 50) {
                    localStorage.setItem('placement_drive_eliminated', 'true');
                } else {
                    let nextProgress = '2';
                    if (roundName === 'gd') nextProgress = '3';
                    if (roundName === 'hr') nextProgress = '4';
                    localStorage.setItem('placement_drive_progress', nextProgress);
                }
            }

            if (!email) return;
            
            await fetch('/api/notify_complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: user, 
                    email: email,
                    domain, 
                    score: normalizedScore 
                })
            });
        } catch (e) {
            console.error("Failed to send completion email", e);
        }
    };

    const handleQuit = async () => {
        if(window.confirm("Pause and save session? An update will be sent to your email.")) {
            if(!window.confirm("Are you absolutely sure you want to exit? Your session will be interrupted.")) return;
            
            const inc = JSON.parse(localStorage.getItem('ai_portal_incomplete_interviews') || '[]');
            const fil = inc.filter(i => i.id !== interviewId);
            const pauseData = {
                id: interviewId, domain, 
                currentQuestionNum: Math.min(currentQNum, MAX_QUESTIONS),
                totalScore, askedQuestions, skippedQuestions, qaHistory,
                allStrengths: strengths, allWeaknesses: weaknesses, allSuggestions: suggestions,
                techScoreTotal, commScoreTotal, qualScoreTotal,
                date: new Date().toLocaleDateString()
            };
            fil.unshift(pauseData);
            localStorage.setItem('ai_portal_incomplete_interviews', JSON.stringify(fil));
            
            // Trigger Email Notification
            try {
                const user = localStorage.getItem('ai_portal_username') || 'Student';
                const email = localStorage.getItem('ai_portal_user_email');
                if (email) {
                    await fetch('/api/notify_pause', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            username: user, 
                            email: email, 
                            domain, 
                            questionNum: currentQNum 
                        })
                    });
                }
            } catch (e) {
                console.error("Failed to send pause email", e);
            }

            navigate(new URLSearchParams(location.search).get('returnTo') || '/performance');
        }
    };

    const speakText = (txt) => {
        if('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(txt);
            u.rate = 1.0;
            u.pitch = 1.0;
            window.speechSynthesis.speak(u);
        }
    };

    const min = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const sec = (timeRemaining % 60).toString().padStart(2, '0');

    if (status === 'summary') {
        const finalTech = Math.round((techScoreTotal / (MAX_QUESTIONS * 10)) * 100) || 0;
        const finalComm = Math.round((commScoreTotal / (MAX_QUESTIONS * 10)) * 100) || 0;
        const finalQual = Math.round((qualScoreTotal / (MAX_QUESTIONS * 10)) * 100) || 0;
        const finalAvg = Math.round((totalScore / (MAX_QUESTIONS * 10)) * 100) || 0;

        return (
            <div style={styles.summaryContainer}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={styles.summaryCard}>
                    <Award size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Interview Concluded</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 12 }}>
                            <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Technical</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalTech}%</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 12 }}>
                            <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Communication</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalComm}%</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 12 }}>
                            <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Answer Quality</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalQual}%</div>
                        </div>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 12, border: '1px solid var(--primary)' }}>
                            <div style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Overall Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{finalAvg}%</div>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Detailed analytics have been saved to your dashboard.</p>
                    <button onClick={() => navigate(new URLSearchParams(location.search).get('returnTo') || '/performance')} className="primary-btn">View Full Performance Report</button>
                </motion.div>
            </div>
        );
    }

    return (
        <ProctoringGuard onAutoSubmit={handleProctoringAutoSubmit} onViolation={handleProctoringViolation}>
        <div style={styles.interviewRoom}>
            {/* Top Stats Bar */}
            <div style={styles.topBar}>
                <div style={styles.barLeft}>
                    <div style={styles.badge}><Cpu size={14}/> {domain}</div>
                    <div style={styles.stepInfo}>Question {currentQNum} <span style={{ color: 'var(--text-sub)' }}>/ {MAX_QUESTIONS}</span></div>
                </div>
                
                <div style={{...styles.timer, color: timeRemaining < 30 ? 'var(--danger)' : 'white'}}>
                    <Clock size={18} /> {min}:{sec}
                </div>

                <div style={styles.barRight}>
                    <button onClick={handleQuit} style={styles.quitBtn}><Save size={16}/> Pause & Save</button>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* Left Side: Interaction */}
                <div style={styles.interactionZone}>
                    {status === 'loading_q' ? (
                        <div style={styles.loadingBox}><div className="spinner"></div><span>AI is formulating next question...</span></div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key={currentQText} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={styles.questionCard}>
                                <div style={styles.interviewerTitle}><Star size={16}/> AI Interviewer</div>
                                <div style={styles.qText}>{currentQText}</div>
                                <button onClick={() => speakText(currentQText)} style={styles.speakBtn}><Volume2 size={16}/></button>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {status === 'evaluating' ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={styles.evalCard}>
                            <div style={styles.evalScore}>Score: <span style={{ color: 'var(--success)' }}>{evalData?.score}</span></div>
                            <div style={styles.evalDetailed}>
                                <div style={styles.evalItem}><strong>Technical:</strong> {evalData?.techScore}/10 | <strong>Communication:</strong> {evalData?.commScore}/10</div>
                                <div style={styles.evalItem}><strong>Strengths:</strong> {evalData?.strength}</div>
                                <div style={styles.evalItem}><strong>Missing:</strong> {evalData?.missing}</div>
                                <div style={styles.evalItem}><strong>Suggestion:</strong> {evalData?.suggestion}</div>
                            </div>
                            <button onClick={fetchQuestion} className="primary-btn" style={{ width: '100%', marginTop: 'auto' }}>
                                Next Question <ChevronRight size={18}/>
                            </button>
                        </motion.div>
                    ) : (
                        <div className="glass-card" style={styles.answerBox}>
                            <div style={styles.answerHeader}>
                                {isCodingDomain ? <Code size={18}/> : <MessageSquare size={18}/>}
                                <span>{isCodingDomain ? 'Code Editor' : 'Verbal Response'}</span>
                            </div>

                            {isCodingDomain ? (
                                <CodeMirror
                                    value={answerData}
                                    height="300px"
                                    theme="dark"
                                    extensions={[javascript({ jsx: true })]}
                                    onChange={(v) => setAnswerData(v)}
                                    className="cm-custom"
                                />
                            ) : isVoiceOnly ? (
                                <div 
                                    onClick={toggleSpeech}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12, cursor: 'pointer' }}
                                >
                                    <Mic size={48} color={isRecording ? 'var(--danger)' : 'var(--text-sub)'} style={{ marginBottom: '1rem', transition: 'all 0.3s' }} />
                                    <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Voice-Only Question</h3>
                                    <p style={{ color: 'var(--text-sub)', textAlign: 'center', maxWidth: '80%' }}>Typing is disabled. You must speak your answer. Click anywhere here or the microphone below to begin.</p>
                                    <p style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 600 }}>Analyzing confidence & presentation...</p>
                                </div>
                            ) : (
                                <textarea 
                                    style={styles.textArea} value={answerData} 
                                    onChange={e => setAnswerData(e.target.value)}
                                    placeholder="Type or dictate your answer..." 
                                />
                            )}

                            <div style={styles.answerControls}>
                                <button 
                                    onClick={toggleSpeech} 
                                    style={{...styles.micBtn, background: isRecording ? 'var(--danger)' : 'rgba(255,255,255,0.05)'}}
                                >
                                    {isRecording ? <MicOff size={20}/> : <Mic size={20}/>}
                                </button>
                                
                                {/* Live Transcription Bubble */}
                                <AnimatePresence>
                                    {isRecording && interimText && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            style={styles.transcriptionBubble}
                                        >
                                            <span style={styles.liveIndicator}>LIVE</span> {interimText}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div style={styles.actionBtns}>
                                    <button onClick={handleSkip} style={styles.skipBtn}>Skip</button>
                                    <button onClick={() => executeSubmit()} style={styles.submitBtn}>Submit Answer</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Visuals */}
                <div style={styles.visualZone}>
                    <div className="glass-card" style={styles.webcamCard}>
                        <WebcamAnalyzer isRecording={isRecording} onEmotionUpdate={(e) => setEmotionsTracking(p => [...p, e])} onProctoringAlert={handleProctoringViolation} />
                    </div>
                    
                    <div className="glass-card" style={styles.hintsCard}>
                        <h4><Info size={16}/> Professional Tips</h4>
                        <ul>
                            <li>Maintain eye contact with the lens.</li>
                            <li>Structure your answer using the STAR method.</li>
                            <li>Pause briefly before answering complex logic.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        </ProctoringGuard>
    );
};

const ChevronRight = ({ size }) => <span style={{ fontSize: size }}>→</span>;

const styles = {
    interviewRoom: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' },
    barLeft: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
    badge: { background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    stepInfo: { fontSize: '0.9rem', fontWeight: 700 },
    timer: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace' },
    barRight: { display: 'flex', gap: '1rem' },
    quitBtn: { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', flex: 1 },
    interactionZone: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    loadingBox: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-sub)' },
    questionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: 24, position: 'relative' },
    interviewerTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' },
    qText: { fontSize: '1.5rem', fontWeight: 700, color: 'white', lineHeight: 1.4 },
    speakBtn: { position: 'absolute', right: '1.5rem', bottom: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' },
    answerBox: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 },
    answerHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 },
    textArea: { background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', resize: 'none', flex: 1, outline: 'none', lineHeight: 1.6 },
    answerControls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' },
    micBtn: { width: 48, height: 48, borderRadius: '50%', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
    actionBtns: { display: 'flex', gap: '1rem' },
    skipBtn: { background: 'transparent', color: 'var(--warning)', border: 'none', fontWeight: 700, cursor: 'pointer' },
    submitBtn: { background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 15px -5px var(--primary-glow)' },
    transcriptionBubble: {
        position: 'absolute', left: '70px', bottom: '15px',
        background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)',
        padding: '0.6rem 1.2rem', borderRadius: '14px', border: '1px solid var(--glass-border)',
        fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic',
        maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem'
    },
    liveIndicator: {
        background: 'var(--danger)', color: 'white', fontSize: '0.65rem',
        fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: '4px',
        animation: 'pulse 1.5s infinite'
    },
    visualZone: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    webcamCard: { height: 260, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    hintsCard: { padding: '1.5rem' },
    evalCard: { padding: '2rem', flex: 1, background: 'rgba(16, 185, 129, 0.05)', display: 'flex', flexDirection: 'column' },
    evalScore: { fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem' },
    evalDetailed: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
    evalItem: { fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-sub)' },
    summaryContainer: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    summaryCard: { maxWidth: 500, padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }
};

export default Interview;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, ArrowRight, Loader, Brain, RefreshCcw, ArrowLeft
} from 'lucide-react';
import ProctoringGuard from '../components/ProctoringGuard';
import WebcamAnalyzer from '../components/WebcamAnalyzer';

const MCQ = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [domain, setDomain] = useState('');
    const [qCount, setQCount] = useState(25);
    const [timeLeft, setTimeLeft] = useState(null);

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState('');
    const [userChoices, setUserChoices] = useState([]);
    
    // Proctoring states
    const [proctoringViolations, setProctoringViolations] = useState([]);

    const finishAssessmentRef = useRef(null);
    const timerRef = useRef(null);


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const d = params.get('domain');
        const count = params.get('count') ? parseInt(params.get('count')) : 25;
        const time = params.get('timeLimit') ? parseInt(params.get('timeLimit')) * 60 : null;
        
        if (d) {
            setDomain(d);
            setQCount(count);
            if (time) setTimeLeft(time);
            fetchQuestions(d, count);
        } else {
            setError('No domain specified for assessment.');
            setLoading(false);
        }
    }, [location]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !isComplete && !loading) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsComplete(true);
                        if (finishAssessmentRef.current) finishAssessmentRef.current();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, isComplete, loading]);

    const fetchQuestions = async (assessmentDomain, count) => {
        setLoading(true);
        setError('');
        setUserChoices([]);
        try {
            const res = await fetch('/api/generate_mcq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: assessmentDomain, count: count })
            });
            const data = await res.json();
            if (data.questions && data.questions.length > 0) {
                const normalizedQuestions = data.questions.map(q => {
                    let ans = q.answer;
                    if (typeof ans === 'string') {
                        const parsed = parseInt(ans, 10);
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {
                            ans = parsed;
                        } else if (['A', 'B', 'C', 'D'].includes(ans.toUpperCase())) {
                            ans = ans.toUpperCase().charCodeAt(0) - 65;
                        } else {
                            const foundIndex = q.options.findIndex(o => o.trim().toLowerCase() === ans.trim().toLowerCase());
                            if (foundIndex !== -1) ans = foundIndex;
                        }
                    }
                    return { ...q, answer: ans };
                });
                setQuestions(normalizedQuestions);
            } else {
                setError('Failed to generate questions. Please try again.');
            }
        } catch (err) {
            setError('Server connection error. Ensure the backend is running.');
        }
        setLoading(false);
    };

    const handleOptionSelect = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;

        setIsAnswered(true);
        const currentQ = questions[currentIndex];

        setUserChoices(prev => {
            const newChoices = [...prev];
            newChoices[currentIndex] = selectedOption;
            return newChoices;
        });

        if (selectedOption === currentQ.answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsComplete(true);
            finishAssessment();
        }
    };

    const finishAssessment = async () => {
        // 1. Gather wrong questions for AI Feedback
        const incorrectTopics = questions
            .filter((q, idx) => userChoices[idx] !== q.answer)
            .map(q => q.question);

        let strengths = ["Good attempt on the MCQ test."];
        let weaknesses = ["Review your incorrect answers from the Detailed Feedback Report."];

        try {
            const fbRes = await fetch('/api/generate_mcq_feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: domain,
                    score: score,
                    total: questions.length,
                    incorrectTopics: incorrectTopics.slice(0, 5) // Send up to 5 wrong questions to keep prompt concise
                })
            });
            const fbData = await fbRes.json();
            if (fbData.strengths && fbData.strengths.length > 0) strengths = fbData.strengths;
            if (fbData.weaknesses && fbData.weaknesses.length > 0) weaknesses = fbData.weaknesses;
        } catch (e) {
            console.error("Failed to generate AI feedback for performance tab.");
        }

        // 2. Save to Performance History
        const percentage = ((score / questions.length) * 100).toFixed(0);
        const tabSwitchCount = proctoringViolations.filter(v => v.type && v.type.includes('TAB_SWITCH')).length;

        const newRecord = {
            id: Date.now().toString(),
            domain: domain + " (MCQ)",
            date: new Date().toLocaleDateString(),
            duration: "N/A",
            score: ((score / questions.length) * 10).toFixed(1), // Normalize to /10 scale for performance chart
            percentage: percentage,
            strengths: strengths,
            weaknesses: weaknesses,
            dominantEmotion: "Analytical",
            fillers: 0,
            violations: proctoringViolations,
            tabSwitches: tabSwitchCount,
            mistakes: incorrectTopics
        };

        const username = localStorage.getItem('ai_portal_username') || 'Student';
        const userKey = `ai_portal_interviews_${username}`;
        const existingHist = JSON.parse(localStorage.getItem(userKey) || '[]');
        localStorage.setItem(userKey, JSON.stringify([newRecord, ...existingHist]));

        // Save to Backend Database & Check Topic Certificate
        fetch('/api/user/save-interview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                domain: domain,
                score: newRecord.score,
                feedback: `Completed MCQ assessment with ${percentage}% score`
            })
        }).catch(() => {});

        // Check Placement Drive Logic
        if (new URLSearchParams(location.search).get('isPlacement') === 'true') {
            let pScores = JSON.parse(localStorage.getItem('placement_round_scores') || '{}');
            pScores.aptitude = parseInt(percentage);
            localStorage.setItem('placement_round_scores', JSON.stringify(pScores));
            if (parseInt(percentage) < 50) {
                localStorage.setItem('placement_drive_eliminated', 'true');
            } else {
                localStorage.setItem('placement_drive_progress', '1');
            }
        }

        // 3. Notify Completion via Email
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            try {
                await fetch('/api/notify_complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: user.username,
                        email: user.profile?.email,
                        domain: domain + " (MCQ)",
                        score: newRecord.score, // Send the /10 normalized score
                        violations: proctoringViolations,
                        tabSwitches: tabSwitchCount,
                        mistakes: incorrectTopics
                    })
                });
            } catch (e) {
                console.log("Failed to notify completion");
            }
        }
    };

    useEffect(() => {
        finishAssessmentRef.current = finishAssessment;
    }, [finishAssessment]);

    const handleProctoringAutoSubmit = useCallback(() => {
        setIsComplete(true);
        if (finishAssessmentRef.current) finishAssessmentRef.current();
    }, []);

    const handleProctoringViolation = useCallback((v) => {
        setProctoringViolations(prev => [...prev, v]);
    }, []);

    if (loading) {
        return (
            <div style={styles.containerCenter}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                    <Brain size={48} color="var(--primary)" />
                </motion.div>
                <h2 style={{ marginTop: '1rem', color: 'white' }}>Generating AI Assessment...</h2>
                <p style={{ color: 'var(--text-sub)' }}>Analyzing domain requirements and crafting {qCount} precise MCQs. This may take up to 30 seconds.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.containerCenter}>
                <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}><XCircle size={48} /></div>
                <h2 style={{ color: 'white', marginBottom: '1rem' }}>Assessment Generation Failed</h2>
                <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>{error}</p>
                <button onClick={() => navigate(new URLSearchParams(location.search).get('returnTo') || '/dashboard')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Exit
                </button>
            </div>
        );
    }

    if (isComplete) {
        const percentage = Math.round((score / questions.length) * 100);
        let message = "Keep Practicing!";
        let color = "var(--warning)";
        if (percentage >= 80) { message = "Excellent Performance!"; color = "var(--success)"; }
        else if (percentage >= 60) { message = "Good Job!"; color = "var(--primary)"; }

        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginBottom: '1.5rem', color, display: 'flex', justifyContent: 'center' }}>
                        <CheckCircle size={80} />
                    </motion.div>
                    <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '0.5rem' }}>{percentage}%</h1>
                    <h2 style={{ color, marginBottom: '1rem' }}>{message}</h2>
                    <p style={{ color: 'var(--text-sub)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                        You scored {score} out of {questions.length} in <strong>{domain}</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
                        <button onClick={() => navigate(new URLSearchParams(location.search).get('returnTo') || '/dashboard')} className="btn btn-outline">
                            Exit Assessment
                        </button>
                        <button onClick={() => {
                            setIsComplete(false);
                            setScore(0);
                            setCurrentIndex(0);
                            setSelectedOption(null);
                            setIsAnswered(false);
                            setProctoringViolations([]);
                            fetchQuestions(domain);
                        }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCcw size={16} /> Re-Attempt Test
                        </button>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
                    <h2 style={{ color: 'white', marginBottom: '2rem', textAlign: 'center' }}>Detailed Feedback Report</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {questions.map((q, idx) => {
                            const userChoice = userChoices[idx];
                            const isCorrect = userChoice === q.answer;
                            return (
                                <div key={idx} className="glass-card" style={{ padding: '2rem', borderLeft: `${isCorrect ? '4px solid var(--success)' : '4px solid var(--danger)'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ marginTop: '0.25rem' }}>
                                            {isCorrect ? <CheckCircle size={24} color="var(--success)" /> : <XCircle size={24} color="var(--danger)" />}
                                        </div>
                                        <div>
                                            <h3 style={{ color: 'white', fontSize: '1.1rem', lineHeight: 1.5 }}>
                                                {idx + 1}. {q.question}
                                            </h3>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginLeft: '2.5rem', marginBottom: '1.5rem' }}>
                                        {q.options.map((opt, optIdx) => {
                                            let bg = 'rgba(255,255,255,0.03)';
                                            let border = '1px solid var(--glass-border)';

                                            if (optIdx === q.answer) {
                                                bg = 'rgba(16, 185, 129, 0.15)';
                                                border = '1px solid var(--success)';
                                            } else if (optIdx === userChoice && !isCorrect) {
                                                bg = 'rgba(239, 68, 68, 0.15)';
                                                border = '1px solid var(--danger)';
                                            }

                                            return (
                                                <div key={optIdx} style={{ padding: '0.75rem 1rem', background: bg, border: border, borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                                    <span style={{ fontWeight: 700, marginRight: '0.75rem', opacity: 0.7 }}>{String.fromCharCode(65 + optIdx)}</span>
                                                    {opt}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ marginLeft: '2.5rem', background: 'rgba(236, 72, 153, 0.05)', padding: '1rem 1.5rem', borderRadius: '8px', borderLeft: '2px solid var(--accent)' }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Explanation:</span>
                                        <span style={{ color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: 1.5 }}>{q.explanation}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <ProctoringGuard onAutoSubmit={handleProctoringAutoSubmit} onViolation={handleProctoringViolation}>
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.domainTitle}>{domain}</h1>
                    <p style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {timeLeft !== null && (
                        <div style={{ color: timeLeft < 60 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700, fontSize: '1.2rem' }}>
                            ⏱️ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                    )}
                    <div style={styles.scoreBadge}>Score: {score}</div>
                    <button 
                        onClick={() => {
                            if(window.confirm("Are you sure you want to exit the assessment early?")) {
                                if(window.confirm("Absolutely sure? Your progress will be lost and you may be penalized if this is a proctored exam.")) {
                                    navigate(new URLSearchParams(location.search).get('returnTo') || '/dashboard');
                                }
                            }
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                    >
                        Exit
                    </button>
                </div>
            </div>

            <div style={styles.progressContainer}>
                <div style={{ ...styles.progressBar, width: `${((currentIndex) / questions.length) * 100}%` }} />
            </div>

            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card"
                style={styles.questionCard}
            >
                <h2 style={styles.questionText}>{currentQ.question}</h2>

                <div style={styles.optionsGrid}>
                    {currentQ.options.map((option, idx) => {
                        let btnStyle = { ...styles.optionBtn };
                        let icon = null;

                        if (isAnswered) {
                            if (idx === currentQ.answer) {
                                btnStyle.background = 'rgba(16, 185, 129, 0.15)';
                                btnStyle.borderColor = 'var(--success)';
                                icon = <CheckCircle size={20} color="var(--success)" />;
                            } else if (idx === selectedOption) {
                                btnStyle.background = 'rgba(239, 68, 68, 0.15)';
                                btnStyle.borderColor = 'var(--danger)';
                                icon = <XCircle size={20} color="var(--danger)" />;
                            } else {
                                btnStyle.opacity = 0.5;
                            }
                        } else if (idx === selectedOption) {
                            btnStyle.background = 'rgba(99, 102, 241, 0.15)';
                            btnStyle.borderColor = 'var(--primary)';
                        }

                        return (
                            <button
                                key={idx}
                                style={btnStyle}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={isAnswered}
                            >
                                <span style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                                <span style={styles.optionText}>{option}</span>
                                {icon && <span style={styles.optionIcon}>{icon}</span>}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.explanationBox}>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Explanation</h4>
                        <p style={{ color: 'var(--text-sub)', lineHeight: 1.5 }}>{currentQ.explanation}</p>
                    </motion.div>
                )}

                <div style={styles.actionRow}>
                    {!isAnswered ? (
                        <button
                            className="btn btn-primary"
                            style={selectedOption === null ? { opacity: 0.5, cursor: 'not-allowed', padding: '0.75rem 1.5rem', fontWeight: 600 } : { padding: '0.75rem 1.5rem', fontWeight: 600 }}
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                        >
                            Confirm Selection
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                            {currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question'} <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </motion.div>
            
            {/* Floating Webcam Analyzer */}
            <div style={styles.webcamFloating}>
                <WebcamAnalyzer isRecording={false} onProctoringAlert={handleProctoringViolation} />
            </div>
        </div>
        </ProctoringGuard>
    );
};

const styles = {
    containerCenter: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh', textAlign: 'center'
    },
    container: {
        maxWidth: '800px', margin: '2rem auto', padding: '0 1rem'
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'
    },
    domainTitle: {
        fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem'
    },
    progressText: {
        color: 'var(--text-sub)', fontSize: '0.9rem'
    },
    scoreBadge: {
        background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)',
        color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 700
    },
    progressContainer: {
        width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px',
        marginBottom: '2rem', overflow: 'hidden'
    },
    progressBar: {
        height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease'
    },
    questionCard: {
        padding: '2.5rem'
    },
    questionText: {
        fontSize: '1.25rem', color: 'white', lineHeight: 1.6, marginBottom: '2rem'
    },
    optionsGrid: {
        display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem'
    },
    optionBtn: {
        display: 'flex', alignItems: 'center', width: '100%', padding: '1rem 1.5rem',
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
        textAlign: 'left'
    },
    optionLetter: {
        width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, marginRight: '1rem', flexShrink: 0
    },
    optionText: {
        color: 'var(--text-main)', fontSize: '1rem', flex: 1
    },
    optionIcon: {
        marginLeft: '1rem'
    },
    explanationBox: {
        background: 'rgba(236, 72, 153, 0.05)', borderLeft: '4px solid var(--accent)',
        padding: '1.5rem', borderRadius: '0 8px 8px 0', marginBottom: '2rem'
    },
    actionRow: {
        display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)',
        paddingTop: '1.5rem'
    },
    webcamFloating: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '240px',
        zIndex: 100,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)'
    }
};

export default MCQ;

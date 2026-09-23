import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    CheckCircle, Lock, Play, Briefcase, 
    Brain, MessageSquare, Users, Award
} from 'lucide-react';

const PlacementDrive = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState('Software Engineer');
    const [difficulty, setDifficulty] = useState('Moderate');
    const [progress, setProgress] = useState(0); // 0 to 4
    const [eliminated, setEliminated] = useState(false);
    const [scores, setScores] = useState({});
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const r = params.get('role');
        const d = params.get('difficulty');
        if (r) setRole(r);
        if (d) setDifficulty(d);
        
        // Developer Test Mode
        if (params.get('test') === '1') {
            localStorage.setItem('placement_drive_progress', '4');
            localStorage.setItem('placement_round_scores', JSON.stringify({
                aptitude: 88,
                technical: 92,
                gd: 85,
                hr: 95
            }));
            localStorage.removeItem('placement_drive_eliminated');
            window.location.href = '/placement-drive';
            return;
        }

        // Load progress and state from local storage
        const savedProgress = localStorage.getItem('placement_drive_progress');
        if (savedProgress) setProgress(parseInt(savedProgress));
        
        const isEliminated = localStorage.getItem('placement_drive_eliminated');
        if (isEliminated === 'true') setEliminated(true);
        
        const savedScores = JSON.parse(localStorage.getItem('placement_round_scores') || '{}');
        setScores(savedScores);

        const savedName = localStorage.getItem('ai_portal_username') || 'Soumya';
        setUserName(savedName);
    }, [location]);

    const rounds = [
        {
            id: 1,
            title: 'Aptitude & Logical Reasoning',
            icon: <Brain size={24} />,
            desc: '40 Questions • 60 Minutes • Auto-Submit',
            action: () => {
                navigate('/mcq?domain=Aptitude%20and%20Logical%20Reasoning&count=40&timeLimit=60&isPlacement=true&returnTo=/placement-drive');
            }
        },
        {
            id: 2,
            title: 'Technical Interview',
            icon: <Briefcase size={24} />,
            desc: `AI-driven technical round tailored for ${role}`,
            action: () => {
                navigate(`/interview?domain=${encodeURIComponent(role + ' (Technical)')}&mode=${difficulty}&isPlacement=true&round=technical&returnTo=/placement-drive`);
            }
        },
        {
            id: 3,
            title: 'Group Discussion (GD)',
            icon: <Users size={24} />,
            desc: 'AI-driven Group Discussion simulation.',
            action: () => {
                navigate(`/interview?domain=${encodeURIComponent(role + ' (Group Discussion)')}&mode=${difficulty}&isPlacement=true&round=gd&returnTo=/placement-drive`);
            }
        },
        {
            id: 4,
            title: 'HR Interview',
            icon: <MessageSquare size={24} />,
            desc: 'AI-driven HR & Behavioral Interview.',
            action: () => {
                navigate(`/interview?domain=${encodeURIComponent(role + ' (HR Interview)')}&mode=${difficulty}&isPlacement=true&round=hr&returnTo=/placement-drive`);
            }
        }
    ];

    const resetProgress = () => {
        localStorage.removeItem('placement_drive_progress');
        localStorage.removeItem('placement_drive_eliminated');
        localStorage.removeItem('placement_round_scores');
        setProgress(0);
        setEliminated(false);
        setScores({});
    };

    const handlePrintReport = () => {
        const style = document.createElement('style');
        style.innerHTML = `@media print { 
            @page { margin: 1cm; size: auto; }
            html, body, #root, .appShell, main, * { 
                background-color: white !important; 
                background-image: none !important; 
                -webkit-print-color-adjust: exact; 
                color: black !important;
            }
            .no-print { display: none !important; }
            .glass-card { background: white !important; border: 1px solid #ccc !important; box-shadow: none !important; color: black !important; }
        }`;
        document.head.appendChild(style);
        window.print();
        setTimeout(() => document.head.removeChild(style), 1000);
    };

    const getAverageScore = () => {
        const vals = Object.values(scores);
        if (vals.length === 0) return 0;
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    };

    return (
        <div style={styles.container}>
            <header style={styles.header} className="no-print">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 style={styles.headerTitle}>Mock Placement <span className="text-gradient">Drive</span></h1>
                    <p style={styles.headerSub}>Target Role: <strong style={{color: 'white'}}>{role}</strong> | Level: <strong style={{color: 'var(--warning)'}}>{difficulty}</strong></p>
                </motion.div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {progress < 4 && !eliminated && (
                        <button onClick={() => {
                            localStorage.setItem('placement_drive_progress', '4');
                            localStorage.setItem('placement_round_scores', JSON.stringify({ aptitude: 88, technical: 92, gd: 85, hr: 95 }));
                            localStorage.removeItem('placement_drive_eliminated');
                            window.location.reload();
                        }} style={{...styles.resetBtn, borderColor: 'var(--success)', color: 'var(--success)'}}>
                            Skip to Final Report (Test)
                        </button>
                    )}
                    {(progress > 0 || eliminated) && (
                        <button onClick={resetProgress} style={styles.resetBtn}>Reset Progress</button>
                    )}
                </div>
            </header>

            {!eliminated && progress < 4 && (
            <div style={styles.timeline} className="no-print">
                {rounds.map((round, index) => {
                    const isUnlocked = true; // UNLOCKED ALL FOR TESTING
                    const isCompleted = progress > index;
                    const isActive = true; // SET ALL TO ACTIVE FOR UI CONSISTENCY DURING TESTING

                    return (
                        <motion.div 
                            key={round.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass-card ${isActive ? 'active-round' : ''}`}
                            style={{
                                ...styles.roundCard,
                                opacity: isUnlocked ? 1 : 0.6,
                                borderColor: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--glass-border)'
                            }}
                        >
                            <div style={styles.cardHeader}>
                                <div style={{...styles.iconBox, background: isCompleted ? 'rgba(16,185,129,0.1)' : isActive ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)', color: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-sub)'}}>
                                    {round.icon}
                                </div>
                                <div style={styles.statusBadge}>
                                    {isCompleted ? <span style={{color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px'}}><CheckCircle size={14}/> Completed</span> 
                                     : !isUnlocked ? <span style={{color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px'}}><Lock size={14}/> Locked</span>
                                     : <span style={{color: 'var(--primary)', fontWeight: 600}}>Up Next</span>}
                                </div>
                            </div>

                            <h3 style={styles.cardTitle}>Round {round.id}: {round.title}</h3>
                            <p style={styles.cardDesc}>{round.desc}</p>

                            <button 
                                onClick={round.action}
                                disabled={!isUnlocked || isCompleted}
                                className="primary-btn"
                                style={{
                                    ...styles.actionBtn,
                                    background: isCompleted ? 'rgba(16,185,129,0.1)' : !isUnlocked ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                                    color: isCompleted ? 'var(--success)' : !isUnlocked ? 'var(--text-sub)' : 'white',
                                    boxShadow: isActive ? '0 8px 20px -5px var(--primary-glow)' : 'none'
                                }}
                            >
                                {isCompleted ? `Score: ${scores[Object.keys(scores)[index]] || '--'}%` : !isUnlocked ? 'Locked' : <><Play size={16}/> Start Round</>}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
            )}
            
            {(progress >= 4 || eliminated) && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={styles.reportCard}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-sub)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Official AI Placement Report
                        </div>
                        {eliminated ? <AlertTriangle size={64} color="var(--danger)" /> : <Award size={64} color="var(--success)" />}
                        <h2 style={{fontSize: '2.5rem', color: eliminated ? 'var(--danger)' : 'var(--success)', margin: '1rem 0 0.5rem 0'}}>
                            {eliminated ? 'Eliminated' : 'Shortlisted / Hired!'}
                        </h2>
                        <h3 style={{ fontSize: '1.8rem', color: 'white', marginTop: '1rem', marginBottom: '0.5rem' }}>
                            Candidate: <span className="text-gradient">{userName.toUpperCase()}</span>
                        </h3>
                        <p style={{color: 'var(--text-sub)', fontSize: '1.1rem'}}>
                            {eliminated ? 'Unfortunately, you scored less than 50% in a required round and did not meet the criteria to advance.' : `Congratulations ${userName}! You have successfully cleared all rounds of the mock placement drive.`}
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: 16, border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                        <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Overall Interview Readiness</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ width: 120, height: 120, borderRadius: '50%', border: `6px solid ${eliminated ? 'var(--danger)' : 'var(--success)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>
                                {getAverageScore()}%
                            </div>
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.scoreRow}><span>Aptitude:</span> <strong>{scores.aptitude !== undefined ? `${scores.aptitude}%` : 'N/A'}</strong></div>
                                <div style={styles.scoreRow}><span>Technical:</span> <strong>{scores.technical !== undefined ? `${scores.technical}%` : 'N/A'}</strong></div>
                                <div style={styles.scoreRow}><span>GD Round:</span> <strong>{scores.gd !== undefined ? `${scores.gd}%` : 'N/A'}</strong></div>
                                <div style={styles.scoreRow}><span>HR Round:</span> <strong>{scores.hr !== undefined ? `${scores.hr}%` : 'N/A'}</strong></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(16,185,129,0.05)', padding: '1.5rem', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
                            <h4 style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '1.2rem' }}>Strengths</h4>
                            <ul style={{ color: 'var(--text-main)', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                                <li>Attempted rigorous multi-stage evaluation.</li>
                                {scores.aptitude >= 70 && <li>Strong logical and quantitative reasoning.</li>}
                                {scores.technical >= 70 && <li>Good grasp of technical concepts for {role}.</li>}
                                {scores.gd >= 70 && <li>Excellent communication in group settings.</li>}
                                {scores.hr >= 70 && <li>Strong cultural fit and behavioral alignment.</li>}
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.05)', padding: '1.5rem', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
                            <h4 style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '1.2rem' }}>Areas to Improve</h4>
                            <ul style={{ color: 'var(--text-main)', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                                {scores.aptitude < 70 && <li>Speed and accuracy in Aptitude sections.</li>}
                                {scores.technical < 70 && <li>Deep dive into core domain knowledge for {role}.</li>}
                                {scores.gd < 70 && <li>Speaking confidently and structuring arguments in GDs.</li>}
                                {scores.hr < 70 && <li>Articulating past experiences and career goals clearly.</li>}
                                {eliminated && <li>Work on the round you were eliminated in to clear the 50% cutoff.</li>}
                            </ul>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(99,102,241,0.05)', padding: '1.5rem', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', marginBottom: '2rem' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>Recommendations</h4>
                        <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
                            We recommend continuing your practice in the <strong>AI Interview Studio</strong> focusing heavily on your lowest scoring round. Utilize the Academic Lab for Aptitude, Code Studio for Technical execution, and Skills Hub for Behavioral/HR readiness.
                        </p>
                    </div>

                    <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button onClick={handlePrintReport} className="primary-btn" style={{ background: 'var(--primary)' }}>Download Final Report</button>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ padding: '0.8rem 2rem', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Exit to Dashboard</button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '2rem 0 4rem 0', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' },
    header: { marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    headerTitle: { fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' },
    headerSub: { color: 'var(--text-sub)', fontSize: '1.1rem' },
    resetBtn: { background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' },
    timeline: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' },
    roundCard: { padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    iconBox: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statusBadge: { fontSize: '0.85rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 20 },
    cardTitle: { fontSize: '1.25rem', color: 'white', marginBottom: '0.75rem' },
    cardDesc: { color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem', flex: 1 },
    actionBtn: { width: '100%', padding: '0.875rem', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
    reportCard: { padding: '3rem', width: '100%' },
    scoreRow: { background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', color: 'white' }
};

export default PlacementDrive;

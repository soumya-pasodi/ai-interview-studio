import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FileText, TrendingUp, CheckCircle, Target, History,
    Award, Info, BookOpen, Code, MessageSquare, AlertTriangle, Star, Trash2
} from 'lucide-react';

const Performance = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [incompleteHistory, setIncompleteHistory] = useState([]);
    const [historyTab, setHistoryTab] = useState('completed');
    const [profile, setProfile] = useState({ name: 'Soumya' });
    
    // Placement Drive State
    const [placementProgress, setPlacementProgress] = useState(0);
    const [placementEliminated, setPlacementEliminated] = useState(false);
    const [placementScores, setPlacementScores] = useState({});

    const [certificates, setCertificates] = useState([]);

    useEffect(() => {
        const storedName = localStorage.getItem('ai_portal_username') || 'Student';
        setProfile({ name: storedName });

        // Load user-scoped interview history (no fake auto-injection)
        const userInterviewsKey = `ai_portal_interviews_${storedName}`;
        const existing = JSON.parse(localStorage.getItem(userInterviewsKey) || '[]');
        setHistory(existing);

        // Fetch from API if available
        fetch(`/api/user/interviews?username=${encodeURIComponent(storedName)}`)
            .then(res => res.json())
            .then(data => {
                if (data.interviews && Array.isArray(data.interviews)) {
                    // Normalize API data format
                    const formatted = data.interviews.map(item => ({
                        id: item.id ? String(item.id) : Math.random().toString(),
                        domain: item.domain,
                        score: item.score ? String(item.score) : "0",
                        percentage: item.score ? String(Math.round(item.score * 10)) : "0",
                        date: item.date_taken ? new Date(item.date_taken).toLocaleDateString() : new Date().toLocaleDateString(),
                        duration: "Completed"
                    }));
                    setHistory(formatted);
                    localStorage.setItem(userInterviewsKey, JSON.stringify(formatted));
                }
            })
            .catch(() => {});

        // Fetch user certificates
        fetch(`/api/user/certificates?username=${encodeURIComponent(storedName)}`)
            .then(res => res.json())
            .then(data => {
                if (data.certificates) {
                    setCertificates(data.certificates);
                }
            })
            .catch(() => {});

        const inc = JSON.parse(localStorage.getItem(`ai_portal_incomplete_interviews_${storedName}`) || '[]');
        setIncompleteHistory(inc);

        setPlacementProgress(parseInt(localStorage.getItem('placement_drive_progress') || '0'));
        setPlacementEliminated(localStorage.getItem('placement_drive_eliminated') === 'true');
        setPlacementScores(JSON.parse(localStorage.getItem('placement_round_scores') || '{}'));
    }, []);

    const handleDeleteRecord = (id, type) => {
        if(!window.confirm("Delete this record permanently?")) return;
        
        if(type === 'completed') {
            const updated = history.filter(h => h.id !== id);
            setHistory(updated);
            localStorage.setItem('ai_portal_interviews', JSON.stringify(updated));
        } else {
            const updated = incompleteHistory.filter(h => h.id !== id);
            setIncompleteHistory(updated);
            localStorage.setItem('ai_portal_incomplete_interviews', JSON.stringify(updated));
        }
    };

    const handleClearHistory = () => {
        if(!window.confirm("Are you sure you want to clear ALL history? This cannot be undone.")) return;
        setHistory([]);
        setIncompleteHistory([]);
        localStorage.removeItem('ai_portal_interviews');
        localStorage.removeItem('ai_portal_incomplete_interviews');
    };

    let totalPerc = 0;
    let totalScore = 0;
    
    // Categorized scores
    let academicScore = 0, academicCount = 0;
    let skillsScore = 0, skillsCount = 0;
    let codingScore = 0, codingCount = 0;

    history.forEach(item => {
        totalPerc += parseFloat(item.percentage);
        totalScore += parseFloat(item.score);
        
        if (item.category === 'academic') { academicScore += parseFloat(item.score); academicCount++; }
        if (item.category === 'skills') { skillsScore += parseFloat(item.score); skillsCount++; }
        if (item.category === 'coding') { codingScore += parseFloat(item.score); codingCount++; }
    });
    
    const avgPerc = history.length > 0 ? (totalPerc / history.length).toFixed(0) : "0";
    const avgScore = history.length > 0 ? (totalScore / history.length).toFixed(1) : "0";
    
    const avgAcad = academicCount > 0 ? (academicScore / academicCount).toFixed(1) : "N/A";
    const avgSkills = skillsCount > 0 ? (skillsScore / skillsCount).toFixed(1) : "N/A";
    const avgCoding = codingCount > 0 ? (codingScore / codingCount).toFixed(1) : "N/A";

    const getRatingStatus = (score) => {
        if (score >= 9) return { status: "Outstanding - Industry Ready 🚀", color: "#10b981" };
        if (score >= 8) return { status: "Highly Proficient - Ready for Interviews ⭐", color: "#3b82f6" };
        if (score >= 7) return { status: "Proficient - Needs Minor Polish 👍", color: "#f59e0b" };
        return { status: "Developing - Keep Practicing 📚", color: "#ef4444" };
    };

    const currentRating = getRatingStatus(parseFloat(avgScore));

    const handlePrint = () => {
        const style = document.createElement('style');
        style.innerHTML = `@media print { 
            @page { margin: 1cm; size: auto; }
            html, body, #root, .appShell, main, * { 
                background-color: white !important; 
                background-image: none !important; 
                -webkit-print-color-adjust: exact; 
            }
            .no-print { display: none !important; } 
            .glass-card { background: white !important; border: 1px solid #ddd !important; box-shadow: none !important; color: black !important; } 
            .text-gradient { -webkit-text-fill-color: black !important; } 
            h1, h2, h3, h4, p, span, li, div { color: black !important; border-color: #ddd !important; }
        }`;
        document.head.appendChild(style);
        window.print();
        setTimeout(() => document.head.removeChild(style), 1000);
    };

    const claimCertificate = () => {
        navigate('/certificate');
    };

    // Aggregate gaps (weaknesses)
    const allGaps = history.flatMap(h => h.weaknesses || []);
    // Aggregate strengths
    const allStrengths = history.flatMap(h => h.strengths || []);
    // Aggregate suggestions
    const allSuggestions = history.flatMap(h => h.suggestions || []);

    const displayHistory = historyTab === 'completed' ? history : incompleteHistory;

    return (
        <div style={styles.container}>
            <header style={styles.header} className="no-print">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 style={styles.headerTitle}>Performance <span className="text-gradient">Analytics</span></h1>
                    <p style={styles.headerSub}>Technical readiness metrics and comprehensive AI competency reports.</p>
                </motion.div>
                
                <div style={styles.headerActions}>
                    <button onClick={handlePrint} style={styles.printBtn}><FileText size={18}/> Download PDF Report</button>
                    <button onClick={claimCertificate} style={styles.certBtn}><Award size={18}/> View Certificate</button>
                </div>
            </header>

            <div style={styles.mainGrid}>
                {/* Left Side: Summary Stats */}
                <div style={styles.leftCol}>
                    <div style={styles.statGrid}>
                        <StatBox title="Overall Readiness" value={`${avgPerc}%`} icon={<Target color="var(--primary)"/>} sub="Average percentage" />
                        <StatBox title="Tech Proficiency" value={`${avgScore}/10`} icon={<TrendingUp color="var(--accent)"/>} sub="Technical depth" />
                        <StatBox title="Mocks Completed" value={history.length} icon={<History color="var(--warning)"/>} sub="Total attempts" />
                    </div>

                    <div className="glass-card" style={styles.historyCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ ...styles.cardTitle, margin: 0 }}>Interview History</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={styles.tabContainer}>
                                    <button onClick={() => setHistoryTab('completed')} style={{...styles.tabBtn, ...(historyTab === 'completed' ? styles.tabActive : {})}}>Completed</button>
                                    <button onClick={() => setHistoryTab('incomplete')} style={{...styles.tabBtn, ...(historyTab === 'incomplete' ? styles.tabActive : {})}}>Incomplete</button>
                                </div>
                                <button onClick={handleClearHistory} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Trash2 size={14}/> Clear All
                                </button>
                            </div>
                        </div>
                        <div style={styles.historyList}>
                            {displayHistory.length === 0 && <p style={{ color: 'var(--text-sub)' }}>No records found in this category.</p>}
                            {displayHistory.map((item, idx) => (
                                <div key={item.id || idx} style={{...styles.historyItem, position: 'relative'}}>
                                    <div style={styles.histLeft}>
                                        <div style={styles.histCircle}>{item.domain.charAt(0)}</div>
                                        <div>
                                            <div style={styles.histDomain}>{item.domain}</div>
                                            <div style={styles.histDate}>{item.date} • {item.duration || 'Interrupted'}</div>
                                            {historyTab === 'incomplete' && <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>Reason: {item.terminatedBy === 'PROCTOR' ? 'Proctoring Violation' : 'Paused / Exited'}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={styles.histScore}>{item.score}/10</div>
                                        <button onClick={() => handleDeleteRecord(item.id, historyTab)} style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Placement Drive Summary */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem', border: `1px solid ${placementEliminated ? 'var(--danger)' : placementProgress >= 4 ? 'var(--success)' : 'var(--glass-border)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Award size={20} color={placementEliminated ? "var(--danger)" : placementProgress >= 4 ? "var(--success)" : "var(--primary)"} />
                                Mock Placement Drive Status
                            </h3>
                            <div style={{ background: placementEliminated ? 'rgba(239, 68, 68, 0.1)' : placementProgress >= 4 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', color: placementEliminated ? 'var(--danger)' : placementProgress >= 4 ? 'var(--success)' : 'var(--text-sub)', padding: '0.3rem 0.8rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                                {placementEliminated ? 'Eliminated' : placementProgress >= 4 ? 'Hired / Shortlisted' : placementProgress > 0 ? `In Progress (Round ${placementProgress + 1})` : 'Not Started'}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 8 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase' }}>Aptitude</div>
                                <div style={{ color: placementScores.aptitude ? 'white' : 'var(--text-sub)', fontWeight: 700 }}>{placementScores.aptitude ? `${placementScores.aptitude}%` : '--'}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase' }}>Technical</div>
                                <div style={{ color: placementScores.technical ? 'white' : 'var(--text-sub)', fontWeight: 700 }}>{placementScores.technical ? `${placementScores.technical}%` : '--'}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase' }}>Group Discussion</div>
                                <div style={{ color: placementScores.gd ? 'white' : 'var(--text-sub)', fontWeight: 700 }}>{placementScores.gd ? `${placementScores.gd}%` : '--'}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase' }}>HR Round</div>
                                <div style={{ color: placementScores.hr ? 'white' : 'var(--text-sub)', fontWeight: 700 }}>{placementScores.hr ? `${placementScores.hr}%` : '--'}</div>
                            </div>
                        </div>
                        <button onClick={() => navigate('/placement-drive')} style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={16} /> View Full Placement Dashboard
                        </button>
                    </div>

                    {/* Course Certificates Block */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Award size={22} color="#d4af37" />
                                Course Certificates Block
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                Earned per topic module
                            </span>
                        </div>

                        {certificates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                                <Award size={36} color="rgba(255,255,255,0.2)" style={{ marginBottom: '0.5rem' }} />
                                <p style={{ color: 'white', fontWeight: 600, margin: '0 0 0.25rem 0' }}>No Topic Certificates Issued Yet</p>
                                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: 0 }}>
                                    Complete all required mock assessments for a specific topic module (e.g. <em>Core Java</em>, <em>Full Stack Web Dev</em>) with a score $\ge$ 7.0/10 to generate a certificate for Admin approval.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {certificates.map((cert, idx) => (
                                    <div key={cert.id || idx} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem 1.25rem', background: 'rgba(15,23,42,0.6)',
                                        border: `1px solid ${cert.status === 'approved' ? '#d4af37' : 'rgba(245,158,11,0.4)'}`,
                                        borderRadius: 12
                                    }}>
                                        <div>
                                            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {cert.status === 'approved' ? '🎓' : '⏳'} {cert.domain}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                                                Score: <strong style={{ color: '#0ea5e9' }}>{cert.score}/10</strong> • Date: {new Date(cert.date_issued).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            {cert.status === 'approved' ? (
                                                <button 
                                                    onClick={() => navigate(`/certificate?domain=${encodeURIComponent(cert.domain)}`)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                                                        color: '#000', border: 'none', padding: '0.5rem 1rem',
                                                        borderRadius: 8, fontWeight: 800, cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                        boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
                                                    }}
                                                >
                                                    <Award size={16} /> View Certificate
                                                </button>
                                            ) : (
                                                <div style={{
                                                    background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                                                    border: '1px solid rgba(245,158,11,0.4)', padding: '0.4rem 0.8rem',
                                                    borderRadius: 20, fontSize: '0.8rem', fontWeight: 700
                                                }}>
                                                    ⏳ Pending Admin Approval
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Comprehensive Downloadable Report */}
                <div style={styles.rightCol} id="printable-report">
                    <div className="glass-card" style={styles.reportCard}>
                        <div style={styles.reportHeader}>
                            <h2 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>AI Performance Report</h2>
                            <p style={{ color: 'var(--text-sub)', marginTop: '0.25rem' }}>Generated for: <strong style={{color: 'white'}}>{profile.name}</strong></p>
                        </div>

                        {/* Overall Rating */}
                        <div style={{ ...styles.ratingBox, borderColor: currentRating.color }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <Star color={currentRating.color} fill={currentRating.color} size={24}/>
                                <h3 style={{ color: 'white', fontSize: '1.4rem', margin: 0 }}>Current Status</h3>
                            </div>
                            <p style={{ color: currentRating.color, fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{currentRating.status}</p>
                            <p style={{ color: 'var(--text-main)', marginTop: '0.5rem' }}>Based on {history.length} rigorous AI interviews across multiple domains.</p>
                        </div>

                        {/* Module Breakdown */}
                        <h3 style={styles.sectionHeading}>Module Breakdown</h3>
                        <div style={styles.moduleGrid}>
                            <div style={styles.moduleBox}>
                                <div style={styles.modHeader}><BookOpen size={18} color="var(--primary)"/> <strong>Academic Lab</strong></div>
                                <div style={styles.modScore}>{avgAcad}<span style={styles.modMax}>/10</span></div>
                                <p style={styles.modSub}>Subject knowledge & theory</p>
                            </div>
                            <div style={styles.moduleBox}>
                                <div style={styles.modHeader}><MessageSquare size={18} color="var(--accent)"/> <strong>Skills Hub</strong></div>
                                <div style={styles.modScore}>{avgSkills}<span style={styles.modMax}>/10</span></div>
                                <p style={styles.modSub}>Communication & soft skills</p>
                            </div>
                            <div style={styles.moduleBox}>
                                <div style={styles.modHeader}><Code size={18} color="var(--warning)"/> <strong>Coding Studio</strong></div>
                                <div style={styles.modScore}>{avgCoding}<span style={styles.modMax}>/10</span></div>
                                <p style={styles.modSub}>DSA & live problem solving</p>
                            </div>
                        </div>

                        {/* Aggregated Feedback */}
                        <div style={styles.feedbackContainer}>
                            <div style={styles.insightBox}>
                                <h4 style={styles.insightTitle}><CheckCircle size={18} color="var(--success)"/> Core Strengths</h4>
                                <ul style={styles.bulletList}>
                                    {allStrengths.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>

                            <div style={{...styles.insightBox, background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)'}}>
                                <h4 style={styles.insightTitle}><AlertTriangle size={18} color="var(--danger)"/> Gaps to Focus On</h4>
                                <ul style={{...styles.bulletList, color: 'var(--text-main)'}}>
                                    {allGaps.slice(0, 4).map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                            
                            <div style={{...styles.insightBox, background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)'}}>
                                <h4 style={styles.insightTitle}><Info size={18} color="var(--accent)"/> AI Suggestions for Improvement</h4>
                                <ul style={{...styles.bulletList, color: 'var(--text-main)'}}>
                                    {allSuggestions.length > 0 ? allSuggestions.slice(0, 4).map((s, i) => <li key={i}>{s}</li>) : <li>Keep practicing to unlock AI suggestions.</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ title, value, icon, sub }) => (
    <div className="glass-card" style={styles.statBox}>
        <div style={styles.statHeader}>
            {icon}
            <span style={styles.statValue}>{value}</span>
        </div>
        <div style={styles.statTitle}>{title}</div>
        <div style={styles.statSub}>{sub}</div>
    </div>
);

const styles = {
    container: { padding: '1rem 0 4rem 0' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' },
    headerTitle: { fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' },
    headerSub: { color: 'var(--text-sub)', fontSize: '1rem' },
    headerActions: { display: 'flex', gap: '1rem' },
    printBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 },
    certBtn: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 8px 15px -5px rgba(245,158,11,0.4)' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
    statBox: { padding: '1.25rem' },
    statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    statValue: { fontSize: '1.5rem', fontWeight: 800, color: 'white' },
    statTitle: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    statSub: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' },
    historyCard: { padding: '1.5rem', flex: 1 },
    cardTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'white' },
    historyList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    historyItem: { padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    histLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    histCircle: { width: 36, height: 36, borderRadius: 8, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', flexShrink: 0 },
    histDomain: { fontWeight: 700, color: 'white', fontSize: '0.9rem' },
    histDate: { fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.2rem' },
    histScore: { fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' },
    tabContainer: { display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 8 },
    tabBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', padding: '0.4rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' },
    tabActive: { background: 'var(--primary)', color: 'white' },
    
    rightCol: { position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' },
    reportCard: { padding: '2.5rem', minHeight: '600px', display: 'flex', flexDirection: 'column' },
    reportHeader: { borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' },
    ratingBox: { padding: '1.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid', borderRadius: 12, marginBottom: '2rem' },
    sectionHeading: { color: 'white', fontSize: '1.2rem', marginBottom: '1rem' },
    moduleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
    moduleBox: { padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12, textAlign: 'center' },
    modHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white', fontSize: '0.9rem', marginBottom: '1rem' },
    modScore: { fontSize: '2rem', fontWeight: 800, color: 'white' },
    modMax: { fontSize: '1rem', color: 'var(--text-sub)', fontWeight: 400 },
    modSub: { fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.5rem' },
    feedbackContainer: { display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' },
    insightBox: { padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--glass-border)' },
    insightTitle: { fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white' },
    bulletList: { paddingLeft: '1.25rem', fontSize: '0.95rem', color: 'var(--text-sub)', lineHeight: 1.7, margin: 0 },
};

export default Performance;

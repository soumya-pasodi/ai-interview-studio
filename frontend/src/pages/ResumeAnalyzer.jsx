import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Target, Send, Briefcase, 
    CheckCircle, AlertTriangle, Lightbulb, 
    BarChart2, Star, BookOpen, Download, PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumeAnalyzer = () => {
    const [resumeText, setResumeText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [difficulty, setDifficulty] = useState('Moderate');
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!resumeText.trim()) {
            setError('Please paste your resume text to analyze.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const res = await fetch('/api/analyze_resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, targetRole })
            });
            const data = await res.json();
            
            if (data.score) {
                setAnalysis(data);
            } else {
                setError('Failed to generate analysis. Please try again.');
            }
        } catch (err) {
            setError('Network error. Ensure the backend server is running.');
        }
        setIsLoading(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setResumeText(event.target.result);
        };
        reader.readAsText(file);
    };

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
            .print-full-width { grid-template-columns: 1fr !important; display: block !important; }
            ::-webkit-scrollbar { display: none; }
        }`;
        document.head.appendChild(style);
        window.print();
        setTimeout(() => document.head.removeChild(style), 1000);
    };

    return (
        <div style={styles.container}>
            <header style={styles.header} className="no-print">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 style={styles.headerTitle}>AI Resume <span className="text-gradient">Analyzer</span></h1>
                    <p style={styles.headerSub}>Upload your resume, set a target role, and get instant gap analysis & recommendations.</p>
                </motion.div>
            </header>

            <div style={styles.mainGrid} className="print-full-width">
                {/* Input Section */}
                <div style={styles.inputCol} className="no-print">
                    <div className="glass-card" style={styles.card}>
                        <h3 style={styles.cardTitle}><Target size={18} color="var(--primary)" /> Target Job Role</h3>
                        <input 
                            style={styles.inputField} 
                            placeholder="e.g. Java Full Stack Developer, Frontend Engineer..." 
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                        />

                        <h3 style={{...styles.cardTitle, marginTop: '2rem'}}>
                            <FileText size={18} color="var(--accent)" /> Resume Content
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '1rem' }}>
                            Paste your resume text below or upload a .txt file.
                        </p>
                        
                        <input 
                            type="file" 
                            accept=".txt" 
                            onChange={handleFileUpload}
                            style={styles.fileInput}
                        />
                        
                        <textarea 
                            style={styles.textArea} 
                            placeholder="Paste your resume content here..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                        />

                        {error && <div style={styles.errorBox}>{error}</div>}

                        <button 
                            onClick={handleAnalyze} 
                            disabled={isLoading}
                            style={{...styles.analyzeBtn, opacity: isLoading ? 0.7 : 1, marginBottom: '1.5rem'}}
                        >
                            {isLoading ? (
                                <><div className="spinner" style={{width: 18, height: 18, borderWidth: 2}}></div> Analyzing...</>
                            ) : (
                                <><Send size={18} /> Analyze Resume</>
                            )}
                        </button>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                            <h4 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <PlayCircle size={18} color="var(--warning)" /> Start Mock Placement Drive
                            </h4>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                4 Rounds: Aptitude, Technical, GD, and HR. Based on your Target Role.
                            </p>
                            
                            <select 
                                style={{...styles.inputField, marginBottom: '1rem', padding: '0.75rem', fontSize: '0.9rem'}}
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="Easy" style={{color: 'black'}}>Easy (Beginner)</option>
                                <option value="Moderate" style={{color: 'black'}}>Moderate (Intermediate)</option>
                                <option value="Difficult" style={{color: 'black'}}>Difficult (Advanced)</option>
                            </select>

                            <button 
                                onClick={() => {
                                    if(resumeText) localStorage.setItem('ai_portal_resume_text', resumeText);
                                    navigate(`/placement-drive?role=${encodeURIComponent(targetRole || 'Software Engineer')}&difficulty=${difficulty}`);
                                }}
                                style={{...styles.analyzeBtn, background: 'linear-gradient(135deg, var(--warning), #d97706)', boxShadow: '0 8px 20px -5px rgba(245,158,11,0.4)', padding: '0.75rem', fontSize: '0.95rem'}}
                            >
                                Start 4-Round Process
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analysis Section */}
                <div style={styles.resultCol}>
                    <AnimatePresence mode="wait">
                        {!analysis && !isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
                                <BarChart2 size={64} color="var(--text-sub)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                <h3>Awaiting Analysis</h3>
                                <p style={{ color: 'var(--text-sub)', maxWidth: 300 }}>Submit your resume and target role to uncover skill gaps and get AI recommendations.</p>
                            </motion.div>
                        )}
                        
                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.emptyState}>
                                <div className="spinner" style={{width: 48, height: 48, marginBottom: '1.5rem'}}></div>
                                <h3>AI is Reviewing...</h3>
                                <p style={{ color: 'var(--text-sub)' }}>Cross-referencing your profile with industry requirements.</p>
                            </motion.div>
                        )}

                        {analysis && !isLoading && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={styles.resultCard}>
                                {/* Score Header */}
                                <div style={styles.scoreHeader}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                        <div style={styles.scoreInfo}>
                                            <h2 style={{ fontSize: '2rem', margin: 0, color: 'white' }}>ATS Match Score</h2>
                                            <p style={{ color: 'var(--text-sub)', margin: 0 }}>Target: <strong style={{ color: 'var(--primary)' }}>{targetRole || 'General Role'}</strong></p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                                            <button onClick={handlePrint} className="no-print" style={styles.printBtn}>
                                                <Download size={16} /> Download Report
                                            </button>
                                            <div style={styles.scoreCircle}>
                                                {analysis.score.split('/')[0]}<span style={{fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)'}}>/100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.resultGrid}>
                                    {/* Strengths / Present */}
                                    <div style={{...styles.resultBox, borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)'}}>
                                        <h4 style={styles.boxTitle}><CheckCircle size={18} color="var(--success)"/> Skills Present</h4>
                                        <ul style={styles.list}>
                                            {analysis.skillsPresent?.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>

                                    {/* Missing / Gaps */}
                                    <div style={{...styles.resultBox, borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', flexDirection: 'column'}}>
                                        <h4 style={styles.boxTitle}><AlertTriangle size={18} color="var(--danger)"/> Missing Skills (Gap)</h4>
                                        <ul style={{...styles.list, flex: 1}}>
                                            {analysis.missingSkills?.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                        {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                                            <button 
                                                onClick={() => navigate(`/learning-hub?skills=${encodeURIComponent(analysis.missingSkills.join(','))}`)}
                                                className="no-print"
                                                style={{...styles.analyzeBtn, marginTop: '1.5rem', padding: '0.6rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', boxShadow: 'none'}}
                                            >
                                                Start Learning Missing Skills
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Keywords */}
                                <div style={styles.section}>
                                    <h4 style={styles.sectionTitle}><Star size={18} color="var(--warning)"/> Missing ATS Keywords</h4>
                                    <div style={styles.tagContainer}>
                                        {analysis.keywordsMissing?.map((k, i) => (
                                            <span key={i} style={styles.tag}>{k}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommended Projects */}
                                <div style={styles.section}>
                                    <h4 style={styles.sectionTitle}><Briefcase size={18} color="var(--accent)"/> Suggested Projects to Bridge the Gap</h4>
                                    <ul style={styles.list2}>
                                        {analysis.suggestedProjects?.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                                
                                {/* Suitable Roles */}
                                <div style={styles.section}>
                                    <h4 style={styles.sectionTitle}><BookOpen size={18} color="var(--primary)"/> Possible Job Roles Based on Current Skills</h4>
                                    <div style={styles.tagContainer}>
                                        {analysis.possibleJobRoles?.map((r, i) => (
                                            <span key={i} style={{...styles.tag, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)'}}>{r}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '1rem 0 4rem 0', display: 'flex', flexDirection: 'column', height: '100%' },
    header: { marginBottom: '2rem' },
    headerTitle: { fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' },
    headerSub: { color: 'var(--text-sub)', fontSize: '1rem' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem', alignItems: 'start' },
    inputCol: { position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' },
    card: { padding: '2rem', display: 'flex', flexDirection: 'column' },
    cardTitle: { fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
    inputField: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: 12, color: 'white', fontSize: '1rem', outline: 'none' },
    fileInput: { marginBottom: '1rem', color: 'var(--text-sub)', fontSize: '0.9rem' },
    textArea: { width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: 12, color: 'white', fontSize: '0.95rem', outline: 'none', resize: 'vertical', minHeight: 250, fontFamily: 'monospace', lineHeight: 1.6, marginBottom: '1.5rem' },
    errorBox: { padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 8, marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' },
    analyzeBtn: { width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', padding: '1rem', borderRadius: 12, color: 'white', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 8px 20px -5px rgba(14, 165, 233, 0.4)', transition: 'transform 0.2s' },
    resultCol: { display: 'flex', flexDirection: 'column', minHeight: 600 },
    emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed var(--glass-border)', padding: '3rem' },
    resultCard: { padding: '2.5rem' },
    scoreHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' },
    scoreInfo: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    scoreCircle: { width: 100, height: 100, borderRadius: '50%', border: '4px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)' },
    resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' },
    resultBox: { padding: '1.5rem', borderRadius: 16, border: '1px solid' },
    boxTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '1rem', fontSize: '1rem' },
    list: { paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 },
    list2: { paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, marginTop: '1rem' },
    section: { marginBottom: '2rem' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '1rem', fontSize: '1.1rem' },
    tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    tag: { padding: '0.4rem 1rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 },
    printBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem', borderRadius: 8, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'background 0.2s' }
};

export default ResumeAnalyzer;

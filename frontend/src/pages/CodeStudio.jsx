import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Code, Play, Terminal, CheckCircle, Brain, 
    MessageSquare, Briefcase, ChevronRight, User, Award, ArrowLeft
} from 'lucide-react';

const CodeStudio = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(null); // 'practice' or 'interview'
    
    // Practice State
    const [pracStep, setPracStep] = useState(1);
    const [pracLang, setPracLang] = useState('');
    const [pracTopic, setPracTopic] = useState('');
    const [pracDiff, setPracDiff] = useState('');

    // Interview State
    const [intStep, setIntStep] = useState(1);
    const [intRole, setIntRole] = useState('');
    const [intLang, setIntLang] = useState('');
    const [intType, setIntType] = useState('');

    const renderLanding = () => (
        <div style={styles.landingContainer}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Terminal size={40} color="var(--primary)" /> Code Editor
                </h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '1.2rem', marginTop: '1rem' }}>
                    Choose your path: Master fundamentals or simulate high-pressure technical interviews.
                </p>
            </motion.div>

            <div style={styles.cardsGrid}>
                {/* Practice Card */}
                <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass-card"
                    style={styles.mainCard}
                    onClick={() => setMode('practice')}
                >
                    <div style={styles.cardIconBox}><Code size={40} color="var(--primary)" /></div>
                    <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem' }}>PRACTICE</h2>
                    <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Learn, practice, get instant AI feedback, and improve at your own pace.</p>
                    <ul style={styles.featureList}>
                        <li><CheckCircle size={16} color="var(--success)"/> Topic-wise problem sets</li>
                        <li><CheckCircle size={16} color="var(--success)"/> Adaptive difficulty</li>
                        <li><CheckCircle size={16} color="var(--success)"/> AI hints & code evaluation</li>
                    </ul>
                    <button className="primary-btn" style={{ width: '100%', marginTop: 'auto' }}>Enter Practice Mode</button>
                </motion.div>

                {/* Interview Card */}
                <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass-card"
                    style={{ ...styles.mainCard, border: '1px solid rgba(245, 158, 11, 0.3)' }}
                    onClick={() => setMode('interview')}
                >
                    <div style={{ ...styles.cardIconBox, background: 'rgba(245, 158, 11, 0.1)' }}><Briefcase size={40} color="var(--warning)" /></div>
                    <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem' }}>CODE INTERVIEW</h2>
                    <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Test your skills under real interview conditions with an interactive AI Interviewer.</p>
                    <ul style={styles.featureList}>
                        <li><CheckCircle size={16} color="var(--warning)"/> Role-based mock interviews</li>
                        <li><CheckCircle size={16} color="var(--warning)"/> Explain approach before coding</li>
                        <li><CheckCircle size={16} color="var(--warning)"/> AI follow-up questions</li>
                    </ul>
                    <button className="primary-btn" style={{ width: '100%', marginTop: 'auto', background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 15px -5px rgba(245,158,11,0.4)' }}>Start Mock Interview</button>
                </motion.div>
            </div>
        </div>
    );

    const renderPracticeWizard = () => {
        if (pracStep === 1) return (
            <WizardStep 
                title="Step 1: Select Language" 
                options={['Python', 'Java', 'C++', 'JavaScript', 'C', 'C#', 'SQL', 'Web Dev (HTML/CSS)']}
                onSelect={(lang) => { setPracLang(lang); setPracStep(2); }}
                onBack={() => setMode(null)}
            />
        );
        if (pracStep === 2) return (
            <WizardStep 
                title="Step 2: Select Topic" 
                options={['Variables & Data Types', 'Arrays', 'Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching']}
                onSelect={(topic) => { setPracTopic(topic); setPracStep(3); }}
                onBack={() => setPracStep(1)}
            />
        );
        if (pracStep === 3) return (
            <WizardStep 
                title="Step 3: Select Difficulty" 
                options={['🟢 Easy', '🟡 Medium', '🔴 Hard', '✨ Adaptive (AI Selected)']}
                onSelect={(diff) => { 
                    setPracDiff(diff); 
                    navigate(`/live-code?mode=practice&lang=${encodeURIComponent(pracLang)}&topic=${encodeURIComponent(pracTopic)}&diff=${encodeURIComponent(diff)}`); 
                }}
                onBack={() => setPracStep(2)}
            />
        );
    };

    const renderInterviewWizard = () => {
        if (intStep === 1) return (
            <WizardStep 
                title="Step 1: Select Target Role" 
                options={['Software Developer', 'Java Developer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'AI/ML Engineer']}
                onSelect={(role) => { setIntRole(role); setIntStep(2); }}
                onBack={() => setMode(null)}
            />
        );
        if (intStep === 2) return (
            <WizardStep 
                title="Step 2: Preferred Language" 
                options={['Python', 'Java', 'C++', 'JavaScript', 'Go', 'Rust']}
                onSelect={(lang) => { setIntLang(lang); setIntStep(3); }}
                onBack={() => setIntStep(1)}
            />
        );
        if (intStep === 3) return (
            <WizardStep 
                title="Step 3: Interview Type" 
                options={['🟢 Beginner Coding Interview', '🟡 Technical Coding Interview', '🔴 Advanced System & Optimization', '🎯 Role-Specific Mock']}
                onSelect={(type) => { 
                    setIntType(type); 
                    navigate(`/live-code?mode=interview&role=${encodeURIComponent(intRole)}&lang=${encodeURIComponent(intLang)}&type=${encodeURIComponent(type)}`); 
                }}
                onBack={() => setIntStep(2)}
            />
        );
    };

    return (
        <div style={styles.container}>
            <AnimatePresence mode="wait">
                {!mode && <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>{renderLanding()}</motion.div>}
                {mode === 'practice' && <motion.div key="prac" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>{renderPracticeWizard()}</motion.div>}
                {mode === 'interview' && <motion.div key="int" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>{renderInterviewWizard()}</motion.div>}
            </AnimatePresence>
        </div>
    );
};

const WizardStep = ({ title, options, onSelect, onBack }) => (
    <div style={styles.wizardContainer}>
        <button onClick={onBack} style={styles.backBtn}><ArrowLeft size={18} /> Back</button>
        <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>{title}</h2>
        <div style={styles.optionsGrid}>
            {options.map((opt, idx) => (
                <motion.button 
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(opt)}
                    className="glass-card"
                    style={styles.optionBtn}
                >
                    {opt}
                </motion.button>
            ))}
        </div>
    </div>
);

const styles = {
    container: { padding: '2rem 1rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    landingContainer: { maxWidth: '1000px', width: '100%', margin: '0 auto', paddingTop: '4rem' },
    cardsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' },
    mainCard: { padding: '3rem', display: 'flex', flexDirection: 'column', cursor: 'pointer', minHeight: '450px', transition: 'all 0.3s ease' },
    cardIconBox: { width: 80, height: 80, borderRadius: 20, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' },
    featureList: { listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-main)' },
    wizardContainer: { maxWidth: '800px', width: '100%', margin: '0 auto', paddingTop: '2rem', position: 'relative' },
    backBtn: { position: 'absolute', top: 0, left: 0, background: 'transparent', border: 'none', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem' },
    optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    optionBtn: { padding: '1.5rem', fontSize: '1.1rem', color: 'white', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', cursor: 'pointer', textAlign: 'center', borderRadius: 12 }
};

export default CodeStudio;

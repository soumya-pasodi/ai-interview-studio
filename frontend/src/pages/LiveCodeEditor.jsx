import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, Code, CheckCircle, RefreshCcw, Brain, 
    ArrowLeft, Terminal, Send, Award, ChevronRight 
} from 'lucide-react';

const MAX_QUESTIONS = 3;

const LiveCodeEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [mode, setMode] = useState('practice');
    const [language, setLanguage] = useState('javascript');
    
    // Interview sequence state
    const [questionIndex, setQuestionIndex] = useState(0);
    const [pastQuestions, setPastQuestions] = useState([]);

    // Problem state
    const [loading, setLoading] = useState(true);
    const [problem, setProblem] = useState(null);
    const [error, setError] = useState('');

    // Editor state
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    // Evaluation state
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState(null);

    useEffect(() => {
        loadNewProblem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location, questionIndex]);

    const loadNewProblem = async () => {
        setLoading(true);
        setError('');
        setEvaluation(null);
        setOutput('');
        
        const params = new URLSearchParams(location.search);
        const urlMode = params.get('mode') || 'practice';
        setMode(urlMode);
        
        let requestBody = {};
        const lang = params.get('lang') || 'Python';
        setLanguage(lang.toLowerCase());
        
        if (urlMode === 'practice') {
            requestBody = {
                mode: 'practice',
                language: lang,
                topic: params.get('topic') || 'Fundamentals',
                difficulty: params.get('diff') || 'Medium',
                pastQuestions: pastQuestions
            };
        } else {
            requestBody = {
                mode: 'interview',
                role: params.get('role') || 'Software Engineer',
                language: lang,
                type: params.get('type') || 'Technical Coding Interview',
                pastQuestions: pastQuestions
            };
        }

        try {
            const res = await fetch('/api/generate_coding_problem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            const data = await res.json();
            if (data.title) {
                setProblem(data);
                setCode(data.starter_code || '// Write your code here');
            } else {
                setError('Failed to generate problem. Please try again.');
            }
        } catch (err) {
            setError('Server connection error. Ensure the backend is running.');
        }
        setLoading(false);
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput('Simulating execution via AI Engine...');
        try {
            const response = await fetch('/api/simulate_execution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, code })
            });
            const data = await response.json();
            if (data.output) setOutput(data.output);
            else if (data.error) setOutput(`Server Error: ${data.error}`);
            else setOutput('Executed successfully with no output.');
        } catch (error) {
            setOutput(`Network Error: ${error.message}`);
        }
        setIsRunning(false);
    };

    const submitSolution = async () => {
        setIsEvaluating(true);
        try {
            const res = await fetch('/api/evaluate_answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question: problem.problem_statement, 
                    answer: code, 
                    isCode: true 
                })
            });
            const data = await res.json();
            if (data.evaluation) {
                setEvaluation(data.evaluation);
                // Save this problem title to avoid repeats
                setPastQuestions(prev => [...prev, problem.title]);
            }
        } catch (e) {
            setEvaluation("Score: Error\nSuggestion: Failed to connect to evaluation engine.");
        }
        setIsEvaluating(false);
    };

    const handleNext = () => {
        if (questionIndex < MAX_QUESTIONS - 1) {
            setQuestionIndex(prev => prev + 1);
        } else {
            navigate('/performance');
        }
    };

    if (loading) {
        return (
            <div style={styles.centerContainer}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Brain size={48} color="var(--primary)" />
                </motion.div>
                <h2 style={{ marginTop: '1rem', color: 'white' }}>
                    {mode === 'interview' 
                        ? `Generating Interview Problem ${questionIndex + 1} of ${MAX_QUESTIONS}...` 
                        : 'Generating Practice Problem...'}
                </h2>
                <p style={{ color: 'var(--text-sub)' }}>Our AI is crafting a unique problem based on your selections.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centerContainer}>
                <h2 style={{ color: 'var(--danger)' }}>Error Generating Problem</h2>
                <p style={{ color: 'var(--text-sub)' }}>{error}</p>
                <button onClick={() => navigate('/code-studio')} className="btn btn-outline" style={{ marginTop: '1rem' }}>Back to Studio</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button onClick={() => navigate('/code-studio')} style={styles.backBtn}><ArrowLeft size={18} /></button>
                    <Code size={24} color={mode === 'interview' ? "var(--warning)" : "var(--primary)"} />
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>
                        {mode === 'interview' ? `Interview Mode (Q${questionIndex + 1}/${MAX_QUESTIONS})` : 'Practice Workspace'}
                    </h2>
                </div>
                <div style={styles.controls}>
                    <span style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginRight: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: 12 }}>
                        Language: <strong style={{ color: 'white' }}>{language.toUpperCase()}</strong>
                    </span>
                    {!evaluation && (
                        <>
                            <button onClick={() => setCode(problem?.starter_code || '')} style={styles.iconBtn}>
                                <RefreshCcw size={16} /> Reset
                            </button>
                            <button onClick={runCode} disabled={isRunning || isEvaluating} style={styles.runBtn}>
                                <Play size={16} /> {isRunning ? 'Running...' : 'Run Code'}
                            </button>
                            <button onClick={submitSolution} disabled={isRunning || isEvaluating} style={styles.submitBtn}>
                                <Send size={16} /> {isEvaluating ? 'Evaluating...' : 'Submit Solution'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div style={styles.workspace}>
                {/* Left Pane: Problem Details OR Evaluation Feedback */}
                <div style={styles.problemPane} className="glass-card">
                    <AnimatePresence mode="wait">
                        {!evaluation ? (
                            <motion.div key="problem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>{problem.title}</h1>
                                
                                <div style={styles.problemSection}>
                                    <h3 style={styles.sectionTitle}>Problem Statement</h3>
                                    <p style={styles.sectionText}>{problem.problem_statement}</p>
                                </div>

                                <div style={styles.problemSection}>
                                    <h3 style={styles.sectionTitle}>Input Format</h3>
                                    <p style={styles.sectionText}>{problem.input_format}</p>
                                </div>

                                <div style={styles.problemSection}>
                                    <h3 style={styles.sectionTitle}>Output Format</h3>
                                    <p style={styles.sectionText}>{problem.output_format}</p>
                                </div>

                                <div style={styles.problemSection}>
                                    <h3 style={styles.sectionTitle}>Constraints</h3>
                                    <p style={{ ...styles.sectionText, fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 4 }}>
                                        {problem.constraints}
                                    </p>
                                </div>

                                <h3 style={styles.sectionTitle}>Examples</h3>
                                {problem.examples && problem.examples.map((ex, idx) => (
                                    <div key={idx} style={styles.exampleBox}>
                                        <strong>Input:</strong>
                                        <pre style={styles.preCode}>{ex.input}</pre>
                                        <strong>Output:</strong>
                                        <pre style={styles.preCode}>{ex.output}</pre>
                                        {ex.explanation && (
                                            <>
                                                <strong>Explanation:</strong>
                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-sub)' }}>{ex.explanation}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div key="feedback" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={styles.feedbackContainer}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <Award size={40} color="var(--primary)" />
                                    <h2 style={{ color: 'white', margin: 0 }}>AI Code Evaluation</h2>
                                </div>
                                <div style={styles.feedbackBox}>
                                    {evaluation.split('\n').map((line, idx) => {
                                        const isScore = line.includes('Score:');
                                        return (
                                        <p key={idx} style={{ color: isScore ? 'var(--warning)' : 'var(--text-main)', fontSize: isScore ? '1.2rem' : '1rem', fontWeight: isScore ? 'bold' : 'normal', marginBottom: '0.5rem' }}>
                                            {line}
                                        </p>
                                        );
                                    })}
                                </div>
                                
                                {mode === 'interview' && (
                                    <button onClick={handleNext} style={{...styles.submitBtn, width: '100%', marginTop: '2rem', justifyContent: 'center', padding: '1rem' }}>
                                        {questionIndex < MAX_QUESTIONS - 1 ? 'Next Question' : 'Finish Interview'} <ChevronRight size={20} />
                                    </button>
                                )}
                                {mode === 'practice' && (
                                    <button onClick={handleNext} style={{...styles.submitBtn, width: '100%', marginTop: '2rem', justifyContent: 'center', padding: '1rem' }}>
                                        Practice Another Problem <ChevronRight size={20} />
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Pane: Code Editor & Output */}
                <div style={styles.editorPane}>
                    <div style={{...styles.editorContainer, pointerEvents: evaluation ? 'none' : 'auto', opacity: evaluation ? 0.7 : 1 }}>
                        <Editor
                            height="100%"
                            language={language === 'c++' || language === 'cpp' ? 'cpp' : language}
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val)}
                            options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 16 } }}
                        />
                    </div>
                    
                    <div style={styles.outputContainer}>
                        <div style={styles.outputHeader}>
                            <Terminal size={16} color="var(--accent)" />
                            <span style={{ color: 'white', fontWeight: 600 }}>Console Output</span>
                        </div>
                        <pre style={styles.outputPre}>
                            {output || 'Run your code to see the output...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    centerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' },
    container: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', width: '100%', gap: '1rem', padding: '1rem 0' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    backBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px' },
    controls: { display: 'flex', gap: '1rem', alignItems: 'center' },
    iconBtn: { background: 'transparent', color: 'var(--text-sub)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
    runBtn: { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.5rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 },
    submitBtn: { background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 10px rgba(0, 240, 255, 0.2)' },
    workspace: { display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 },
    problemPane: { flex: 1, overflowY: 'auto', padding: '2rem', position: 'relative' },
    problemSection: { marginBottom: '1.5rem' },
    sectionTitle: { color: 'var(--primary)', fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    sectionText: { color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.95rem' },
    exampleBox: { background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--glass-border)' },
    preCode: { background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: 4, margin: '0.25rem 0 0.75rem 0', color: 'var(--text-main)', fontFamily: 'monospace' },
    editorPane: { flex: 1.2, display: 'flex', flexDirection: 'column', gap: '1rem' },
    editorContainer: { flex: 2, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#1e1e1e', transition: 'all 0.3s ease' },
    outputContainer: { flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    outputHeader: { padding: '1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    outputPre: { padding: '1rem', color: 'var(--text-sub)', fontSize: '0.9rem', margin: 0, overflowY: 'auto', flex: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' },
    feedbackContainer: { padding: '1rem' },
    feedbackBox: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '2rem' }
};

export default LiveCodeEditor;

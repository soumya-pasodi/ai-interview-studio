import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, Printer, ArrowLeft, Download, Lock, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CertificateView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [domain, setDomain] = useState('AI Technical Mock Assessment');
    const [certStatus, setCertStatus] = useState('checking'); // checking, approved, pending_approval, locked
    const [score, setScore] = useState('8.5');

    useEffect(() => {
        const username = localStorage.getItem('ai_portal_username') || 'Student';
        setName(username);
        
        const params = new URLSearchParams(location.search);
        const reqDomain = params.get('domain') || 'Core Java';
        setDomain(reqDomain);

        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        setDate(today.toLocaleDateString(undefined, options));

        // Check verification from API
        fetch(`/api/user/certificates?username=${encodeURIComponent(username)}`)
            .then(res => res.json())
            .then(data => {
                if (data.certificates && Array.isArray(data.certificates) && data.certificates.length > 0) {
                    const match = data.certificates.find(c => c.domain.toLowerCase() === reqDomain.toLowerCase());
                    if (match) {
                        setCertStatus(match.status); // 'approved' or 'pending_approval'
                        if (match.score) setScore(match.score);
                    } else {
                        // Check if user has completed interviews for this domain
                        fetch(`/api/user/interviews?username=${encodeURIComponent(username)}`)
                            .then(res => res.json())
                            .then(invData => {
                                const domainInvs = invData.interviews ? invData.interviews.filter(i => i.domain.toLowerCase() === reqDomain.toLowerCase()) : [];
                                if (domainInvs.length >= 2) {
                                    setCertStatus('pending_approval');
                                } else {
                                    setCertStatus('locked');
                                }
                            })
                            .catch(() => setCertStatus('locked'));
                    }
                } else {
                    // No certificates issued in DB -> Check interview history
                    fetch(`/api/user/interviews?username=${encodeURIComponent(username)}`)
                        .then(res => res.json())
                        .then(invData => {
                            const domainInvs = invData.interviews ? invData.interviews.filter(i => i.domain.toLowerCase() === reqDomain.toLowerCase()) : [];
                            if (domainInvs.length >= 2) {
                                setCertStatus('pending_approval');
                            } else {
                                setCertStatus('locked');
                            }
                        })
                        .catch(() => setCertStatus('locked'));
                }
            })
            .catch(() => setCertStatus('locked'));
    }, [location.search]);

    const handlePrint = () => {
        const style = document.createElement('style');
        style.innerHTML = `@media print { 
            @page { margin: 0; size: landscape; }
            html, body, #root, .appShell, main { 
                background-color: white !important; 
                background-image: none !important; 
                -webkit-print-color-adjust: exact; 
            }
            .no-print { display: none !important; }
            body { display: flex; justify-content: center; align-items: center; }
        }`;
        document.head.appendChild(style);
        window.print();
        setTimeout(() => document.head.removeChild(style), 1000);
    };

    if (certStatus === 'checking') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'white' }}>
                <Clock className="spinner" size={32} color="#0ea5e9" /> &nbsp; Verifying Certificate Status...
            </div>
        );
    }

    if (certStatus === 'pending_approval') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ maxWidth: 550, textAlign: 'center', padding: '3rem 2rem', border: '1px solid #f59e0b' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                        <Clock size={40} color="#f59e0b" />
                    </div>
                    <h2 style={{ color: 'white', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Certificate Pending Admin Verification</h2>
                    <p style={{ color: 'var(--text-sub)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Your certificate for <strong style={{ color: '#f59e0b' }}>{domain}</strong> has been requested upon completing the topic requirements. It is currently under review by the Administrator and will become available once approved.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/performance')} style={{ padding: '0.8rem 1.5rem', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                            <ArrowLeft size={16} /> Back to Performance
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (certStatus === 'locked') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ maxWidth: 550, textAlign: 'center', padding: '3rem 2rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                        <Lock size={40} color="var(--danger)" />
                    </div>
                    <h2 style={{ color: 'white', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Topic Certificate Locked</h2>
                    <p style={{ color: 'var(--text-sub)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        You have not yet completed the full course module for <strong style={{ color: 'white' }}>{domain}</strong>. Complete the required mock assessments for this topic with a passing score to unlock your certificate.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/dashboard')} style={{ padding: '0.8rem 1.5rem', borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                            Start Assessment Now
                        </button>
                        <button onClick={() => navigate('/performance')} style={{ padding: '0.8rem 1.5rem', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                            Back to Performance
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div className="no-print" style={styles.actions}>
                <button onClick={() => navigate('/performance')} style={styles.backBtn}>
                    <ArrowLeft size={16} /> Back to Performance
                </button>
                <button onClick={handlePrint} style={styles.printBtn}>
                    <Printer size={16} /> Print / Save as PDF
                </button>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="certificate-container"
                style={styles.certificateOuter}
            >
                <div style={styles.certificateInner}>
                    <div style={styles.decorativeTop}></div>
                    <div style={styles.decorativeBottom}></div>
                    
                    <div style={styles.header}>
                        <Award size={64} color="#d4af37" style={{ marginBottom: '1rem' }} />
                        <h1 style={styles.title}>CERTIFICATE OF EXCELLENCE</h1>
                        <p style={styles.subtitle}>OFFICIALLY GRANTED BY AI INTERVIEW STUDIO</p>
                    </div>

                    <div style={styles.body}>
                        <p style={styles.textRegular}>This document certifies that</p>
                        <h2 style={styles.recipientName}>{name.toUpperCase()}</h2>
                        <p style={styles.textRegular}>
                            has successfully completed the complete course requirements and demonstrated outstanding technical proficiency in 
                        </p>
                        <h3 style={{ color: '#0ea5e9', fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0', fontFamily: 'sans-serif' }}>
                            {domain.toUpperCase()}
                        </h3>
                        <p style={styles.textHighlight}>
                            Awarded Status: <strong>Verified AI Certified ({score}/10)</strong>
                        </p>
                    </div>

                    <div style={styles.footer}>
                        <div style={styles.signatureBlock}>
                            <div style={styles.signatureLine}>Soumya & Team</div>
                            <p style={styles.signatureTitle}>Program Directors</p>
                        </div>
                        
                        <div style={styles.badgeWrap}>
                            <div style={styles.seal}>
                                <div style={styles.sealInner}>
                                    <span style={{fontSize: 10, fontWeight: 800}}>VERIFIED</span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.signatureBlock}>
                            <div style={styles.signatureLine}>{date}</div>
                            <p style={styles.signatureTitle}>Date of Issuance</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const styles = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', paddingBottom: '3rem' },
    actions: { display: 'flex', gap: '1rem', width: '100%', maxWidth: 900, justifyContent: 'space-between' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-sub)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' },
    printBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#d4af37', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)' },
    
    certificateOuter: {
        width: 850, height: 600, 
        background: '#fcfcfc', color: '#333',
        padding: '10px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        position: 'relative'
    },
    certificateInner: {
        width: '100%', height: '100%',
        border: '3px double #d4af37',
        padding: '3rem', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative'
    },
    decorativeTop: { position: 'absolute', top: 5, left: 5, width: 60, height: 60, borderTop: '3px solid #d4af37', borderLeft: '3px solid #d4af37' },
    decorativeBottom: { position: 'absolute', bottom: 5, right: 5, width: 60, height: 60, borderBottom: '3px solid #d4af37', borderRight: '3px solid #d4af37' },
    
    header: { textAlign: 'center', marginBottom: '3rem' },
    title: { fontFamily: 'serif', fontSize: '2.8rem', fontWeight: 800, color: '#222', margin: '0 0 0.5rem 0', letterSpacing: '2px' },
    subtitle: { fontFamily: 'sans-serif', fontSize: '1rem', color: '#666', letterSpacing: '4px', margin: 0 },
    
    body: { textAlign: 'center', maxWidth: 650, marginBottom: '4rem' },
    textRegular: { fontFamily: 'serif', fontSize: '1.2rem', color: '#444', lineHeight: 1.6, margin: '1rem 0' },
    recipientName: { fontFamily: 'serif', fontSize: '3rem', fontWeight: 700, color: '#d4af37', borderBottom: '1px solid #ccc', margin: '1rem auto', paddingBottom: '0.5rem', width: '80%', letterSpacing: '2px' },
    textHighlight: { fontFamily: 'sans-serif', fontSize: '1.2rem', color: '#111', background: '#f5f5f5', padding: '10px 20px', borderRadius: 4, display: 'inline-block', marginTop: '1rem', border: '1px solid #eee' },
    
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', padding: '0 2rem', boxSizing: 'border-box' },
    signatureBlock: { textAlign: 'center', width: 200 },
    signatureLine: { fontFamily: 'cursive', fontSize: '1.5rem', color: '#0f172a', borderBottom: '1px solid #444', paddingBottom: '0.5rem', marginBottom: '0.5rem' },
    signatureTitle: { fontFamily: 'sans-serif', fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    
    badgeWrap: { flex: 1, display: 'flex', justifyContent: 'center' },
    seal: { width: 90, height: 90, background: '#d4af37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    sealInner: { width: 75, height: 75, border: '2px dashed #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }
};

export default CertificateView;

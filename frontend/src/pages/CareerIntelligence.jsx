import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Building, Globe, Zap, AlertTriangle, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CareerIntelligence = () => {
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [workMode, setWorkMode] = useState('Remote');

    // Mock Student Profile
    const studentProfile = {
        targetRole: "Java Full Stack Developer",
        skills: ["Java", "Spring Boot", "MySQL", "HTML", "CSS"],
        missingSkills: ["Docker", "Microservices"]
    };

    // AI Job Matches
    const jobMatches = [
        {
            title: "Java Developer Intern",
            company: "TechNova Solutions",
            location: "Remote",
            matchScore: 85,
            matchedSkills: ["Java", "Spring Boot", "MySQL"],
            missingSkills: ["Docker"],
            url: "https://www.linkedin.com/jobs/search/?keywords=Java%20Developer%20Intern"
        },
        {
            title: "Backend Engineer - Entry Level",
            company: "CloudScale Inc.",
            location: "Bangalore / Hybrid",
            matchScore: 78,
            matchedSkills: ["Java", "Spring Boot"],
            missingSkills: ["Microservices", "Docker"],
            url: "https://in.indeed.com/jobs?q=Backend+Engineer"
        },
        {
            title: "Full Stack Web Developer",
            company: "Innovate AI",
            location: "Remote",
            matchScore: 65,
            matchedSkills: ["HTML", "CSS", "MySQL"],
            missingSkills: ["React", "AWS"],
            url: "https://internshala.com/internships/full-stack-development-internship/"
        }
    ];

    const platforms = [
        { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=', color: '#0a66c2' },
        { name: 'Naukri', url: 'https://www.naukri.com/', color: '#166eb8' },
        { name: 'Indeed', url: 'https://in.indeed.com/jobs?q=', color: '#2164f4' },
        { name: 'Internshala', url: 'https://internshala.com/internships/keywords-', color: '#1295c9' },
        { name: 'Wellfound', url: 'https://wellfound.com/jobs?search=', color: '#000000' }
    ];

    const handleSearch = (platformUrl) => {
        if (!searchQuery) return;
        const query = encodeURIComponent(searchQuery + (locationQuery ? ' ' + locationQuery : ''));
        window.open(platformUrl + query, '_blank');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Career Opportunities <span style={{ color: 'var(--primary)' }}>Intelligence</span></h1>
                    <p style={styles.subtitle}>AI-driven job matching and unified search across top global platforms.</p>
                </div>
            </div>

            <div style={styles.grid}>
                {/* LEFT COL: Search & Connect */}
                <div style={styles.leftCol}>
                    <div className="glass-card" style={styles.card}>
                        <div style={styles.cardHeader}>
                            <Search color="var(--primary)" size={24} />
                            <h3>Find Opportunities</h3>
                        </div>
                        <p style={styles.desc}>Search across multiple job portals simultaneously.</p>
                        
                        <div style={styles.searchForm}>
                            <div style={styles.inputGroup}>
                                <Briefcase size={18} style={styles.inputIcon} />
                                <input 
                                    style={styles.inputField} 
                                    placeholder="Job title, skills, or company" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <MapPin size={18} style={styles.inputIcon} />
                                <input 
                                    style={styles.inputField} 
                                    placeholder="City, state, or Remote" 
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                />
                            </div>
                            
                            <div style={styles.platformsContainer}>
                                <p style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Search on Platform:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {platforms.map((p, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleSearch(p.url)}
                                            style={{...styles.platformBtn, borderColor: p.color}}
                                        >
                                            <Globe size={14} color={p.color} /> {p.name} <ExternalLink size={12} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: AI Job Match */}
                <div style={styles.rightCol}>
                    <div className="glass-card" style={styles.card}>
                        <div style={styles.cardHeader}>
                            <Zap color="#f59e0b" size={24} />
                            <h3>AI Job Match Analysis</h3>
                        </div>
                        <p style={styles.desc}>Comparing your current assessed profile to real-world roles.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                            {jobMatches.map((job, idx) => (
                                <motion.div whileHover={{ scale: 1.01 }} key={idx} style={styles.jobCard}>
                                    <div style={styles.jobTop}>
                                        <div>
                                            <h4 style={styles.jobTitle}>{job.title}</h4>
                                            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-sub)', fontSize: '0.85rem', marginTop: '4px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14}/> {job.company}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {job.location}</span>
                                            </div>
                                        </div>
                                        <div style={styles.scoreBadge}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: job.matchScore > 75 ? 'var(--success)' : '#f59e0b' }}>
                                                {job.matchScore}%
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>Match</span>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.skillsAnalysis}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                                <CheckCircle size={14} /> You Have
                                            </span>
                                            <div style={styles.badgeContainer}>
                                                {job.matchedSkills.map(s => <span key={s} style={styles.matchBadge}>{s}</span>)}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                                <AlertTriangle size={14} /> Missing Skills
                                            </span>
                                            <div style={styles.badgeContainer}>
                                                {job.missingSkills.map(s => <span key={s} style={styles.missingBadge}>{s}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.actionRow}>
                                        <button onClick={() => window.open(job.url, '_blank')} style={styles.viewJobBtn}>
                                            View Opportunity <ExternalLink size={14} />
                                        </button>
                                        
                                        {job.missingSkills.length > 0 && (
                                            <button 
                                                onClick={() => navigate(`/learning-hub?skills=${job.missingSkills.join(',')}`)} 
                                                style={styles.learnBtn}
                                            >
                                                Learn Missing Skills <ArrowRight size={14} />
                                            </button>
                                        )}
                                        
                                        <button 
                                            onClick={() => navigate(`/placement-drive?role=${encodeURIComponent(job.title)}`)} 
                                            style={styles.simulateBtn}
                                        >
                                            Prepare for Role <Zap size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' },
    title: { fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' },
    subtitle: { color: 'var(--text-sub)', fontSize: '1.1rem', maxWidth: '600px' },
    
    grid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    rightCol: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    
    card: { padding: '2rem' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' },
    desc: { color: 'var(--text-sub)', fontSize: '0.95rem', marginBottom: '2rem' },
    
    searchForm: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '16px', color: '#64748b' },
    inputField: { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '16px 16px 16px 48px', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' },
    
    platformsContainer: { marginTop: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' },
    platformBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid', borderRadius: '8px', color: 'white', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' },
    
    jobCard: { background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    jobTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    jobTitle: { color: 'white', fontSize: '1.2rem', fontWeight: 700, margin: 0 },
    scoreBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' },
    
    skillsAnalysis: { display: 'flex', gap: '2rem', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' },
    badgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    matchBadge: { background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(16,185,129,0.2)' },
    missingBadge: { background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(239,68,68,0.2)' },
    
    actionRow: { display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' },
    viewJobBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' },
    learnBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--primary)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' },
    simulateBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '10px', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' },
};

export default CareerIntelligence;

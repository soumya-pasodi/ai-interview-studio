import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Shield, Globe, Database, 
    Cpu, Rocket, ArrowRight, Play,
    MessageSquare, Clock, BookOpen,
    ExternalLink, FileText, X, Download,
    CheckCircle, Code, Monitor, Star, Search, Users, Award
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import curriculumData from '../data/curriculumData.json';

const progressData = [
    { week: 'Week 1', score: 65 },
    { week: 'Week 2', score: 70 },
    { week: 'Week 3', score: 75 },
    { week: 'Week 4', score: 72 },
    { week: 'Week 5', score: 80 },
    { week: 'Week 6', score: 84 },
    { week: 'Week 7', score: 88 },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('home'); // home, academic, skills, coding
    const [subView, setSubView] = useState('assessment'); // assessment, learning (relevant for academic)
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedAssessmentItem, setSelectedAssessmentItem] = useState(null);
    
    // User Performance Stats
    const [studentName, setStudentName] = useState('Student');
    const [userInterviews, setUserInterviews] = useState([]);
    const [userStats, setUserStats] = useState({
        totalInterviews: 0,
        avgScore: 0,
        modulesCompleted: 0,
        readinessScore: 0,
        chartData: []
    });

    // Wizard States
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedDegree, setSelectedDegree] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedStream, setSelectedStream] = useState(null);
    const [interviewType, setInterviewType] = useState(null);
    const [selectedRoleCategory, setSelectedRoleCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Sync state with URL params & load user performance
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view') || 'home';
        setActiveTab(view);
        // Reset wizard
        setSelectedLevel(null);
        setSelectedDegree(null);
        setSelectedGroup(null);
        setSelectedStream(null);
        setInterviewType(null);
        setSelectedRoleCategory(null);
        setSearchQuery('');

        const storedName = localStorage.getItem('ai_portal_username') || 'Student';
        setStudentName(storedName);

        const localData = JSON.parse(localStorage.getItem(`ai_portal_interviews_${storedName}`) || '[]');
        setUserInterviews(localData);
        computeUserStats(localData);

        // Fetch from API
        fetch(`/api/user/interviews?username=${encodeURIComponent(storedName)}`)
            .then(res => res.json())
            .then(data => {
                if (data.interviews && Array.isArray(data.interviews)) {
                    setUserInterviews(data.interviews);
                    computeUserStats(data.interviews);
                }
            })
            .catch(() => {});
    }, [location]);

    const computeUserStats = (interviews) => {
        if (!interviews || interviews.length === 0) {
            setUserStats({
                totalInterviews: 0,
                avgScore: 0,
                modulesCompleted: 0,
                readinessScore: 0,
                chartData: [
                    { week: 'Week 1', score: 0 },
                    { week: 'Week 2', score: 0 }
                ]
            });
            return;
        }

        const total = interviews.length;
        const totalScore = interviews.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);
        const avg = Math.round((totalScore / total) * 10); // percentage 0-100
        const uniqueDomains = new Set(interviews.map(i => i.domain)).size;
        const readiness = Math.min(100, Math.round(avg * 0.8 + total * 4));

        const chart = interviews.slice(-7).map((inv, index) => ({
            week: `Attempt ${index + 1}`,
            score: Math.round((parseFloat(inv.score) || 0) * 10)
        }));

        setUserStats({
            totalInterviews: total,
            avgScore: avg,
            modulesCompleted: uniqueDomains,
            readinessScore: readiness,
            chartData: chart.length > 0 ? chart : [{ week: 'Attempt 1', score: 0 }]
        });
    };

    const handleAction = (item) => {
        setSelectedAssessmentItem(item);
    };

    const renderHome = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.homeContainer}>
            <div style={styles.homeHero}>
                <div style={styles.heroBadge}>WELCOME BACK, {studentName.toUpperCase()}</div>
                <h1 style={styles.homeTitle}>AI POWERED HOLISTIC INTERVIEW AND <span className="text-gradient">PERSONAL DEVELOPMENT SYSTEM</span></h1>
                <p style={styles.homeLead}>
                    A unique, multi-dimensional platform designed to bridge the gap between academic learning and industry readiness using State-of-the-Art Generative AI.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto 4rem' }}>
                    <div className="glass-card" style={styles.metricCard}>
                        <div style={styles.metricHeader}>
                            <h3 style={styles.metricTitle}>Total Interviews</h3>
                            <Users size={20} color="var(--primary)" />
                        </div>
                        <div style={styles.metricValue}>{userStats.totalInterviews}</div>
                        <div style={styles.metricTrend}>
                            <span style={{color: userStats.totalInterviews > 0 ? 'var(--success)' : 'var(--text-sub)'}}>
                                {userStats.totalInterviews > 0 ? `${userStats.totalInterviews} completed` : 'No attempts yet'}
                            </span>
                        </div>
                    </div>
                    <div className="glass-card" style={styles.metricCard}>
                        <div style={styles.metricHeader}>
                            <h3 style={styles.metricTitle}>Average Score</h3>
                            <Award size={20} color="var(--accent)" />
                        </div>
                        <div style={styles.metricValue}>{userStats.avgScore}%</div>
                        <div style={styles.metricTrend}>
                            <span style={{color: userStats.avgScore >= 70 ? 'var(--success)' : 'var(--warning)'}}>
                                {userStats.avgScore > 0 ? 'Overall Avg' : 'Pending First Test'}
                            </span>
                        </div>
                    </div>
                    <div className="glass-card" style={styles.metricCard}>
                        <div style={styles.metricHeader}>
                            <h3 style={styles.metricTitle}>Modules Touched</h3>
                            <BookOpen size={20} color="var(--warning)" />
                        </div>
                        <div style={styles.metricValue}>{userStats.modulesCompleted}</div>
                        <div style={styles.metricTrend}><span style={{color: 'var(--text-sub)'}}>Topic domains</span></div>
                    </div>
                    <div className="glass-card" style={styles.metricCard}>
                        <div style={styles.metricHeader}>
                            <h3 style={styles.metricTitle}>Career Readiness</h3>
                            <Zap size={20} color="var(--success)" />
                        </div>
                        <div style={styles.metricValue}>{userStats.readinessScore}<span style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>/100</span></div>
                        <div style={styles.metricTrend}>
                            <span style={{color: 'var(--success)'}}>
                                {userStats.readinessScore >= 70 ? 'Industry Ready' : 'In Training'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Graph */}
                <div className="glass-card" style={{ ...styles.chartContainer, maxWidth: '1000px', margin: '0 auto 4rem', padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Personal Performance Progress</h3>
                        <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem' }}>
                            {userStats.totalInterviews > 0 ? `Your assessment score trend over your recent attempts.` : `Complete your first mock assessment to start tracking your progress.`}
                        </p>
                    </div>
                    <div style={{ height: 320, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userStats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <RechartsTooltip 
                                    contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                                />
                                <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 8, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={styles.homeGrid}>
                    <div className="glass-card" style={styles.homeItem}>
                        <div style={styles.homeIcon}><Rocket size={20} color="var(--primary)"/></div>
                        <h4>AI Mock Interviews</h4>
                        <p>Real-time voice-interactive assessments for 12+ engineering departments.</p>
                    </div>
                    <div className="glass-card" style={styles.homeItem}>
                        <div style={styles.homeIcon}><BookOpen size={20} color="var(--accent)"/></div>
                        <h4>Learning Hub</h4>
                        <p>Curated training kits for core programming and soft skills mastery.</p>
                    </div>
                    <div className="glass-card" style={styles.homeItem}>
                        <div style={styles.homeIcon}><Globe size={20} color="var(--warning)"/></div>
                        <h4>Jobs & Internships Hub</h4>
                        <p>AI-driven job matching and unified search across top global platforms.</p>
                    </div>
                    <div className="glass-card" style={styles.homeItem}>
                        <div style={styles.homeIcon}><Code size={20} color="var(--success)"/></div>
                        <h4>Coding Studio</h4>
                        <p>Logic building and competitive programming challenges with AI feedback.</p>
                    </div>
                    <div className="glass-card" style={styles.homeItem}>
                        <div style={styles.homeIcon}><FileText size={20} color="var(--primary)"/></div>
                        <h4>Resume Analyzer AI</h4>
                        <p>Intelligent resume parsing and skill-gap identification with actionable insights.</p>
                    </div>
                    <div className="glass-card" style={styles.homeItem}>
                        <div style={styles.homeIcon}><Zap size={20} color="var(--accent)"/></div>
                        <h4>Performance Analytics</h4>
                        <p>Comprehensive dashboard tracking your overall progress and readiness score.</p>
                    </div>
                </div>
            </div>

            <div style={styles.missionSection}>
                <div style={styles.missionText}>
                    <h2 style={styles.sectionTitle}>Platform Capabilities</h2>
                    <p style={styles.missionDesc}>
                        Built as a comprehensive solution for modern students, this ecosystem integrates 
                        Natural Language Processing, Speech-to-Text, and Large Language Models to create 
                        a personalized mentor that understands your career goals and skill gaps.
                    </p>
                    <div style={styles.statRow}>
                        <div style={styles.miniStat}><CheckCircle size={16} color="var(--success)"/> Department Specific Analysis</div>
                        <div style={styles.miniStat}><CheckCircle size={16} color="var(--success)"/> Skill Gap Identification</div>
                        <div style={styles.miniStat}><CheckCircle size={16} color="var(--success)"/> Automated Learning Paths</div>
                    </div>
                </div>
                <div style={styles.missionVisual}>
                    <div className="glass-card" style={styles.visualCard}>
                        <div style={styles.visualCircles}>
                            <div style={styles.circleOuter}></div>
                            <div style={styles.circleInner}><Star size={32} color="var(--primary)"/></div>
                        </div>
                        <span style={styles.visualLabel}>Neural Engine Active</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderLab = (title, items, type) => (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>{title} ({items.length})</h2>
            </div>
            <div style={styles.grid}>
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5, borderColor: item.color || 'var(--primary)' }}
                        className="glass-card"
                        style={styles.domainCard}
                        onClick={() => type === 'assessment' ? handleAction(item) : setSelectedCourse(item)}
                    >
                        <div style={{...styles.iconWrapper, background: `${item.color || '#6366f1'}20`, color: item.color || '#6366f1'}}>
                            {type === 'assessment' ? <Monitor size={24}/> : <BookOpen size={24}/>}
                        </div>
                        <h3 style={styles.cardTitle}>{item.title}</h3>
                        <p style={styles.cardDesc}>{item.desc}</p>
                        <div style={{...styles.cardAction, color: item.color || 'var(--primary)'}}>
                            <span>{type === 'assessment' ? 'Start Assessment' : 'View Resources'}</span>
                            <ArrowRight size={16} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );

    const renderAcademicWizard = () => {
        if (!selectedLevel) {
            return (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Step 1: Choose Your Education Level</h2>
                    </div>
                    <div style={styles.grid}>
                        {curriculumData.education_levels.map(level => (
                            <motion.div key={level.id} whileHover={{ y: -5, borderColor: 'var(--primary)' }} className="glass-card" style={styles.domainCard} onClick={() => setSelectedLevel(level)}>
                                <div style={{...styles.iconWrapper, background: `rgba(99, 102, 241, 0.2)`, color: 'var(--primary)'}}>
                                    <BookOpen size={24}/>
                                </div>
                                <h3 style={styles.cardTitle}>{level.title}</h3>
                                <div style={styles.cardAction}><span>Select Level</span><ArrowRight size={16} /></div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            );
        }

        if (!selectedDegree) {
            const filteredDegrees = selectedLevel.degrees.filter(degree => 
                degree.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                degree.id.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
                    <div style={{...styles.sectionHeader, flexWrap: 'wrap', gap: '1rem'}}>
                        <h2 style={styles.sectionTitle}>Step 2: Select Your Degree</h2>
                        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                            <div style={styles.searchBar}>
                                <Search size={18} color="var(--text-sub)" />
                                <input 
                                    placeholder="Search degrees (e.g. BBA)..." 
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button onClick={() => { setSelectedLevel(null); setSearchQuery(''); }} style={styles.tabBtn}><X size={16}/> Back</button>
                        </div>
                    </div>
                    <div style={styles.grid}>
                        {filteredDegrees.length > 0 ? (
                            filteredDegrees.map(degree => (
                                <motion.div key={degree.id} whileHover={{ y: -5, borderColor: 'var(--primary)' }} className="glass-card" style={styles.domainCard} onClick={() => { setSelectedDegree(degree); setSearchQuery(''); }}>
                                    <div style={{...styles.iconWrapper, background: `rgba(99, 102, 241, 0.2)`, color: 'var(--primary)'}}>
                                        <BookOpen size={24}/>
                                    </div>
                                    <h3 style={styles.cardTitle}>{degree.title}</h3>
                                    <div style={styles.cardAction}><span>Select Degree</span><ArrowRight size={16} /></div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--text-sub)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                                No degrees found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </motion.section>
            );
        }

        if (!selectedGroup && selectedDegree.groups) {
            return (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Step 2.5: Select Engineering Branch</h2>
                        <button onClick={() => setSelectedDegree(null)} style={styles.tabBtn}><X size={16}/> Back</button>
                    </div>
                    <div style={styles.grid}>
                        {selectedDegree.groups.map(group => (
                            <motion.div key={group.id} whileHover={{ y: -5, borderColor: 'var(--primary)' }} className="glass-card" style={styles.domainCard} onClick={() => setSelectedGroup(group)}>
                                <div style={{...styles.iconWrapper, background: `rgba(99, 102, 241, 0.2)`, color: 'var(--primary)'}}>
                                    <BookOpen size={24}/>
                                </div>
                                <h3 style={styles.cardTitle}>{group.title}</h3>
                                <div style={styles.cardAction}><span>Select Branch Group</span><ArrowRight size={16} /></div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            );
        }

        if (!selectedStream) {
            const streamsToRender = selectedGroup ? selectedGroup.streams : selectedDegree.streams;
            return (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Step 3: Choose Your Specialization</h2>
                        <button onClick={() => { selectedDegree.groups ? setSelectedGroup(null) : setSelectedDegree(null); }} style={styles.tabBtn}><X size={16}/> Back</button>
                    </div>
                    <div style={styles.grid}>
                        {streamsToRender && streamsToRender.map(stream => (
                            <motion.div key={stream.id} whileHover={{ y: -5, borderColor: 'var(--accent)' }} className="glass-card" style={styles.domainCard} onClick={() => setSelectedStream(stream)}>
                                <div style={{...styles.iconWrapper, background: `rgba(236, 72, 153, 0.2)`, color: 'var(--accent)'}}>
                                    <Monitor size={24}/>
                                </div>
                                <h3 style={styles.cardTitle}>{stream.title}</h3>
                                <div style={{...styles.cardAction, color: 'var(--accent)'}}><span>Select Specialization</span><ArrowRight size={16} /></div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            );
        }

        if (!interviewType) {
            return (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Step 4: Choose Practice Type</h2>
                        <button onClick={() => setSelectedStream(null)} style={styles.tabBtn}><X size={16}/> Back</button>
                    </div>
                    <div style={styles.grid}>
                        <motion.div whileHover={{ y: -5, borderColor: 'var(--warning)' }} className="glass-card" style={styles.domainCard} onClick={() => setInterviewType('role')}>
                            <div style={{...styles.iconWrapper, background: `rgba(245, 158, 11, 0.2)`, color: 'var(--warning)'}}>
                                <Globe size={24}/>
                            </div>
                            <h3 style={styles.cardTitle}>Role-Based Interview</h3>
                            <p style={styles.cardDesc}>Test your skills for specific industry roles.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -5, borderColor: 'var(--success)' }} className="glass-card" style={styles.domainCard} onClick={() => setInterviewType('course')}>
                            <div style={{...styles.iconWrapper, background: `rgba(16, 185, 129, 0.2)`, color: 'var(--success)'}}>
                                <FileText size={24}/>
                            </div>
                            <h3 style={styles.cardTitle}>Subject-Specific Interview</h3>
                            <p style={styles.cardDesc}>Test your knowledge on a specific college subject.</p>
                        </motion.div>
                    </div>
                </motion.section>
            );
        }

        const activeCategories = interviewType === 'role' ? selectedStream.role_categories : selectedStream.course_categories;

        if (activeCategories && !selectedRoleCategory) {
            return (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Step 4.5: Select {interviewType === 'role' ? 'Industry' : 'Subject'} Category</h2>
                        <button onClick={() => setInterviewType(null)} style={styles.tabBtn}><X size={16}/> Back</button>
                    </div>
                    <div style={styles.grid}>
                        {activeCategories.map(category => (
                            <motion.div key={category.id} whileHover={{ y: -5, borderColor: 'var(--primary)' }} className="glass-card" style={styles.domainCard} onClick={() => setSelectedRoleCategory(category)}>
                                <div style={{...styles.iconWrapper, background: `rgba(99, 102, 241, 0.2)`, color: 'var(--primary)'}}>
                                    {interviewType === 'role' ? <Globe size={24}/> : <BookOpen size={24}/>}
                                </div>
                                <h3 style={styles.cardTitle}>{category.title}</h3>
                                {category.desc && <p style={styles.cardDesc}>{category.desc}</p>}
                                <div style={styles.cardAction}><span>Select Category</span><ArrowRight size={16} /></div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            );
        }

        let items = [];
        if (interviewType === 'role') {
            items = selectedRoleCategory ? selectedRoleCategory.roles : selectedStream.roles;
        } else {
            items = selectedRoleCategory ? selectedRoleCategory.courses : selectedStream.courses;
        }
        const title = interviewType === 'role' ? 'Industry Roles' : 'Subject Courses';

        return (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.gridSection}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>{title} ({items?.length || 0})</h2>
                    <button onClick={() => { selectedRoleCategory ? setSelectedRoleCategory(null) : setInterviewType(null); }} style={styles.tabBtn}><X size={16}/> Back</button>
                </div>
                <div style={styles.grid}>
                    {items && items.map((item) => (
                        <motion.div key={item.id} whileHover={{ y: -5, borderColor: item.color || 'var(--primary)' }} className="glass-card" style={styles.domainCard} onClick={() => interviewType === 'role' ? handleAction(item) : (item.resources ? setSelectedCourse(item) : handleAction(item))}>
                            <div style={{...styles.iconWrapper, background: `${item.color || '#6366f1'}20`, color: item.color || '#6366f1'}}>
                                {interviewType === 'role' ? <Monitor size={24}/> : <BookOpen size={24}/>}
                            </div>
                            <h3 style={styles.cardTitle}>{item.title}</h3>
                            <p style={styles.cardDesc}>{item.desc}</p>
                            <div style={{...styles.cardAction, color: item.color || 'var(--primary)'}}>
                                <span>{interviewType === 'role' ? 'Start Assessment' : (item.resources ? 'View Resources' : 'Start Assessment')}</span>
                                <ArrowRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        );
    };

    return (
        <div style={styles.content}>
            <AnimatePresence mode="wait">
                {activeTab === 'home' && renderHome()}
                {activeTab === 'academic' && renderAcademicWizard()}
                {activeTab === 'skills' && renderLab("Skills Hub", curriculumData.skills, 'assessment')}
                {activeTab === 'coding' && renderLab("Coding Studio", curriculumData.coding_studio, 'assessment')}
            </AnimatePresence>

            {/* Resources Modal */}
            <AnimatePresence>
                {selectedCourse && (
                    <div style={styles.modalOverlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={styles.modal}
                        >
                            <div style={styles.modalHeader}>
                                <h2>{selectedCourse.title} - Kit</h2>
                                <button onClick={() => setSelectedCourse(null)} style={styles.closeBtn}><X size={20}/></button>
                            </div>
                            <div style={styles.modalBody}>
                                <div style={styles.resourceGroup}>
                                    <h4><Globe size={16} color="var(--accent)"/> Top Websites</h4>
                                    <div style={styles.linkList}>
                                        {selectedCourse.resources.websites.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer" style={styles.linkItem}>
                                                <ExternalLink size={14}/> {new URL(url).hostname}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div style={styles.resourceGroup}>
                                    <h4><Play size={16} color="#ef4444"/> Video Lectures</h4>
                                    <a href={selectedCourse.resources.youtube} target="_blank" rel="noreferrer" style={{...styles.linkItem, color: '#ef4444'}}>
                                        <Play size={14} fill="#ef4444"/> Mastery Playlist
                                    </a>
                                </div>
                                <div style={styles.resourceGroup}>
                                    <h4><FileText size={16} color="var(--success)"/> Study Notes</h4>
                                    <a href={selectedCourse.resources.notes} target="_blank" rel="noreferrer" style={{...styles.linkItem, color: 'var(--success)'}}>
                                        <FileText size={14}/> Download PDF Roadmap
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assessment Type Modal */}
            <AnimatePresence>
                {selectedAssessmentItem && (
                    <div style={styles.modalOverlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={styles.modal}
                        >
                            <div style={styles.modalHeader}>
                                <h2>{selectedAssessmentItem.title} - Assessment</h2>
                                <button onClick={() => setSelectedAssessmentItem(null)} style={styles.closeBtn}><X size={20}/></button>
                            </div>
                            <div style={styles.modalBody}>
                                <p style={{ color: 'var(--text-sub)', marginBottom: '1rem' }}>Choose how you want to be assessed for this skill:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <motion.div 
                                        whileHover={{ y: -5, borderColor: 'var(--primary)' }} 
                                        className="glass-card" 
                                        style={{ ...styles.domainCard, padding: '1.5rem', textAlign: 'center' }}
                                        onClick={() => navigate(`/interview?domain=${encodeURIComponent(selectedAssessmentItem.domain || selectedAssessmentItem.title)}`)}
                                    >
                                        <div style={{...styles.iconWrapper, margin: '0 auto 1rem', background: `rgba(99, 102, 241, 0.2)`, color: 'var(--primary)'}}>
                                            <MessageSquare size={24}/>
                                        </div>
                                        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>AI Voice Interview</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Real-time voice interactive assessment</p>
                                    </motion.div>
                                    
                                    <motion.div 
                                        whileHover={{ y: -5, borderColor: 'var(--accent)' }} 
                                        className="glass-card" 
                                        style={{ ...styles.domainCard, padding: '1.5rem', textAlign: 'center' }}
                                        onClick={() => navigate(`/mcq?domain=${encodeURIComponent(selectedAssessmentItem.domain || selectedAssessmentItem.title)}`)}
                                    >
                                        <div style={{...styles.iconWrapper, margin: '0 auto 1rem', background: `rgba(236, 72, 153, 0.2)`, color: 'var(--accent)'}}>
                                            <FileText size={24}/>
                                        </div>
                                        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>MCQ Test</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Standard multiple choice questions</p>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    content: { padding: '1rem 0 4rem 0' },
    homeContainer: { display: 'flex', flexDirection: 'column', gap: '4rem' },
    homeHero: { textAlign: 'center', padding: '4rem 0' },
    heroBadge: { fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '2px', marginBottom: '1rem' },
    homeTitle: { fontSize: '4rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', lineHeight: 1 },
    homeLead: { fontSize: '1.25rem', color: 'var(--text-sub)', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6 },
    
    metricCard: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', textAlign: 'left' },
    metricHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    metricTitle: { color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 },
    metricValue: { color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0' },
    metricTrend: { fontSize: '0.8rem', color: 'var(--text-sub)' },
    
    homeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' },
    homeItem: { padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    homeIcon: { width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    missionSection: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' },
    missionText: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    sectionTitle: { fontSize: '2rem', fontWeight: 700, color: 'white' },
    missionDesc: { color: 'var(--text-sub)', lineHeight: 1.7, fontSize: '1.05rem' },
    statRow: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' },
    miniStat: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' },
    missionVisual: { display: 'flex', justifyContent: 'center' },
    visualCard: { width: '280px', height: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', background: 'rgba(255,255,255,0.01)' },
    visualCircles: { position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    circleOuter: { position: 'absolute', inset: 0, border: '2px dashed var(--primary)', borderRadius: '50%', opacity: 0.3, animation: 'spin 10s linear infinite' },
    circleInner: { width: 80, height: 80, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--primary-glow)' },
    visualLabel: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px' },
    
    gridSection: { marginTop: '1rem' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1.2rem', borderRadius: 12, border: '1px solid var(--glass-border)' },
    searchInput: { background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '250px', fontSize: '0.9rem' },
    tabSwitcher: { display: 'flex', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: 14 },
    tabBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', padding: '0.6rem 1.2rem', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' },
    tabActive: { background: 'var(--primary)', color: 'white', boxShadow: '0 4px 15px -4px var(--primary)' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
    domainCard: { padding: '2rem', cursor: 'pointer', border: '1px solid var(--glass-border)' },
    iconWrapper: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 700, color: 'white' },
    cardDesc: { color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, height: '3rem', overflow: 'hidden' },
    cardAction: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', marginTop: '1rem' },
    
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
    modal: { width: '100%', maxWidth: '500px', padding: '2.5rem' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' },
    modalBody: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    resourceGroup: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    linkList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    linkItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }
};

export default Dashboard;

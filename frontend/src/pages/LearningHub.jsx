import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { BookOpen, Target, AlertCircle, Zap, Code, Database, CheckCircle, ChevronRight, BrainCircuit, Activity, X, Loader, PlayCircle, Download, ArrowLeft, Calendar, Unlock, Lock } from 'lucide-react';

const LearningHub = () => {
    const location = useLocation();
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showDirectModal, setShowDirectModal] = useState(false);
    const [directSubject, setDirectSubject] = useState('');
    const [directDays, setDirectDays] = useState('7');

    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [activeModule, setActiveModule] = useState(null);
    const [completedModules, setCompletedModules] = useState([]); // Array of completed module titles

    const [skillGaps, setSkillGaps] = useState([
        { skill: 'Java', current: 7.2, target: 8.5, priority: 'Medium', color: 'var(--primary)' },
        { skill: 'Spring Boot', current: 4.1, target: 8.0, priority: 'High', color: 'var(--danger)' },
        { skill: 'SQL', current: 6.0, target: 8.0, priority: 'Medium', color: 'var(--primary)' }
    ]);

    const recommendations = [
        { title: 'Spring Boot REST APIs', reason: 'Weak performance in your last technical interview.', priority: 'High', icon: <Code size={20}/>, videoId: 'vtPkZShrvXQ' },
        { title: 'SQL Joins & Subqueries', reason: '3 incorrect SQL questions in Mock Test.', priority: 'Medium', icon: <Database size={20}/>, videoId: 'HXV3zeJZ1EQ' }
    ];

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const skillsParam = queryParams.get('skills');
        if (skillsParam) {
            handleGeneratePlan(skillsParam);
        }
    }, [location]);

    const handleGeneratePlan = (specificSkills = null) => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            const title = typeof specificSkills === 'string' ? "Resume Skill Gap Recovery Plan" : "Full Stack Mastery Plan";
            const topicsList = typeof specificSkills === 'string' ? specificSkills.split(',') : ["Dependency Injection", "REST API Design"];
            
            setGeneratedPlan({
                title: title,
                duration: "4 Weeks",
                modules: [
                    { title: "Week 1: Core Fundamentals", topics: topicsList, status: "Unlocked" },
                    { title: "Week 2: Advanced Integrations", topics: ["Complex Queries", "API Gateways"], status: "Locked" },
                    { title: "Week 3: Project Building", topics: ["Full Stack Dev", "Deployment"], status: "Locked" },
                    { title: "Week 4: Mock Assessments", topics: ["Interview Prep", "System Design"], status: "Locked" }
                ]
            });
            setShowPlanModal(true);
        }, 2500);
    };

    const handleGenerateDirectPlan = () => {
        if (!directSubject.trim()) return;
        setIsGenerating(true);
        
        setTimeout(() => {
            setIsGenerating(false);
            const daysCount = parseInt(directDays) || 7;
            const modules = [];
            for(let i=1; i<=daysCount; i++) {
                modules.push({
                    title: `Day ${i}: ${directSubject} Phase ${i}`,
                    topics: [`${directSubject} Basics part ${i}`, `Practice Exercise ${i}`],
                    status: i === 1 ? "Unlocked" : "Locked" // Only Day 1 is unlocked initially
                });
            }

            setGeneratedPlan({
                title: `${directSubject} Intensive Roadmap`,
                duration: `${daysCount} Days`,
                modules: modules
            });
            setShowDirectModal(false);
            setShowPlanModal(true);
        }, 1500);
    };

    const getVideoForTopic = (title, topic) => {
        const query = (title + " " + topic).toLowerCase();
        
        // Frontend
        if (query.includes('react')) return 'bMknfKXIFA8';
        if (query.includes('html') || query.includes('css')) return 'G3e-cpL7ofc';
        if (query.includes('javascript') || query.includes('js')) return 'W6NZfCO5SIk';
        if (query.includes('angular')) return '0LhBvp8qpro';
        if (query.includes('vue')) return 'FXpIoQ_rT_c';

        // Backend / DB
        if (query.includes('spring') || query.includes('java')) return 'vtPkZShrvXQ';
        if (query.includes('node') || query.includes('express')) return 'Oe421EPjeBE';
        if (query.includes('python') || query.includes('django')) return 'rfscVS0vtbw';
        if (query.includes('sql') || query.includes('database')) return 'HXV3zeJZ1EQ';
        if (query.includes('mongo') || query.includes('nosql')) return 'pWbMrx5rVBE';

        // Core / Systems
        if (query.includes('system design') || query.includes('architecture')) return 'bBQPxgX32y4';
        if (query.includes('docker') || query.includes('microservice')) return 'fqMOX6JJhGo';
        if (query.includes('aws') || query.includes('cloud')) return 'k1RI5locZE4';
        if (query.includes('git') || query.includes('version control')) return '8JJ101D3knE';
        if (query.includes('algorithm') || query.includes('data structure')) return '8hly31xKli0';
        if (query.includes('machine learning') || query.includes('ai')) return 'GwIoAwogpWU';
        if (query.includes('c++') || query.includes('cpp')) return 'vLnPwxZdW4Y';

        // Soft Skills
        if (query.includes('hr') || query.includes('communication') || query.includes('interview')) return 'QeIo5_73Y-E';
        if (query.includes('resume')) return 'Tt08KmFfIYQ';
        
        // Dynamic Fallbacks for unknown topics based on string length to simulate variety
        const fallbacks = ['8hly31xKli0', 'bBQPxgX32y4', 'W6NZfCO5SIk', 'QeIo5_73Y-E', 'GwIoAwogpWU'];
        return fallbacks[query.length % fallbacks.length];
    };

    const getReferenceLinks = (title, topic) => {
        const query = (title + " " + topic).toLowerCase();
        const links = [];
        
        if (query.includes('react') || query.includes('html') || query.includes('css') || query.includes('js') || query.includes('javascript') || query.includes('web')) {
            links.push({ name: 'MDN Web Docs', url: 'https://developer.mozilla.org', desc: 'Best for: HTML, CSS, JavaScript, APIs, web technologies' });
            links.push({ name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', desc: 'Best for: Web development, JavaScript, Python' });
            links.push({ name: 'W3Schools', url: 'https://www.w3schools.com', desc: 'Best for: HTML, CSS, JavaScript, SQL, Python' });
        } else if (query.includes('java') || query.includes('spring')) {
            links.push({ name: 'JavaTpoint', url: 'https://www.javatpoint.com', desc: 'Best for: Java, Spring, Hibernate, SQL, DBMS' });
            links.push({ name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org', desc: 'Best for: DSA, Java, interview preparation' });
            links.push({ name: 'StudyTonight', url: 'https://www.studytonight.com', desc: 'Best for: CS fundamentals, Java, OS' });
        } else if (query.includes('sql') || query.includes('database') || query.includes('dbms')) {
            links.push({ name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org', desc: 'Best for: DBMS, SQL, Normalization' });
            links.push({ name: 'TutorialsPoint', url: 'https://www.tutorialspoint.com', desc: 'Best for: SQL, DBMS, cloud' });
            links.push({ name: 'StudyTonight', url: 'https://www.studytonight.com', desc: 'Best for: CS fundamentals, DBMS' });
        } else if (query.includes('python') || query.includes('c++') || query.includes('c')) {
            links.push({ name: 'Programiz', url: 'https://www.programiz.com', desc: 'Best for: C, C++, Java, Python, programming fundamentals' });
            links.push({ name: 'TutorialsPoint', url: 'https://www.tutorialspoint.com', desc: 'Best for: Python, C/C++, AI' });
            links.push({ name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org', desc: 'Best for: DSA, Python, C++ concepts' });
        } else {
            links.push({ name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org', desc: 'Best for: DSA, OS, CN, AI, interview prep' });
            links.push({ name: 'TutorialsPoint', url: 'https://www.tutorialspoint.com', desc: 'Best for: Cloud, AI and many other subjects' });
            links.push({ name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', desc: 'Best for: Databases, ML, Web dev' });
            links.push({ name: 'StudyTonight', url: 'https://www.studytonight.com', desc: 'Best for: CS fundamentals, programming' });
        }
        
        return links;
    };

    const handleStartModule = (mod) => {
        if (mod.status === 'Locked' && !completedModules.includes(mod.title)) {
            alert("This module is currently locked. Complete the previous modules to unlock it!");
            return;
        }

        setShowPlanModal(false);
        const topic = mod.topics[0] || mod.title;
        const videoId = getVideoForTopic(mod.title, topic);

        setActiveModule({
            originalModule: mod,
            title: mod.title,
            videoId: videoId,
            referenceLinks: getReferenceLinks(mod.title, topic),
            notes: `
<h2>1. COMPREHENSIVE THEORETICAL EXPLANATION</h2>
<p>Welcome to the ultimate learning module for <strong>${mod.title}</strong>, focusing extensively on <strong>${topic}</strong>. This detailed resource is designed to take you from a fundamental understanding to an advanced, interview-ready state.</p>
<p>In modern software engineering, mastering this concept is critical. It acts as the backbone for building systems that are highly scalable, easily maintainable, and remarkably robust. This chapter will deeply explore the 'why' behind the technology, ensuring that you can not only write the code but architect the solution.</p>
<p><strong>Primary Objectives:</strong></p>
<ul>
    <li>Analyze the core architecture and fundamental principles behind the technology.</li>
    <li>Evaluate how these engineering paradigms solve historical bottlenecks in legacy applications.</li>
    <li>Deconstruct standard implementation patterns utilized by Fortune 500 tech companies.</li>
    <li>Prepare for rigorous technical interviews through extensive conceptual drills.</li>
</ul>

<div class="page-break"></div>

<h2>2. DEEP DIVE: ARCHITECTURE & IMPORTANT CONCEPTS</h2>
<p>To truly grasp this subject, we must peel back the layers of abstraction. Let us examine the four pillars of this technology:</p>
<ol>
    <li><strong>Core Abstraction:</strong> At its heart, this technology removes manual boilerplate. By abstracting away low-level configurations, developers can dedicate their cognitive load entirely to complex business logic.</li>
    <li><strong>Lifecycle Management:</strong> Memory leaks and rogue processes are a thing of the past. The underlying framework or runtime takes complete control of object creation, configuration, optimization, and eventual destruction via garbage collection.</li>
    <li><strong>Separation of Concerns (SoC):</strong> It enforces an exceptionally clean architectural design. By forcefully dividing the application into distinct layers (e.g., Controllers, Services, Repositories, or Presentation vs Logic), it ensures that a change in the UI does not break the database query.</li>
    <li><strong>Elastic Scalability:</strong> It was engineered from day one to handle high throughput, concurrent thread execution, and horizontal scaling across distributed nodes.</li>
</ol>
<p><em>Historical Context:</em> Before these concepts became industry standards, developers spent 40% of their time writing "glue code." Now, the ecosystem provides the glue, letting you build the actual house.</p>

<div class="page-break"></div>

<h2>3. PRACTICAL EXAMPLES & CODE IMPLEMENTATIONS</h2>
<p>Theory without practice is void. Let us look at a real-world scenario. Imagine you are tasked with building a highly scalable backend microservice for a global e-commerce checkout system processing thousands of transactions per second.</p>
<p>Instead of tightly coupling your checkout service to a specific payment gateway (like Stripe), you utilize standard decoupling principles.</p>

<pre><code>
// ==========================================
// ENTERPRISE IMPLEMENTATION EXAMPLE
// ==========================================

public interface PaymentProcessor {
    boolean charge(double amount, String currency);
}

// The core business service
public class CheckoutService {
    private final PaymentProcessor paymentProcessor;

    // Notice: Dependency is injected via the constructor.
    // The CheckoutService does not know IF it's using Stripe, PayPal, or Crypto!
    public CheckoutService(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }
    
    public void processOrder(Order order) {
        System.out.println("Initiating checkout for Order ID: " + order.getId());
        boolean success = paymentProcessor.charge(order.getTotal(), "USD");
        
        if(success) {
            System.out.println("Order processed successfully.");
        } else {
            throw new PaymentFailedException("Transaction declined.");
        }
    }
}
</code></pre>
<p><strong>Analysis of the Code:</strong> This pattern (Dependency Injection/Inversion of Control) makes unit testing incredibly easy. When testing <code>CheckoutService</code>, we do not need to hit the real Stripe API. We can simply pass in a MockPaymentProcessor.</p>

<div class="page-break"></div>

<h2>4. COMMON TECHNICAL INTERVIEW EXAMINATIONS</h2>
<p>If you list this skill on your resume, expect the following questions during your L4/L5 engineering interviews:</p>
<ul>
    <li>
        <strong>Q: Explain the internal workings of this concept to a junior developer.</strong><br/>
        <em>A:</em> Imagine a restaurant. Instead of you (the developer) going to the kitchen, cooking the food, and serving yourself, you simply give your order to the waiter (the framework). The framework manages the ingredients, the chefs, and brings the finished product to your table. It acts as an invisible manager that wires everything together at runtime.
    </li>
    <li>
        <strong>Q: What are the severe performance implications of misusing this?</strong><br/>
        <em>A:</em> While there is a slight overhead during application startup due to the initial scanning, mapping, and dependency resolution, runtime performance is heavily optimized. However, if misconfigured (e.g., creating too many prototype beans instead of singletons), it can lead to massive heap exhaustion and garbage collection pauses.
    </li>
    <li>
        <strong>Q: How would you debug a circular dependency issue?</strong><br/>
        <em>A:</em> A circular dependency occurs when Service A requires Service B, and Service B requires Service A. To resolve this, I would first attempt to refactor the shared logic into a brand new Service C. If architectural refactoring isn't immediately possible, I would use lazy initialization (e.g., @Lazy) as a temporary workaround.
    </li>
</ul>

<div class="page-break"></div>

<h2>5. MASTERY ASSESSMENT & PRACTICE LAB</h2>
<p>Test your comprehension with these rigorous assessment questions before moving to the next module.</p>
<ol>
    <li><strong>Architectural Decision:</strong> You are tasked with migrating a 10-year-old monolithic application to this modern paradigm. Write a 3-step execution plan outlining how you would implement this without causing downtime.</li>
    <li><strong>Debugging:</strong> If the framework throws a <code>NullPointerException</code> at runtime despite the dependency being declared, what are the top 3 configuration errors you would check first?</li>
    <li><strong>Multiple Choice:</strong> What is the primary architectural benefit of this approach?
        <br/>a) Faster compilation times in the IDE
        <br/>b) Extreme loose coupling between modules
        <br/>c) Reduction in absolute memory usage footprint
        <br/>d) Faster UI rendering speeds
        <br/><em>(Answer: B)</em>
    </li>
</ol>
<hr/>
<p><strong>END OF DOCUMENT</strong></p>
<p><em>Proceed to the next module in the AI Learning Hub to continue your personalized roadmap.</em></p>
`
        });
    };

    const handleCompleteModule = () => {
        if (!activeModule) return;
        setCompletedModules(prev => [...prev, activeModule.title]);
        
        // If part of the generated plan, unlock the next one
        if (generatedPlan) {
            const updatedModules = [...generatedPlan.modules];
            const currentIndex = updatedModules.findIndex(m => m.title === activeModule.title);
            if (currentIndex !== -1 && currentIndex + 1 < updatedModules.length) {
                updatedModules[currentIndex + 1].status = "Unlocked";
            }
            setGeneratedPlan({
                ...generatedPlan,
                modules: updatedModules
            });
        }
        
        alert("🎉 Congratulations! You completed this module. The next section has been unlocked.");
        setActiveModule(null);
        setShowPlanModal(true); // Bring them back to the roadmap
    };

    const downloadNotes = () => {
        if (!activeModule) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${activeModule.title} - Comprehensive Study Guide</title>
                    <style>
                        body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; line-height: 1.8; color: #1e293b; max-width: 850px; margin: 0 auto; padding: 40px; }
                        h1 { color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; margin-bottom: 30px; }
                        h2 { color: #1d4ed8; margin-top: 40px; font-size: 1.5rem; }
                        p, li { font-size: 1.05rem; }
                        pre { background: #f8fafc; padding: 25px; border-radius: 12px; overflow-x: auto; font-size: 14px; border: 1px solid #e2e8f0; }
                        code { font-family: 'Fira Code', monospace; color: #b91c1c; }
                        .page-break { page-break-before: always; margin-top: 50px; }
                        ul, ol { padding-left: 25px; }
                        li { margin-bottom: 12px; }
                        .watermark { text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${activeModule.title} - Deep Dive Mastery</h1>
                    <p><strong>Generated by: Platform Intelligence Learning Hub</strong></p>
                    <p><em>This document contains an extensive 5-page depth analysis, theoretical foundations, code implementations, and rigorous interview preparation materials.</em></p>
                    <hr/>
                    ${activeModule.notes}
                    <div class="watermark">Confidential & Proprietary Learning Material - Generated Automatically</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Timeout ensures styles load before print dialogue triggers
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    if (activeModule) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.container}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setActiveModule(null)} style={styles.backBtn}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button onClick={handleCompleteModule} style={{...styles.downloadBtn, background: 'var(--success)', color: 'white'}}>
                        <CheckCircle size={18} /> Mark Module as Completed
                    </button>
                </div>
                
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>{activeModule.title}</h1>
                        <p style={styles.subtitle}>Watch the conceptual lecture below, read the detailed theory, and complete the practice questions.</p>
                    </div>
                    <button onClick={downloadNotes} style={styles.downloadBtn}>
                        <Download size={18} /> Download Notes
                    </button>
                </div>

                <div style={{...styles.moduleGrid, gridTemplateColumns: '1.5fr 1fr'}}>
                    <div style={styles.videoContainer}>
                        <div style={styles.iframeWrapper}>
                            <iframe 
                                src={`https://www.youtube.com/embed/${activeModule.videoId}`} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '16px' }}
                            ></iframe>
                        </div>
                    </div>
                    
                    <div className="glass-card" style={{...styles.notesPreview, padding: '1.5rem'}}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <BookOpen color="var(--primary)" size={24} />
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Reference Links</h3>
                        </div>
                        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Explore these trusted, free resources to dive deeper into the concepts with more examples.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {activeModule.referenceLinks && activeModule.referenceLinks.map((link, idx) => (
                                <a 
                                    key={idx} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{ 
                                        display: 'block', padding: '1rem', background: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '12px', border: '1px solid var(--glass-border)',
                                        textDecoration: 'none', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)' }}
                                >
                                    <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>
                                        {link.name}
                                    </div>
                                    <div style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                                        {link.desc}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Adaptive <span style={{ color: 'var(--primary)' }}>Learning Hub</span></h1>
                    <p style={styles.subtitle}>Start direct learning or get personalized paths based on your interview skill gaps.</p>
                </div>
                <div style={styles.overallReadiness}>
                    <div style={styles.readinessScore}>68%</div>
                    <div style={styles.readinessLabel}>Career Readiness</div>
                </div>
            </div>

            <div style={styles.grid}>
                {/* Left Column */}
                <div style={styles.leftCol}>
                    <div className="glass-card" style={styles.card}>
                        <div style={styles.cardHeader}>
                            <BrainCircuit color="var(--primary)" size={24} />
                            <h3>Learning Modes</h3>
                        </div>
                        <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            Choose how you want to learn. You can dive directly into a topic, or let the AI build a plan based on your recent skill gaps.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button 
                                onClick={() => setShowDirectModal(true)}
                                style={{...styles.generateBtn, background: 'var(--accent)'}}
                            >
                                <Calendar size={18} /> Direct Learning (Custom Roadmap)
                            </button>

                            <button 
                                onClick={() => handleGeneratePlan()}
                                disabled={isGenerating}
                                style={{...styles.generateBtn, background: isGenerating ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}}
                            >
                                {isGenerating ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Loader className="spin" size={18} /> Analyzing Gaps...
                                    </span>
                                ) : <><Target size={18}/> Generate AI Skill-Gap Plan</>}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card" style={styles.card}>
                        <div style={styles.cardHeader}>
                            <AlertCircle color="var(--danger)" size={24} />
                            <h3>AI Identified Skill Gaps</h3>
                        </div>
                        <div style={styles.gapList}>
                            {skillGaps.map((gap, i) => (
                                <div key={i} style={styles.gapItem}>
                                    <div style={styles.gapTop}>
                                        <span style={styles.gapName}>{gap.skill}</span>
                                        <span style={{...styles.gapPriority, color: gap.priority === 'High' ? 'var(--danger)' : 'var(--primary)'}}>
                                            {gap.priority === 'High' && '🔴'} {gap.priority} Priority
                                        </span>
                                    </div>
                                    <div style={styles.progressRow}>
                                        <div style={styles.progressBarBg}>
                                            <div style={{...styles.progressBarFill, width: `${(gap.current / 10) * 100}%`, background: gap.color}} />
                                        </div>
                                        <span style={styles.gapScore}>{gap.current} / {gap.target}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={styles.rightCol}>
                    <div className="glass-card" style={styles.card}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap color="#f59e0b" size={24} /> AI Recommended for You
                        </h3>
                        <div style={styles.recommendationList}>
                            {recommendations.map((rec, i) => (
                                <motion.div onClick={() => handleStartModule({title: rec.title, topics: [rec.title], status: 'Unlocked'})} whileHover={{ scale: 1.02 }} key={i} style={styles.recCard}>
                                    <div style={styles.recIcon}>{rec.icon}</div>
                                    <div style={styles.recContent}>
                                        <h4 style={styles.recTitle}>{rec.title}</h4>
                                        <p style={styles.recReason}><strong>Reason:</strong> {rec.reason}</p>
                                    </div>
                                    <ChevronRight color="var(--text-sub)" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Direct Learning Setup Modal */}
            <AnimatePresence>
                {showDirectModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.modalOverlay}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{...styles.modalContent, maxWidth: '450px'}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ color: 'white', margin: 0 }}>Direct Learning Setup</h2>
                                <button onClick={() => setShowDirectModal(false)} style={styles.closeBtn}><X size={24} /></button>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Subject or Target Role</label>
                                <input 
                                    style={styles.inputField}
                                    placeholder="e.g. ReactJS, System Design, Data Analyst"
                                    value={directSubject}
                                    onChange={(e) => setDirectSubject(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>How many days to complete?</label>
                                <select 
                                    style={styles.inputField}
                                    value={directDays}
                                    onChange={(e) => setDirectDays(e.target.value)}
                                >
                                    <option style={{color: 'black'}} value="3">3 Days (Crash Course)</option>
                                    <option style={{color: 'black'}} value="7">7 Days (Standard)</option>
                                    <option style={{color: 'black'}} value="14">14 Days (Comprehensive)</option>
                                    <option style={{color: 'black'}} value="30">30 Days (Mastery)</option>
                                </select>
                            </div>

                            <button onClick={handleGenerateDirectPlan} disabled={isGenerating || !directSubject} style={{...styles.generateBtn, background: 'var(--primary)'}}>
                                {isGenerating ? <Loader className="spin" size={18} /> : "Generate Scheduled Roadmap"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generated Plan Modal */}
            <AnimatePresence>
                {showPlanModal && generatedPlan && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.modalOverlay}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={styles.modalContent}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ color: 'white', margin: 0 }}>{generatedPlan.title}</h2>
                                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>Duration: {generatedPlan.duration}</span>
                                </div>
                                <button onClick={() => setShowPlanModal(false)} style={styles.closeBtn}><X size={24} /></button>
                            </div>

                            <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
                                Your personalized sequential roadmap. You must complete each module to unlock the next.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {generatedPlan.modules.map((mod, i) => {
                                    const isCompleted = completedModules.includes(mod.title);
                                    const isLocked = mod.status === 'Locked' && !isCompleted;
                                    
                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => handleStartModule(mod)}
                                            style={{
                                                ...styles.moduleCard, 
                                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                                opacity: isLocked ? 0.6 : 1,
                                                borderColor: isCompleted ? 'var(--success)' : (isLocked ? 'var(--glass-border)' : 'var(--primary)')
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h4 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {isCompleted ? <CheckCircle size={18} color="var(--success)"/> : (isLocked ? <Lock size={18}/> : <Unlock size={18} color="var(--primary)"/>)}
                                                    {mod.title}
                                                </h4>
                                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '8px', background: isCompleted ? 'rgba(16,185,129,0.1)' : (isLocked ? 'rgba(255,255,255,0.1)' : 'var(--primary)'), color: isCompleted ? 'var(--success)' : (isLocked ? 'var(--text-sub)' : 'white') }}>
                                                    {isCompleted ? 'Completed' : (isLocked ? 'Locked' : 'Start Now')}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {mod.topics.map((t, j) => (
                                                    <span key={j} style={styles.topicBadge}>{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' },
    title: { fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' },
    subtitle: { color: 'var(--text-sub)', fontSize: '1.1rem', maxWidth: '600px' },
    overallReadiness: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(16,185,129,0.1)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)' },
    readinessScore: { fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1 },
    readinessLabel: { color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' },
    
    grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    rightCol: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    
    card: { padding: '2rem' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
    
    gapList: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
    gapItem: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    gapTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    gapName: { color: 'white', fontWeight: 600 },
    gapPriority: { fontSize: '0.8rem', fontWeight: 600 },
    
    progressRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
    progressBarBg: { flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease-out' },
    gapScore: { color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: 600, width: '60px', textAlign: 'right' },
    
    recommendationList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    recCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)', cursor: 'pointer' },
    recIcon: { width: 44, height: 44, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    recContent: { flex: 1 },
    recTitle: { color: 'white', fontSize: '1.05rem', marginBottom: '0.3rem' },
    recReason: { color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.4 },
    
    inputField: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: 12, color: 'white', fontSize: '1rem', outline: 'none' },
    generateBtn: { width: '100%', padding: '1.2rem', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '1rem', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { width: '90%', maxWidth: '600px', background: 'var(--surface)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' },
    closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' },
    moduleCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px', transition: 'all 0.2s' },
    topicBadge: { background: 'rgba(0,0,0,0.4)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-sub)' },

    // Module Viewer Styles
    backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', cursor: 'pointer', width: 'fit-content', fontWeight: 600 },
    downloadBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 },
    moduleGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' },
    videoContainer: { display: 'flex', flexDirection: 'column' },
    iframeWrapper: { position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' },
    notesPreview: { padding: '2rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'rgba(15,23,42,0.6)', borderRadius: '16px', border: '1px solid var(--glass-border)' },
    notesText: { color: 'var(--text-sub)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, overflowY: 'auto', flex: 1, paddingRight: '1rem' }
};

export default LearningHub;

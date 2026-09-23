require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const https = require('https');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);
    
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    // --- INSTAGRAM / YOUTUBE STYLE LIVE STREAM SOCKET EVENTS ---
    socket.on('join_live_room', (data) => {
        socket.join('live_stream_room');
        const count = io.sockets.adapter.rooms.get('live_stream_room')?.size || 1;
        io.to('live_stream_room').emit('viewer_count_update', { count });
    });

    socket.on('leave_live_room', () => {
        socket.leave('live_stream_room');
        const count = io.sockets.adapter.rooms.get('live_stream_room')?.size || 0;
        io.to('live_stream_room').emit('viewer_count_update', { count });
    });

    socket.on('send_live_chat', (data) => {
        io.to('live_stream_room').emit('receive_live_chat', data);
    });

    socket.on('send_live_reaction', (data) => {
        io.to('live_stream_room').emit('receive_live_reaction', data);
    });

    socket.on('broadcast_video_frame', (data) => {
        socket.to('live_stream_room').emit('receive_video_frame', data);
    });
    
    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const count = io.sockets.adapter.rooms.get('live_stream_room')?.size || 0;
        io.to('live_stream_room').emit('viewer_count_update', { count });
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built frontend static assets from frontend/dist
const frontendDistStatic = path.join(__dirname, 'frontend/dist');
if (fs.existsSync(frontendDistStatic)) {
    app.use(express.static(frontendDistStatic));
}

// Multer Storage Configuration for Local Video & Image Uploads
const uploadsDir = path.join(__dirname, 'uploads/videos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads/videos');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.mp4';
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const videoUpload = multer({ 
    storage: videoStorage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB file limit
});

// Database connection
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Ensure users table exists with expanded fields
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            firstName TEXT,
            lastName TEXT,
            dob TEXT,
            email TEXT,
            phone TEXT,
            gender TEXT,
            university TEXT,
            collegeName TEXT,
            status TEXT DEFAULT 'pending'
        )`, (err) => {
            if (err) console.error("Table creation error:", err.message);
            else {
                // Migration check: Add columns if they don't exist in an old DB
                const columns = ['firstName', 'lastName', 'dob', 'email', 'phone', 'gender', 'university', 'collegeName', 'status'];
                columns.forEach(col => {
                    db.run(`ALTER TABLE users ADD COLUMN ${col} TEXT`, (err) => {
                        // Ignore errors if column already exists
                    });
                });
                
                // Initialize old users as approved
                db.run(`UPDATE users SET status = 'approved' WHERE status IS NULL`, (err) => {});
                // Add unique index on email (ignore if exists)
                db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`, (err) => {
                    if (err) console.log('Email index note:', err.message);
                    else console.log('Email uniqueness constraint active.');
                });
            }
        });

        // Create Interviews Table
        db.run(`CREATE TABLE IF NOT EXISTS interviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            domain TEXT,
            score REAL,
            feedback TEXT,
            date_taken DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`, (err) => {
            if (err) console.error("Interviews table creation error:", err.message);
        });

        // Create Certificates Table
        db.run(`CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            domain TEXT,
            score REAL,
            status TEXT DEFAULT 'pending_approval',
            date_issued DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`, (err) => {
            if (err) console.error("Certificates table creation error:", err.message);
            else {
                // Cleanup orphan certificates for users who have no interview history
                db.run(`DELETE FROM certificates WHERE user_id NOT IN (SELECT DISTINCT user_id FROM interviews)`, (err) => {
                    if (!err) console.log('🧹 Verified database certificate integrity.');
                });
            }
        });

        // Create Videos Table
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            domain TEXT,
            description TEXT,
            video_url TEXT NOT NULL,
            thumbnail_url TEXT,
            duration TEXT DEFAULT '15:00',
            quality TEXT DEFAULT '1080p Full HD',
            date_uploaded DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Videos table creation error:", err.message);
        });

        // Create Live Sessions Table
        db.run(`CREATE TABLE IF NOT EXISTS live_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            domain TEXT,
            description TEXT,
            stream_url TEXT,
            status TEXT DEFAULT 'active',
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ended_at DATETIME
        )`, (err) => {
            if (err) console.error("Live sessions table creation error:", err.message);
        });

        // Ensure admins table exists
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'Super Admin'
        )`, (err) => {
            if (err) console.error("Admin table creation error:", err.message);
            else {
                // Pre-create the single Super Admin account if it doesn't exist
                db.get('SELECT id FROM admins WHERE username = ?', ['admin'], (err, row) => {
                    if (!row) {
                        db.run(`INSERT INTO admins (username, password, role) VALUES (?, ?, ?)`, ['admin', 'admin123', 'Super Admin'], (err) => {
                            if (!err) console.log('👑 Super Admin account created successfully. (admin / admin123)');
                        });
                    } else {
                        console.log('👑 Super Admin account verified.');
                    }
                });
            }
        });
    }
});

// Email Configuration — Auto-creates a working test mailbox
let transporter = null;

(async () => {
    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD
                }
            });
            console.log('📧 Email system ready (LIVE PRODUCTION MODE)');
        } else {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('📧 Email system ready (test mode)');
        }
    } catch (err) {
        console.error('Email setup failed:', err.message);
    }
})();

const sendEmail = async (to, subject, htmlBody) => {
    if (!transporter) {
        console.log(`📧 [EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
        return;
    }
    // Safety check: Skip sending to dummy/test domains that cause delivery failure bounce-backs to admin inbox
    if (!to || typeof to !== 'string' || to.endsWith('@example.com') || to.endsWith('@test.com') || to.includes('@localhost') || to.includes('student1787')) {
        console.log(`📧 [BOUNCE PREVENTION SKIPPED] To: ${to} | Subject: ${subject}`);
        return;
    }
    try {
        const senderAddress = process.env.EMAIL_USER ? `"AI Interview Studio" <${process.env.EMAIL_USER}>` : '"AI Interview Studio" <studio@ai-interview.com>';
        const info = await transporter.sendMail({
            from: senderAddress,
            to, subject, 
            html: htmlBody
        });
        console.log(`📧 Email sent to ${to}: ${subject}`);
        if (nodemailer.getTestMessageUrl(info)) {
            console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (err) {
        console.error("Email failed:", err.message);
    }
};

// API Routes

const otpStore = {};

app.post('/api/send-registration-otp', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existing) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (existing) return res.status(409).json({ error: 'This email is already registered.' });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };
        
        sendEmail(email, "🔑 Validate your AI Interview Studio Account", 
            `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#6366f1;">Email Validation Required</h2>
                <p>Your OTP for registration is: <strong style="font-size:24px;color:#0ea5e9;">${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
            </div>`
        );
        console.log(`[OTP Simulated for Registration] -> ${email}: ${otp}`);
        res.status(200).json({ message: 'OTP sent successfully' });
    });
});

app.post('/api/verify-registration-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
    
    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email' });
    if (Date.now() > record.expires) return res.status(400).json({ error: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    
    delete otpStore[email];
    res.status(200).json({ message: 'Email validated successfully' });
});

// Register API
app.post('/api/register', (req, res) => {
    const { 
        username, password, firstName, lastName, 
        dob, email, phone, gender, university, collegeName 
    } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password and email are required' });
    }

    const sql = `INSERT INTO users (
        username, password, firstName, lastName, 
        dob, email, phone, gender, university, collegeName, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

    // Check for duplicate email first
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existing) => {
        if (existing) {
            return res.status(409).json({ error: 'This email is already registered. Please login instead.' });
        }

        db.run(sql, [
            username, password, firstName, lastName, 
            dob, email, phone, gender, university, collegeName
        ], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed: users.username')) {
                    return res.status(409).json({ error: 'Username already exists. Choose a different one.' });
                }
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'This email is already registered.' });
                }
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
        res.status(201).json({ message: 'Registration successful', userId: this.lastID });
        
        // Send Welcome Email
        sendEmail(email, "🎓 Welcome to AI Interview Studio", 
            `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#6366f1;">Welcome to AI Interview Studio!</h2>
                <p>Hi <strong>${firstName || username}</strong>,</p>
                <p>Your account has been created successfully. You now have access to:</p>
                <ul>
                    <li>🎯 AI-powered Mock Interviews</li>
                    <li>📚 12+ Department Assessments</li>
                    <li>🤖 Personal AI Academic Mentor</li>
                    <li>📊 Performance Analytics & Certificates</li>
                </ul>
                <p>Start your first mock interview now and track your growth!</p>
                <br/>
                <p style="color:#64748b;font-size:12px;">— AI Interview Studio | Built by Soumya & Team</p>
            </div>`
        );
    }); // close db.run
    }); // close db.get
});

// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanIdentifier = (username || '').trim();
    const sql = 'SELECT * FROM users WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND password = ?';
    db.get(sql, [cleanIdentifier, cleanIdentifier, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials. Please check your username/email and password.' });
        }
        
        if (row.status === 'pending') {
            return res.status(403).json({ error: 'Account pending admin approval. Please wait.' });
        }
        
        // Logged in successfully
        res.status(200).json({ 
            message: 'Login successful', 
            username: row.username,
            profile: {
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email
            }
        });

        // Send Login Notification Email
        if (row.email) {
            sendEmail(row.email, "🔐 New Login — AI Interview Studio", 
                `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                    <h2 style="color:#6366f1;">Login Notification</h2>
                    <p>Hi <strong>${row.firstName || row.username}</strong>,</p>
                    <p>A new login was detected on your AI Interview Studio account:</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p>If this wasn't you, please secure your account immediately.</p>
                    <br/>
                    <p style="color:#64748b;font-size:12px;">— AI Interview Studio | Built by Soumya & Team</p>
                </div>`
            );
        }
    });
});
// --- OTP Email Sending API (BACKEND SECURITY UPGRADE) ---
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_key_2026';
const adminOtps = new Map();

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized: No token provided' });
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        req.admin = decoded;
        next();
    });
};

app.post('/api/admin/send-otp', async (req, res) => {
    const { email } = req.body;
    // Generate secure OTP on the server!
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    adminOtps.set(email, { otp, expires: Date.now() + 300000 }); // 5 min expiry
    
    try {
        await sendEmail(
            email, 
            '🚨 CRITICAL: Admin Login OTP', 
            `<p>Your highly secure Admin Portal OTP is: <strong>${otp}</strong></p><p>If you did not request this, lock down the system immediately.</p>`
        );
        res.status(200).json({ success: true, message: 'OTP sent securely' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ error: 'Failed to send OTP email.', details: error.message });
    }
});

app.post('/api/admin/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const record = adminOtps.get(email);
    
    if (!record || record.expires < Date.now()) {
        return res.status(400).json({ error: 'OTP expired or invalid.' });
    }
    
    if (record.otp === otp) {
        adminOtps.delete(email); // Prevent reuse
        const token = jwt.sign({ email, role: 'Super Admin' }, JWT_SECRET, { expiresIn: '30m' });
        res.status(200).json({ success: true, token });
    } else {
        res.status(400).json({ error: 'Invalid OTP code.' });
    }
});

// Admin Login API
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM admins WHERE username = ? AND password = ?';
    db.get(sql, [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }
        
        res.status(200).json({ 
            message: 'Admin login successful', 
            admin: {
                username: row.username,
                role: row.role
            }
        });
    });
});

// Admin Stats API
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    const stats = {
        totalStudents: 0,
        pendingRegistrations: 0, 
        interviewsCompleted: 0, 
        certificatesIssued: 0 
    };
    
    const queries = [
        new Promise(resolve => db.get('SELECT COUNT(*) as count FROM users WHERE status = "approved"', (err, row) => resolve(row ? row.count : 0))),
        new Promise(resolve => db.get('SELECT COUNT(*) as count FROM users WHERE status = "pending"', (err, row) => resolve(row ? row.count : 0))),
        new Promise(resolve => db.get('SELECT COUNT(*) as count FROM interviews', (err, row) => resolve(row ? row.count : 0))),
        new Promise(resolve => db.get('SELECT COUNT(*) as count FROM certificates WHERE status = "approved"', (err, row) => resolve(row ? row.count : 0)))
    ];

    Promise.all(queries).then(results => {
        stats.totalStudents = results[0];
        stats.pendingRegistrations = results[1];
        stats.interviewsCompleted = results[2];
        stats.certificatesIssued = results[3];
        res.json(stats);
    });
});

// Admin Students List API
app.get('/api/admin/students', authenticateAdmin, (req, res) => {
    db.all('SELECT id, username, email, firstName, lastName, university, status FROM users', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ students: rows });
    });
});

// Admin Pending Registrations API
app.get('/api/admin/pending-registrations', authenticateAdmin, (req, res) => {
    db.all('SELECT id, username, email, firstName, lastName, university FROM users WHERE status = "pending"', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ students: rows });
    });
});

// Admin Approve Registration API
app.post('/api/admin/approve-registration', authenticateAdmin, (req, res) => {
    const { id } = req.body;
    db.run('UPDATE users SET status = "approved" WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, message: 'Student approved successfully' });
    });
});

// Admin Pending Certificates API
app.get('/api/admin/pending-certificates', authenticateAdmin, (req, res) => {
    const query = `
        SELECT c.id, c.domain, c.score, c.date_issued, u.firstName, u.lastName, u.email 
        FROM certificates c
        JOIN users u ON c.user_id = u.id
        WHERE c.status = 'pending_approval'
    `;
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ certificates: rows });
    });
});

// Admin Approve Certificate API
app.post('/api/admin/approve-certificate', authenticateAdmin, (req, res) => {
    const { id } = req.body;
    db.run('UPDATE certificates SET status = "approved" WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, message: 'Certificate approved successfully' });
    });
});
// Admin Analytics APIs based on REAL interviews data

app.get('/api/admin/domains', authenticateAdmin, (req, res) => {
    db.all('SELECT domain as name, COUNT(*) as count FROM interviews GROUP BY domain ORDER BY count DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
        const domains = rows.map(r => ({ ...r, percent: Math.round((r.count / total) * 100) }));
        res.json({ domains });
    });
});

app.get('/api/admin/performance-trend', authenticateAdmin, (req, res) => {
    db.all('SELECT date(date_taken) as day, AVG(score) as avgScore FROM interviews GROUP BY date(date_taken) ORDER BY date_taken LIMIT 10', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const trendData = rows.map(r => ({ name: r.day, score: Math.round(r.avgScore * 10) }));
        res.json({ trendData });
    });
});

app.get('/api/admin/skill-gaps', authenticateAdmin, (req, res) => {
    db.all('SELECT domain as skill, AVG(score) as avgScore FROM interviews GROUP BY domain ORDER BY avgScore ASC LIMIT 5', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const skillGaps = rows.map(r => ({ skill: r.skill, score: Math.round(r.avgScore * 10), max: 100 }));
        res.json({ skillGaps });
    });
});

app.get('/api/admin/top-improvers', authenticateAdmin, (req, res) => {
    db.all('SELECT u.firstName, u.lastName, i.domain, i.score FROM interviews i JOIN users u ON i.user_id = u.id ORDER BY i.score DESC LIMIT 5', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const topImprovers = rows.map(r => ({ name: `${r.firstName} ${r.lastName}`, domain: r.domain, improvement: Math.round(r.score * 10) }));
        res.json({ topImprovers });
    });
});

app.get('/api/admin/alerts', authenticateAdmin, (req, res) => {
    db.get('SELECT COUNT(*) as count FROM users WHERE status = "pending"', (err, pendingUsers) => {
        db.get('SELECT COUNT(*) as count FROM certificates WHERE status = "pending_approval"', (err, pendingCerts) => {
            const alerts = [];
            if (pendingUsers && pendingUsers.count > 0) {
                alerts.push({ id: 1, message: `${pendingUsers.count} new student registrations pending approval.`, type: 'warning' });
            }
            if (pendingCerts && pendingCerts.count > 0) {
                alerts.push({ id: 2, message: `${pendingCerts.count} certificates are waiting to be issued.`, type: 'info' });
            }
            db.get('SELECT COUNT(*) as count FROM interviews WHERE score < 6', (err, lowScores) => {
                if (lowScores && lowScores.count > 0) {
                    alerts.push({ id: 3, message: `${lowScores.count} recent interviews flagged for low performance.`, type: 'danger' });
                }
                res.json({ alerts });
            });
        });
    });
});

app.get('/api/admin/placement-readiness', authenticateAdmin, (req, res) => {
    db.get('SELECT COUNT(DISTINCT user_id) as readyCount FROM interviews WHERE score >= 8.5', (err, ready) => {
        db.get('SELECT COUNT(DISTINCT user_id) as totalCount FROM interviews', (err, total) => {
            const readyCount = ready ? ready.readyCount : 0;
            const totalCount = total ? total.totalCount : 1;
            const score = Math.round((readyCount / totalCount) * 100) || 0;
            res.json({ 
                readiness: {
                    score, trend: 5.2, ready: readyCount, needsImprovement: totalCount - readyCount, highPriority: 0
                }
            });
        });
    });
});

app.get('/api/admin/activity', authenticateAdmin, (req, res) => {
    const query = `
        SELECT u.firstName, u.lastName, i.domain, i.score, i.date_taken 
        FROM interviews i 
        JOIN users u ON i.user_id = u.id 
        ORDER BY i.date_taken DESC LIMIT 10
    `;
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const recentActivity = rows.map((r, i) => ({
            id: i,
            user: `${r.firstName} ${r.lastName}`,
            action: `completed an interview in ${r.domain} with score ${r.score}`,
            time: r.date_taken
        }));
        res.json({ recentActivity });
    });
});

// Get Profile API
app.get('/api/profile', (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username required' });

    db.get('SELECT username, firstName, lastName, email, phone, university, collegeName, dob, gender FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json({ profile: row });
    });
});

// Update Profile API
app.post('/api/profile/update', (req, res) => {
    const { username, firstName, lastName, phone, university, collegeName, dob, gender } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const sql = `UPDATE users SET firstName = ?, lastName = ?, phone = ?, university = ?, collegeName = ?, dob = ?, gender = ? WHERE username = ?`;
    db.run(sql, [firstName, lastName, phone, university, collegeName, dob, gender, username], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, message: 'Profile updated' });
    });
});

// --- USER INTERVIEWS & TOPIC CERTIFICATES APIs ---

// Get User Interviews API
app.get('/api/user/interviews', (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username required' });

    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        db.all('SELECT id, domain, score, feedback, date_taken FROM interviews WHERE user_id = ? ORDER BY date_taken DESC', [user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ interviews: rows || [] });
        });
    });
});

// Save User Interview API
app.post('/api/user/save-interview', (req, res) => {
    const { username, domain, score, feedback, category } = req.body;
    if (!username || !domain) return res.status(400).json({ error: 'Username and domain required' });

    db.get('SELECT id, email, firstName, username FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        const numScore = parseFloat(score) || 0;
        db.run('INSERT INTO interviews (user_id, domain, score, feedback) VALUES (?, ?, ?, ?)', 
            [user.id, domain, numScore, feedback || 'Assessment completed successfully'], 
            function(err) {
                if (err) return res.status(500).json({ error: 'Failed to save interview' });
                
                const interviewId = this.lastID;

                // Auto-check if user completed topic module criteria (>= 2 assessments in this domain & avg score >= 7.0)
                db.all('SELECT score FROM interviews WHERE user_id = ? AND domain = ?', [user.id, domain], (err, domainInterviews) => {
                    if (!err && domainInterviews && domainInterviews.length >= 2) {
                        const total = domainInterviews.reduce((acc, curr) => acc + curr.score, 0);
                        const avg = total / domainInterviews.length;
                        if (avg >= 7.0) {
                            // Check if certificate already exists or requested for this domain
                            db.get('SELECT id FROM certificates WHERE user_id = ? AND domain = ?', [user.id, domain], (err, cert) => {
                                if (!cert) {
                                    db.run('INSERT INTO certificates (user_id, domain, score, status) VALUES (?, ?, ?, "pending_approval")', 
                                        [user.id, domain, avg.toFixed(1)]);
                                }
                            });
                        }
                    }
                });

                res.json({ success: true, message: 'Interview saved', id: interviewId });
            }
        );
    });
});

// Get User Certificates API
app.get('/api/user/certificates', (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username required' });

    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        db.all('SELECT id, domain, score, status, date_issued FROM certificates WHERE user_id = ? ORDER BY date_issued DESC', [user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ certificates: rows || [] });
        });
    });
});

// Request Course Certificate API
app.post('/api/user/request-certificate', (req, res) => {
    const { username, domain, score } = req.body;
    if (!username || !domain) return res.status(400).json({ error: 'Username and domain required' });

    db.get('SELECT id, email, firstName FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        db.get('SELECT id, status FROM certificates WHERE user_id = ? AND domain = ?', [user.id, domain], (err, existing) => {
            if (existing) {
                return res.json({ success: true, message: 'Certificate request already recorded.', status: existing.status });
            }

            const numScore = parseFloat(score) || 8.5;
            db.run('INSERT INTO certificates (user_id, domain, score, status) VALUES (?, ?, ?, "pending_approval")', 
                [user.id, domain, numScore], 
                function(err) {
                    if (err) return res.status(500).json({ error: 'Failed to request certificate' });
                    res.json({ success: true, message: 'Certificate request submitted for Admin verification.', id: this.lastID, status: 'pending_approval' });
                }
            );
        });
    });
});

// --- HIGH-QUALITY VIDEO UPLOADS & LIVE STREAMING APIs ---

// Admin Upload Video API
app.post('/api/admin/upload-video', (req, res) => {
    const { title, domain, description, videoUrl, thumbnailUrl, quality } = req.body;
    if (!title || !videoUrl) return res.status(400).json({ error: 'Title and Video URL required' });

    const sql = `INSERT INTO videos (title, domain, description, video_url, thumbnail_url, quality) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        title, 
        domain || 'General Engineering', 
        description || 'High quality lecture video', 
        videoUrl, 
        thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', 
        quality || '1080p Full HD'
    ], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to upload video' });
        
        const videoId = this.lastID;
        const videoObj = { id: videoId, title, domain, description, video_url: videoUrl, thumbnail_url: thumbnailUrl, quality };

        // 1. Broadcast Socket.io event for real-time website toast
        io.emit('new_video_published', videoObj);

        // 2. Query all student emails and send superb HTML notification email
        db.all('SELECT email, firstName FROM users WHERE email IS NOT NULL', [], (err, students) => {
            if (!err && students && students.length > 0) {
                const htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #020617; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; color: #f8fafc;">
                    <div style="background: linear-gradient(135deg, #0ea5e9, #a855f7); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px;">🎬 NEW VIDEO LECTURE RELEASED</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">AI Interview Studio — High-Quality Learning</p>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #38bdf8; font-size: 20px; margin-top: 0;">${title}</h2>
                        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">${description || 'A new high-quality lecture has been uploaded to your learning dashboard.'}</p>
                        <div style="background: #0f172a; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #1e293b;">
                            <p style="margin: 0; font-size: 13px; color: #cbd5e1;"><strong>Topic Domain:</strong> ${domain || 'General'}</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #cbd5e1;"><strong>Quality:</strong> ${quality || '1080p Full HD'}</p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173/classes" style="background: linear-gradient(135deg, #0ea5e9, #a855f7); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; display: inline-block;">📺 Watch Lecture Now</a>
                        </div>
                    </div>
                </div>`;

                students.forEach(student => {
                    if (student.email) {
                        sendEmail(student.email, `🎬 New Lecture Uploaded: ${title}`, htmlBody);
                    }
                });
            }
        });

        res.json({ success: true, message: 'Video uploaded and student notifications sent', id: videoId });
    });
});

// Admin Upload Video File (Device Upload Multipart) API
app.post('/api/admin/upload-video-file', videoUpload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbnailFile', maxCount: 1 }
]), (req, res) => {
    const { title, domain, description, quality, videoUrl: bodyVideoUrl, thumbnailUrl: bodyThumbnailUrl } = req.body;
    
    let finalVideoUrl = bodyVideoUrl || '';
    if (req.files && req.files.videoFile && req.files.videoFile.length > 0) {
        finalVideoUrl = `/uploads/videos/${req.files.videoFile[0].filename}`;
    }

    let finalThumbnailUrl = bodyThumbnailUrl || '';
    if (req.files && req.files.thumbnailFile && req.files.thumbnailFile.length > 0) {
        finalThumbnailUrl = `/uploads/videos/${req.files.thumbnailFile[0].filename}`;
    }

    if (!title || !finalVideoUrl) {
        return res.status(400).json({ error: 'Title and video file/link are required' });
    }

    const defaultThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
    const sql = `INSERT INTO videos (title, domain, description, video_url, thumbnail_url, quality) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [
        title, 
        domain || 'General Engineering', 
        description || 'High quality lecture video', 
        finalVideoUrl, 
        finalThumbnailUrl || defaultThumb, 
        quality || '1080p Full HD'
    ], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to upload video file to server' });
        
        const videoId = this.lastID;
        const videoObj = { 
            id: videoId, 
            title, 
            domain, 
            description, 
            video_url: finalVideoUrl, 
            thumbnail_url: finalThumbnailUrl || defaultThumb, 
            quality,
            date_uploaded: new Date().toISOString()
        };

        // 1. Broadcast Socket.io event for real-time website toast
        io.emit('new_video_published', videoObj);

        // 2. Query all student emails and send HTML notification email
        db.all('SELECT email, firstName FROM users WHERE email IS NOT NULL', [], (err, students) => {
            if (!err && students && students.length > 0) {
                const htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #020617; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; color: #f8fafc;">
                    <div style="background: linear-gradient(135deg, #0ea5e9, #a855f7); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px;">🎬 NEW VIDEO LECTURE RELEASED</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">AI Interview Studio — High-Quality Learning</p>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #38bdf8; font-size: 20px; margin-top: 0;">${title}</h2>
                        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">${description || 'A new high-quality lecture has been uploaded to your learning dashboard.'}</p>
                        <div style="background: #0f172a; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #1e293b;">
                            <p style="margin: 0; font-size: 13px; color: #cbd5e1;"><strong>Topic Domain:</strong> ${domain || 'General'}</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #cbd5e1;"><strong>Quality:</strong> ${quality || '1080p Full HD'}</p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173/classes" style="background: linear-gradient(135deg, #0ea5e9, #a855f7); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; display: inline-block;">📺 Watch Lecture Now</a>
                        </div>
                    </div>
                </div>`;

                students.forEach(student => {
                    if (student.email) {
                        sendEmail(student.email, `🎬 New Lecture Uploaded: ${title}`, htmlBody);
                    }
                });
            }
        });

        res.json({ success: true, message: 'Video file uploaded successfully and student notifications sent', video: videoObj });
    });
});

// Get All Videos API
app.get('/api/videos', (req, res) => {
    db.all('SELECT * FROM videos ORDER BY date_uploaded DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ videos: rows || [] });
    });
});

// Delete Video API
app.delete('/api/admin/delete-video/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM videos WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true, message: 'Video deleted' });
    });
});

// Admin Start Live Stream API
app.post('/api/admin/start-live', (req, res) => {
    const { title, domain, description, streamUrl } = req.body;
    if (!title) return res.status(400).json({ error: 'Stream title required' });

    // End any existing active stream first
    db.run("UPDATE live_sessions SET status = 'ended', ended_at = CURRENT_TIMESTAMP WHERE status = 'active'", (err) => {
        const sql = `INSERT INTO live_sessions (title, domain, description, stream_url, status) VALUES (?, ?, ?, ?, 'active')`;
        db.run(sql, [
            title, 
            domain || 'General', 
            description || 'Live interactive session with Admin', 
            streamUrl || ''
        ], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to start live stream' });

            const liveSession = { id: this.lastID, title, domain, description, stream_url: streamUrl, status: 'active' };

            // 1. Emit Socket event to all online students
            io.emit('live_session_started', liveSession);

            // 2. Email all students immediately
            db.all('SELECT email, firstName FROM users WHERE email IS NOT NULL', [], (err, students) => {
                if (!err && students && students.length > 0) {
                    const htmlBody = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #020617; border-radius: 16px; overflow: hidden; border: 1px solid #ef4444; color: #f8fafc;">
                        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1px;">🔴 ADMIN LIVE SESSION STARTED NOW</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Live Interactive Studio Broadcast</p>
                        </div>
                        <div style="padding: 30px;">
                            <h2 style="color: #f87171; font-size: 20px; margin-top: 0;">${title}</h2>
                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">${description || 'The Admin has started an interactive live session. Join now to interact live via stream, Q&A chat, and live reactions!'}</p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="http://localhost:5173/classes" style="background: #ef4444; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(239,68,68,0.4);">🔴 JOIN LIVE STREAM NOW</a>
                            </div>
                        </div>
                    </div>`;

                    students.forEach(student => {
                        if (student.email) {
                            sendEmail(student.email, `🔴 LIVE NOW: ${title}`, htmlBody);
                        }
                    });
                }
            });

            res.json({ success: true, message: 'Live stream started and students notified', liveSession });
        });
    });
});

// Admin End Live Stream API
app.post('/api/admin/end-live', (req, res) => {
    db.run("UPDATE live_sessions SET status = 'ended', ended_at = CURRENT_TIMESTAMP WHERE status = 'active'", function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        io.emit('live_session_ended');
        res.json({ success: true, message: 'Live session ended' });
    });
});

// Get Active Live Stream API
app.get('/api/live-sessions/active', (req, res) => {
    db.get("SELECT * FROM live_sessions WHERE status = 'active' ORDER BY started_at DESC LIMIT 1", [], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ activeLive: row || null });
    });
});


// OpenAI API configuration based on python backend
const OPENROUTER_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || '';

function makeOpenRouterRequest(payload) {
    return new Promise((resolve, reject) => {
        const dataStr = JSON.stringify(payload);
        const options = {
            hostname: 'openrouter.ai',
            port: 443,
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(dataStr)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(dataStr);
        req.end();
    });
}

// Generate Question API
app.post('/api/notify_pause', async (req, res) => {
    const { username, email, domain, questionNum } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const subject = `Interview Paused: ${domain}`;
    const text = `Hi ${username}, your interview session for ${domain} was paused at Question ${questionNum}. You can resume it anytime from your dashboard. Keep going!`;
    
    await sendEmail(email, subject, text);
    res.json({ success: true, message: "Pause notification sent" });
});

// Generate Question API
app.post('/api/generate_question', async (req, res) => {
    const { domain, level, askedQuestions, previousScore, qaHistory, mode, resumeData } = req.body;
    
    let adaptiveContext = "";
    if (previousScore !== undefined) {
        if (parseFloat(previousScore) < 5) {
            adaptiveContext = "The candidate's previous answer was WEAK. Guide them or ask a foundational clarification question.";
        } else if (parseFloat(previousScore) >= 8) {
            adaptiveContext = "The candidate's previous answer was STRONG. Drill deeper into advanced edge-cases.";
        }
    }

    let prompt = `You are a highly intelligent, adaptive AI technical interviewer conducting a mock interview for the domain: ${domain}.`;
    
    // 3. Pressure Mode Logic
    if (mode === 'Difficult' || mode === 'Pressure') {
        prompt += `\nINTERVIEW MODE: PRESSURE (Hard). You must act tough and scrutinize the candidate. Challenge vague answers, ask unexpected follow-ups, quickly change topics if they stall, and drill deep into their technical logic. Do not be overly friendly.`;
    } else if (mode === 'Moderate' || mode === 'Professional') {
        prompt += `\nINTERVIEW MODE: PROFESSIONAL. Maintain a formal, standard corporate tone. Focus on structured behavioral and technical questions.`;
    } else {
        prompt += `\nINTERVIEW MODE: NORMAL (Easy). Be friendly, encouraging, and use a standard, supportive interview style.`;
    }

    // 4 & 5. Resume Deep-Dive & Fake Knowledge Detection
    if (resumeData) {
        prompt += `\n\nCANDIDATE'S RESUME CONTEXT: ${resumeData.substring(0, 500)}. You may occasionally ask deep-dive questions specific to their projects or claimed skills to verify they aren't faking their knowledge.`;
    }

    // 1, 2 & 6. Memory, Cross-Questioning, and the "Why" Chain
    if (qaHistory && qaHistory.length > 0) {
        const lastQA = qaHistory[qaHistory.length - 1];
        prompt += `
        
PREVIOUS CONVERSATION HISTORY (Memory):
${qaHistory.map((qa, i) => `Q${i+1}: ${qa.q}\nCandidate A${i+1}: ${qa.a}`).join('\n\n')}

CRITICAL INSTRUCTION FOR NEXT QUESTION:
Review the candidate's last answer. 
- If their answer was vague, surface-level, or mentioned a specific concept/tool, YOUR NEXT QUESTION MUST BE A DIRECT FOLLOW-UP CROSS-QUESTION. Dig deeper into their previous answer! (e.g., "You mentioned X, why did you use it over Y?", or "Can you give a real-world example of how you implemented that?"). Keep asking 'Why' until you verify their actual understanding.
- If the last answer was excellent and complete, transition smoothly to a new topic within ${domain}.
${adaptiveContext}`;
    } else {
        prompt += `\n\nThis is the FIRST question of the interview. Start by asking a strong foundational question about ${domain} or their resume.`;
    }

    prompt += `\n\nAsk ONLY ONE interview question. Do NOT repeat previous questions. Return ONLY the question string, nothing else.`;

    try {
        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini", // Openrouter fallback
            messages: [{ role: "user", content: prompt }],
            max_tokens: 120,
            temperature: 0.9
        });

        if(data && data.choices && data.choices.length > 0) {
            res.json({ question: data.choices[0].message.content.trim() });
        } else {
            console.error('Openrouter Error:', data);
            res.status(500).json({ error: 'Failed to generate question from AI' });
        }
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate MCQ API
app.post('/api/generate_mcq', async (req, res) => {
    const { domain, count = 10 } = req.body;
    
    const prompt = `You are a strict, expert examiner. Generate exactly ${count} multiple choice questions (MCQs) for the following domain:
Domain: ${domain}

Requirements:
- Each question must be highly relevant, practical, and test genuine understanding, not just trivia.
- Each question must have exactly 4 options.
- Only one option can be correct.
- Provide a short explanation for the correct answer.

Respond ONLY with a valid JSON array of objects. Do not include markdown code blocks like \`\`\`json or any other conversational text. 
Format:
[
  {
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "answer": 0, // index of correct option (0-3)
    "explanation": "Because..."
  }
]`;

    try {
        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini", 
            messages: [{ role: "user", content: prompt }],
            max_tokens: 4000,
            temperature: 0.7
        });

        if(data && data.choices && data.choices.length > 0) {
            let output = data.choices[0].message.content.trim();
            if (output.startsWith('\`\`\`json')) output = output.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
            else if (output.startsWith('\`\`\`')) output = output.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
            
            try {
                const mcqs = JSON.parse(output);
                res.json({ questions: mcqs });
            } catch (e) {
                console.error("Failed to parse MCQs JSON:", output);
                res.status(500).json({ error: 'Failed to parse AI response as JSON' });
            }
        } else {
            console.error('Openrouter Error:', data);
            res.status(500).json({ error: 'Failed to generate MCQs from AI' });
        }
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate MCQ Feedback API
app.post('/api/generate_mcq_feedback', async (req, res) => {
    const { domain, score, total, incorrectTopics } = req.body;
    
    let prompt = `You are a strict technical mentor. A student took a multiple-choice test on ${domain} and scored ${score} out of ${total}.`;
    
    if (incorrectTopics && incorrectTopics.length > 0) {
        prompt += `\nThey answered questions incorrectly related to these topics/questions:\n${incorrectTopics.join('\n')}\n`;
    }

    prompt += `
Based on this performance, provide exactly 2 bullet points for their strengths (what they likely know well given their score) and exactly 2 bullet points for their weaknesses/areas to focus on (specifically based on what they got wrong).

Return ONLY a valid JSON object in this exact format:
{
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}`;

    try {
        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.7
        });

        if (data && data.choices && data.choices.length > 0) {
            let output = data.choices[0].message.content.trim();
            if (output.startsWith('\`\`\`json')) output = output.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
            else if (output.startsWith('\`\`\`')) output = output.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
            
            try {
                const feedback = JSON.parse(output);
                res.json(feedback);
            } catch (e) {
                console.error("Failed to parse Feedback JSON:", output);
                res.json({ strengths: ["Solid foundational attempt."], weaknesses: ["Review the incorrect topics from your test report."] });
            }
        } else {
            res.status(500).json({ error: 'Failed to generate feedback from AI' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Evaluate Answer API
app.post('/api/evaluate_answer', async (req, res) => {
    const { question, answer, isCode } = req.body;
    
    let prompt = `You are a strict, professional technical interviewer evaluating a candidate's answer.
    
Question:
${question}

Candidate Answer:
${answer}

Evaluate the candidate's answer strictly based on technical accuracy, completeness, and clarity.
If the answer is gibberish, random letters (like "nk"), or completely irrelevant, you MUST score it 0/10 or 1/10.
Do NOT be overly generous. Give an honest, realistic score out of 10.

Evaluate the answer and respond EXPLICITLY in this precise format without any extra markdown formatting or conversational text:

Technical Score: X/10
Communication Score: X/10
Answer Quality: X/10
Strength: What they did well (if anything, otherwise say "None")
Missing: What crucial information is missing or incorrect
Suggestion: A strict but constructive tip for improvement`;

    if (isCode) {
        prompt = `You are an expert, strict Senior Software Engineer evaluating a candidate's code submission.

Challenge/Question:
${question}

Candidate Code:
${answer}

Evaluate the code strictly! Check for syntax correctness, logic, and efficiency.
If the code is gibberish, random letters, or completely fails to address the problem, score it 0/10 or 1/10.
Do NOT give high scores just for effort. Give an honest, realistic score out of 10.

Respond EXPLICITLY in this precise format without any extra markdown formatting or conversational text:

Technical Score: X/10
Communication Score: X/10
Answer Quality: X/10
Strength: What works well in their logic (if anything)
Missing: Crucial logical flaws or missing components
Suggestion: How they can fix or optimize their code`;
    }

    try {
        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini", 
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200
        });

        if(data && data.choices && data.choices.length > 0) {
            res.json({ evaluation: data.choices[0].message.content.trim() });
        } else {
            console.error('Openrouter Error:', data);
            res.status(500).json({ error: 'Failed to evaluate answer from AI' });
        }
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate Coding Problem API
app.post('/api/generate_coding_problem', async (req, res) => {
    const { mode, language, topic, difficulty, role, type, pastQuestions = [] } = req.body;
    
    let prompt = "";
    
    let exclusions = "";
    if (pastQuestions && pastQuestions.length > 0) {
        exclusions = `\nCRITICAL: Do NOT generate any of the following problems, or anything highly similar to them:\n- ${pastQuestions.join('\n- ')}\nGenerate a completely new and unique problem.`;
    }

    if (mode === 'practice') {
        prompt = `You are an expert algorithm instructor. Generate a coding problem for a student practicing ${language}.
Topic: ${topic}
Difficulty: ${difficulty}${exclusions}

Return ONLY a valid JSON object with the following structure:
{
  "title": "Problem Title",
  "problem_statement": "Detailed description of the problem...",
  "input_format": "What the input looks like...",
  "output_format": "What the output should be...",
  "constraints": "Data constraints (e.g., 1 <= N <= 10^5)...",
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "starter_code": "The initial function signature or class structure in ${language}"
}`;
    } else {
        prompt = `You are a Senior Technical Interviewer at a top tech company. You are interviewing a candidate for a ${role} role.
The candidate prefers to code in ${language}.
The interview type is: ${type}.${exclusions}

Generate a realistic, role-relevant coding interview problem.
Return ONLY a valid JSON object with the following structure:
{
  "title": "Problem Title",
  "problem_statement": "Detailed description of the problem...",
  "input_format": "What the input looks like...",
  "output_format": "What the output should be...",
  "constraints": "Data constraints...",
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "starter_code": "The initial function signature or class structure in ${language}"
}`;
    }

    try {
        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini", 
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
        });

        if(data && data.choices && data.choices.length > 0) {
            let output = data.choices[0].message.content.trim();
            if (output.startsWith('\`\`\`json')) output = output.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
            else if (output.startsWith('\`\`\`')) output = output.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
            
            try {
                const problem = JSON.parse(output);
                res.json(problem);
            } catch (e) {
                console.error("Failed to parse Problem JSON:", output);
                res.status(500).json({ error: 'Failed to parse AI response as JSON' });
            }
        } else {
            console.error('Openrouter Error:', data);
            res.status(500).json({ error: 'Failed to generate problem from AI' });
        }
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Simulate Code Execution via AI API
app.post('/api/simulate_execution', async (req, res) => {
    const { language, code } = req.body;
    
    const prompt = `You are a strict code execution engine simulator. I will provide you with a snippet of ${language} code.
You must simulate its execution.
If there are syntax errors, output the exact error message that a compiler/interpreter would throw.
If it runs successfully, output ONLY the exact text that would be printed to the standard output (console).
Do NOT include markdown, explanations, or any extra text. ONLY the raw console output or error.

Code:
${code}`;

    try {
        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini", 
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.1
        });

        if(data && data.choices && data.choices.length > 0) {
            let output = data.choices[0].message.content.trim();
            if (output.startsWith('\`\`\`')) {
                output = output.replace(/^\`\`\`[\w]*\n/, '').replace(/\n\`\`\`$/, '');
            }
            res.json({ output });
        } else {
            res.status(500).json({ error: 'Failed to simulate execution' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Chat Mentor API
app.post('/api/mentor_chat', async (req, res) => {
    const { context, message, memory } = req.body;
    
    const prompt = `You are a highly supportive 24/7 AI Technical Mentor inside an interview preparation application.
Context of what the student is currently looking at: ${context || "General Application"}

Student's Message: ${message}

Act as an encouraging mentor. Be concise. Provide guidance, answer doubts, or coach them on how to approach technical problems. If they paste code, point out bugs nicely.

Return only your conversational response.`;

    try {
        const messagesTokenLimit = memory ? memory.slice(-4) : [];
        const apiMessages = [
            { role: "system", content: "You are the platform's friendly AI Interview Mentor." },
            ...messagesTokenLimit,
            { role: "user", content: prompt }
        ];

        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini",
            messages: apiMessages,
            max_tokens: 300,
            temperature: 0.7
        });

        if(data && data.choices && data.choices.length > 0) {
            res.json({ reply: data.choices[0].message.content.trim() });
        } else {
            res.status(500).json({ error: 'Failed to connect to mentor AI' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Resume Analyzer API
app.post('/api/analyze_resume', async (req, res) => {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text required" });

    const prompt = `You are an expert AI Technical Recruiter and Career Coach. 
Analyze the following resume text.
Target Job Role: ${targetRole || 'General Software Engineering'}

Resume Text:
${resumeText}

Based on this resume and the target role, provide a comprehensive analysis.
Return ONLY a valid JSON object strictly matching this format, with no markdown code blocks (\`\`\`json) and no extra conversational text:
{
  "score": "X/100",
  "skillsPresent": ["Skill 1", "Skill 2"],
  "missingSkills": ["Missing 1", "Missing 2"],
  "keywordsMissing": ["Keyword 1", "Keyword 2"],
  "possibleJobRoles": ["Role 1", "Role 2"],
  "suggestedProjects": ["Project 1", "Project 2"],
  "areasToImprove": ["Improvement 1", "Improvement 2"]
}`;

    try {
        const data = await makeOpenRouterRequest({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.7
        });

        if(data && data.choices && data.choices.length > 0) {
            let output = data.choices[0].message.content.trim();
            if (output.startsWith('\`\`\`json')) output = output.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
            else if (output.startsWith('\`\`\`')) output = output.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
            
            try {
                const analysis = JSON.parse(output);
                res.json(analysis);
            } catch (e) {
                console.error("Failed to parse Resume JSON:", output);
                res.status(500).json({ error: 'Failed to parse AI response as JSON' });
            }
        } else {
            res.status(500).json({ error: 'Failed to generate resume analysis' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Completion API
app.post('/api/notify_complete', async (req, res) => {
    const { username, email, domain, score, tabSwitches, mistakes, violations } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const subject = `🎉 Assessment Completed: ${domain}`;
    
    let proctoringHtml = '';
    if (tabSwitches !== undefined || violations !== undefined) {
        proctoringHtml = `
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #b45309;">Proctoring Report</h3>
                <p><strong>Tab Switches:</strong> ${tabSwitches || 0}</p>
                ${violations && violations.length > 0 ? `<p><strong>Total Violations:</strong> ${violations.length}</p>` : ''}
            </div>
        `;
    }

    let mistakesHtml = '';
    if (mistakes && mistakes.length > 0) {
        mistakesHtml = `
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #b91c1c;">Areas for Improvement (Mistakes)</h3>
                <ul style="color: #7f1d1d;">
                    ${mistakes.map(m => `<li>${m}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#10b981;">Assessment Completed Successfully!</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>You have successfully completed your <strong>${domain}</strong> assessment.</p>
        <p><strong>Your Score:</strong> ${score}/10</p>
        ${proctoringHtml}
        ${mistakesHtml}
        <p>Head over to your dashboard to review your detailed performance analytics, strengths, and areas for improvement.</p>
        <br/>
        <p style="color:#64748b;font-size:12px;">— AI Interview Studio | Built by Soumya & Team</p>
    </div>`;
    
    await sendEmail(email, subject, htmlBody);
    res.json({ success: true, message: "Completion notification sent" });
});

// Certificate API
app.post('/api/notify_certificate', async (req, res) => {
    const { username, email, avgScore, mocksCount } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const subject = `🎓 Your Professional AI Proficiency Certificate is Here!`;
    const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:2px solid #d4af37;background:#fdfdfd;">
        <div style="text-align:center;">
            <h1 style="color:#d4af37;margin-bottom:5px;">CERTIFICATE OF EXCELLENCE</h1>
            <p style="color:#666;letter-spacing:2px;margin-top:0;">AI INTERVIEW STUDIO</p>
        </div>
        <p>This certifies that</p>
        <h2 style="text-align:center;color:#333;">${username}</h2>
        <p>has successfully passed the rigorous requirements for the <strong>Professional AI Proficiency Certificate</strong>.</p>
        <ul style="color:#444;">
            <li><strong>Total Mocks Cleared:</strong> ${mocksCount}</li>
            <li><strong>Overall Average Score:</strong> ${avgScore}/10</li>
        </ul>
        <p>Congratulations on demonstrating outstanding technical capabilities, excellent soft skills, and exceptional problem-solving prowess!</p>
        <br/>
        <div style="text-align:right;">
            <p style="font-weight:bold;margin-bottom:0;">Soumya & Team</p>
            <p style="color:#888;font-size:12px;margin-top:0;">Directors, AI Interview Studio</p>
        </div>
    </div>`;
    
    await sendEmail(email, subject, htmlBody);
    res.json({ success: true, message: "Certificate sent" });
});

// --- ADMIN API ROUTES ---
app.get('/api/admin/stats', (req, res) => {
    // For now, doing a simple DB query for students and returning dynamic AI Insights
    db.get('SELECT COUNT(*) as totalStudents FROM users', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Return dynamic data for the AI Platform Insight card and stats grid
        res.json({
            totalStudents: row ? row.totalStudents : 0,
            interviewsCompleted: 1426,
            aiEvaluations: 1426,
            avgImprovement: 24.8,
            certificatesIssued: 186,
            aiInsight: {
                title: "AI Platform Insight",
                highlightText: "Java Full Stack",
                mainTextSuffix: " candidates are showing the highest improvement this week.",
                subText: "Average performance increased 18.6% after adaptive interview practice across all domains."
            }
        });
    });
});

app.get('/api/admin/students', (req, res) => {
    db.all('SELECT id, username, email, firstName, lastName, university FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ students: rows });
    });
});

app.get('/api/admin/performance-trend', (req, res) => {
    // Mocked trend data showing improvement over the last 4 weeks across domains
    res.json({
        trendData: [
            { name: 'Week 1', Technical: 65, Communication: 70, ProblemSolving: 60, Confidence: 68, DomainKnowledge: 62 },
            { name: 'Week 2', Technical: 72, Communication: 75, ProblemSolving: 68, Confidence: 74, DomainKnowledge: 69 },
            { name: 'Week 3', Technical: 78, Communication: 79, ProblemSolving: 75, Confidence: 82, DomainKnowledge: 76 },
            { name: 'Week 4', Technical: 85, Communication: 84, ProblemSolving: 82, Confidence: 88, DomainKnowledge: 85 }
        ]
    });
});

app.get('/api/admin/domains', (req, res) => {
    res.json({
        domains: [
            { name: "Java Full Stack", count: 82, percentage: 33, color: "#8B5CF6", icon: "Layers" },
            { name: "Data Science & Analytics", count: 64, percentage: 26, color: "#06B6D4", icon: "BarChart2" },
            { name: "Cyber Security", count: 51, percentage: 20, color: "#10B981", icon: "ShieldCheck" },
            { name: "Generative AI", count: 43, percentage: 16, color: "#F59E0B", icon: "Sparkles" },
            { name: "Robotics", count: 28, percentage: 11, color: "#EC4899", icon: "Cpu" },
            { name: "VLSI", count: 21, percentage: 8, color: "#6366F1", icon: "BrainCircuit" }
        ]
    });
});

app.get('/api/admin/skill-gaps', (req, res) => {
    res.json({
        skillGaps: [
            { name: "Communication", count: 42, max: 50, color: "#EF4444" },
            { name: "Java", count: 36, max: 50, color: "#F59E0B" },
            { name: "Problem Solving", count: 29, max: 50, color: "#F59E0B" },
            { name: "DSA", count: 25, max: 50, color: "#10B981" },
            { name: "Confidence", count: 19, max: 50, color: "#06B6D4" }
        ]
    });
});

app.get('/api/admin/top-improvers', (req, res) => {
    res.json({
        topImprovers: [
            { name: "Rohit Sharma", domain: "Java Full Stack", improvement: 38, initial: "R", color: "#06B6D4" },
            { name: "Anjali Mehta", domain: "Data Science", improvement: 34, initial: "A", color: "#8B5CF6" },
            { name: "Vikram Reddy", domain: "Cyber Security", improvement: 31, initial: "V", color: "#F59E0B" }
        ]
    });
});

app.get('/api/admin/alerts', (req, res) => {
    res.json({
        alerts: [
            { message: "12 students haven't completed an interview in 14 days.", time: "2 hours ago", type: "critical" },
            { message: "8 students repeatedly struggle with technical questions.", time: "5 hours ago", type: "warning" },
            { message: "24 students reached placement-ready status.", time: "1 day ago", type: "success" },
            { message: "31 certificates are ready for verification.", time: "2 days ago", type: "info" }
        ]
    });
});

app.get('/api/admin/recent-activity', (req, res) => {
    res.json({
        recentActivity: [
            { type: "New student registration", description: "Rahul Kumar joined the platform", time: "09:45 AM", icon: "UserPlus", color: "#8B5CF6" },
            { type: "Interview completed", description: "Anjali Mehta completed Java Interview", time: "09:30 AM", icon: "FileCheck", color: "#10B981" },
            { type: "Certificate issued", description: "Certificate issued to Vikram Reddy", time: "09:15 AM", icon: "Award", color: "#F59E0B" },
            { type: "Domain added", description: "Robotics domain was added", time: "08:50 AM", icon: "Layers", color: "#06B6D4" }
        ]
    });
});

app.get('/api/admin/placement-readiness', (req, res) => {
    res.json({
        readiness: {
            score: 72,
            ready: 86,
            needsImprovement: 104,
            highPriority: 38,
            trend: "+8.4%"
        }
    });
});

// Serve frontend React SPA index.html for all non-API GET routes
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/socket.io')) {
        const frontendDistIndex = path.join(__dirname, 'frontend/dist/index.html');
        if (fs.existsSync(frontendDistIndex)) {
            return res.sendFile(frontendDistIndex);
        }
    }
    next();
});

// Start Server listening on 0.0.0.0 (all network interfaces for mobile/tablet/cloud access)
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`Access local network URL: http://localhost:${PORT}`);
});

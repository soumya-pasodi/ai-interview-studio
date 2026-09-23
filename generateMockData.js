const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

const domains = ['Java Full Stack', 'Cyber Security', 'Data Science', 'MERN Stack', 'Python Automation'];
const unis = ['MIT', 'Stanford', 'VTU', 'IIT Bombay', 'PES University'];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomScore() {
    return (Math.random() * 5 + 5).toFixed(1); // 5.0 to 10.0
}

db.serialize(() => {
    console.log("Ensuring new schema exists...");
    db.run(`ALTER TABLE users ADD COLUMN status TEXT`, (err) => {
        if (err) console.log("Status column already exists or altered.");
    });
    
    db.run(`UPDATE users SET status = 'approved' WHERE status IS NULL`);
    
    db.run(`CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        domain TEXT,
        score REAL,
        feedback TEXT,
        date_taken DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        domain TEXT,
        score REAL,
        status TEXT DEFAULT 'pending_approval',
        date_issued DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log("Generating 25 mock students...");
    
    for (let i = 1; i <= 25; i++) {
        const username = `student${Date.now()}_${i}`;
        const email = `student${Date.now()}_${i}@test.com`;
        const firstName = `TestUser`;
        const lastName = `${i}`;
        const uni = randomElement(unis);
        // 5 of them will be 'pending', 20 'approved'
        const status = i <= 5 ? 'pending' : 'approved';

        db.run(`INSERT INTO users (username, password, firstName, lastName, email, university, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, 'password123', firstName, lastName, email, uni, status], function(err) {
            if (err) {
                console.error("Error inserting user:", err.message);
                return;
            }
            
            const userId = this.lastID;
            
            // Only approved users get interviews
            if (status === 'approved') {
                // Give them 1-3 interviews
                const numInterviews = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < numInterviews; j++) {
                    const domain = randomElement(domains);
                    const score = randomScore();
                    
                    db.run(`INSERT INTO interviews (user_id, domain, score, feedback) VALUES (?, ?, ?, ?)`,
                        [userId, domain, score, "Mock feedback"]);
                    
                    // Generate certificate if >= 7.5
                    if (parseFloat(score) >= 7.5) {
                        const certStatus = Math.random() > 0.5 ? 'pending_approval' : 'approved';
                        db.run(`INSERT INTO certificates (user_id, domain, score, status) VALUES (?, ?, ?, ?)`,
                            [userId, domain, score, certStatus]);
                    }
                }
            }
        });
    }
});

setTimeout(() => {
    console.log("Mock data generation complete!");
    db.close();
}, 2000);

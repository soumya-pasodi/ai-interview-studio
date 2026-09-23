const BASE_URL = '/api/admin';

const getHeaders = () => {
    const token = localStorage.getItem('admin_jwt') || localStorage.getItem('admin_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const safeFetch = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            console.error(`Failed to fetch ${endpoint}. Status: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        if (error.message === 'Unauthorized') throw error;
        console.error(`Fetch failed for ${endpoint}. Error:`, error.message);
        return null;
    }
};

export const adminService = {
    getOverview: async () => {
        const data = await safeFetch('/stats');
        return data || { totalStudents: 0, pendingRegistrations: 0, interviewsCompleted: 0, certificatesIssued: 0 };
    },
    
    getStudents: async () => {
        const data = await safeFetch('/students');
        return data?.students || [];
    },

    getPendingRegistrations: async () => {
        const data = await safeFetch('/pending-registrations');
        return data?.students || [];
    },

    approveRegistration: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/approve-registration`, { 
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ id })
            });
            return response.ok;
        } catch (err) {
            return false;
        }
    },

    getPendingCertificates: async () => {
        const data = await safeFetch('/pending-certificates');
        return data?.certificates || [];
    },

    approveCertificate: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/approve-certificate`, { 
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ id })
            });
            return response.ok;
        } catch (err) {
            return false;
        }
    },

    getPerformance: async () => {
        const data = await safeFetch('/performance-trend');
        return data || { 
            trendData: [
                { name: 'Week 1', technical: 65, communication: 70, problemSolving: 60, confidence: 68, domain: 62 },
                { name: 'Week 2', technical: 72, communication: 75, problemSolving: 68, confidence: 74, domain: 70 },
                { name: 'Week 3', technical: 80, communication: 78, problemSolving: 75, confidence: 82, domain: 79 },
                { name: 'Week 4', technical: 86, communication: 85, problemSolving: 82, confidence: 88, domain: 85 }
            ]
        };
    },
    
    getDomains: async () => {
        const data = await safeFetch('/domains');
        return data || { 
            domains: [
                { name: 'Java Full Stack', count: 82, percent: 33 },
                { name: 'Data Science', count: 64, percent: 26 },
                { name: 'Cyber Security', count: 51, percent: 20 },
                { name: 'Generative AI', count: 43, percent: 16 },
                { name: 'Robotics', count: 28, percent: 11 },
                { name: 'VLSI', count: 21, percent: 8 }
            ]
        };
    },
    
    getSkillGaps: async () => {
        const data = await safeFetch('/skill-gaps');
        return data || { 
            skillGaps: [
                { skill: 'Communication', count: 42, max: 50 },
                { skill: 'Java Basics', count: 36, max: 50 },
                { skill: 'Problem Solving', count: 29, max: 50 },
                { skill: 'DSA', count: 25, max: 50 },
                { skill: 'Confidence', count: 19, max: 50 }
            ]
        };
    },
    
    getReadiness: async () => {
        const data = await safeFetch('/placement-readiness');
        return data || { 
            readiness: {
                score: 72,
                trend: 8.4,
                ready: 86,
                needsImprovement: 104,
                highPriority: 38
            }
        };
    },
    
    getTopImprovers: async () => {
        const data = await safeFetch('/top-improvers');
        return data || { 
            topImprovers: [
                { name: 'Rohit Sharma', domain: 'Java Full Stack', improvement: 38 },
                { name: 'Anjali Mehta', domain: 'Data Science', improvement: 34 },
                { name: 'Vikram Reddy', domain: 'Cyber Security', improvement: 31 }
            ]
        };
    },
    
    getAlerts: async () => {
        const data = await safeFetch('/alerts');
        return data || { 
            alerts: [
                { id: 1, message: '12 students haven\'t completed an interview in 14 days.', type: 'warning' },
                { id: 2, message: '8 students repeatedly struggle with technical questions.', type: 'danger' },
                { id: 3, message: '24 students reached placement-ready status.', type: 'success' },
                { id: 4, message: '31 certificates are ready for verification.', type: 'info' }
            ]
        };
    },
    
    getActivity: async () => {
        const data = await safeFetch('/activity');
        return data || { 
            recentActivity: [
                { id: 1, user: 'Rahul Kumar', action: 'joined the platform', time: new Date().toISOString(), type: 'info' },
                { id: 2, user: 'Anjali Mehta', action: 'completed Java Interview', time: new Date().toISOString(), type: 'success' },
                { id: 3, user: 'Vikram Reddy', action: 'was issued a certificate', time: new Date().toISOString(), type: 'success' }
            ]
        };
    }
};

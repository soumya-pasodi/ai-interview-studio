import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Performance from './pages/Performance';
import Profile from './pages/Profile';
import CertificateView from './pages/CertificateView';
import LiveCodeEditor from './pages/LiveCodeEditor';
import PeerInterview from './pages/PeerInterview';
import MCQ from './pages/MCQ';
import CodeStudio from './pages/CodeStudio';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import PlacementDrive from './pages/PlacementDrive';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import LearningHub from './pages/LearningHub';
import CareerIntelligence from './pages/CareerIntelligence';
import LiveClasses from './pages/LiveClasses';

// Assets
import bgLogin from './assets/react_bg_login.png';
import bgHome from './assets/react_bg_home.png';
import bgAcademic from './assets/react_bg_academic.png';
import bgCoding from './assets/react_bg_coding.png';
import bgPeer from './assets/react_bg_peer.png';
import bgResume from './assets/react_bg_resume.png';
import bgPerformance from './assets/react_bg_performance.png';

const DynamicBackground = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let bgImage = bgHome; // Default fallback

    if (path === '/' || path === '/login') {
      bgImage = bgLogin;
    } else if (path === '/dashboard' || path === '/profile') {
      bgImage = bgHome;
    } else if (path === '/interview' || path === '/mcq' || path === '/placement-drive') {
      bgImage = bgAcademic;
    } else if (path === '/code-studio' || path === '/live-code') {
      bgImage = bgCoding;
    } else if (path === '/peer-interview') {
      bgImage = bgPeer;
    } else if (path === '/resume') {
      bgImage = bgResume;
    } else if (path === '/performance' || path === '/certificate') {
      bgImage = bgPerformance;
    }

    // Don't apply dynamic image background to admin routes
    if (path.startsWith('/admin')) {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = '#050505';
    } else {
      // Apply the background to the body with a darker gradient overlay to reduce brightness
      document.body.style.backgroundImage = `linear-gradient(rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.85)), url('${bgImage}')`;
    }
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <DynamicBackground />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/mcq" element={<MCQ />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/certificate" element={<CertificateView />} />
          <Route path="/live-code" element={<LiveCodeEditor />} />
          <Route path="/code-studio" element={<CodeStudio />} />
          <Route path="/peer-interview" element={<PeerInterview />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/placement-drive" element={<PlacementDrive />} />
          <Route path="/learning-hub" element={<LearningHub />} />
          <Route path="/career-intelligence" element={<CareerIntelligence />} />
          <Route path="/classes" element={<LiveClasses />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

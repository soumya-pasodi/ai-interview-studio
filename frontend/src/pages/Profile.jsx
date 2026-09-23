import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen, MapPin, Upload, Camera, Save, ShieldCheck } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        university: '',
        collegeName: '',
        dob: '',
        gender: ''
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    
    const fileInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        const username = localStorage.getItem('ai_portal_username');
        if (!username) return;
        
        try {
            const res = await fetch(`/api/profile?username=${username}`);
            const data = await res.json();
            if (data.profile) {
                setProfile(data.profile);
                const savedAvatar = localStorage.getItem(`avatar_${username}`);
                if (savedAvatar) setAvatarUrl(savedAvatar);
                
                const savedResume = localStorage.getItem(`resume_${username}`);
                if (savedResume) setResumeFile(savedResume);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        }
        setIsLoading(false);
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const saveProfile = async () => {
        try {
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                alert("Profile Updated Successfully!");
                setIsEditing(false);
            } else {
                alert("Failed to update profile.");
            }
        } catch (e) {
            alert("Error connecting to server.");
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result);
                localStorage.setItem(`avatar_${profile.username}`, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file.name);
            localStorage.setItem(`resume_${profile.username}`, file.name);
            alert(`Resume "${file.name}" uploaded successfully!`);
        }
    };

    if (isLoading) {
        return <div style={styles.loading}>Loading Profile...</div>;
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>Student <span className="text-gradient">Profile</span></h1>
                <p style={styles.headerSub}>Manage your academic identity and professional details.</p>
            </header>

            <div style={styles.grid}>
                {/* Left Side: Avatar & Resume */}
                <div style={styles.leftCol}>
                    <div className="glass-card" style={styles.avatarCard}>
                        <div style={styles.avatarWrapper}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" style={styles.avatarImg} />
                            ) : (
                                <div style={styles.avatarPlaceholder}>
                                    {profile.firstName?.charAt(0) || profile.username?.charAt(0)}
                                </div>
                            )}
                            <button style={styles.cameraBtn} onClick={() => fileInputRef.current.click()}>
                                <Camera size={16} />
                            </button>
                            <input 
                                type="file" ref={fileInputRef} 
                                style={{ display:'none' }} 
                                accept="image/*"
                                onChange={handleAvatarUpload} 
                            />
                        </div>
                        <h2 style={styles.name}>{profile.firstName} {profile.lastName}</h2>
                        <p style={styles.username}>@{profile.username}</p>
                        
                        <div style={styles.badge}>
                            <ShieldCheck size={14} /> Verified Student
                        </div>
                    </div>

                    <div className="glass-card" style={styles.resumeCard}>
                        <h3 style={styles.resumeTitle}>Professional Resume</h3>
                        <div style={styles.resumeBox}>
                            {resumeFile ? (
                                <div style={styles.resumeFile}>
                                    <BookOpen size={20} color="var(--primary)" />
                                    <span>{resumeFile}</span>
                                </div>
                            ) : (
                                <p style={styles.noResume}>No resume uploaded yet.</p>
                            )}
                            <button style={styles.uploadBtn} onClick={() => resumeInputRef.current.click()}>
                                <Upload size={16} /> {resumeFile ? 'Update Resume' : 'Upload Resume'}
                            </button>
                            <input 
                                type="file" ref={resumeInputRef} 
                                style={{ display:'none' }}
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload} 
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Details Form */}
                <div className="glass-card" style={styles.detailsCard}>
                    <div style={styles.detailsHeader}>
                        <h3 style={styles.detailsTitle}>Personal Information</h3>
                        <button 
                            style={isEditing ? styles.saveBtn : styles.editBtn} 
                            onClick={isEditing ? saveProfile : () => setIsEditing(true)}
                        >
                            {isEditing ? <><Save size={16}/> Save Changes</> : 'Edit Profile'}
                        </button>
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>First Name</label>
                            <input 
                                name="firstName" value={profile.firstName || ''} 
                                onChange={handleChange} disabled={!isEditing} 
                                style={isEditing ? styles.inputActive : styles.inputDisabled} 
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Last Name</label>
                            <input 
                                name="lastName" value={profile.lastName || ''} 
                                onChange={handleChange} disabled={!isEditing} 
                                style={isEditing ? styles.inputActive : styles.inputDisabled} 
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address (Read-only)</label>
                            <div style={styles.inputWithIcon}>
                                <Mail size={16} color="var(--text-sub)" style={styles.inputIcon} />
                                <input 
                                    name="email" value={profile.email || ''} 
                                    disabled={true} 
                                    style={{...styles.inputDisabled, paddingLeft: '2.5rem'}} 
                                />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <div style={styles.inputWithIcon}>
                                <Phone size={16} color={isEditing ? 'var(--primary)' : 'var(--text-sub)'} style={styles.inputIcon} />
                                <input 
                                    name="phone" value={profile.phone || ''} 
                                    onChange={handleChange} disabled={!isEditing} 
                                    style={{...(isEditing ? styles.inputActive : styles.inputDisabled), paddingLeft: '2.5rem'}} 
                                />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>University</label>
                            <div style={styles.inputWithIcon}>
                                <BookOpen size={16} color={isEditing ? 'var(--primary)' : 'var(--text-sub)'} style={styles.inputIcon} />
                                <input 
                                    name="university" value={profile.university || ''} 
                                    onChange={handleChange} disabled={!isEditing} 
                                    style={{...(isEditing ? styles.inputActive : styles.inputDisabled), paddingLeft: '2.5rem'}} 
                                />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>College Name</label>
                            <div style={styles.inputWithIcon}>
                                <MapPin size={16} color={isEditing ? 'var(--primary)' : 'var(--text-sub)'} style={styles.inputIcon} />
                                <input 
                                    name="collegeName" value={profile.collegeName || ''} 
                                    onChange={handleChange} disabled={!isEditing} 
                                    style={{...(isEditing ? styles.inputActive : styles.inputDisabled), paddingLeft: '2.5rem'}} 
                                />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Date of Birth</label>
                            <input 
                                type="date" name="dob" value={profile.dob || ''} 
                                onChange={handleChange} disabled={!isEditing} 
                                style={isEditing ? styles.inputActive : styles.inputDisabled} 
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Gender</label>
                            <select 
                                name="gender" value={profile.gender || ''} 
                                onChange={handleChange} disabled={!isEditing} 
                                style={isEditing ? styles.inputActive : styles.inputDisabled}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-sub)' },
    container: { maxWidth: 1000, margin: '0 auto', padding: '2rem' },
    header: { marginBottom: '2rem' },
    headerTitle: { fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'white' },
    headerSub: { fontSize: '1.1rem', color: 'var(--text-sub)', margin: 0 },
    
    grid: { display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    
    avatarCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem' },
    avatarWrapper: { position: 'relative', width: 120, height: 120, marginBottom: '1rem' },
    avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' },
    avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', fontWeight: 800, color: 'white', textTransform: 'uppercase' },
    cameraBtn: { position: 'absolute', bottom: 5, right: 5, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' },
    name: { fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'white' },
    username: { fontSize: '0.9rem', color: 'var(--text-sub)', margin: '0 0 1rem 0' },
    badge: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 },
    
    resumeCard: { padding: '1.5rem' },
    resumeTitle: { fontSize: '1.1rem', fontWeight: 700, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', margin: '0 0 1rem 0' },
    resumeBox: { display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' },
    resumeFile: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 8, width: '100%', fontSize: '0.9rem', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)' },
    noResume: { fontSize: '0.9rem', color: 'var(--text-sub)', margin: 0 },
    uploadBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' },

    detailsCard: { padding: '2rem' },
    detailsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' },
    detailsTitle: { fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'white' },
    editBtn: { background: 'transparent', border: '1px solid var(--text-sub)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' },
    saveBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--success)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' },
    
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: { fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600 },
    inputDisabled: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-main)', padding: '0.75rem', borderRadius: 8, fontSize: '0.95rem', cursor: 'not-allowed', width: '100%', boxSizing: 'border-box' },
    inputActive: { background: 'rgba(0,0,0,0.2)', border: '1px solid var(--primary)', color: 'white', padding: '0.75rem', borderRadius: 8, fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', outline: 'none' },
    inputWithIcon: { position: 'relative', width: '100%' },
    inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }
};

export default Profile;

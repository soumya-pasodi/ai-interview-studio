# 🚀 AI Interview Studio - Technology Stack

AI Interview Studio is a sophisticated, full-stack technical assessment platform designed to provide a "Real-World" interview experience. It combines real-time AI vision, voice activity detection, and automated grading into a seamless environment.

---

## 🎨 1. Frontend Architecture
Built with performance and aesthetics in mind, the frontend provides a low-latency, responsive user experience.

- **React.js (v19)**: The core UI engine, chosen for its component-based architecture and efficient state management.
- **Vite (v8)**: Modern build tool that provides blazing Fast Refresh (HMR) and optimized production bundles.
- **Framer Motion**: Powering all micro-animations, transitions, and the "fluid" dashboard experience.
- **Lucide React**: A clean, consistent icon set used for professional UI semantics.
- **CodeMirror**: An advanced, browser-based code editor integrated for technical programming assessments.
- **Vanilla CSS (Glassmorphism)**: Custom-scoped CSS modules implemented with a modern, transparent background aesthetic and vibrant neon accents.

---

## 🤖 2. Intelligence & Vision Engine
The "Heart" of the platform, utilizing both local and cloud-based AI.

- **Face-API.js**: JavaScript API for face detection and face recognition in the browser.
  - *Utility*: Real-time monitoring for multi-face detection, primary face tracking, and engagement analysis during the mock.
- **Voice Activity Detection (VAD)**: Custom real-time audio analysis buffer.
  - *Utility*: Detects background whispering and high-frequency audio patterns indicative of external assistance.
- **OpenRouter (GPT-4o-mini Integration)**: 
  - *Utility*: Generates adaptive technical questions and performs the high-accuracy "Mentorship Mode" grading of user answers.

---

## ⚙️ 3. Backend & Infrastructure
A robust Node.js environment designed for security and scalability.

- **Node.js (LTS)**: JavaScript runtime for the server environment.
- **Express.js (v5)**: The web framework used to handle RESTful API routing, authentication, and secure data flow.
- **SQLite3**: A lightweight, disk-based database for local storage of user profiles, assessment history, and analytical logs.
- **Nodemailer**: Node.js module to handle automated transactional emails for registration, completion, and certificates.
- **Cors & Body-Parser**: Middleware for secure cross-origin requests and efficient JSON payload handling.

---

## 📄 4. Professional Certification System
Our unique branding and verification layer.

- **Dynamic HTML/CSS Canvas**: The certificate is rendered as a standalone, printable professional document.
- **PDF Generation**: Native browser print-to-PDF hooks with high-resolution CSS print media queries.
- **Performance Evaluation Matrix**: Real-time analytical logic that aggregates GPA, completion count, and AI feedback to determine eligibility.

---

## 🛠️ 5. Developer & Setup Tools
- **Concurrently**: Utility to run both the Node server and Vite client simultaneously.
- **ESLint**: Standardized code linting for frontend and backend consistency.
- **Git / GitHub**: Recommended for version control and collaborative student development.

---

> [!TIP]
> **Project Goal**: AI Interview Studio aims to bridge the gap between academic learning and industry technical hiring standards through AI-driven feedback loops.

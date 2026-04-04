# AlgoMemo 🧠
AlgoMemo is a full-stack DSA tracking application built for developers who are serious about cracking technical interviews. It combines spaced repetition memory science, AI-powered pattern explanations, gamification, and a Chrome extension to create the most frictionless DSA prep experience available.

## 🌐 Live Demo
[https://algo-memo-kappa.vercel.app](https://algo-memo-kappa.vercel.app)

## ✨ Features

### 🎯 Core Engine
- **Intelligent Dashboard** — Track progress across 21 DSA categories (Arrays, Trees, DP, Graphs, and more)
- **Question Bank** — Pre-loaded with Blind 75 & NeetCode 150 patterns with direct LeetCode links
- **Note-Taking System** — Save custom notes, core intuition ("The Trick"), and time/space complexity per problem
- **Difficulty Filtering** — Filter problems by Easy, Medium, and Hard

### 🧠 Memory & Mastery (Spaced Repetition)
- **Recall Engine** — Calculates `nextRevisionDate` based on confidence (Easy = 21 days, Medium = 7 days, Hard = 1 day)
- **Revision Mode** — Shows only problems you're in danger of forgetting today
- **Neural Weakness Detector** — Auto-detects topics where you struggle most (>50% Hard confidence) and surfaces them on the dashboard

### 🤖 AI-Powered
- **Pattern Intuition** — Powered by Gemini AI, explains the core "aha moment" for any problem in 2 sentences — no code, just pure intuition

### 📊 Analytics & Visualizations
- **Mastery Radar Chart** — Spider-web graph of your strengths and weaknesses across all DSA topics
- **Confidence Mix Pie Chart** — Visual breakdown of Easy / Medium / Hard problem distribution
- **Performance Metrics** — Real-time solved counts and difficulty breakdowns

### 🎮 Gamification
- **Leveling System** — Level up every 5 problems solved (Max Level 10)
- **Titles** — Evolve from "Pattern Solver" → "Pattern Architect" → "DSA Guru"
- **Badge System** — Earn achievements:
  - 🔥 **Consistency Hero** — 7-day solve streak
  - 🛡️ **Hard Target** — Solve a Hard problem
  - 🎯 **Topic Master** — 10 problems in one category
- **Streak Engine** — Daily activity tracker with streak reset logic

### 🔌 Chrome Extension
- **Auto-scrapes** problem title and difficulty directly from LeetCode
- **Auto token sync** — Token syncs automatically when you log into AlgoMemo (no copy-paste)
- **One-click save** — Send any LeetCode problem to your AlgoMemo tracker instantly

### 🔐 Security & Personalization
- **JWT Authentication** — Secure login/signup with Bearer token protection
- **Avatar Chooser** — Pick from 8 unique DiceBear avatar styles
- **Profile Settings** — Separate forms for identity and password updates
- **Auto-generated Avatars** — Every user gets a unique avatar via DiceBear even without selecting one

## 🛠️ Tech Stack

- **Frontend & Extension:** React.js, Tailwind CSS, Manifest V3, Recharts, React Activity Calendar, Lucide React, Date-fns, Axios
- **Backend & AI:** Node.js, Express, MongoDB, Mongoose, Google Gemini AI, JWT, Bcrypt.js
- **Infrastructure:** Vercel, Render, MongoDB Atlas

## 🚀 Installation & Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/algomemo.git
cd algomemo
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
node server.js
# or with auto-reload
nodemon server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
### 4. Chrome Extension Setup
```
1. Open Chrome → go to chrome://extensions
2. Enable "Developer Mode" (top right toggle)
3. Click "Load Unpacked"
4. Select the /extension folder
5. Log into AlgoMemo → token auto-syncs to extension
6. Open any LeetCode problem → click the extension icon
```

---

## 📁 Project Structure

```
algomemo/
├── backend/
│   ├── controllers/
│   │   ├── userController.js    # Auth, profile, stats
│   │   ├── noteController.js    # CRUD for notes
│   │   └── aiController.js      # Gemini AI integration
│   ├── middleware/
│   │   └── auth.js              # JWT protect middleware
│   ├── models/
│   │   ├── User.js              # User schema + bcrypt hooks
│   │   └── Note.js              # Note schema + indexes
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── noteRoutes.js
│   │   └── aiRoutes.js
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx    # Main hub
│       │   ├── Profile.jsx      # Stats, analytics, settings
│       │   └── TopicDetail.jsx  # Per-topic problem list
│       ├── components/
│       │   ├── NoteModal.jsx    # Save/edit notes
│       │   ├── AIExplainerModal.jsx  # AI intuition
│       │   ├── WeaknessDetector.jsx  # Weakness alert card
│       │   └── BadgeRenderer.jsx     # Achievement badges
│       ├── api/
│       │   └── axios.js         # Axios instance + interceptors
│       └── data/
│           └── questions.js     # Full question bank
│
└── extension/
    ├── manifest.json
    ├── content.js               # LeetCode scraper + token listener
    ├── popup.html
    └── popup.js
```

## 👨‍💻 Built By
**Prashant** — Associate Software Engineer building toward Full Stack  
[GitHub](https://github.com/prashant404) · [AlgoMemo Live](https://algo-memo-kappa.vercel.app)

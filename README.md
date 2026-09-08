<div align="center">

# ⚡ PortfolioAI

### *Next-Gen Dynamic Portfolio & Resume Builder*
*Build. Preview. Export. Ship — All in One Place.*

A **production-ready, full-stack** Portfolio & Resume Builder with Glassmorphic dark UI, AI-powered OCR resume parsing, real-time live preview, JWT authentication, 6 resume templates, and one-click PDF export.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Now-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://code-alpha-dynamic-portfolio-builder.vercel.app)
[![Watch on YouTube](https://img.shields.io/badge/▶%20Watch%20on%20YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@KabeerSoomro)
[![Watch on LinkedIn](https://img.shields.io/badge/👁%20Watch%20on%20LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kabir-soomro)

</div>

---

## 📸 Project Preview

<div align="center">

> 🔗 **[Click here to open the Live App](https://code-alpha-dynamic-portfolio-builder.vercel.app)**

| Page | Description |
|------|-------------|
| 🏠 **Landing / Auth** | Beautiful login & register with glassmorphism |
| 📊 **Dashboard** | Portfolio stats, completion meter, snapshot card |
| ✏️ **Resume Builder** | Split-screen real-time editor + live preview |

</div>

## ✨ Key Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure register & login with bcrypt password hashing |
| 🤖 **AI OCR Import** | Upload resume photo — Tesseract.js auto-fills all fields |
| ⚡ **Real-Time Preview** | Split-screen editor with zero-latency DOM binding |
| 💾 **Auto-Save** | Debounced API calls (1200ms) — no data loss ever |
| 📄 **PDF Export** | ATS-friendly A4 PDF via html2pdf.js |
| 🎨 **6 Resume Templates** | Modern, Sidebar, Minimal, Executive, Creative, Tech Mono |
| 🌈 **Theme Picker** | 6 accent colors + custom color picker |
| 📊 **Dashboard Stats** | Animated counters, completion meter, portfolio snapshot |
| 🌙 **Dark / Light Mode** | System-aware theme with smooth transitions |
| 📧 **Contact Support** | EmailJS-powered contact form on every page |
| 🔑 **Password Reset** | Secure token-based password reset flow |
| 📱 **Responsive Design** | Works on desktop, tablet & mobile |
| 🚀 **Server Wakeup UX** | Smart retry + loading overlay for Render cold starts |
| 🔄 **Drag & Drop Sort** | SortableJS for reordering experience & education entries |

</div>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3%20(Glassmorphism)-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript%20ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Libraries & Tools
![Tesseract.js](https://img.shields.io/badge/Tesseract.js%20(OCR)-3B82F6?style=for-the-badge&logo=openai&logoColor=white)
![html2pdf](https://img.shields.io/badge/html2pdf.js-EF4444?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)
![EmailJS](https://img.shields.io/badge/EmailJS-FF6B35?style=for-the-badge&logo=gmail&logoColor=white)
![SortableJS](https://img.shields.io/badge/SortableJS-8B5CF6?style=for-the-badge&logo=buffer&logoColor=white)

### Deployment
![Vercel](https://img.shields.io/badge/Frontend%20→%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend%20→%20Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

</div>



---

## 📂 Project Structure

```
CodeAlpha_Dynamic-Portfolio-Builder/
│
├── 📁 backend/
│   ├── 📁 config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── 📁 controllers/
│   │   ├── authController.js      # Register, Login, GetMe, UpdateProfile, ResetPassword
│   │   └── portfolioController.js # CRUD + upsert portfolio
│   ├── 📁 middleware/
│   │   └── auth.js                # JWT protect middleware
│   ├── 📁 models/
│   │   ├── User.js                # Mongoose User schema (name, email, avatar, password)
│   │   └── Portfolio.js           # Mongoose Portfolio schema (all resume fields)
│   ├── 📁 routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── portfolioRoutes.js     # /api/portfolio/*
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── 📁 frontend/
    ├── index.html                 # 🏠 Landing + Auth page (Login/Register)
    ├── dashboard.html             # 📊 User dashboard (stats + quick actions)
    ├── builder.html               # ✏️ Split-screen resume builder
    ├── reset-password.html        # 🔑 Password reset page
    ├── vercel.json                # SPA routing config for Vercel
    │
    ├── 📁 css/
    │   ├── main.css               # Global design system + glassmorphism tokens
    │   ├── auth.css               # Login/Register form styles
    │   ├── builder.css            # Split-screen builder layout + templates
    │   └── dashboard.css          # Dashboard cards + stats styles
    │
    └── 📁 js/
        ├── api.js                 # API service (apiFetch, Auth, server wakeup overlay)
        ├── auth.js                # Login / Register / Forgot password logic
        ├── dashboard.js           # Dashboard stats + portfolio snapshot
        ├── builder.js             # Real-time field binding + auto-save + templates
        ├── ocr.js                 # Tesseract.js OCR pipeline
        ├── pdf.js                 # html2pdf.js PDF export
        ├── settings.js            # Profile settings modal (avatar, name, email)
        ├── contact.js             # EmailJS contact modal (works on all pages)
        └── theme.js               # Dark/light mode controller
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

```bash
node --version   # v18+
npm --version    # v9+
```

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/KabirSoomro/CodeAlpha_Dynamic-Portfolio-Builder.git
cd CodeAlpha_Dynamic-Portfolio-Builder
```

### 2️⃣ Configure Backend

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfoliodb
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5500
```

```bash
npm install
npm run dev
# ✅ Backend running on http://localhost:5000
```

### 3️⃣ Run Frontend

Open `frontend/index.html` with **VS Code Live Server** (port 5500), or:

```bash
cd frontend
npx serve .
# ✅ Frontend running on http://localhost:3000
```

> **Note:** Make sure `API_BASE_URL` in `frontend/js/api.js` points to `http://localhost:5000/api` for local development.

---

## 🌐 Deployment

### 🔵 Backend → Render (Free Tier)

1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repo
4. Set **Root Directory**: `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `node server.js`
7. Add all environment variables in the Render dashboard
8. Set `FRONTEND_URL` to your Vercel domain (e.g. `https://your-app.vercel.app`)

> ⚠️ **Render Free Tier Note:** The server sleeps after 15 minutes of inactivity. The app includes a smart **"Server Waking Up..."** overlay with auto-retry so users are never left confused.

### 🟢 Frontend → Vercel

1. Push to GitHub
2. Import your repo in [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Update `API_BASE_URL` in `js/api.js` to your Render URL
5. Click **Deploy** 🚀

---

## 📡 API Reference

### 🔒 Auth Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/register` | ❌ | Create new account |
| `POST` | `/api/auth/login` | ❌ | Login & receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `PUT` | `/api/auth/updatedetails` | ✅ | Update name, email, avatar |
| `PUT` | `/api/auth/updatepassword` | ✅ | Change password |
| `POST` | `/api/auth/forgotpassword` | ❌ | Request password reset |
| `PUT` | `/api/auth/resetpassword/:token` | ❌ | Reset password with token |

### 📄 Portfolio Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/portfolio/me` | ✅ | Fetch user's portfolio |
| `POST` | `/api/portfolio` | ✅ | Create or replace portfolio (upsert) |
| `PATCH` | `/api/portfolio` | ✅ | Partial update (used by auto-save) |
| `DELETE` | `/api/portfolio` | ✅ | Delete portfolio |

### 🩺 Health Check

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/health` | ❌ | Server health status |

---

## 🔑 Environment Variables

```env
# Server
NODE_ENV=development          # or production
PORT=5000                     # Express server port

# Database
MONGO_URI=mongodb+srv://...   # MongoDB Atlas connection string

# Auth
JWT_SECRET=your_secret        # Min 32 chars, keep secret!
JWT_EXPIRES_IN=7d             # Token expiry (7d, 30d, etc.)

# CORS
FRONTEND_URL=https://your-app.vercel.app   # Your deployed frontend URL
```

---

## 🎨 Resume Templates

The builder includes **6 professional resume templates**:

| Template | Style | Best For |
|----------|-------|---------|
| 🟣 **Modern** (Default) | Clean gradient accents | Tech & Creative roles |
| 🔵 **Sidebar** | Two-column with colored sidebar | Corporate & Finance |
| ⚪ **Minimal** | Elegant black & white | All industries |
| 🟤 **Executive** | Bold headers, classic layout | Senior/Leadership roles |
| 🌸 **Creative** | Colorful, expressive design | Design & Marketing |
| 💚 **Tech Monospace** | Code-style monospace fonts | Developers & Engineers |

---

## 🔒 Security Features

- 🛡️ **Helmet.js** — Sets security HTTP headers
- 🔐 **bcryptjs** — Password hashing (salt rounds: 10)
- 🎫 **JWT** — Stateless authentication with expiry
- 🚫 **CORS** — Strict origin whitelisting
- 🛑 **Rate limiting** via Render's infrastructure
- 🔒 **Password never returned** — Mongoose `select: false`
- 🔄 **Token-based password reset** — Crypto-generated secure tokens

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| 📁 Frontend Files | 15+ |
| 📁 Backend Files | 10+ |
| 🎨 CSS Lines | 3,500+ |
| 💻 JS Lines | 4,000+ |
| 🛣️ API Endpoints | 11 |
| 🎭 Resume Templates | 6 |
| 🌐 Pages | 4 (index, dashboard, builder, reset-password) |

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- 🏢 **[CodeAlpha](https://codealpha.tech)** — For the internship opportunity
- 🤖 **[Tesseract.js](https://tesseract.projectnaptha.com/)** — OCR engine
- 📧 **[EmailJS](https://www.emailjs.com/)** — Email service
- 📄 **[html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)** — PDF export
- 🔄 **[SortableJS](https://sortablejs.github.io/Sortable/)** — Drag & drop
- ☁️ **[Render](https://render.com)** — Backend hosting
- 🚀 **[Vercel](https://vercel.com)** — Frontend hosting
- 🍃 **[MongoDB Atlas](https://www.mongodb.com/atlas)** — Database hosting

---

<div align="center">

### ⭐ If this project helped you, please give it a star!

[![GitHub stars](https://img.shields.io/github/stars/KabirSoomro/CodeAlpha_Dynamic-Portfolio-Builder?style=social)](https://github.com/KabirSoomro/CodeAlpha_Dynamic-Portfolio-Builder)
[![GitHub forks](https://img.shields.io/github/forks/KabirSoomro/CodeAlpha_Dynamic-Portfolio-Builder?style=social)](https://github.com/KabirSoomro/CodeAlpha_Dynamic-Portfolio-Builder/fork)

---

**Made with ❤️ by [Kabeer Soomro](https://www.linkedin.com/in/kabir-soomro) for CodeAlpha Internship**

[![LinkedIn](https://img.shields.io/badge/Connect%20on%20LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kabir-soomro)
[![YouTube](https://img.shields.io/badge/Subscribe%20on%20YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@KabeerSoomro)

</div>

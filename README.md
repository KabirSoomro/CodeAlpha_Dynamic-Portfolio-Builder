# ⚡ PortfolioAI — Next-Gen Dynamic Portfolio & Resume Builder

A production-ready, full-stack Portfolio & Resume Builder featuring a Glassmorphic dark UI, AI-powered OCR resume parsing, real-time live preview, JWT authentication, and one-click PDF export.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Glassmorphism), Vanilla JS (ES6+) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS |
| OCR | Tesseract.js v5 |
| PDF Export | html2pdf.js |

---

## 📂 Project Structure

```
/root
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   └── portfolioController.js  # CRUD + upsert
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── models/
│   │   ├── User.js            # Mongoose User schema
│   │   └── Portfolio.js       # Mongoose Portfolio schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── portfolioRoutes.js
│   ├── .env.example           # Copy → .env and fill values
│   ├── package.json
│   └── server.js              # Express app entry point
│
└── frontend/
    ├── index.html             # Landing / Auth page
    ├── dashboard.html         # User dashboard
    ├── builder.html           # Split-screen resume builder
    ├── vercel.json            # SPA routing config
    ├── css/
    │   ├── main.css           # Global design system + glassmorphism
    │   ├── auth.css           # Auth page styles
    │   ├── builder.css        # Split-screen builder styles
    │   └── dashboard.css      # Dashboard styles
    └── js/
        ├── api.js             # API service layer (apiFetch + Auth)
        ├── auth.js            # Login / Register logic
        ├── dashboard.js       # Dashboard stats + snapshot
        ├── builder.js         # Real-time binding + auto-save
        ├── ocr.js             # Tesseract.js OCR pipeline
        └── pdf.js             # html2pdf.js export
```

---

## 🚀 Getting Started

### 1. Configure Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL
npm install
npm run dev
```

The backend runs on **http://localhost:5000**

### 2. Run Frontend

Open `frontend/index.html` with **VS Code Live Server** (port 5500).

Or serve it with any static server:

```bash
cd frontend
npx serve .
```

---

## 🌐 Deployment

### Backend → Render
1. Push `backend/` folder to a GitHub repo
2. Create a new **Web Service** on Render
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add all `.env` variables in the Render dashboard
6. Set `FRONTEND_URL` to your Vercel domain

### Frontend → Vercel
1. Push `frontend/` folder to a GitHub repo
2. Import the repo in Vercel
3. Set **Root Directory** to `frontend`
4. Update `API_BASE_URL` in `js/api.js` to your Render service URL
5. Deploy!

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register & login with bcrypt
- 🤖 **OCR Resume Import** — Upload a photo of your old resume; Tesseract.js extracts and populates fields
- ⚡ **Real-Time Preview** — Split-screen editor with zero-latency DOM binding
- 💾 **Auto-Save** — Debounced PATCH calls (1200ms delay) prevent server spam
- 📄 **PDF Export** — ATS-friendly A4 PDF via html2pdf.js
- 🎨 **Theme Picker** — 6 accent color swatches + custom color picker
- 📊 **Dashboard Stats** — Animated counters, completion meter, portfolio snapshot

---

## 📝 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/portfolio/me` | Yes | Fetch portfolio |
| POST | `/api/portfolio` | Yes | Create/replace portfolio |
| PATCH | `/api/portfolio` | Yes | Partial update (auto-save) |
| DELETE | `/api/portfolio` | Yes | Delete portfolio |

---

## 🔑 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5500
```

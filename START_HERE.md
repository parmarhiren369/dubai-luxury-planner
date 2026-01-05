# 🚀 Quick Start Guide

## ✅ Merge Conflict Resolved!
Your code has been successfully pushed to GitHub: `https://github.com/parmarhiren369/dubai-luxury-planner.git`

## 🎯 To Start the System

### Option 1: Use the Startup Script (Easiest)
```bash
cd /Users/hirendhirajbhaiparmar/Desktop/2f
./start.sh
```

This will:
- ✅ Check MongoDB status
- ✅ Create `.env` files if missing
- ✅ Start backend server (port 5000)
- ✅ Start frontend server (port 5173)
- ✅ Show you the URLs

**Then open:** `http://localhost:5173`

---

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd /Users/hirendhirajbhaiparmar/Desktop/2f/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/hirendhirajbhaiparmar/Desktop/2f
npm run dev
```

**Then open:** `http://localhost:5173`

---

## 📋 Prerequisites

1. **MongoDB** - Either:
   - Local MongoDB running: `brew services start mongodb-community` (macOS)
   - OR MongoDB Atlas (cloud) - update `server/.env` with your connection string

2. **Node.js** - Version 18+ installed

---

## 🔧 Environment Files

The script will create these automatically, but you can also create them manually:

**`server/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wtb-tourism
FRONTEND_URL=http://localhost:5173
```

**`.env` (root):**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify `MONGODB_URI` in `server/.env`

**Frontend can't connect:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`

**Port already in use:**
- Change `PORT` in `server/.env` to another port
- Update `VITE_API_URL` accordingly

---

## 📦 What's Working

✅ **Rate Management Calendar** - Fully functional, saves to MongoDB
✅ **Backend API** - All CRUD endpoints ready
✅ **Frontend UI** - All pages ready
✅ **GitHub** - Code pushed successfully

---

## 🎉 You're All Set!

Run `./start.sh` and open `http://localhost:5173` to see your application!

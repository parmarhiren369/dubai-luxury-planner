# Setup Guide - WTB Tourism Management System

This guide will help you set up the complete WTB Tourism Management System with both frontend and backend.

## Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas

## Step 1: Install Dependencies

### Frontend Dependencies
```bash
npm install
```

### Backend Dependencies
```bash
cd server
npm install
cd ..
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   # Start MongoDB from Services or run mongod.exe
   ```

### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `server/.env` with your Atlas connection string

## Step 3: Configure Environment Variables

### Frontend (.env in root directory)

Create `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)

Create `server/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wtb-tourism
FRONTEND_URL=http://localhost:5173
```

**For MongoDB Atlas**, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wtb-tourism?retryWrites=true&w=majority
```

## Step 4: Start the Backend Server

```bash
cd server
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

If you see connection errors:
- Check MongoDB is running (for local setup)
- Verify `MONGODB_URI` in `server/.env`
- Check MongoDB connection string format

## Step 5: Start the Frontend Development Server

Open a new terminal window:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 6: Verify Installation

1. Open `http://localhost:5173` in your browser
2. Navigate to different pages:
   - Dashboard
   - Hotels
   - Customers
   - Agents
   - Quotations

3. Test creating a new hotel:
   - Go to Hotels page
   - Click "Add Hotel"
   - Fill in the form
   - Save

4. Check MongoDB to verify data is being saved:
   ```bash
   # Using MongoDB Compass or mongo shell
   use wtb-tourism
   db.hotels.find()
   ```

## Troubleshooting

### Backend won't start

**Error: Cannot connect to MongoDB**
- Ensure MongoDB is running: `mongod --version`
- Check `MONGODB_URI` in `server/.env`
- For Atlas, verify network access and credentials

**Error: Port 5000 already in use**
- Change `PORT` in `server/.env` to another port (e.g., 5001)
- Update `VITE_API_URL` in frontend `.env` accordingly

### Frontend can't connect to backend

**Error: Network request failed**
- Ensure backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in `.env` matches backend port
- Check CORS settings in `server/src/index.ts`

### TypeScript errors

**Error: Cannot find module**
- Run `npm install` in both root and `server/` directories
- Delete `node_modules` and reinstall if needed

### MongoDB connection issues

**Error: Authentication failed**
- Check username/password in connection string
- Verify database user has proper permissions
- For Atlas, check IP whitelist

**Error: Timeout**
- Check network connectivity
- Verify MongoDB is accessible
- Check firewall settings

## Development Workflow

1. **Start MongoDB** (if using local)
2. **Start Backend**: `cd server && npm run dev`
3. **Start Frontend**: `npm run dev` (in root directory)
4. **Make changes** - Both servers support hot reload
5. **Test changes** in browser at `http://localhost:5173`

## Production Build

### Build Frontend
```bash
npm run build
```

### Build Backend
```bash
cd server
npm run build
npm start
```

## Next Steps

- Import sample data using Excel import features
- Configure Firebase Authentication (optional)
- Set up environment-specific configurations
- Deploy to production servers

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Support

If you encounter issues:
1. Check the error messages in terminal
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection status

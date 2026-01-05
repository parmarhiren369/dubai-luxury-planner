# Quick Start Guide

Get your WTB Tourism Management System up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm
npm --version

# Check MongoDB (if using local)
mongod --version
```

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## Step 2: Set Up Environment

### Create Frontend `.env` file:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Create Backend `.env` file:
```bash
cd server
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wtb-tourism
FRONTEND_URL=http://localhost:5173
EOF
cd ..
```

**For MongoDB Atlas**, update `MONGODB_URI` in `server/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wtb-tourism
```

## Step 3: Start MongoDB

### Local MongoDB:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - Start MongoDB service from Services
```

### MongoDB Atlas:
- No local setup needed, just use the connection string

## Step 4: Start Backend

```bash
cd server
npm run dev
```

Wait for: `✅ Connected to MongoDB` and `🚀 Server running on http://localhost:5000`

## Step 5: Start Frontend

Open a **new terminal**:

```bash
npm run dev
```

Wait for: `Local: http://localhost:5173/`

## Step 6: Open Browser

Navigate to: **http://localhost:5173**

## Verify It Works

1. Go to **Hotels** page
2. Click **Add Hotel**
3. Fill in the form and save
4. Check MongoDB - you should see the new hotel:
   ```bash
   # Using MongoDB Compass or mongo shell
   use wtb-tourism
   db.hotels.find().pretty()
   ```

## Troubleshooting

### Backend won't start
- ✅ Check MongoDB is running
- ✅ Verify `MONGODB_URI` in `server/.env`
- ✅ Check port 5000 is not in use

### Frontend can't connect
- ✅ Ensure backend is running
- ✅ Check `VITE_API_URL` in `.env`
- ✅ Check browser console for errors

### MongoDB connection error
- ✅ Verify MongoDB is accessible
- ✅ Check connection string format
- ✅ For Atlas: Check IP whitelist and credentials

## What's Next?

1. **Explore the API**: Visit `http://localhost:5000/api/hotels`
2. **Read Documentation**: Check `README.md` and `SETUP.md`
3. **Integrate Frontend**: See `MIGRATION_GUIDE.md` for updating pages
4. **Add Sample Data**: Use Excel import features

## Need Help?

- Check `SETUP.md` for detailed instructions
- Check `MIGRATION_GUIDE.md` for frontend integration
- Check `BACKEND_SUMMARY.md` for API details

## Common Commands

```bash
# Start everything (in separate terminals)
cd server && npm run dev    # Terminal 1
npm run dev                 # Terminal 2

# Build for production
npm run build               # Frontend
cd server && npm run build  # Backend

# Check MongoDB data
mongosh wtb-tourism
db.hotels.find()
```

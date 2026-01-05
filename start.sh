#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting WTB Tourism Management System...${NC}\n"

# Check if MongoDB is running (optional check)
if ! pgrep -x "mongod" > /dev/null && ! pgrep -x "mongodb" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB doesn't seem to be running.${NC}"
    echo -e "${YELLOW}   If using local MongoDB, start it first.${NC}"
    echo -e "${YELLOW}   If using MongoDB Atlas, you're good to go!${NC}\n"
fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating server/.env file...${NC}"
    cat > server/.env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wtb-tourism
FRONTEND_URL=http://localhost:5173
EOF
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating .env file...${NC}"
    echo "VITE_API_URL=http://localhost:5000/api" > .env
fi

# Start backend in background
echo -e "${GREEN}📦 Starting Backend Server...${NC}"
cd server
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}🎨 Starting Frontend Server...${NC}"
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✅ Both servers are starting!${NC}\n"
echo -e "${BLUE}📍 Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}📍 Backend API: http://localhost:5000/api${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

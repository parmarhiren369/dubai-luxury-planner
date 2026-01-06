# WTB Tourism Management System

A comprehensive tourism management system for managing hotels, customers, agents, quotations, and travel services.

## Features

- 🏨 **Hotel Management**: Manage hotel pricing, room types, and date-based rate periods
- 👥 **Customer Management**: Maintain customer database with contact information
- 🤝 **Agent Management**: Track travel agents and their commissions
- 📋 **Quotation System**: Create and manage travel quotations with multiple services
- 🗺️ **Sightseeing Tours**: Manage tour packages and attractions
- 🍽️ **Meals & Transfers**: Manage meal options and transfer services
- 🎫 **Entry Tickets & Visa**: Handle entry tickets and visa services
- 📊 **Dashboard**: Real-time statistics and analytics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router
- TanStack Query
- date-fns

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- RESTful API

## Project Structure

```
2f/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API client
│   └── hooks/             # Custom React hooks
├── server/                # Backend API server
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── controllers/   # Route controllers
│   │   └── routes/        # API routes
│   └── package.json
└── package.json           # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository** (if applicable)

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd server
npm install
```

4. **Set up environment variables:**

Create `.env` in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wtb-tourism
FRONTEND_URL=http://localhost:5173
```

5. **Start MongoDB** (if running locally):
```bash
mongod
```

6. **Start the backend server:**
```bash
cd server
npm run dev
```

7. **Start the frontend development server:**
```bash
npm run dev
```The application will be available at `http://localhost:5173`

## API Documentation

The backend API runs on `http://localhost:5000/api`. See `server/README.md` for detailed API documentation.

### Main Endpoints

- `/api/hotels` - Hotel management
- `/api/customers` - Customer management
- `/api/agents` - Agent management
- `/api/quotations` - Quotation management
- `/api/sightseeing` - Sightseeing tours
- `/api/meals` - Meal options
- `/api/transfers` - Transfer services
- `/api/entry-tickets` - Entry tickets
- `/api/visa` - Visa services
- `/api/dashboard` - Dashboard statistics

## Development

### Frontend Development

```bash
npm run dev          # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

### Backend Development

```bash
cd server
npm run dev           # Start dev server with hot reload
npm run build         # Build TypeScript
npm start             # Start production server
npm run lint          # Run ESLint
```

## Database Schema

The application uses MongoDB with the following main collections:

- **hotels**: Hotel information with rate periods
- **customers**: Customer master data
- **agents**: Travel agent information
- **quotations**: Quotation/booking details
- **sightseeing**: Tour and attraction details
- **meals**: Meal options
- **transfers**: Transfer services
- **entryTickets**: Entry ticket options
- **visa**: Visa services## Features in Detail

### Hotel Management
- Add, edit, and delete hotels
- Configure room types and pricing
- Set date-based rate periods
- Import/export hotel data via Excel

### Quotation System
- Create quotations with multiple services
- Calculate costs automatically
- Track quotation status (draft, sent, confirmed, cancelled)
- Generate quotation IDs automatically

### Rate Management
- Set daily rates for specific date ranges
- Support for different room types and meal plans
- Automatic rate calculation based on dates

## Production Deployment

### Build Frontend
```bash
npm run build
```

### Build Backend
```bash
cd server
npm run build
```

### Environment Variables

Make sure to set production environment variables:
- `VITE_API_URL` - Production API URL
- `MONGODB_URI` - Production MongoDB connection string
- `NODE_ENV=production`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please contact [your contact information].

# WTB Tourism Backend API

Backend API server for WTB Tourism Management System built with Express, TypeScript, and MongoDB.

## Features

- RESTful API endpoints for all entities
- MongoDB database with Mongoose ODM
- TypeScript for type safety
- CORS enabled for frontend integration
- Error handling middleware
- Data validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - `MONGODB_URI`: MongoDB connection string
   - `PORT`: Server port (default: 5000)
   - `FRONTEND_URL`: Frontend URL for CORS

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the server:
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

## API Endpoints

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create hotel
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel
- `GET /api/hotels/:hotelId/rate` - Get rate for date
- `POST /api/hotels/:hotelId/rate` - Set rate for date range
- `POST /api/hotels/import` - Import hotels

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Quotations
- `GET /api/quotations` - Get all quotations
- `GET /api/quotations/:id` - Get quotation by ID
- `POST /api/quotations` - Create quotation
- `PUT /api/quotations/:id` - Update quotation
- `PATCH /api/quotations/:id/status` - Update quotation status
- `DELETE /api/quotations/:id` - Delete quotation

### Sightseeing
- `GET /api/sightseeing` - Get all sightseeing items
- `GET /api/sightseeing/:id` - Get sightseeing item by ID
- `POST /api/sightseeing` - Create sightseeing item
- `PUT /api/sightseeing/:id` - Update sightseeing item
- `DELETE /api/sightseeing/:id` - Delete sightseeing item
- `POST /api/sightseeing/import` - Import sightseeing items

### Meals, Transfers, Entry Tickets, Visa
Similar CRUD endpoints available for all entities.

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-quotations` - Get recent quotations
- `GET /api/dashboard/upcoming-bookings` - Get upcoming bookings

## Database Models

All models include timestamps (`createdAt`, `updatedAt`) automatically.

- **Hotel**: Hotel information with rate periods
- **Customer**: Customer master data
- **Agent**: Travel agent information
- **Quotation**: Quotation/booking details
- **Sightseeing**: Tour and attraction details
- **Meal**: Meal options
- **Transfer**: Transfer services
- **EntryTicket**: Entry ticket options
- **Visa**: Visa services

## Development

The server runs on `http://localhost:5000` by default. Make sure MongoDB is running before starting the server.

## Production

Build the TypeScript code:
```bash
npm run build
```

Start the server:
```bash
npm start
```

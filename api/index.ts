import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to send JSON response
function json(res: VercelResponse, data: any, status = 200) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(status).json(data);
}

// Helper to send error response
function sendError(res: VercelResponse, message: string, status = 500) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(status).json({ message });
}

// Lazy load mongoose and models to avoid initialization errors
let dbConnection: any = null;
let models: any = null;

async function getDb() {
  if (!dbConnection) {
    const mongoose = await import('mongoose');
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    if (mongoose.default.connection.readyState === 0) {
      await mongoose.default.connect(MONGODB_URI, {
        bufferCommands: false,
        maxIdleTimeMS: 10000,
        serverSelectionTimeoutMS: 10000,
      });
    }
    
    dbConnection = mongoose.default;
  }
  return dbConnection;
}

async function getModels() {
  if (!models) {
    const mongoose = await getDb();
    const Schema = mongoose.Schema;
    
    // Define schemas inline to avoid import issues
    const HotelSchema = new Schema({
      name: { type: String, required: true },
      category: { type: String, required: true },
      location: { type: String, required: true },
      singleRoom: { type: Number, default: 0 },
      doubleRoom: { type: Number, default: 0 },
      tripleRoom: { type: Number, default: 0 },
      quadRoom: { type: Number, default: 0 },
      sixRoom: { type: Number, default: 0 },
      extraBed: { type: Number, default: 0 },
      childWithBed: { type: Number, default: 0 },
      childWithoutBed: { type: Number, default: 0 },
      childWithoutBed3to5: { type: Number, default: 0 },
      childWithoutBed5to11: { type: Number, default: 0 },
      infant: { type: Number, default: 0 },
      mealPlan: { type: String, default: 'BB' },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
      ratePeriods: [{ roomType: String, mealPlan: String, startDate: Date, endDate: Date, rate: Number }]
    }, { timestamps: true });
    
    const CustomerSchema = new Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
      nationality: String,
      passportNo: String,
      address: String,
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });
    
    const AgentSchema = new Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
      company: { type: String, required: true },
      role: { type: String, default: 'Agent' },
      commission: { type: Number, default: 10, min: 0, max: 100 },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });
    
    const SightseeingSchema = new Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: String, required: true },
      adultPrice: { type: Number, required: true, min: 0 },
      childPrice: { type: Number, required: true, min: 0 },
      infantPrice: { type: Number, default: 0, min: 0 },
      entryTicket: { type: Number, default: 0, min: 0 },
      category: { type: String, required: true },
      includes: { type: String, required: true },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });
    
    const MealSchema = new Schema({
      name: { type: String, required: true },
      type: { type: String, required: true },
      description: { type: String, required: true },
      pricePerPerson: { type: Number, required: true, min: 0 },
      restaurant: { type: String, required: true },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });
    
    const TransferSchema = new Schema({
      name: { type: String, required: true },
      type: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      vehicleType: { type: String, required: true },
      capacity: { type: Number, required: true, min: 1 },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });
    
    const EntryTicketSchema = new Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      location: { type: String, required: true },
      adultPrice: { type: Number, required: true, min: 0 },
      childPrice: { type: Number, required: true, min: 0 },
      infantPrice: { type: Number, default: 0, min: 0 },
      category: { type: String, required: true },
      validity: { type: String, required: true },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });
    
    const VisaSchema = new Schema({
      country: { type: String, required: true },
      type: { type: String, required: true },
      processingTime: { type: String, required: true },
      validity: { type: String, required: true },
      adultPrice: { type: Number, required: true, min: 0 },
      childPrice: { type: Number, required: true, min: 0 },
      infantPrice: { type: Number, default: 0, min: 0 },
      requirements: [{ type: String }],
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });
    
    const QuotationSchema = new Schema({
      quotationId: { type: String, required: true, unique: true },
      customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
      customerName: { type: String, required: true },
      agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
      type: { type: String, enum: ['FIT', 'Group', 'Corporate', 'Honeymoon'], required: true },
      nationality: String,
      adults: { type: Number, default: 0 },
      childrenWithBed: { type: Number, default: 0 },
      childrenWithoutBed: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
      arrivalDate: { type: Date, required: true },
      departureDate: { type: Date, required: true },
      nights: { type: Number, required: true },
      items: [{ type: String, name: String, quantity: Number, unitPrice: Number, total: Number, details: String, referenceId: String }],
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      perHeadCost: { type: Number, required: true },
      notes: String,
      status: { type: String, enum: ['draft', 'sent', 'confirmed', 'cancelled'], default: 'draft' }
    }, { timestamps: true });
    
    // Add id transform to all schemas
    const addIdTransform = (schema: any) => {
      schema.set('toJSON', {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
          const { _id, __v, ...rest } = ret;
          return { id: _id?.toString(), ...rest };
        }
      });
    };
    
    addIdTransform(HotelSchema);
    addIdTransform(CustomerSchema);
    addIdTransform(AgentSchema);
    addIdTransform(SightseeingSchema);
    addIdTransform(MealSchema);
    addIdTransform(TransferSchema);
    addIdTransform(EntryTicketSchema);
    addIdTransform(VisaSchema);
    addIdTransform(QuotationSchema);
    
    models = {
      Hotel: mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema),
      Customer: mongoose.models.Customer || mongoose.model('Customer', CustomerSchema),
      Agent: mongoose.models.Agent || mongoose.model('Agent', AgentSchema),
      Sightseeing: mongoose.models.Sightseeing || mongoose.model('Sightseeing', SightseeingSchema),
      Meal: mongoose.models.Meal || mongoose.model('Meal', MealSchema),
      Transfer: mongoose.models.Transfer || mongoose.model('Transfer', TransferSchema),
      EntryTicket: mongoose.models.EntryTicket || mongoose.model('EntryTicket', EntryTicketSchema),
      Visa: mongoose.models.Visa || mongoose.model('Visa', VisaSchema),
      Quotation: mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema),
    };
  }
  return models;
}

// Route matcher
function matchRoute(url: string, pattern: string): { match: boolean; params: Record<string, string> } {
  const urlParts = url.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);
  
  if (urlParts.length !== patternParts.length) {
    return { match: false, params: {} };
  }
  
  const params: Record<string, string> = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return { match: false, params: {} };
    }
  }
  
  return { match: true, params };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).end();
  }

  const url = req.url?.split('?')[0] || '';
  const method = req.method || 'GET';
  const query = req.query;

  try {
    // Health check - doesn't need DB
    if (url === '/api/health' && method === 'GET') {
      return json(res, { status: 'ok', timestamp: new Date().toISOString(), mongoUri: process.env.MONGODB_URI ? 'set' : 'not set' });
    }

    // Get models (lazy load)
    const { Hotel, Customer, Agent, Sightseeing, Meal, Transfer, EntryTicket, Visa, Quotation } = await getModels();

    // ==================== HOTELS ====================
    if (url === '/api/hotels' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status) q.status = status;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      const hotels = await Hotel.find(q).sort({ createdAt: -1 });
      return json(res, hotels);
    }

    if (url === '/api/hotels' && method === 'POST') {
      const hotel = new Hotel(req.body);
      await hotel.save();
      return json(res, hotel, 201);
    }

    if (url === '/api/hotels/import' && method === 'POST') {
      const hotels = req.body;
      if (!Array.isArray(hotels) || hotels.length === 0) {
        return sendError(res, 'Invalid data: Expected an array of hotels', 400);
      }
      const imported = await Hotel.insertMany(hotels, { ordered: false });
      return json(res, { count: imported.length, hotels: imported }, 201);
    }

    const hotelByIdMatch = matchRoute(url, '/api/hotels/:id');
    if (hotelByIdMatch.match) {
      const { id } = hotelByIdMatch.params;
      if (method === 'GET') {
        const hotel = await Hotel.findById(id);
        if (!hotel) return sendError(res, 'Hotel not found', 404);
        return json(res, hotel);
      }
      if (method === 'PUT') {
        const hotel = await Hotel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!hotel) return sendError(res, 'Hotel not found', 404);
        return json(res, hotel);
      }
      if (method === 'DELETE') {
        const hotel = await Hotel.findByIdAndDelete(id);
        if (!hotel) return sendError(res, 'Hotel not found', 404);
        return json(res, { message: 'Hotel deleted successfully' });
      }
    }

    // ==================== CUSTOMERS ====================
    if (url === '/api/customers' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      const customers = await Customer.find(q).sort({ createdAt: -1 });
      return json(res, customers);
    }

    if (url === '/api/customers' && method === 'POST') {
      const customer = new Customer(req.body);
      await customer.save();
      return json(res, customer, 201);
    }

    const customerByIdMatch = matchRoute(url, '/api/customers/:id');
    if (customerByIdMatch.match) {
      const { id } = customerByIdMatch.params;
      if (method === 'GET') {
        const customer = await Customer.findById(id);
        if (!customer) return sendError(res, 'Customer not found', 404);
        return json(res, customer);
      }
      if (method === 'PUT') {
        const customer = await Customer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!customer) return sendError(res, 'Customer not found', 404);
        return json(res, customer);
      }
      if (method === 'DELETE') {
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) return sendError(res, 'Customer not found', 404);
        return json(res, { message: 'Customer deleted successfully' });
      }
    }

    // ==================== AGENTS ====================
    if (url === '/api/agents' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ];
      }
      const agents = await Agent.find(q).sort({ createdAt: -1 });
      return json(res, agents);
    }

    if (url === '/api/agents' && method === 'POST') {
      const agent = new Agent(req.body);
      await agent.save();
      return json(res, agent, 201);
    }

    const agentByIdMatch = matchRoute(url, '/api/agents/:id');
    if (agentByIdMatch.match) {
      const { id } = agentByIdMatch.params;
      if (method === 'GET') {
        const agent = await Agent.findById(id);
        if (!agent) return sendError(res, 'Agent not found', 404);
        return json(res, agent);
      }
      if (method === 'PUT') {
        const agent = await Agent.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!agent) return sendError(res, 'Agent not found', 404);
        return json(res, agent);
      }
      if (method === 'DELETE') {
        const agent = await Agent.findByIdAndDelete(id);
        if (!agent) return sendError(res, 'Agent not found', 404);
        return json(res, { message: 'Agent deleted successfully' });
      }
    }

    // ==================== SIGHTSEEING ====================
    if (url === '/api/sightseeing' && method === 'GET') {
      const { search, category, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (category && category !== 'all') q.category = category;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      const sightseeing = await Sightseeing.find(q).sort({ createdAt: -1 });
      return json(res, sightseeing);
    }

    if (url === '/api/sightseeing' && method === 'POST') {
      const sightseeing = new Sightseeing(req.body);
      await sightseeing.save();
      return json(res, sightseeing, 201);
    }

    const sightseeingByIdMatch = matchRoute(url, '/api/sightseeing/:id');
    if (sightseeingByIdMatch.match) {
      const { id } = sightseeingByIdMatch.params;
      if (method === 'GET') {
        const item = await Sightseeing.findById(id);
        if (!item) return sendError(res, 'Sightseeing not found', 404);
        return json(res, item);
      }
      if (method === 'PUT') {
        const item = await Sightseeing.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!item) return sendError(res, 'Sightseeing not found', 404);
        return json(res, item);
      }
      if (method === 'DELETE') {
        const item = await Sightseeing.findByIdAndDelete(id);
        if (!item) return sendError(res, 'Sightseeing not found', 404);
        return json(res, { message: 'Sightseeing deleted successfully' });
      }
    }

    // ==================== MEALS ====================
    if (url === '/api/meals' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { restaurant: { $regex: search, $options: 'i' } }
        ];
      }
      const meals = await Meal.find(q).sort({ createdAt: -1 });
      return json(res, meals);
    }

    if (url === '/api/meals' && method === 'POST') {
      const meal = new Meal(req.body);
      await meal.save();
      return json(res, meal, 201);
    }

    const mealByIdMatch = matchRoute(url, '/api/meals/:id');
    if (mealByIdMatch.match) {
      const { id } = mealByIdMatch.params;
      if (method === 'GET') {
        const meal = await Meal.findById(id);
        if (!meal) return sendError(res, 'Meal not found', 404);
        return json(res, meal);
      }
      if (method === 'PUT') {
        const meal = await Meal.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!meal) return sendError(res, 'Meal not found', 404);
        return json(res, meal);
      }
      if (method === 'DELETE') {
        const meal = await Meal.findByIdAndDelete(id);
        if (!meal) return sendError(res, 'Meal not found', 404);
        return json(res, { message: 'Meal deleted successfully' });
      }
    }

    // ==================== TRANSFERS ====================
    if (url === '/api/transfers' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { vehicleType: { $regex: search, $options: 'i' } }
        ];
      }
      const transfers = await Transfer.find(q).sort({ createdAt: -1 });
      return json(res, transfers);
    }

    if (url === '/api/transfers' && method === 'POST') {
      const transfer = new Transfer(req.body);
      await transfer.save();
      return json(res, transfer, 201);
    }

    const transferByIdMatch = matchRoute(url, '/api/transfers/:id');
    if (transferByIdMatch.match) {
      const { id } = transferByIdMatch.params;
      if (method === 'GET') {
        const transfer = await Transfer.findById(id);
        if (!transfer) return sendError(res, 'Transfer not found', 404);
        return json(res, transfer);
      }
      if (method === 'PUT') {
        const transfer = await Transfer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!transfer) return sendError(res, 'Transfer not found', 404);
        return json(res, transfer);
      }
      if (method === 'DELETE') {
        const transfer = await Transfer.findByIdAndDelete(id);
        if (!transfer) return sendError(res, 'Transfer not found', 404);
        return json(res, { message: 'Transfer deleted successfully' });
      }
    }

    // ==================== ENTRY TICKETS ====================
    if (url === '/api/entry-tickets' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }
      const tickets = await EntryTicket.find(q).sort({ createdAt: -1 });
      return json(res, tickets);
    }

    if (url === '/api/entry-tickets' && method === 'POST') {
      const ticket = new EntryTicket(req.body);
      await ticket.save();
      return json(res, ticket, 201);
    }

    const ticketByIdMatch = matchRoute(url, '/api/entry-tickets/:id');
    if (ticketByIdMatch.match) {
      const { id } = ticketByIdMatch.params;
      if (method === 'GET') {
        const ticket = await EntryTicket.findById(id);
        if (!ticket) return sendError(res, 'Entry ticket not found', 404);
        return json(res, ticket);
      }
      if (method === 'PUT') {
        const ticket = await EntryTicket.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!ticket) return sendError(res, 'Entry ticket not found', 404);
        return json(res, ticket);
      }
      if (method === 'DELETE') {
        const ticket = await EntryTicket.findByIdAndDelete(id);
        if (!ticket) return sendError(res, 'Entry ticket not found', 404);
        return json(res, { message: 'Entry ticket deleted successfully' });
      }
    }

    // ==================== VISA ====================
    if (url === '/api/visa' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (search) {
        q.$or = [
          { country: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
        ];
      }
      const visas = await Visa.find(q).sort({ createdAt: -1 });
      return json(res, visas);
    }

    if (url === '/api/visa' && method === 'POST') {
      const visa = new Visa(req.body);
      await visa.save();
      return json(res, visa, 201);
    }

    const visaByIdMatch = matchRoute(url, '/api/visa/:id');
    if (visaByIdMatch.match) {
      const { id } = visaByIdMatch.params;
      if (method === 'GET') {
        const visa = await Visa.findById(id);
        if (!visa) return sendError(res, 'Visa not found', 404);
        return json(res, visa);
      }
      if (method === 'PUT') {
        const visa = await Visa.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!visa) return sendError(res, 'Visa not found', 404);
        return json(res, visa);
      }
      if (method === 'DELETE') {
        const visa = await Visa.findByIdAndDelete(id);
        if (!visa) return sendError(res, 'Visa not found', 404);
        return json(res, { message: 'Visa deleted successfully' });
      }
    }

    // ==================== QUOTATIONS ====================
    if (url === '/api/quotations' && method === 'GET') {
      const { search, status } = query;
      const q: any = {};
      if (status && status !== 'all') q.status = status;
      if (search) {
        q.$or = [
          { quotationId: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } }
        ];
      }
      const quotations = await Quotation.find(q)
        .populate('customerId', 'name email phone')
        .populate('agentId', 'name company')
        .sort({ createdAt: -1 });
      return json(res, quotations);
    }

    if (url === '/api/quotations' && method === 'POST') {
      const { customerId } = req.body;
      const customer = await Customer.findById(customerId);
      if (!customer) return sendError(res, 'Customer not found', 404);
      
      const year = new Date().getFullYear();
      const count = await Quotation.countDocuments({ createdAt: { $gte: new Date(year, 0, 1) } });
      const quotationId = `QT-${year}-${String(count + 1).padStart(3, '0')}`;
      
      const quotation = new Quotation({ ...req.body, quotationId, customerName: customer.name });
      await quotation.save();
      return json(res, quotation, 201);
    }

    const quotationByIdMatch = matchRoute(url, '/api/quotations/:id');
    if (quotationByIdMatch.match) {
      const { id } = quotationByIdMatch.params;
      if (method === 'GET') {
        const quotation = await Quotation.findById(id).populate('customerId').populate('agentId');
        if (!quotation) return sendError(res, 'Quotation not found', 404);
        return json(res, quotation);
      }
      if (method === 'PUT') {
        const quotation = await Quotation.findByIdAndUpdate(id, req.body, { new: true }).populate('customerId agentId');
        if (!quotation) return sendError(res, 'Quotation not found', 404);
        return json(res, quotation);
      }
      if (method === 'DELETE') {
        const quotation = await Quotation.findByIdAndDelete(id);
        if (!quotation) return sendError(res, 'Quotation not found', 404);
        return json(res, { message: 'Quotation deleted successfully' });
      }
    }

    // ==================== DASHBOARD ====================
    if (url === '/api/dashboard/stats' && method === 'GET') {
      const totalBookings = await Quotation.countDocuments({ status: 'confirmed' });
      const activeCustomers = await Customer.countDocuments({ status: 'active' });
      const hotelsManaged = await Hotel.countDocuments({ status: 'active' });
      const tourPackages = await Sightseeing.countDocuments({ status: 'active' });
      
      return json(res, {
        totalBookings: { value: totalBookings, growth: 0 },
        revenue: { value: 0, currency: 'AED' },
        activeCustomers: { value: activeCustomers, newThisMonth: 0 },
        quotationsSent: { value: 0, pending: 0 },
        hotelsManaged: { value: hotelsManaged },
        tourPackages: { value: tourPackages }
      });
    }

    if (url === '/api/dashboard/recent-quotations' && method === 'GET') {
      const quotations = await Quotation.find()
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);
      return json(res, quotations);
    }

    // 404 - Route not found
    return sendError(res, `Route not found: ${method} ${url}`, 404);

  } catch (err: any) {
    console.error('API Error:', err);
    return sendError(res, err.message || 'Internal server error', 500);
  }
}

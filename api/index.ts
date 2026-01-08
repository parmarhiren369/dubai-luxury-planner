import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url?.split('?')[0] || '';
  const method = req.method || 'GET';

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (url === '/api/health' || url === '/api') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongoUri: process.env.MONGODB_URI ? 'configured' : 'NOT CONFIGURED - Please set MONGODB_URI in Vercel Environment Variables'
    });
  }

  try {
    // Lazy load mongoose
    const mongoose = (await import('mongoose')).default;
    
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      return res.status(500).json({ 
        message: 'MONGODB_URI is not configured. Please add it in Vercel Project Settings > Environment Variables',
        help: 'Set MONGODB_URI to: mongodb+srv://hirenhp936_db_user:hirendham369@wtb-tour.yldxqa5.mongodb.net/wtb-tourism?retryWrites=true&w=majority'
      });
    }

    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }

    // Define Hotel Schema inline
    const HotelSchema = new mongoose.Schema({
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
    }, { timestamps: true });

    HotelSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

    // Define Customer Schema
    const CustomerSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      nationality: String,
      passportNo: String,
      address: String,
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    CustomerSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

    // Define Agent Schema
    const AgentSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      company: { type: String, required: true },
      role: { type: String, default: 'Agent' },
      commission: { type: Number, default: 10 },
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    AgentSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);

    // Define Sightseeing Schema
    const SightseeingSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: String, required: true },
      adultPrice: { type: Number, required: true },
      childPrice: { type: Number, required: true },
      infantPrice: { type: Number, default: 0 },
      entryTicket: { type: Number, default: 0 },
      category: { type: String, required: true },
      includes: { type: String, required: true },
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    SightseeingSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const Sightseeing = mongoose.models.Sightseeing || mongoose.model('Sightseeing', SightseeingSchema);

    // Define Meal Schema
    const MealSchema = new mongoose.Schema({
      name: { type: String, required: true },
      type: { type: String, required: true },
      description: { type: String, required: true },
      pricePerPerson: { type: Number, required: true },
      restaurant: { type: String, required: true },
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    MealSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const Meal = mongoose.models.Meal || mongoose.model('Meal', MealSchema);

    // Define Transfer Schema
    const TransferSchema = new mongoose.Schema({
      name: { type: String, required: true },
      type: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      vehicleType: { type: String, required: true },
      capacity: { type: Number, required: true },
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    TransferSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const Transfer = mongoose.models.Transfer || mongoose.model('Transfer', TransferSchema);

    // Define EntryTicket Schema
    const EntryTicketSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      location: { type: String, required: true },
      adultPrice: { type: Number, required: true },
      childPrice: { type: Number, required: true },
      infantPrice: { type: Number, default: 0 },
      category: { type: String, required: true },
      validity: { type: String, required: true },
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    EntryTicketSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const EntryTicket = mongoose.models.EntryTicket || mongoose.model('EntryTicket', EntryTicketSchema);

    // Define Visa Schema
    const VisaSchema = new mongoose.Schema({
      country: { type: String, required: true },
      type: { type: String, required: true },
      processingTime: { type: String, required: true },
      validity: { type: String, required: true },
      adultPrice: { type: Number, required: true },
      childPrice: { type: Number, required: true },
      infantPrice: { type: Number, default: 0 },
      requirements: [String],
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    VisaSchema.set('toJSON', {
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    const Visa = mongoose.models.Visa || mongoose.model('Visa', VisaSchema);

    // API Routes
    // Hotels
    if (url === '/api/hotels' && method === 'GET') {
      const hotels = await Hotel.find().sort({ createdAt: -1 });
      return res.status(200).json(hotels);
    }
    if (url === '/api/hotels' && method === 'POST') {
      const hotel = new Hotel(req.body);
      await hotel.save();
      return res.status(201).json(hotel);
    }
    if (url === '/api/hotels/import' && method === 'POST') {
      const hotels = await Hotel.insertMany(req.body);
      return res.status(201).json({ count: hotels.length, hotels });
    }
    if (url.match(/^\/api\/hotels\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const hotel = await Hotel.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(hotel);
    }
    if (url.match(/^\/api\/hotels\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await Hotel.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Customers
    if (url === '/api/customers' && method === 'GET') {
      const customers = await Customer.find().sort({ createdAt: -1 });
      return res.status(200).json(customers);
    }
    if (url === '/api/customers' && method === 'POST') {
      const customer = new Customer(req.body);
      await customer.save();
      return res.status(201).json(customer);
    }
    if (url.match(/^\/api\/customers\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const customer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(customer);
    }
    if (url.match(/^\/api\/customers\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await Customer.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Agents
    if (url === '/api/agents' && method === 'GET') {
      const agents = await Agent.find().sort({ createdAt: -1 });
      return res.status(200).json(agents);
    }
    if (url === '/api/agents' && method === 'POST') {
      const agent = new Agent(req.body);
      await agent.save();
      return res.status(201).json(agent);
    }
    if (url.match(/^\/api\/agents\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const agent = await Agent.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(agent);
    }
    if (url.match(/^\/api\/agents\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await Agent.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Sightseeing
    if (url === '/api/sightseeing' && method === 'GET') {
      const items = await Sightseeing.find().sort({ createdAt: -1 });
      return res.status(200).json(items);
    }
    if (url === '/api/sightseeing' && method === 'POST') {
      const item = new Sightseeing(req.body);
      await item.save();
      return res.status(201).json(item);
    }
    if (url.match(/^\/api\/sightseeing\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const item = await Sightseeing.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(item);
    }
    if (url.match(/^\/api\/sightseeing\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await Sightseeing.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Meals
    if (url === '/api/meals' && method === 'GET') {
      const items = await Meal.find().sort({ createdAt: -1 });
      return res.status(200).json(items);
    }
    if (url === '/api/meals' && method === 'POST') {
      const item = new Meal(req.body);
      await item.save();
      return res.status(201).json(item);
    }
    if (url.match(/^\/api\/meals\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const item = await Meal.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(item);
    }
    if (url.match(/^\/api\/meals\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await Meal.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Transfers
    if (url === '/api/transfers' && method === 'GET') {
      const items = await Transfer.find().sort({ createdAt: -1 });
      return res.status(200).json(items);
    }
    if (url === '/api/transfers' && method === 'POST') {
      const item = new Transfer(req.body);
      await item.save();
      return res.status(201).json(item);
    }
    if (url.match(/^\/api\/transfers\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const item = await Transfer.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(item);
    }
    if (url.match(/^\/api\/transfers\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await Transfer.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Entry Tickets
    if (url === '/api/entry-tickets' && method === 'GET') {
      const items = await EntryTicket.find().sort({ createdAt: -1 });
      return res.status(200).json(items);
    }
    if (url === '/api/entry-tickets' && method === 'POST') {
      const item = new EntryTicket(req.body);
      await item.save();
      return res.status(201).json(item);
    }
    if (url.match(/^\/api\/entry-tickets\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const item = await EntryTicket.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(item);
    }
    if (url.match(/^\/api\/entry-tickets\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await EntryTicket.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Visa
    if (url === '/api/visa' && method === 'GET') {
      const items = await Visa.find().sort({ createdAt: -1 });
      return res.status(200).json(items);
    }
    if (url === '/api/visa' && method === 'POST') {
      const item = new Visa(req.body);
      await item.save();
      return res.status(201).json(item);
    }
    if (url.match(/^\/api\/visa\/[^/]+$/) && method === 'PUT') {
      const id = url.split('/').pop();
      const item = await Visa.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(item);
    }
    if (url.match(/^\/api\/visa\/[^/]+$/) && method === 'DELETE') {
      const id = url.split('/').pop();
      await Visa.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    // Dashboard
    if (url === '/api/dashboard/stats' && method === 'GET') {
      return res.status(200).json({
        totalBookings: { value: 0, growth: 0 },
        revenue: { value: 0, currency: 'AED' },
        activeCustomers: { value: 0, newThisMonth: 0 },
        quotationsSent: { value: 0, pending: 0 },
        hotelsManaged: { value: 0 },
        tourPackages: { value: 0 }
      });
    }
    if (url === '/api/dashboard/recent-quotations' && method === 'GET') {
      return res.status(200).json([]);
    }

    // 404
    return res.status(404).json({ message: `Route not found: ${method} ${url}` });

  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

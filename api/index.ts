import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from './lib/mongodb';

// Import models
import Hotel from './lib/models/Hotel';
import Customer from './lib/models/Customer';
import Agent from './lib/models/Agent';
import Quotation from './lib/models/Quotation';
import Sightseeing from './lib/models/Sightseeing';
import Meal from './lib/models/Meal';
import Transfer from './lib/models/Transfer';
import EntryTicket from './lib/models/EntryTicket';
import Visa from './lib/models/Visa';

import { startOfDay, endOfDay, eachDayOfInterval, differenceInDays } from 'date-fns';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to parse request body
async function parseBody(req: VercelRequest): Promise<any> {
  if (req.body) return req.body;
  return {};
}

// Helper to send JSON response
function json(res: VercelResponse, data: any, status = 200) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(status).json(data);
}

// Helper to send error response
function error(res: VercelResponse, message: string, status = 500) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(status).json({ message });
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
      return json(res, { status: 'ok', timestamp: new Date().toISOString() });
    }

    // Connect to database for all other routes
    await connectDB();

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
      const body = await parseBody(req);
      const hotel = new Hotel(body);
      await hotel.save();
      return json(res, hotel, 201);
    }

    if (url === '/api/hotels/import' && method === 'POST') {
      const hotels = await parseBody(req);
      if (!Array.isArray(hotels) || hotels.length === 0) {
        return error(res, 'Invalid data: Expected an array of hotels', 400);
      }
      const validHotels = hotels.filter((h: any) => h.name && typeof h.name === 'string');
      if (validHotels.length === 0) {
        return error(res, 'No valid hotels found', 400);
      }
      const normalizedHotels = validHotels.map((hotel: any) => ({
        name: String(hotel.name).trim(),
        category: String(hotel.category || '').trim(),
        location: String(hotel.location || '').trim(),
        singleRoom: Number(hotel.singleRoom) || 0,
        doubleRoom: Number(hotel.doubleRoom) || 0,
        tripleRoom: Number(hotel.tripleRoom) || 0,
        quadRoom: Number(hotel.quadRoom) || 0,
        sixRoom: Number(hotel.sixRoom) || 0,
        extraBed: Number(hotel.extraBed) || 0,
        childWithBed: Number(hotel.childWithBed) || 0,
        childWithoutBed: Number(hotel.childWithoutBed) || 0,
        childWithoutBed3to5: Number(hotel.childWithoutBed3to5) || 0,
        childWithoutBed5to11: Number(hotel.childWithoutBed5to11) || 0,
        infant: Number(hotel.infant) || 0,
        mealPlan: String(hotel.mealPlan || 'BB').toUpperCase(),
        status: hotel.status === 'inactive' ? 'inactive' : 'active',
        ratePeriods: []
      }));
      const imported = await Hotel.insertMany(normalizedHotels, { ordered: false });
      return json(res, { count: imported.length, hotels: imported }, 201);
    }

    // Hotel by ID routes
    const hotelByIdMatch = matchRoute(url, '/api/hotels/:id');
    if (hotelByIdMatch.match) {
      const { id } = hotelByIdMatch.params;
      
      if (method === 'GET') {
        const hotel = await Hotel.findById(id);
        if (!hotel) return error(res, 'Hotel not found', 404);
        return json(res, hotel);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const hotel = await Hotel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!hotel) return error(res, 'Hotel not found', 404);
        return json(res, hotel);
      }
      
      if (method === 'DELETE') {
        const hotel = await Hotel.findByIdAndDelete(id);
        if (!hotel) return error(res, 'Hotel not found', 404);
        return json(res, { message: 'Hotel deleted successfully' });
      }
    }

    // Hotel rate routes
    const hotelRateMatch = matchRoute(url, '/api/hotels/:hotelId/rate');
    if (hotelRateMatch.match) {
      const { hotelId } = hotelRateMatch.params;
      
      if (method === 'GET') {
        const { roomType, mealPlan, date } = query;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return error(res, 'Hotel not found', 404);
        
        const targetDate = startOfDay(new Date(date as string));
        const period = hotel.ratePeriods.find((r: any) =>
          r.roomType === roomType && r.mealPlan === mealPlan &&
          targetDate >= startOfDay(r.startDate) && targetDate <= endOfDay(r.endDate)
        );
        
        if (period) return json(res, { rate: period.rate });
        
        const roomTypeMap: Record<string, string> = {
          'SGL': 'singleRoom', 'DBL': 'doubleRoom', 'TPL': 'tripleRoom',
          'QUAD': 'quadRoom', 'SIX': 'sixRoom', 'EX_BED_11': 'extraBed',
          'CWB_3_11': 'childWithBed', 'CNB_3_5': 'childWithoutBed3to5', 'CNB_5_11': 'childWithoutBed5to11'
        };
        const rateKey = roomTypeMap[roomType as string];
        const rate = rateKey ? (hotel as any)[rateKey] : null;
        return json(res, { rate: rate || null });
      }
      
      if (method === 'POST') {
        const body = await parseBody(req);
        const { roomType, mealPlan, startDate, endDate, rate } = body;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return error(res, 'Hotel not found', 404);
        
        hotel.ratePeriods = hotel.ratePeriods.filter((p: any) =>
          !(p.roomType === roomType && p.mealPlan === mealPlan &&
            p.startDate <= new Date(endDate) && p.endDate >= new Date(startDate))
        );
        hotel.ratePeriods.push({ roomType, mealPlan, startDate: new Date(startDate), endDate: new Date(endDate), rate });
        await hotel.save();
        return json(res, hotel);
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
      const body = await parseBody(req);
      const customer = new Customer(body);
      await customer.save();
      return json(res, customer, 201);
    }

    const customerByIdMatch = matchRoute(url, '/api/customers/:id');
    if (customerByIdMatch.match) {
      const { id } = customerByIdMatch.params;
      
      if (method === 'GET') {
        const customer = await Customer.findById(id);
        if (!customer) return error(res, 'Customer not found', 404);
        return json(res, customer);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const customer = await Customer.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!customer) return error(res, 'Customer not found', 404);
        return json(res, customer);
      }
      
      if (method === 'DELETE') {
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) return error(res, 'Customer not found', 404);
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
      const body = await parseBody(req);
      const agent = new Agent(body);
      await agent.save();
      return json(res, agent, 201);
    }

    const agentByIdMatch = matchRoute(url, '/api/agents/:id');
    if (agentByIdMatch.match) {
      const { id } = agentByIdMatch.params;
      
      if (method === 'GET') {
        const agent = await Agent.findById(id);
        if (!agent) return error(res, 'Agent not found', 404);
        return json(res, agent);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const agent = await Agent.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!agent) return error(res, 'Agent not found', 404);
        return json(res, agent);
      }
      
      if (method === 'DELETE') {
        const agent = await Agent.findByIdAndDelete(id);
        if (!agent) return error(res, 'Agent not found', 404);
        return json(res, { message: 'Agent deleted successfully' });
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
      const body = await parseBody(req);
      const { customerId, agentId, type, nationality, adults, childrenWithBed, childrenWithoutBed, infants, arrivalDate, departureDate, items, notes } = body;
      
      const customer = await Customer.findById(customerId);
      if (!customer) return error(res, 'Customer not found', 404);
      
      const nights = differenceInDays(new Date(departureDate), new Date(arrivalDate));
      const totalPax = adults + childrenWithBed + childrenWithoutBed;
      const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
      const grandTotal = subtotal;
      const perHeadCost = totalPax > 0 ? grandTotal / totalPax : 0;
      
      const quotation = new Quotation({
        customerId, customerName: customer.name, agentId, type, nationality,
        adults, childrenWithBed, childrenWithoutBed, infants,
        arrivalDate: new Date(arrivalDate), departureDate: new Date(departureDate),
        nights, items, subtotal, grandTotal, perHeadCost, notes, status: 'draft'
      });
      
      await quotation.save();
      await quotation.populate('customerId agentId');
      return json(res, quotation, 201);
    }

    const quotationByIdMatch = matchRoute(url, '/api/quotations/:id');
    if (quotationByIdMatch.match) {
      const { id } = quotationByIdMatch.params;
      
      if (method === 'GET') {
        const quotation = await Quotation.findById(id).populate('customerId').populate('agentId');
        if (!quotation) return error(res, 'Quotation not found', 404);
        return json(res, quotation);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const quotation = await Quotation.findById(id);
        if (!quotation) return error(res, 'Quotation not found', 404);
        
        if (body.items) {
          const subtotal = body.items.reduce((sum: number, item: any) => sum + item.total, 0);
          const totalPax = (body.adults || quotation.adults) + (body.childrenWithBed || quotation.childrenWithBed) + (body.childrenWithoutBed || quotation.childrenWithoutBed);
          body.subtotal = subtotal;
          body.grandTotal = subtotal;
          body.perHeadCost = totalPax > 0 ? subtotal / totalPax : 0;
        }
        if (body.arrivalDate || body.departureDate) {
          const arrival = new Date(body.arrivalDate || quotation.arrivalDate);
          const departure = new Date(body.departureDate || quotation.departureDate);
          body.nights = differenceInDays(departure, arrival);
        }
        
        Object.assign(quotation, body);
        await quotation.save();
        await quotation.populate('customerId agentId');
        return json(res, quotation);
      }
      
      if (method === 'DELETE') {
        const quotation = await Quotation.findByIdAndDelete(id);
        if (!quotation) return error(res, 'Quotation not found', 404);
        return json(res, { message: 'Quotation deleted successfully' });
      }
    }

    const quotationStatusMatch = matchRoute(url, '/api/quotations/:id/status');
    if (quotationStatusMatch.match && method === 'PATCH') {
      const { id } = quotationStatusMatch.params;
      const body = await parseBody(req);
      const quotation = await Quotation.findByIdAndUpdate(id, { status: body.status }, { new: true })
        .populate('customerId agentId');
      if (!quotation) return error(res, 'Quotation not found', 404);
      return json(res, quotation);
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
      const body = await parseBody(req);
      const sightseeing = new Sightseeing(body);
      await sightseeing.save();
      return json(res, sightseeing, 201);
    }

    if (url === '/api/sightseeing/import' && method === 'POST') {
      const items = await parseBody(req);
      const imported = await Sightseeing.insertMany(items);
      return json(res, { count: imported.length, items: imported }, 201);
    }

    const sightseeingByIdMatch = matchRoute(url, '/api/sightseeing/:id');
    if (sightseeingByIdMatch.match) {
      const { id } = sightseeingByIdMatch.params;
      
      if (method === 'GET') {
        const item = await Sightseeing.findById(id);
        if (!item) return error(res, 'Sightseeing not found', 404);
        return json(res, item);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const item = await Sightseeing.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!item) return error(res, 'Sightseeing not found', 404);
        return json(res, item);
      }
      
      if (method === 'DELETE') {
        const item = await Sightseeing.findByIdAndDelete(id);
        if (!item) return error(res, 'Sightseeing not found', 404);
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
      const body = await parseBody(req);
      const meal = new Meal(body);
      await meal.save();
      return json(res, meal, 201);
    }

    const mealByIdMatch = matchRoute(url, '/api/meals/:id');
    if (mealByIdMatch.match) {
      const { id } = mealByIdMatch.params;
      
      if (method === 'GET') {
        const meal = await Meal.findById(id);
        if (!meal) return error(res, 'Meal not found', 404);
        return json(res, meal);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const meal = await Meal.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!meal) return error(res, 'Meal not found', 404);
        return json(res, meal);
      }
      
      if (method === 'DELETE') {
        const meal = await Meal.findByIdAndDelete(id);
        if (!meal) return error(res, 'Meal not found', 404);
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
      const body = await parseBody(req);
      const transfer = new Transfer(body);
      await transfer.save();
      return json(res, transfer, 201);
    }

    const transferByIdMatch = matchRoute(url, '/api/transfers/:id');
    if (transferByIdMatch.match) {
      const { id } = transferByIdMatch.params;
      
      if (method === 'GET') {
        const transfer = await Transfer.findById(id);
        if (!transfer) return error(res, 'Transfer not found', 404);
        return json(res, transfer);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const transfer = await Transfer.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!transfer) return error(res, 'Transfer not found', 404);
        return json(res, transfer);
      }
      
      if (method === 'DELETE') {
        const transfer = await Transfer.findByIdAndDelete(id);
        if (!transfer) return error(res, 'Transfer not found', 404);
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
      const body = await parseBody(req);
      const ticket = new EntryTicket(body);
      await ticket.save();
      return json(res, ticket, 201);
    }

    const ticketByIdMatch = matchRoute(url, '/api/entry-tickets/:id');
    if (ticketByIdMatch.match) {
      const { id } = ticketByIdMatch.params;
      
      if (method === 'GET') {
        const ticket = await EntryTicket.findById(id);
        if (!ticket) return error(res, 'Entry ticket not found', 404);
        return json(res, ticket);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const ticket = await EntryTicket.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!ticket) return error(res, 'Entry ticket not found', 404);
        return json(res, ticket);
      }
      
      if (method === 'DELETE') {
        const ticket = await EntryTicket.findByIdAndDelete(id);
        if (!ticket) return error(res, 'Entry ticket not found', 404);
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
      const body = await parseBody(req);
      const visa = new Visa(body);
      await visa.save();
      return json(res, visa, 201);
    }

    const visaByIdMatch = matchRoute(url, '/api/visa/:id');
    if (visaByIdMatch.match) {
      const { id } = visaByIdMatch.params;
      
      if (method === 'GET') {
        const visa = await Visa.findById(id);
        if (!visa) return error(res, 'Visa not found', 404);
        return json(res, visa);
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        const visa = await Visa.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!visa) return error(res, 'Visa not found', 404);
        return json(res, visa);
      }
      
      if (method === 'DELETE') {
        const visa = await Visa.findByIdAndDelete(id);
        if (!visa) return error(res, 'Visa not found', 404);
        return json(res, { message: 'Visa deleted successfully' });
      }
    }

    // ==================== DASHBOARD ====================
    if (url === '/api/dashboard/stats' && method === 'GET') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const totalBookings = await Quotation.countDocuments({ status: 'confirmed' });
      const lastMonthBookings = await Quotation.countDocuments({
        status: 'confirmed',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      });
      const bookingsGrowth = lastMonthBookings > 0 ? ((totalBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1) : 0;

      const revenueData = await Quotation.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]);
      const revenue = revenueData[0]?.total || 0;

      const activeCustomers = await Customer.countDocuments({ status: 'active' });
      const newCustomersThisMonth = await Customer.countDocuments({ status: 'active', createdAt: { $gte: startOfMonth } });
      const quotationsSent = await Quotation.countDocuments({ status: 'sent' });
      const totalQuotations = await Quotation.countDocuments();
      const hotelsManaged = await Hotel.countDocuments({ status: 'active' });
      const tourPackages = await Sightseeing.countDocuments({ status: 'active' });

      return json(res, {
        totalBookings: { value: totalBookings, growth: typeof bookingsGrowth === 'string' ? parseFloat(bookingsGrowth) : bookingsGrowth },
        revenue: { value: revenue, currency: 'AED' },
        activeCustomers: { value: activeCustomers, newThisMonth: newCustomersThisMonth },
        quotationsSent: { value: totalQuotations, pending: quotationsSent },
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

    if (url === '/api/dashboard/upcoming-bookings' && method === 'GET') {
      const today = new Date();
      const quotations = await Quotation.find({ status: 'confirmed', arrivalDate: { $gte: today } })
        .populate('customerId', 'name')
        .sort({ arrivalDate: 1 })
        .limit(10);
      return json(res, quotations);
    }

    // 404 - Route not found
    return error(res, `Route not found: ${method} ${url}`, 404);

  } catch (err: any) {
    console.error('API Error:', err);
    
    // Provide more helpful error messages
    let errorMessage = err.message || 'Internal server error';
    
    // Check for common issues
    if (errorMessage.includes('MONGODB_URI')) {
      errorMessage = 'Database not configured. Please set MONGODB_URI in Vercel Environment Variables.';
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      errorMessage = 'Cannot connect to database. Check your MongoDB Atlas connection string.';
    } else if (errorMessage.includes('authentication failed')) {
      errorMessage = 'Database authentication failed. Check your MongoDB username and password.';
    }
    
    return error(res, errorMessage, 500);
  }
}

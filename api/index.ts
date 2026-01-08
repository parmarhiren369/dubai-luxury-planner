import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== HOTELS ====================
app.get('/api/hotels', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    const hotels = await Hotel.find(query).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/hotels/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/hotels', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/hotels/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/hotels/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/hotels/import', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const hotels = req.body;
    if (!Array.isArray(hotels) || hotels.length === 0) {
      return res.status(400).json({ message: 'Invalid data: Expected an array of hotels' });
    }
    const validHotels = hotels.filter((hotel: any) => hotel.name && typeof hotel.name === 'string' && hotel.name.trim() !== '');
    if (validHotels.length === 0) {
      return res.status(400).json({ message: 'No valid hotels found' });
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
    res.status(201).json({ count: imported.length, hotels: imported });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Hotel rate management
app.get('/api/hotels/:hotelId/rate', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { hotelId, roomType, mealPlan, date } = req.query;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    
    const targetDate = startOfDay(new Date(date as string));
    const period = hotel.ratePeriods.find((r: any) =>
      r.roomType === roomType && r.mealPlan === mealPlan &&
      targetDate >= startOfDay(r.startDate) && targetDate <= endOfDay(r.endDate)
    );
    
    if (period) return res.json({ rate: period.rate });
    
    const roomTypeMap: Record<string, string> = {
      'SGL': 'singleRoom', 'DBL': 'doubleRoom', 'TPL': 'tripleRoom',
      'QUAD': 'quadRoom', 'SIX': 'sixRoom', 'EX_BED_11': 'extraBed',
      'CWB_3_11': 'childWithBed', 'CNB_3_5': 'childWithoutBed3to5', 'CNB_5_11': 'childWithoutBed5to11'
    };
    const rateKey = roomTypeMap[roomType as string];
    const rate = rateKey ? (hotel as any)[rateKey] : null;
    res.json({ rate: rate || null });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/hotels/:hotelId/rate', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { hotelId } = req.params;
    const { roomType, mealPlan, startDate, endDate, rate } = req.body;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    
    hotel.ratePeriods = hotel.ratePeriods.filter((p: any) =>
      !(p.roomType === roomType && p.mealPlan === mealPlan &&
        p.startDate <= new Date(endDate) && p.endDate >= new Date(startDate))
    );
    hotel.ratePeriods.push({ roomType, mealPlan, startDate: new Date(startDate), endDate: new Date(endDate), rate });
    await hotel.save();
    res.json(hotel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/hotels/:hotelId/rates/period', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { hotelId } = req.params;
    const { startDate, endDate, mealPlan } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate required' });
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    
    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));
    const days = eachDayOfInterval({ start, end });
    const roomTypes = ['SGL', 'DBL', 'TPL', 'QUAD', 'SIX', 'EX_BED_11', 'CWB_3_11', 'CNB_3_5', 'CNB_5_11'];
    const rates: Record<string, Record<string, number>> = {};
    
    for (const day of days) {
      const dateKey = day.toISOString().split('T')[0];
      rates[dateKey] = {};
      for (const roomType of roomTypes) {
        const period = hotel.ratePeriods.find((r: any) =>
          r.roomType === roomType && r.mealPlan === mealPlan &&
          startOfDay(day) >= startOfDay(r.startDate) && startOfDay(day) <= endOfDay(r.endDate)
        );
        if (period) {
          rates[dateKey][roomType] = period.rate;
        } else {
          const roomTypeMap: Record<string, string> = {
            'SGL': 'singleRoom', 'DBL': 'doubleRoom', 'TPL': 'tripleRoom',
            'QUAD': 'quadRoom', 'SIX': 'sixRoom', 'EX_BED_11': 'extraBed',
            'CWB_3_11': 'childWithBed', 'CNB_3_5': 'childWithoutBed3to5', 'CNB_5_11': 'childWithoutBed5to11'
          };
          rates[dateKey][roomType] = (hotel as any)[roomTypeMap[roomType]] || 0;
        }
      }
    }
    res.json({ rates });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/hotels/:hotelId/rates/bulk', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { hotelId } = req.params;
    const { rates, mealPlan } = req.body;
    if (!rates || !Array.isArray(rates)) return res.status(400).json({ message: 'rates array required' });
    if (!mealPlan) return res.status(400).json({ message: 'mealPlan required' });
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    
    const ratesByRoomType: Record<string, Array<{ date: Date; rate: number }>> = {};
    for (const entry of rates) {
      const { date, roomType, rate } = entry;
      if (!ratesByRoomType[roomType]) ratesByRoomType[roomType] = [];
      ratesByRoomType[roomType].push({ date: startOfDay(new Date(date)), rate: parseFloat(rate) || 0 });
    }
    
    for (const [roomType, dateRates] of Object.entries(ratesByRoomType)) {
      hotel.ratePeriods = hotel.ratePeriods.filter((p: any) => {
        if (p.roomType !== roomType || p.mealPlan !== mealPlan) return true;
        for (const { date } of dateRates) {
          if (date >= startOfDay(p.startDate) && date <= endOfDay(p.endDate)) return false;
        }
        return true;
      });
      for (const { date, rate } of dateRates) {
        hotel.ratePeriods.push({ roomType, mealPlan, startDate: date, endDate: date, rate });
      }
    }
    await hotel.save();
    res.json({ message: 'Rates updated', hotel });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/hotels/:hotelId/rates/copy', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { hotelId } = req.params;
    const { sourceDate, roomType, mealPlan, startDate, endDate } = req.body;
    if (!sourceDate || !roomType || !mealPlan || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields required' });
    }
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    
    const source = startOfDay(new Date(sourceDate));
    const sourcePeriod = hotel.ratePeriods.find((r: any) =>
      r.roomType === roomType && r.mealPlan === mealPlan &&
      source >= startOfDay(r.startDate) && source <= endOfDay(r.endDate)
    );
    if (!sourcePeriod) return res.status(404).json({ message: 'Source rate not found' });
    
    const sourceRate = sourcePeriod.rate;
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    const days = eachDayOfInterval({ start, end });
    
    hotel.ratePeriods = hotel.ratePeriods.filter((p: any) =>
      !(p.roomType === roomType && p.mealPlan === mealPlan &&
        startOfDay(p.startDate) >= start && endOfDay(p.endDate) <= end)
    );
    
    for (const day of days) {
      hotel.ratePeriods.push({ roomType, mealPlan, startDate: day, endDate: day, rate: sourceRate });
    }
    await hotel.save();
    res.json({ message: 'Rate copied', hotel });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customers/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/customers', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/customers/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/customers/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== AGENTS ====================
app.get('/api/agents', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    const agents = await Agent.find(query).sort({ createdAt: -1 });
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/agents/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/agents', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/agents/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/agents/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ message: 'Agent deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== QUOTATIONS ====================
app.get('/api/quotations', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { quotationId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    const quotations = await Quotation.find(query)
      .populate('customerId', 'name email phone')
      .populate('agentId', 'name company')
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/quotations/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const quotation = await Quotation.findById(req.params.id)
      .populate('customerId').populate('agentId');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/quotations', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { customerId, agentId, type, nationality, adults, childrenWithBed, childrenWithoutBed, infants, arrivalDate, departureDate, items, notes } = req.body;
    
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
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
    res.status(201).json(quotation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/quotations/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    
    const updates = req.body;
    if (updates.items) {
      const subtotal = updates.items.reduce((sum: number, item: any) => sum + item.total, 0);
      const totalPax = (updates.adults || quotation.adults) + (updates.childrenWithBed || quotation.childrenWithBed) + (updates.childrenWithoutBed || quotation.childrenWithoutBed);
      updates.subtotal = subtotal;
      updates.grandTotal = subtotal;
      updates.perHeadCost = totalPax > 0 ? subtotal / totalPax : 0;
    }
    if (updates.arrivalDate || updates.departureDate) {
      const arrival = new Date(updates.arrivalDate || quotation.arrivalDate);
      const departure = new Date(updates.departureDate || quotation.departureDate);
      updates.nights = differenceInDays(departure, arrival);
    }
    
    Object.assign(quotation, updates);
    await quotation.save();
    await quotation.populate('customerId agentId');
    res.json(quotation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/quotations/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/quotations/:id/status', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { status } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('customerId agentId');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ==================== SIGHTSEEING ====================
app.get('/api/sightseeing', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, category, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const sightseeing = await Sightseeing.find(query).sort({ createdAt: -1 });
    res.json(sightseeing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/sightseeing/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const item = await Sightseeing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Sightseeing not found' });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sightseeing', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const sightseeing = new Sightseeing(req.body);
    await sightseeing.save();
    res.status(201).json(sightseeing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/sightseeing/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const sightseeing = await Sightseeing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sightseeing) return res.status(404).json({ message: 'Sightseeing not found' });
    res.json(sightseeing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/sightseeing/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const sightseeing = await Sightseeing.findByIdAndDelete(req.params.id);
    if (!sightseeing) return res.status(404).json({ message: 'Sightseeing not found' });
    res.json({ message: 'Sightseeing deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sightseeing/import', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const items = req.body;
    const imported = await Sightseeing.insertMany(items);
    res.status(201).json({ count: imported.length, items: imported });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ==================== MEALS ====================
app.get('/api/meals', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { restaurant: { $regex: search, $options: 'i' } }
      ];
    }
    const meals = await Meal.find(query).sort({ createdAt: -1 });
    res.json(meals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/meals/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/meals', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const meal = new Meal(req.body);
    await meal.save();
    res.status(201).json(meal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/meals/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/meals/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TRANSFERS ====================
app.get('/api/transfers', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { vehicleType: { $regex: search, $options: 'i' } }
      ];
    }
    const transfers = await Transfer.find(query).sort({ createdAt: -1 });
    res.json(transfers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/transfers/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
    res.json(transfer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/transfers', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const transfer = new Transfer(req.body);
    await transfer.save();
    res.status(201).json(transfer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/transfers/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const transfer = await Transfer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
    res.json(transfer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/transfers/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const transfer = await Transfer.findByIdAndDelete(req.params.id);
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
    res.json({ message: 'Transfer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ENTRY TICKETS ====================
app.get('/api/entry-tickets', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    const tickets = await EntryTicket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/entry-tickets/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const ticket = await EntryTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Entry ticket not found' });
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/entry-tickets', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const ticket = new EntryTicket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/entry-tickets/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const ticket = await EntryTicket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ message: 'Entry ticket not found' });
    res.json(ticket);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/entry-tickets/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const ticket = await EntryTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Entry ticket not found' });
    res.json({ message: 'Entry ticket deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== VISA ====================
app.get('/api/visa', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { search, status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { country: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }
    const visas = await Visa.find(query).sort({ createdAt: -1 });
    res.json(visas);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/visa/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const visa = await Visa.findById(req.params.id);
    if (!visa) return res.status(404).json({ message: 'Visa not found' });
    res.json(visa);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/visa', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const visa = new Visa(req.body);
    await visa.save();
    res.status(201).json(visa);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/visa/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const visa = await Visa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!visa) return res.status(404).json({ message: 'Visa not found' });
    res.json(visa);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/visa/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const visa = await Visa.findByIdAndDelete(req.params.id);
    if (!visa) return res.status(404).json({ message: 'Visa not found' });
    res.json({ message: 'Visa deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
  try {
    await connectDB();
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

    res.json({
      totalBookings: { value: totalBookings, growth: typeof bookingsGrowth === 'string' ? parseFloat(bookingsGrowth) : bookingsGrowth },
      revenue: { value: revenue, currency: 'AED' },
      activeCustomers: { value: activeCustomers, newThisMonth: newCustomersThisMonth },
      quotationsSent: { value: totalQuotations, pending: quotationsSent },
      hotelsManaged: { value: hotelsManaged },
      tourPackages: { value: tourPackages }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/dashboard/recent-quotations', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const quotations = await Quotation.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/dashboard/upcoming-bookings', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const today = new Date();
    const quotations = await Quotation.find({ status: 'confirmed', arrivalDate: { $gte: today } })
      .populate('customerId', 'name')
      .sort({ arrivalDate: 1 })
      .limit(10);
    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Export for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}

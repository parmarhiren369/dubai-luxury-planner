import { Request, Response } from 'express';
import Hotel from '../models/Hotel';
import { startOfDay, endOfDay } from 'date-fns';

export const getHotels = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

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
};

export const getHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createHotel = async (req: Request, res: Response) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRateForDate = async (req: Request, res: Response) => {
  try {
    const { hotelId, roomType, mealPlan, date } = req.query;
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const targetDate = startOfDay(new Date(date as string));

    // Check rate periods
    const period = hotel.ratePeriods.find(r =>
      r.roomType === roomType &&
      r.mealPlan === mealPlan &&
      targetDate >= startOfDay(r.startDate) &&
      targetDate <= endOfDay(r.endDate)
    );

    if (period) {
      return res.json({ rate: period.rate });
    }

    // Fallback to base rate
    const roomTypeMap: Record<string, keyof typeof hotel> = {
      'SGL': 'singleRoom',
      'DBL': 'doubleRoom',
      'TPL': 'tripleRoom',
      'QUAD': 'quadRoom',
      'SIX': 'sixRoom',
      'EX_BED_11': 'extraBed',
      'CWB_3_11': 'childWithBed',
      'CNB_3_5': 'childWithoutBed3to5',
      'CNB_5_11': 'childWithoutBed5to11'
    };

    const rateKey = roomTypeMap[roomType as string];
    const rate = rateKey ? hotel[rateKey as keyof typeof hotel] : null;

    res.json({ rate: rate || null });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const setRateForDate = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { roomType, mealPlan, startDate, endDate, rate } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Remove overlapping periods
    hotel.ratePeriods = hotel.ratePeriods.filter(p =>
      !(p.roomType === roomType && p.mealPlan === mealPlan &&
        p.startDate <= new Date(endDate) && p.endDate >= new Date(startDate))
    );

    // Add new period
    hotel.ratePeriods.push({
      roomType,
      mealPlan,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rate
    });

    await hotel.save();
    res.json(hotel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const importHotels = async (req: Request, res: Response) => {
  try {
    const hotels = req.body;
    
    if (!Array.isArray(hotels) || hotels.length === 0) {
      return res.status(400).json({ message: 'Invalid data: Expected an array of hotels' });
    }

    // Validate each hotel before importing
    const validHotels = hotels.filter((hotel: any) => {
      if (!hotel.name || typeof hotel.name !== 'string' || hotel.name.trim() === '') {
        return false;
      }
      return true;
    });

    if (validHotels.length === 0) {
      return res.status(400).json({ message: 'No valid hotels found. Each hotel must have a name.' });
    }

    // Ensure all required fields have defaults
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
    res.status(201).json({ 
      count: imported.length, 
      hotels: imported,
      message: `Successfully imported ${imported.length} hotel(s)`
    });
  } catch (error: any) {
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Some hotels already exist. Please check for duplicates.',
        error: error.message 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error: ' + Object.values(error.errors).map((e: any) => e.message).join(', '),
        error: error.message 
      });
    }
    
    res.status(400).json({ message: error.message || 'Failed to import hotels' });
  }
};

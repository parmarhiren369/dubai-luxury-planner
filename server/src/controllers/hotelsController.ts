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
    const imported = await Hotel.insertMany(hotels);
    res.status(201).json({ count: imported.length, hotels: imported });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

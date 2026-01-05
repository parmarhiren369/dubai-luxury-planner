import { Request, Response } from 'express';
import Sightseeing from '../models/Sightseeing';

export const getSightseeing = async (req: Request, res: Response) => {
  try {
    const { search, category, status } = req.query;
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
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
};

export const getSightseeingItem = async (req: Request, res: Response) => {
  try {
    const item = await Sightseeing.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Sightseeing item not found' });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSightseeing = async (req: Request, res: Response) => {
  try {
    const sightseeing = new Sightseeing(req.body);
    await sightseeing.save();
    res.status(201).json(sightseeing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSightseeing = async (req: Request, res: Response) => {
  try {
    const sightseeing = await Sightseeing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sightseeing) {
      return res.status(404).json({ message: 'Sightseeing item not found' });
    }
    res.json(sightseeing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSightseeing = async (req: Request, res: Response) => {
  try {
    const sightseeing = await Sightseeing.findByIdAndDelete(req.params.id);
    if (!sightseeing) {
      return res.status(404).json({ message: 'Sightseeing item not found' });
    }
    res.json({ message: 'Sightseeing item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const importSightseeing = async (req: Request, res: Response) => {
  try {
    const items = req.body;
    const imported = await Sightseeing.insertMany(items);
    res.status(201).json({ count: imported.length, items: imported });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

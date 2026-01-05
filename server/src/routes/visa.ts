import express from 'express';
import { Request, Response } from 'express';
import Visa from '../models/Visa';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, country, type, status } = req.query;
    const query: any = {};
    
    if (status && status !== 'all') query.status = status;
    if (country) query.country = country;
    if (type) query.type = type;
    
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

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const visa = await Visa.findById(req.params.id);
    if (!visa) return res.status(404).json({ message: 'Visa not found' });
    res.json(visa);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const visa = new Visa(req.body);
    await visa.save();
    res.status(201).json(visa);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const visa = await Visa.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!visa) return res.status(404).json({ message: 'Visa not found' });
    res.json(visa);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const visa = await Visa.findByIdAndDelete(req.params.id);
    if (!visa) return res.status(404).json({ message: 'Visa not found' });
    res.json({ message: 'Visa deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

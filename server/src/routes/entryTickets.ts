import express from 'express';
import { Request, Response } from 'express';
import EntryTicket from '../models/EntryTicket';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, status } = req.query;
    const query: any = {};
    
    if (status && status !== 'all') query.status = status;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tickets = await EntryTicket.find(query).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await EntryTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Entry ticket not found' });
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const ticket = new EntryTicket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await EntryTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Entry ticket not found' });
    res.json(ticket);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await EntryTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Entry ticket not found' });
    res.json({ message: 'Entry ticket deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

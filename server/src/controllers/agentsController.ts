import { Request, Response } from 'express';
import Agent from '../models/Agent';

export const getAgents = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
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
};

export const getAgent = async (req: Request, res: Response) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgent = async (req: Request, res: Response) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

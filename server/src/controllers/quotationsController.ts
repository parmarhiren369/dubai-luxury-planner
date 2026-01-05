import { Request, Response } from 'express';
import Quotation from '../models/Quotation';
import Customer from '../models/Customer';
import { differenceInDays } from 'date-fns';

export const getQuotations = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
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
};

export const getQuotation = async (req: Request, res: Response) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customerId')
      .populate('agentId');
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      agentId,
      type,
      nationality,
      adults,
      childrenWithBed,
      childrenWithoutBed,
      infants,
      arrivalDate,
      departureDate,
      items,
      notes
    } = req.body;
    
    // Get customer name
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const nights = differenceInDays(new Date(departureDate), new Date(arrivalDate));
    const totalPax = adults + childrenWithBed + childrenWithoutBed;
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    const grandTotal = subtotal;
    const perHeadCost = totalPax > 0 ? grandTotal / totalPax : 0;
    
    const quotation = new Quotation({
      customerId,
      customerName: customer.name,
      agentId,
      type,
      nationality,
      adults,
      childrenWithBed,
      childrenWithoutBed,
      infants,
      arrivalDate: new Date(arrivalDate),
      departureDate: new Date(departureDate),
      nights,
      items,
      subtotal,
      grandTotal,
      perHeadCost,
      notes,
      status: 'draft'
    });
    
    await quotation.save();
    await quotation.populate('customerId agentId');
    res.status(201).json(quotation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateQuotation = async (req: Request, res: Response) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    const updates = req.body;
    
    // Recalculate if items changed
    if (updates.items) {
      const subtotal = updates.items.reduce((sum: number, item: any) => sum + item.total, 0);
      const totalPax = (updates.adults || quotation.adults) + 
                       (updates.childrenWithBed || quotation.childrenWithBed) + 
                       (updates.childrenWithoutBed || quotation.childrenWithoutBed);
      updates.subtotal = subtotal;
      updates.grandTotal = subtotal;
      updates.perHeadCost = totalPax > 0 ? subtotal / totalPax : 0;
    }
    
    // Recalculate nights if dates changed
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
};

export const deleteQuotation = async (req: Request, res: Response) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuotationStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customerId agentId');
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

import express from 'express';
import { Request, Response } from 'express';
import Quotation from '../models/Quotation';
import Customer from '../models/Customer';
import Hotel from '../models/Hotel';
import Sightseeing from '../models/Sightseeing';

const router = express.Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total bookings (confirmed quotations)
    const totalBookings = await Quotation.countDocuments({ status: 'confirmed' });
    const lastMonthBookings = await Quotation.countDocuments({
      status: 'confirmed',
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    const bookingsGrowth = lastMonthBookings > 0
      ? ((totalBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
      : 0;

    // Revenue this month
    const revenueData = await Quotation.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' }
        }
      }
    ]);
    const revenue = revenueData[0]?.total || 0;

    // Active customers
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const newCustomersThisMonth = await Customer.countDocuments({
      status: 'active',
      createdAt: { $gte: startOfMonth }
    });

    // Quotations sent
    const quotationsSent = await Quotation.countDocuments({ status: 'sent' });
    const totalQuotations = await Quotation.countDocuments();

    // Hotels managed
    const hotelsManaged = await Hotel.countDocuments({ status: 'active' });

    // Tour packages (sightseeing)
    const tourPackages = await Sightseeing.countDocuments({ status: 'active' });

    res.json({
      totalBookings: {
        value: totalBookings,
        growth: typeof bookingsGrowth === 'string' ? parseFloat(bookingsGrowth) : bookingsGrowth
      },
      revenue: {
        value: revenue,
        currency: 'AED'
      },
      activeCustomers: {
        value: activeCustomers,
        newThisMonth: newCustomersThisMonth
      },
      quotationsSent: {
        value: totalQuotations,
        pending: quotationsSent
      },
      hotelsManaged: {
        value: hotelsManaged
      },
      tourPackages: {
        value: tourPackages
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/recent-quotations', async (req: Request, res: Response) => {
  try {
    const quotations = await Quotation.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/upcoming-bookings', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const quotations = await Quotation.find({
      status: 'confirmed',
      arrivalDate: { $gte: today }
    })
      .populate('customerId', 'name')
      .sort({ arrivalDate: 1 })
      .limit(10);
    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

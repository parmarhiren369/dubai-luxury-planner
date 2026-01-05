import { Request, Response } from 'express';
import Hotel from '../models/Hotel';
import { startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

/**
 * Get all rates for a hotel within a date range
 * Query params: startDate, endDate, mealPlan
 */
export const getRatesForPeriod = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { startDate, endDate, mealPlan } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const start = startOfDay(new Date(startDate as string));
        const end = endOfDay(new Date(endDate as string));
        const days = eachDayOfInterval({ start, end });

        // Room types to fetch
        const roomTypes = ['SGL', 'DBL', 'TPL', 'QUAD', 'SIX', 'EX_BED_11', 'CWB_3_11', 'CNB_3_5', 'CNB_5_11'];

        // Build response with rates for each day and room type
        const rates: Record<string, Record<string, number>> = {};

        for (const day of days) {
            const dateKey = day.toISOString().split('T')[0];
            rates[dateKey] = {};

            for (const roomType of roomTypes) {
                // Find matching rate period
                const period = hotel.ratePeriods.find(r =>
                    r.roomType === roomType &&
                    r.mealPlan === mealPlan &&
                    startOfDay(day) >= startOfDay(r.startDate) &&
                    startOfDay(day) <= endOfDay(r.endDate)
                );

                if (period) {
                    rates[dateKey][roomType] = period.rate;
                } else {
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

                    const rateKey = roomTypeMap[roomType];
                    rates[dateKey][roomType] = rateKey ? (hotel[rateKey] as number) : 0;
                }
            }
        }

        res.json({ rates });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Bulk set rates for multiple dates and room types
 * Body: { rates: Array<{ date, roomType, rate }>, mealPlan }
 */
export const bulkSetRates = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { rates, mealPlan } = req.body;

        if (!rates || !Array.isArray(rates)) {
            return res.status(400).json({ message: 'rates array is required' });
        }

        if (!mealPlan) {
            return res.status(400).json({ message: 'mealPlan is required' });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Group rates by roomType and date for efficient processing
        const ratesByRoomType: Record<string, Array<{ date: Date; rate: number }>> = {};

        for (const rateEntry of rates) {
            const { date, roomType, rate } = rateEntry;

            if (!ratesByRoomType[roomType]) {
                ratesByRoomType[roomType] = [];
            }

            ratesByRoomType[roomType].push({
                date: startOfDay(new Date(date)),
                rate: parseFloat(rate) || 0
            });
        }

        // Process each room type
        for (const [roomType, dateRates] of Object.entries(ratesByRoomType)) {
            // Remove existing overlapping periods for this room type and meal plan
            hotel.ratePeriods = hotel.ratePeriods.filter(p => {
                if (p.roomType !== roomType || p.mealPlan !== mealPlan) {
                    return true;
                }

                // Check if this period overlaps with any of our new dates
                const periodStart = startOfDay(p.startDate);
                const periodEnd = endOfDay(p.endDate);

                for (const { date } of dateRates) {
                    if (date >= periodStart && date <= periodEnd) {
                        return false; // Remove this period
                    }
                }

                return true; // Keep this period
            });

            // Add new rate periods (one per date for simplicity)
            for (const { date, rate } of dateRates) {
                hotel.ratePeriods.push({
                    roomType,
                    mealPlan,
                    startDate: date,
                    endDate: date,
                    rate
                });
            }
        }

        await hotel.save();
        res.json({ message: 'Rates updated successfully', hotel });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Copy rate from one date to all dates in a range
 * Body: { sourceDate, roomType, mealPlan, startDate, endDate }
 */
export const copyRateToAll = async (req: Request, res: Response) => {
    try {
        const { hotelId } = req.params;
        const { sourceDate, roomType, mealPlan, startDate, endDate } = req.body;

        if (!sourceDate || !roomType || !mealPlan || !startDate || !endDate) {
            return res.status(400).json({
                message: 'sourceDate, roomType, mealPlan, startDate, and endDate are required'
            });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Find the source rate
        const source = startOfDay(new Date(sourceDate));
        const sourcePeriod = hotel.ratePeriods.find(r =>
            r.roomType === roomType &&
            r.mealPlan === mealPlan &&
            source >= startOfDay(r.startDate) &&
            source <= endOfDay(r.endDate)
        );

        if (!sourcePeriod) {
            return res.status(404).json({ message: 'Source rate not found' });
        }

        const sourceRate = sourcePeriod.rate;
        const start = startOfDay(new Date(startDate));
        const end = endOfDay(new Date(endDate));
        const days = eachDayOfInterval({ start, end });

        // Remove existing periods for this room type and meal plan in the range
        hotel.ratePeriods = hotel.ratePeriods.filter(p =>
            !(p.roomType === roomType &&
                p.mealPlan === mealPlan &&
                startOfDay(p.startDate) >= start &&
                endOfDay(p.endDate) <= end)
        );

        // Add new periods for each day
        for (const day of days) {
            hotel.ratePeriods.push({
                roomType,
                mealPlan,
                startDate: day,
                endDate: day,
                rate: sourceRate
            });
        }

        await hotel.save();
        res.json({ message: 'Rate copied to all dates successfully', hotel });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

import express from 'express';
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getRateForDate,
  setRateForDate,
  importHotels
} from '../controllers/hotelsController';
import {
  getRatesForPeriod,
  bulkSetRates,
  copyRateToAll
} from '../controllers/rateManagementController';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotel);
router.post('/', createHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);
router.get('/:hotelId/rate', getRateForDate);
router.post('/:hotelId/rate', setRateForDate);
router.get('/:hotelId/rates/period', getRatesForPeriod);
router.post('/:hotelId/rates/bulk', bulkSetRates);
router.post('/:hotelId/rates/copy', copyRateToAll);
router.post('/import', importHotels);

export default router;

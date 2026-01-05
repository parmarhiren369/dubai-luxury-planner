import express from 'express';
import {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus
} from '../controllers/quotationsController';

const router = express.Router();

router.get('/', getQuotations);
router.get('/:id', getQuotation);
router.post('/', createQuotation);
router.put('/:id', updateQuotation);
router.patch('/:id/status', updateQuotationStatus);
router.delete('/:id', deleteQuotation);

export default router;

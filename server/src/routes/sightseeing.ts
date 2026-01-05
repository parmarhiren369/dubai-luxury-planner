import express from 'express';
import {
  getSightseeing,
  getSightseeingItem,
  createSightseeing,
  updateSightseeing,
  deleteSightseeing,
  importSightseeing
} from '../controllers/sightseeingController';

const router = express.Router();

router.get('/', getSightseeing);
router.get('/:id', getSightseeingItem);
router.post('/', createSightseeing);
router.post('/import', importSightseeing);
router.put('/:id', updateSightseeing);
router.delete('/:id', deleteSightseeing);

export default router;

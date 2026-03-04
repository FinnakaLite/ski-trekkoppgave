import { Router } from 'express';
import { getLifts, getRoutes, updateRoute } from '../controllers/ridesController.ts';

const router = Router();

router.get('/lifts', getLifts);
router.get('/routes', getRoutes);
router.put('/routes/:turID', updateRoute);

export default router;

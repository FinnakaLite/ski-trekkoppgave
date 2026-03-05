import { Router } from 'express';
import { getLifts, getRoutes, updateRoute } from '../controllers/ridesController.ts';
import { verifyCardSerial } from '../controllers/miscApi.ts';

const router = Router();

router.get('/lifts', getLifts);
router.get('/routes', getRoutes);
router.put('/routes/:turID', updateRoute);

router.get('/verifyCardSerial', verifyCardSerial)

export default router;

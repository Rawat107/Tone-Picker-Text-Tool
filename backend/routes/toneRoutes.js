import { Router } from 'express';
import toneController from '../controllers/toneController';

const router = Router();

//POST api/tone/adjust --Adjust text tone based on coordinates or preset

router.post("/adjust", toneController.adjustTone);

//GET /api/tone/health -- Health check endpoint
router.get("/health", toneController.healthCheck)

export default router;
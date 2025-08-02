// routes/chartRoutes.js
import express from 'express';
import { ageChart, chartLogic, courseChartLogic } from '../controllers/chartController.js';


const router = express.Router();

router.get('/chart-data', chartLogic);
router.get('/courseChart', courseChartLogic);
router.get('/ageChart', ageChart);

export default router;

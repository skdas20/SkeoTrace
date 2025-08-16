import express from 'express';
import authRoutes from './auth.routes';
import producerRoutes from './producer.routes';
import retailerRoutes from './retailer.routes';
import adminRoutes from './admin.routes';
import publicRoutes from './public.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/producer', producerRoutes);
router.use('/retailer', retailerRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);

// Health check
router.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Organic Food Traceability API'
  });
});

export default router;

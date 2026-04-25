import express from 'express';
import {
  placeOrder, getMyOrders, getOrderById,
  cancelOrder, getAllOrders, updateOrderStatus, getAdminStats,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order routes are protected

router.post('/place', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/admin/stats', admin, getAdminStats);
router.get('/admin/all', admin, getAllOrders);
router.put('/admin/:id/status', admin, updateOrderStatus);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

export default router;

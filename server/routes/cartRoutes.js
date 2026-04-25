import express from 'express';
import {
  getCart, addToCart, updateCartItem,
  removeFromCart, applyCoupon, clearCart,
  getAvailableCoupons,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart routes are protected

router.get('/', getCart);
router.get('/coupons', getAvailableCoupons);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.post('/coupon', applyCoupon);
router.delete('/clear', clearCart);

export default router;

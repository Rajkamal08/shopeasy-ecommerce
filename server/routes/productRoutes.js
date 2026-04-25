import express from 'express';
import {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, addReview,
  getFeaturedProducts, getSuggestions,
  getBrands, getTopRated, getNewArrivals, compareProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/suggestions', getSuggestions);
router.get('/brands', getBrands);
router.get('/top-rated', getTopRated);
router.get('/new-arrivals', getNewArrivals);
router.get('/compare', compareProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/review', protect, addReview);

export default router;

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// @desc    Get user's cart
// @route   GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'title images price stock category');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'title images price stock category');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/update
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'title images price stock category');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();
    await cart.populate('items.product', 'title images price stock category');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply coupon code (smart validation)
// @route   POST /api/cart/coupon
export const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode) {
      return res.status(400).json({ message: 'Please enter a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check new users only
    if (coupon.newUsersOnly) {
      const orderCount = await Order.countDocuments({ user: req.user._id });
      if (orderCount > 0) {
        return res.status(400).json({ message: 'This coupon is for new users only' });
      }
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'title images price stock category');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || item.price) * item.quantity;
    }, 0);

    // Check min order amount
    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minOrderAmount.toLocaleString('en-IN')}`
      });
    }

    // Check applicable category
    if (coupon.applicableCategory) {
      const hasCategory = cart.items.some(
        item => item.product?.category === coupon.applicableCategory
      );
      if (!hasCategory) {
        return res.status(400).json({
          message: `This coupon only applies to ${coupon.applicableCategory} products`
        });
      }
    }

    // Calculate discount
    let discountAmount;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round(subtotal * coupon.value / 100);
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.value;
    }

    // Calculate effective discount percentage for cart storage
    const discountPercent = Math.round((discountAmount / subtotal) * 100);

    cart.couponCode = coupon.code;
    cart.discount = discountPercent;

    // Increment usage
    coupon.usedCount += 1;
    await coupon.save();

    await cart.save();
    res.json({
      ...cart.toObject(),
      discountAmount,
      message: `🎉 ${coupon.code} applied! You saved ₹${discountAmount.toLocaleString('en-IN')}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available coupons (public list)
// @route   GET /api/cart/coupons
export const getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    }).select('code type value minOrderAmount maxDiscount applicableCategory newUsersOnly expiresAt');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.couponCode = '';
      cart.discount = 0;
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

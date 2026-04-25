import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Place order
// @route   POST /api/orders/place
export const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Build order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      title: item.product.title,
      image: item.product.images?.[0] || '',
      quantity: item.quantity,
      price: item.price,
    }));

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
    const deliveryCharge = subtotal >= 500 ? 0 : 40;
    let totalAmount = subtotal + deliveryCharge;

    if (cart.discount > 0) {
      totalAmount = totalAmount - (subtotal * cart.discount / 100);
    }

    // Estimated delivery: 5-7 days
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 3) + 5);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      totalAmount,
      deliveryCharge,
      estimatedDelivery,
      timeline: [{ status: 'Placed', time: new Date() }],
    });

    // Update stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    cart.couponCode = '';
    cart.discount = 0;
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['Shipped', 'OutForDelivery', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order after shipping' });
    }

    order.status = 'Cancelled';
    order.timeline.push({ status: 'Cancelled', time: new Date() });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({ orders, totalRevenue, totalOrders: orders.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/admin/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.timeline.push({ status, time: new Date() });

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin stats (enhanced analytics)
// @route   GET /api/orders/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProducts = await Product.countDocuments();

    // Revenue last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = await Order.find({
        createdAt: { $gte: date, $lt: nextDate },
        status: { $ne: 'Cancelled' },
      });

      last7Days.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        orders: dayOrders.length,
      });
    }

    // Order status distribution
    const allOrders = await Order.find();
    const statusCounts = {};
    allOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Category-wise revenue
    const categoryRevenue = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const cat = item.title?.includes('Shirt') || item.title?.includes('Pant') || item.title?.includes('Shoes')
          ? 'Fashion'
          : item.title?.includes('iPhone') || item.title?.includes('MacBook') || item.title?.includes('Headphones') || item.title?.includes('Earbuds')
          ? 'Electronics'
          : item.title?.includes('Table') || item.title?.includes('Mixer')
          ? 'Home & Kitchen'
          : item.title?.includes('Racquet') || item.title?.includes('Football')
          ? 'Sports'
          : 'Books';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.price * item.quantity);
      });
    });

    // Top 5 selling products
    const productSales = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!productSales[item.title]) {
          productSales[item.title] = { title: item.title, image: item.image, qty: 0, revenue: 0 };
        }
        productSales[item.title].qty += item.quantity;
        productSales[item.title].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('user totalAmount status createdAt items');

    // Average order value
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    res.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      avgOrderValue,
      revenueChart: last7Days,
      statusCounts,
      categoryRevenue,
      topProducts,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


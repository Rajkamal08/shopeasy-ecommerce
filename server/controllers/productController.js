import Product from '../models/Product.js';

// @desc    Get all products with filters, search, sort, pagination
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice, rating,
      brand, sort, page = 1, limit = 12,
    } = req.query;

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) query.category = category;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) query.averageRating = { $gte: Number(rating) };

    // Brand filter
    if (brand) {
      const brands = brand.split(',');
      query.brand = { $in: brands };
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'popular') sortOption = { averageRating: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get all unique brands for filter
    const allBrands = await Product.distinct('brand');

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      brands: allBrands,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('ratings.user', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review
// @route   POST /api/products/:id/review
export const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already reviewed
    const alreadyReviewed = product.ratings.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    product.ratings.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      review,
    });

    product.numReviews = product.ratings.length;
    product.averageRating =
      product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product suggestions (search autocomplete)
// @route   GET /api/products/suggestions
export const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const products = await Product.find({
      title: { $regex: q, $options: 'i' },
    }).select('title category').limit(8);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique brand list
// @route   GET /api/products/brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated products (4+ stars)
// @route   GET /api/products/top-rated
export const getTopRated = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { averageRating: { $gte: 4 } };
    if (category && category !== 'All') query.category = category;
    const products = await Product.find(query).sort({ averageRating: -1 }).limit(10);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get newest products
// @route   GET /api/products/new-arrivals
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Compare products by IDs
// @route   GET /api/products/compare?ids=id1,id2,id3
export const compareProducts = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ message: 'No product IDs provided' });
    const idArray = ids.split(',').slice(0, 3);
    const products = await Product.find({ _id: { $in: idArray } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


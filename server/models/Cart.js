import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
    default: '',
  },
  discount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Recalculate total before save
cartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (this.discount > 0) {
    this.totalPrice = this.totalPrice - (this.totalPrice * this.discount / 100);
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/Coupon.js';

dotenv.config();

const coupons = [
  {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 500,
    maxDiscount: 200,
    usageLimit: 100,
    expiresAt: new Date('2026-12-31'),
    isActive: true,
  },
  {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 1000,
    maxDiscount: 500,
    usageLimit: 50,
    expiresAt: new Date('2026-12-31'),
    isActive: true,
  },
  {
    code: 'FIRST50',
    type: 'percentage',
    value: 50,
    minOrderAmount: 0,
    maxDiscount: 1000,
    newUsersOnly: true,
    usageLimit: 200,
    expiresAt: new Date('2026-12-31'),
    isActive: true,
  },
  {
    code: 'WELCOME',
    type: 'flat',
    value: 200,
    minOrderAmount: 999,
    usageLimit: 100,
    expiresAt: new Date('2026-12-31'),
    isActive: true,
  },
  {
    code: 'FASHION30',
    type: 'percentage',
    value: 30,
    minOrderAmount: 500,
    maxDiscount: 300,
    applicableCategory: 'Fashion',
    usageLimit: 80,
    expiresAt: new Date('2026-12-31'),
    isActive: true,
  },
  {
    code: 'FLAT500',
    type: 'flat',
    value: 500,
    minOrderAmount: 2000,
    usageLimit: 30,
    expiresAt: new Date('2026-12-31'),
    isActive: true,
  },
];

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log('✅ 6 coupons seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedCoupons();

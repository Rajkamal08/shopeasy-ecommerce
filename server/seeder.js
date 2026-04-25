import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';

dotenv.config();

const products = [
  // Electronics - Phones
  { title: 'Samsung Galaxy S24 Ultra', description: 'Flagship smartphone with 200MP camera, S Pen support, 6.8" Dynamic AMOLED display, Snapdragon 8 Gen 3 processor.', price: 74999, originalPrice: 134999, discount: 44, images: ['https://picsum.photos/400/400?random=1','https://picsum.photos/400/400?random=2'], category: 'Electronics', subcategory: 'Phones', brand: 'Samsung', stock: 45, averageRating: 4.6, isFeatured: true, seller: 'Samsung Official', ratings: [{ user: null, name: 'Rahul K', rating: 5, review: 'Best phone I ever used!' }, { user: null, name: 'Priya M', rating: 4, review: 'Great camera but expensive.' }] },
  { title: 'iPhone 15 Pro Max 256GB', description: 'Apple A17 Pro chip, titanium design, 48MP camera system, USB-C, Action button.', price: 89999, originalPrice: 159900, discount: 43, images: ['https://picsum.photos/400/400?random=3','https://picsum.photos/400/400?random=4'], category: 'Electronics', subcategory: 'Phones', brand: 'Apple', stock: 30, averageRating: 4.8, isFeatured: true, seller: 'Apple India', ratings: [{ user: null, name: 'Amit S', rating: 5, review: 'Premium feel and performance.' }, { user: null, name: 'Neha R', rating: 5, review: 'Camera quality is insane.' }] },
  { title: 'OnePlus 12 5G', description: 'Snapdragon 8 Gen 3, 50MP Hasselblad camera, 100W SUPERVOOC charging, 5400mAh battery.', price: 52999, originalPrice: 69999, discount: 24, images: ['https://picsum.photos/400/400?random=5'], category: 'Electronics', subcategory: 'Phones', brand: 'OnePlus', stock: 80, averageRating: 4.4, isFeatured: false, seller: 'OnePlus Store', ratings: [{ user: null, name: 'Vikram T', rating: 4, review: 'Fast charging is a game changer.' }, { user: null, name: 'Sneha P', rating: 5, review: 'Value for money flagship.' }] },
  // Electronics - Laptops
  { title: 'MacBook Air M3 15-inch', description: '15.3" Liquid Retina, M3 chip, 16GB RAM, 512GB SSD, 18-hour battery, fanless design.', price: 134900, originalPrice: 149900, discount: 10, images: ['https://picsum.photos/400/400?random=6','https://picsum.photos/400/400?random=7'], category: 'Electronics', subcategory: 'Laptops', brand: 'Apple', stock: 20, averageRating: 4.7, isFeatured: true, seller: 'Apple India', ratings: [{ user: null, name: 'Karan D', rating: 5, review: 'Perfect for professionals.' }, { user: null, name: 'Meera J', rating: 4, review: 'Wish it had more ports.' }] },
  { title: 'HP Pavilion Gaming Laptop', description: 'Intel i7-12700H, RTX 3050, 16GB DDR5, 512GB SSD, 15.6" 144Hz IPS display.', price: 67990, originalPrice: 89990, discount: 24, images: ['https://picsum.photos/400/400?random=8'], category: 'Electronics', subcategory: 'Laptops', brand: 'HP', stock: 55, averageRating: 4.2, isFeatured: false, seller: 'HP World', ratings: [{ user: null, name: 'Arjun N', rating: 4, review: 'Great for gaming on budget.' }, { user: null, name: 'Divya L', rating: 4, review: 'Good performance, decent build.' }] },
  // Electronics - Earphones
  { title: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise cancellation, 30hr battery, Hi-Res Audio, multipoint connection.', price: 26990, originalPrice: 34990, discount: 22, images: ['https://picsum.photos/400/400?random=9'], category: 'Electronics', subcategory: 'Earphones', brand: 'Sony', stock: 100, averageRating: 4.5, isFeatured: true, seller: 'Sony Official', ratings: [{ user: null, name: 'Raj P', rating: 5, review: 'ANC is unbelievable.' }, { user: null, name: 'Anita K', rating: 4, review: 'Comfortable for long wear.' }] },
  // Fashion - Shirts
  { title: 'Allen Solly Slim Fit Formal Shirt', description: 'Premium cotton formal shirt, wrinkle-resistant, classic collar, available in multiple colors.', price: 1199, originalPrice: 1999, discount: 40, images: ['https://picsum.photos/400/400?random=10'], category: 'Fashion', subcategory: 'Shirts', brand: 'Allen Solly', stock: 200, averageRating: 4.1, isFeatured: false, seller: 'Fashion Hub', ratings: [{ user: null, name: 'Rohit M', rating: 4, review: 'Good fabric quality.' }, { user: null, name: 'Pooja S', rating: 4, review: 'Fits perfectly.' }] },
  { title: 'Levis Mens Casual Denim Shirt', description: 'Classic Levis denim shirt, Western style, button-down collar, two chest pockets.', price: 2499, originalPrice: 3999, discount: 37, images: ['https://picsum.photos/400/400?random=11'], category: 'Fashion', subcategory: 'Shirts', brand: 'Levis', stock: 150, averageRating: 4.3, isFeatured: true, seller: 'Levis Store', ratings: [{ user: null, name: 'Suresh V', rating: 4, review: 'Iconic Levis quality.' }, { user: null, name: 'Kavita R', rating: 5, review: 'Husband loves it!' }] },
  // Fashion - Shoes
  { title: 'Nike Air Max 270 Sneakers', description: 'Max Air 270 unit, breathable mesh upper, foam midsole, rubber outsole, lifestyle sneaker.', price: 8995, originalPrice: 14995, discount: 40, images: ['https://picsum.photos/400/400?random=12'], category: 'Fashion', subcategory: 'Shoes', brand: 'Nike', stock: 75, averageRating: 4.5, isFeatured: true, seller: 'Nike Official', ratings: [{ user: null, name: 'Aakash G', rating: 5, review: 'Super comfortable for daily wear.' }, { user: null, name: 'Ritu S', rating: 4, review: 'Stylish and durable.' }] },
  { title: 'Adidas Ultraboost Light Running Shoes', description: 'BOOST midsole, Primeknit upper, Continental rubber outsole, neutral running shoe.', price: 11999, originalPrice: 18999, discount: 36, images: ['https://picsum.photos/400/400?random=13'], category: 'Fashion', subcategory: 'Shoes', brand: 'Adidas', stock: 60, averageRating: 4.6, isFeatured: false, seller: 'Adidas India', ratings: [{ user: null, name: 'Manish K', rating: 5, review: 'Best running shoes ever.' }, { user: null, name: 'Sonal B', rating: 4, review: 'Expensive but worth it.' }] },
  // Fashion - Bags
  { title: 'Wildcraft Turnaround Backpack 35L', description: 'Durable polyester, laptop compartment, multiple pockets, padded straps, rain cover included.', price: 1799, originalPrice: 2999, discount: 40, images: ['https://picsum.photos/400/400?random=14'], category: 'Fashion', subcategory: 'Bags', brand: 'Wildcraft', stock: 180, averageRating: 4.2, isFeatured: false, seller: 'Wildcraft Official', ratings: [{ user: null, name: 'Deepak J', rating: 4, review: 'Great for college and travel.' }, { user: null, name: 'Nisha T', rating: 4, review: 'Good quality for the price.' }] },
  { title: 'Skybags Brat 46 Ltrs Backpack', description: 'Large capacity backpack, organizer pocket, bottom shoe compartment, USB charging port.', price: 1299, originalPrice: 2500, discount: 48, images: ['https://picsum.photos/400/400?random=15'], category: 'Fashion', subcategory: 'Bags', brand: 'Skybags', stock: 120, averageRating: 3.9, isFeatured: false, seller: 'Bag Store', ratings: [{ user: null, name: 'Varun C', rating: 4, review: 'Lots of space.' }, { user: null, name: 'Isha M', rating: 4, review: 'USB port is handy.' }] },
  // Home & Kitchen - Appliances
  { title: 'Prestige Iris 750W Mixer Grinder', description: '3 stainless steel jars, 750W motor, 3 speed control with incher, ISI certified.', price: 2899, originalPrice: 4995, discount: 42, images: ['https://picsum.photos/400/400?random=16'], category: 'Home & Kitchen', subcategory: 'Appliances', brand: 'Prestige', stock: 90, averageRating: 4.0, isFeatured: false, seller: 'Kitchen World', ratings: [{ user: null, name: 'Sunita D', rating: 4, review: 'Works great for daily use.' }, { user: null, name: 'Ramesh P', rating: 4, review: 'Good motor power.' }] },
  { title: 'Philips Air Fryer HD9200/90', description: 'Rapid Air Technology, 4.1L capacity, touch panel, auto shut-off, 1400W, dishwasher safe.', price: 6999, originalPrice: 9995, discount: 30, images: ['https://picsum.photos/400/400?random=17'], category: 'Home & Kitchen', subcategory: 'Appliances', brand: 'Philips', stock: 40, averageRating: 4.4, isFeatured: true, seller: 'Philips Home', ratings: [{ user: null, name: 'Geeta M', rating: 5, review: 'Healthy cooking made easy!' }, { user: null, name: 'Vijay K', rating: 4, review: 'Cooks evenly.' }] },
  { title: 'Bajaj Majesty ICX 8 Induction Cooktop', description: '2000W, pan sensor technology, feather touch buttons, auto-off, energy efficient.', price: 2199, originalPrice: 3595, discount: 38, images: ['https://picsum.photos/400/400?random=18'], category: 'Home & Kitchen', subcategory: 'Appliances', brand: 'Bajaj', stock: 110, averageRating: 4.1, isFeatured: false, seller: 'Bajaj Electricals', ratings: [{ user: null, name: 'Lata S', rating: 4, review: 'Heats up fast.' }, { user: null, name: 'Mohan R', rating: 4, review: 'Good for hostel use.' }] },
  // Home & Kitchen - Decor
  { title: 'AmazonBasics 4-Shelf Glass Door Bookcase', description: 'Tempered glass doors, adjustable shelves, modern design, 150 lb capacity per shelf.', price: 8499, originalPrice: 12999, discount: 34, images: ['https://picsum.photos/400/400?random=19'], category: 'Home & Kitchen', subcategory: 'Decor', brand: 'AmazonBasics', stock: 25, averageRating: 4.0, isFeatured: false, seller: 'Home Decor Hub', ratings: [{ user: null, name: 'Anjali V', rating: 4, review: 'Looks elegant in living room.' }, { user: null, name: 'Prakash N', rating: 4, review: 'Easy assembly.' }] },
  { title: 'Solimo Fabric Curtain Set (Pack of 2)', description: 'Blackout curtains, grommet top, thermal insulated, 7ft length, machine washable.', price: 799, originalPrice: 1499, discount: 46, images: ['https://picsum.photos/400/400?random=20'], category: 'Home & Kitchen', subcategory: 'Decor', brand: 'Solimo', stock: 200, averageRating: 3.8, isFeatured: false, seller: 'Home Essentials', ratings: [{ user: null, name: 'Tara G', rating: 4, review: 'Good blackout quality.' }, { user: null, name: 'Harsh P', rating: 4, review: 'Value for money.' }] },
  { title: 'IKEA LACK Side Table', description: 'Minimalist design, lightweight, easy to assemble, 55x55cm, perfect as coffee table.', price: 999, originalPrice: 1499, discount: 33, images: ['https://picsum.photos/400/400?random=21'], category: 'Home & Kitchen', subcategory: 'Decor', brand: 'IKEA', stock: 70, averageRating: 4.2, isFeatured: false, seller: 'IKEA India', ratings: [{ user: null, name: 'Neeraj S', rating: 4, review: 'Simple and elegant.' }, { user: null, name: 'Pallavi R', rating: 5, review: 'Perfect for small spaces.' }] },
  // Sports - Equipment
  { title: 'NIVIA Storm Football Size 5', description: 'Machine stitched, 32 panels, PVC material, suitable for hard ground, official size.', price: 599, originalPrice: 999, discount: 40, images: ['https://picsum.photos/400/400?random=22'], category: 'Sports', subcategory: 'Equipment', brand: 'NIVIA', stock: 150, averageRating: 4.0, isFeatured: false, seller: 'Sports Zone', ratings: [{ user: null, name: 'Siddharth K', rating: 4, review: 'Good for casual play.' }, { user: null, name: 'Arun M', rating: 4, review: 'Decent quality.' }] },
  { title: 'Yonex Nanoray 7000I Badminton Racquet', description: 'Graphite frame, isometric head, G4 grip, pre-strung, lightweight 85g.', price: 1999, originalPrice: 2990, discount: 33, images: ['https://picsum.photos/400/400?random=23'], category: 'Sports', subcategory: 'Equipment', brand: 'Yonex', stock: 85, averageRating: 4.3, isFeatured: true, seller: 'Sports World', ratings: [{ user: null, name: 'Ashwin R', rating: 4, review: 'Great control and power.' }, { user: null, name: 'Maya D', rating: 5, review: 'Professional feel.' }] },
  { title: 'Cockatoo Stainless Steel Dumbbells 10KG Pair', description: 'Chrome plated, knurled grip, hexagonal design anti-roll, pair of 5kg each.', price: 2499, originalPrice: 3999, discount: 37, images: ['https://picsum.photos/400/400?random=24'], category: 'Sports', subcategory: 'Equipment', brand: 'Cockatoo', stock: 60, averageRating: 4.1, isFeatured: false, seller: 'Fitness Hub', ratings: [{ user: null, name: 'Rahul V', rating: 4, review: 'Solid build.' }, { user: null, name: 'Priyanka M', rating: 4, review: 'Good for home workouts.' }] },
  // Sports - Clothing
  { title: 'HRX Active Mens Running T-Shirt', description: 'Rapid-Dry technology, anti-odor treatment, flatlock seams, reflective logo, lightweight.', price: 699, originalPrice: 1299, discount: 46, images: ['https://picsum.photos/400/400?random=25'], category: 'Sports', subcategory: 'Clothing', brand: 'HRX', stock: 180, averageRating: 4.0, isFeatured: false, seller: 'HRX by Hrithik', ratings: [{ user: null, name: 'Tarun S', rating: 4, review: 'Great for gym.' }, { user: null, name: 'Nidhi R', rating: 4, review: 'Comfortable and light.' }] },
  { title: 'Decathlon Track Pants Slim Fit', description: 'Polyester blend, elasticated waist, zip pockets, tapered fit, moisture-wicking.', price: 999, originalPrice: 1699, discount: 41, images: ['https://picsum.photos/400/400?random=26'], category: 'Sports', subcategory: 'Clothing', brand: 'Decathlon', stock: 130, averageRating: 4.2, isFeatured: false, seller: 'Decathlon India', ratings: [{ user: null, name: 'Vishal G', rating: 4, review: 'Best track pants.' }, { user: null, name: 'Swati K', rating: 5, review: 'Super comfortable.' }] },
  // Books - Fiction
  { title: 'The Alchemist by Paulo Coelho', description: 'International bestseller about a shepherd boy who travels from Spain to Egypt to find treasure and discovers the meaning of life.', price: 299, originalPrice: 499, discount: 40, images: ['https://picsum.photos/400/400?random=27'], category: 'Books', subcategory: 'Fiction', brand: 'HarperCollins', stock: 200, averageRating: 4.5, isFeatured: false, seller: 'Book World', ratings: [{ user: null, name: 'Shivani M', rating: 5, review: 'Life changing book!' }, { user: null, name: 'Kunal S', rating: 4, review: 'Beautiful storytelling.' }] },
  { title: 'Atomic Habits by James Clear', description: 'Proven framework for improving every day. Learn how tiny changes in habits can lead to remarkable results.', price: 399, originalPrice: 799, discount: 50, images: ['https://picsum.photos/400/400?random=28'], category: 'Books', subcategory: 'Self-Help', brand: 'Penguin', stock: 180, averageRating: 4.7, isFeatured: true, seller: 'Book Hub', ratings: [{ user: null, name: 'Ankit J', rating: 5, review: 'Must read for everyone.' }, { user: null, name: 'Rekha T', rating: 5, review: 'Changed my daily routine.' }] },
  // Books - Tech
  { title: 'Clean Code by Robert C. Martin', description: 'A handbook of agile software craftsmanship. Essential reading for every professional developer.', price: 2199, originalPrice: 3999, discount: 45, images: ['https://picsum.photos/400/400?random=29'], category: 'Books', subcategory: 'Tech', brand: 'Pearson', stock: 50, averageRating: 4.4, isFeatured: false, seller: 'Tech Books', ratings: [{ user: null, name: 'Dev P', rating: 5, review: 'Every developer needs this.' }, { user: null, name: 'Shreya N', rating: 4, review: 'Great coding principles.' }] },
  { title: 'The Psychology of Money by Morgan Housel', description: 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money.', price: 349, originalPrice: 599, discount: 41, images: ['https://picsum.photos/400/400?random=30'], category: 'Books', subcategory: 'Self-Help', brand: 'Jaico', stock: 160, averageRating: 4.6, isFeatured: false, seller: 'Book World', ratings: [{ user: null, name: 'Saurav R', rating: 5, review: 'Eye opening!' }, { user: null, name: 'Garima K', rating: 4, review: 'Simple yet profound.' }] },
  { title: 'Sapiens by Yuval Noah Harari', description: 'A brief history of humankind. Explores how biology and history have defined us and enhanced our understanding of what it means to be human.', price: 449, originalPrice: 799, discount: 43, images: ['https://picsum.photos/400/400?random=31'], category: 'Books', subcategory: 'Fiction', brand: 'Vintage', stock: 140, averageRating: 4.5, isFeatured: true, seller: 'Book Hub', ratings: [{ user: null, name: 'Nitin M', rating: 5, review: 'Mind blowing perspective.' }, { user: null, name: 'Jyoti S', rating: 4, review: 'Dense but rewarding.' }] },
  { title: 'Boat Airdopes 141 TWS Earbuds', description: 'ENx noise cancellation, 42hr playback, IPX4 water resistant, low latency gaming mode.', price: 1299, originalPrice: 4490, discount: 71, images: ['https://picsum.photos/400/400?random=32'], category: 'Electronics', subcategory: 'Earphones', brand: 'boAt', stock: 190, averageRating: 3.9, isFeatured: false, seller: 'boAt Lifestyle', ratings: [{ user: null, name: 'Ravi K', rating: 4, review: 'Great bass for the price.' }, { user: null, name: 'Simran G', rating: 4, review: 'Battery life is amazing.' }] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    console.log('Existing data cleared.');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin user created: admin@test.com / Admin@123');

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'User@123',
      role: 'user',
      isVerified: true,
      addresses: [{
        name: 'Test User',
        phone: '9876543210',
        pincode: '110001',
        street: '123 Main Street',
        city: 'New Delhi',
        state: 'Delhi',
        isDefault: true,
      }],
    });
    console.log('Test user created: user@test.com / User@123');

    // Set user refs on ratings and insert products
    const productsToInsert = products.map(p => {
      p.ratings = p.ratings.map(r => ({ ...r, user: user._id }));
      p.numReviews = p.ratings.length;
      return p;
    });

    await Product.insertMany(productsToInsert);
    console.log(`${productsToInsert.length} products inserted.`);

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();

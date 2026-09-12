require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const productImages = {
  earbuds: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85',
  'phone-stand': 'https://images.unsplash.com/photo-1581795669633-91ef7c9699a8?auto=format&fit=crop&w=800&q=85',
  tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85',
  saree: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=85',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=85',
  notebook: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85',
  books: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85',
};

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, gadgets' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories' },
  { name: 'Groceries', slug: 'groceries', description: 'Daily essentials' },
  { name: 'Books & Stationery', slug: 'books-stationery', description: 'Books, notebooks, supplies' },
];

const seed = async () => {
  await connectDB();

  await Category.deleteMany();
  await Product.deleteMany();

  const createdCategories = await Category.insertMany(categories);
  const byName = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]));

  const products = [
    { name: 'Wireless Earbuds', description: 'Bluetooth 5.3 earbuds with charging case', price: 2500, discountPrice: 1999, stock: 40, category: byName['Electronics'], brand: 'SoundPro', rating: 4.3, numReviews: 21, isFeatured: true, keyword: 'earbuds' },
    { name: 'Smartphone Stand', description: 'Adjustable aluminum phone stand', price: 600, stock: 100, category: byName['Electronics'], brand: 'GripIt', rating: 4.0, numReviews: 8, keyword: 'phone-stand' },
    { name: "Men's Cotton T-Shirt", description: 'Breathable cotton t-shirt, multiple colors', price: 900, stock: 60, category: byName['Fashion'], brand: 'WearWell', rating: 4.1, numReviews: 14, keyword: 'tshirt' },
    { name: "Women's Kurta Set", description: 'Traditional kurta with matching leggings', price: 2200, discountPrice: 1799, stock: 25, category: byName['Fashion'], brand: 'EthnicEdge', rating: 4.6, numReviews: 32, isFeatured: true, keyword: 'saree' },
    { name: 'Basmati Rice 5kg', description: 'Premium long-grain basmati rice', price: 950, stock: 80, category: byName['Groceries'], brand: 'HarvestGold', rating: 4.4, numReviews: 19, keyword: 'rice' },
    { name: 'Organic Honey 500g', description: 'Pure organic honey', price: 550, stock: 50, category: byName['Groceries'], brand: 'NatureNest', rating: 4.7, numReviews: 27, isFeatured: true, keyword: 'honey' },
    { name: 'Notebook Pack (5pc)', description: 'A5 ruled notebooks, pack of 5', price: 400, stock: 120, category: byName['Books & Stationery'], brand: 'PageWorks', rating: 3.9, numReviews: 6, keyword: 'notebook' },
    { name: 'Fiction Bestseller Bundle', description: '3 bestselling fiction novels', price: 1800, stock: 30, category: byName['Books & Stationery'], brand: 'ReadMore', rating: 4.5, numReviews: 15, keyword: 'books' },
  ];

  const withSlugs = products.map((p) => ({
    ...p,
    images: [productImages[p.keyword]],
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 7),
  }));

  await Product.insertMany(withSlugs);

  const adminExists = await User.findOne({ email: '[email protected]' });
  if (!adminExists) {
    await User.create({
      name: 'ShopSewa Admin',
      email: '[email protected]',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin created: [email protected] / admin123');
  }

  console.log(`Seeded ${createdCategories.length} categories and ${withSlugs.length} products`);
  mongoose.connection.close();
};

seed();

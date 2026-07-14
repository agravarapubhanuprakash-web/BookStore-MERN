const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Category = require('../models/Category');
const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Reservation = require('../models/Reservation');
const Announcement = require('../models/Announcement');

const { categories, books, users, reviews } = require('./seedData');

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('Clearing existing data...');
    await Announcement.deleteMany();
    await Reservation.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Book.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    console.log('Collections cleared.');

    // 1. Seed Categories
    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories seeded.`);

    // Map category name to its ID
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 2. Seed Users
    console.log('Seeding users...');
    const hashedUsers = await Promise.all(
      users.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        return {
          ...u,
          password: hashedPassword,
        };
      })
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users seeded.`);

    // Map user email to its ID and User object
    const userMap = {};
    createdUsers.forEach((user) => {
      userMap[user.email] = user;
    });

    // 3. Seed Books
    console.log('Seeding books...');
    const booksWithRefs = books.map((b) => {
      const catId = categoryMap[b.categoryName];
      if (!catId) {
        throw new Error(`Category "${b.categoryName}" not found for book: "${b.title}"`);
      }

      return {
        ...b,
        category: catId
      };
    });

    const createdBooks = await Book.insertMany(booksWithRefs);
    console.log(`${createdBooks.length} books seeded.`);

    // Map book title to its ID
    const bookMap = {};
    createdBooks.forEach((book) => {
      bookMap[book.title] = book._id;
    });

    // 4. Seed Reviews & Update Book Ratings
    console.log('Seeding reviews...');
    const reviewsWithRefs = reviews.map((r) => {
      const bookId = bookMap[r.bookTitle];
      const user = userMap[r.userEmail];

      if (!bookId) {
        throw new Error(`Book "${r.bookTitle}" not found for review`);
      }
      if (!user) {
        throw new Error(`User "${r.userEmail}" not found for review`);
      }

      return {
        book: bookId,
        user: user._id,
        rating: r.rating,
        comment: r.comment,
      };
    });

    await Review.insertMany(reviewsWithRefs);
    console.log('Reviews seeded.');

    // Recalculate and update ratings for each book that got reviews
    console.log('Recalculating book ratings...');
    for (const book of createdBooks) {
      const bookReviews = reviewsWithRefs.filter(
        (r) => r.book.toString() === book._id.toString()
      );

      if (bookReviews.length > 0) {
        const sum = bookReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = parseFloat((sum / bookReviews.length).toFixed(1));
        
        await Book.findByIdAndUpdate(book._id, {
          rating: avgRating,
          numReviews: bookReviews.length,
        });
      }
    }
    console.log('Book ratings updated.');

    // 5. Seed empty cart and wishlist for seeded users
    console.log('Creating carts & wishlists for users...');
    for (const user of createdUsers) {
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, books: [] });
    }

    // 6. Create a default Announcement
    console.log('Creating default announcement...');
    const admin = createdUsers.find((u) => u.role === 'admin');
    await Announcement.create({
      title: 'Welcome to BookStore!',
      message: 'Explore our brand new collection of over 50 books across engineering, self-help, and academic subjects! Cash on Delivery and Online Payments are available.',
      type: 'success',
      isActive: true,
      createdBy: admin ? admin._id : undefined,
    });

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();

const Book = require('../models/Book');
const Category = require('../models/Category');
const Review = require('../models/Review');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @desc    Get all books (paginated, sortable)
 * @route   GET /api/books
 * @access  Public
 */
const getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Build sort object from query (e.g. sort=price or sort=-createdAt)
    let sortObj = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach((field) => {
        if (field.startsWith('-')) {
          sortObj[field.substring(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    } else {
      sortObj = { createdAt: -1 }; // default: newest first
    }

    const [books, total] = await Promise.all([
      Book.find()
        .populate('category', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Book.countDocuments(),
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      'category',
      'name description'
    );

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    res.json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new book (admin only)
 * @route   POST /api/books
 * @access  Private/Admin
 */
const createBook = async (req, res, next) => {
  try {
    const bookData = { ...req.body };

    // If an image file was uploaded, push it to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'bookstore/books'
      );
      bookData.coverImage = result.secure_url;
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a book (admin only)
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    // If a new image was uploaded, push it to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'bookstore/books'
      );
      req.body.coverImage = result.secure_url;
    }

    // Update fields
    Object.assign(book, req.body);
    await book.save();

    res.json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a book (admin only)
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    await book.deleteOne();

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search books by title or author
 * @route   GET /api/books/search
 * @access  Public
 */
const searchBooks = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      throw new ApiError(400, 'Search query (q) is required');
    }

    const regex = new RegExp(q, 'i');

    const books = await Book.find({
      $or: [{ title: regex }, { author: regex }],
    })
      .populate('category', 'name')
      .limit(20);

    res.json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get books by category
 * @route   GET /api/books/category/:categoryId
 * @access  Public
 */
const getBooksByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    const [books, total] = await Promise.all([
      Book.find({ category: categoryId })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Book.countDocuments({ category: categoryId }),
    ]);

    res.json({
      success: true,
      category: category.name,
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured books
 * @route   GET /api/books/featured
 * @access  Public
 */
const getFeaturedBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ isFeatured: true })
      .populate('category', 'name')
      .limit(8);

    res.json({
      success: true,
      books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get new arrivals (newest books)
 * @route   GET /api/books/new-arrivals
 * @access  Public
 */
const getNewArrivals = async (req, res, next) => {
  try {
    const books = await Book.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get best sellers (most reviewed & highest rated)
 * @route   GET /api/books/best-sellers
 * @access  Public
 */
const getBestSellers = async (req, res, next) => {
  try {
    const books = await Book.find()
      .populate('category', 'name')
      .sort({ numReviews: -1, rating: -1 })
      .limit(8);

    res.json({
      success: true,
      books,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/books/recommendations
 * @access  Private
 */
const getRecommendations = async (req, res, next) => {
  try {
    // Fetch user with recently viewed books populated
    const user = await User.findById(req.user._id).populate({
      path: 'recentlyViewed.book',
      select: 'category',
    });

    // Collect category IDs from recently viewed books
    const viewedCategories = [];
    if (user.recentlyViewed && user.recentlyViewed.length > 0) {
      user.recentlyViewed.forEach((entry) => {
        if (entry.book && entry.book.category) {
          const catId = entry.book.category.toString();
          if (!viewedCategories.includes(catId)) {
            viewedCategories.push(catId);
          }
        }
      });
    }

    let books;

    if (viewedCategories.length > 0) {
      // Recommend books from the user's recently viewed categories,
      // sorted by rating (highest first)
      books = await Book.find({
        category: { $in: viewedCategories },
      })
        .populate('category', 'name')
        .sort({ rating: -1, numReviews: -1 })
        .limit(8);
    }

    // Fallback: if no recently viewed categories or not enough results,
    // return highest rated books overall
    if (!books || books.length === 0) {
      books = await Book.find()
        .populate('category', 'name')
        .sort({ rating: -1, numReviews: -1 })
        .limit(8);
    }

    res.json({
      success: true,
      books,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  getBooksByCategory,
  getFeaturedBooks,
  getNewArrivals,
  getBestSellers,
  getRecommendations,
};

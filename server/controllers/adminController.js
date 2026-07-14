const { Parser } = require('json2csv');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const Book = require('../models/Book');
const User = require('../models/User');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Reservation = require('../models/Reservation');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Basic counts
    const [totalBooks, totalUsers, totalOrders] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
    ]);

    // Revenue (sum of totalPrice for paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Active reservations count
    const activeReservations = await Reservation.countDocuments({
      status: { $in: ['pending', 'notified'] },
    });

    // Monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly revenue with month names
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    // Category distribution
    const categoryDistribution = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: {
            $ifNull: [
              { $arrayElemAt: ['$categoryInfo.name', 0] },
              'Uncategorized',
            ],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        activeReservations,
        monthlyRevenue: formattedMonthlyRevenue,
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export all books as a CSV file
 * @route   GET /api/admin/export/books
 * @access  Admin
 */
const exportBooksCSV = async (req, res, next) => {
  try {
    const books = await Book.find().lean();

    if (books.length === 0) {
      throw new ApiError(404, 'No books found to export');
    }

    const fields = [
      'title',
      'author',
      'isbn',
      'price',
      'stock',
      'category',
      'publisher',
      'publishedDate',
      'pages',
      'language',
      'description',
      'rating',
      'numReviews',
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(books);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=books_export.csv',
    });

    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Import books from a CSV file
 * @route   POST /api/admin/import/books
 * @access  Admin
 */
const importBooksCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload a CSV file');
    }

    const results = [];

    // Create a readable stream from the file buffer
    const readable = new Readable();
    readable.push(req.file.buffer);
    readable.push(null); // signal end of stream

    await new Promise((resolve, reject) => {
      readable
        .pipe(csvParser())
        .on('data', (row) => {
          // Parse numeric fields
          const bookData = {
            title: row.title,
            author: row.author,
            isbn: row.isbn,
            price: parseFloat(row.price) || 0,
            stock: parseInt(row.stock, 10) || 0,
            category: row.category || undefined,
            publisher: row.publisher,
            publishedDate: row.publishedDate || undefined,
            pages: parseInt(row.pages, 10) || undefined,
            language: row.language || 'English',
            description: row.description,
          };
          results.push(bookData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      throw new ApiError(400, 'CSV file is empty or has no valid data');
    }

    const createdBooks = await Book.insertMany(results, { ordered: false });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdBooks.length} book(s)`,
      count: createdBooks.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent activity log (orders + user registrations)
 * @route   GET /api/admin/activity
 * @access  Admin
 */
const getActivityLog = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const orderActivities = recentOrders.map((order) => ({
      type: 'order',
      message: `${order.user ? order.user.name : 'Unknown User'} placed an order worth ₹${order.totalPrice}`,
      user: order.user,
      orderId: order._id,
      status: order.status,
      date: order.createdAt,
    }));

    // Get recent user registrations
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const userActivities = recentUsers.map((user) => ({
      type: 'registration',
      message: `${user.name} registered an account`,
      user: { name: user.name, email: user.email },
      date: user.createdAt,
    }));

    // Combine and sort by date (most recent first)
    const activities = [...orderActivities, ...userActivities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (admin, paginated + search)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.q || '';

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await User.countDocuments(searchQuery);
    
    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      throw new ApiError(400, 'Please provide a valid role (user or admin)');
    }

    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent admin from demoting themselves
    if (userToUpdate._id.toString() === req.user._id.toString() && role !== 'admin') {
      throw new ApiError(400, 'You cannot demote your own admin account');
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle block/unblock user account
 * @route   PUT /api/admin/users/:id/block
 * @access  Admin
 */
const toggleUserBlock = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent blocking self
    if (userToUpdate._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'You cannot block your own account');
    }

    userToUpdate.isBlocked = !userToUpdate.isBlocked;
    await userToUpdate.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${userToUpdate.isBlocked ? 'blocked' : 'activated'}`,
      isBlocked: userToUpdate.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  exportBooksCSV,
  importBooksCSV,
  getActivityLog,
  getAllUsers,
  updateUserRole,
  toggleUserBlock,
};

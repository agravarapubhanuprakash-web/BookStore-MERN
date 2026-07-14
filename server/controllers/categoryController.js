const Category = require('../models/Category');
const Book = require('../models/Book');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all categories with book count per category
 * @route   GET /api/categories
 * @access  Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    // Get all categories
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Aggregate book counts per category
    const bookCounts = await Book.aggregate([
      { $group: { _id: '$category', bookCount: { $sum: 1 } } },
    ]);

    // Create a map for quick lookup
    const countMap = {};
    bookCounts.forEach((item) => {
      countMap[item._id ? item._id.toString() : 'uncategorized'] = item.bookCount;
    });

    // Attach bookCount to each category
    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      bookCount: countMap[cat._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      throw new ApiError(400, 'Category name is required');
    }

    // Check for duplicate name (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existing) {
      throw new ApiError(400, 'A category with this name already exists');
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // If renaming, check for duplicate
    if (name && name !== category.name) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id },
      });

      if (existing) {
        throw new ApiError(400, 'A category with this name already exists');
      }

      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Check if any books are in this category
    const bookCount = await Book.countDocuments({ category: req.params.id });

    if (bookCount > 0) {
      throw new ApiError(
        400,
        `Cannot delete category. ${bookCount} book(s) are still assigned to it. Reassign or remove them first.`
      );
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

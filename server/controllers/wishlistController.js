const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get the current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'books',
      'title author price coverImage stock rating'
    );

    if (!wishlist) {
      wishlist = { books: [] };
    }

    res.status(200).json({
      success: true,
      count: wishlist.books.length,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a book to the wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      throw new ApiError(400, 'Book ID is required');
    }

    // Find or create the wishlist for this user
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        books: [bookId],
      });
    } else {
      // Only add if the book is not already in the wishlist
      if (wishlist.books.includes(bookId)) {
        throw new ApiError(400, 'Book is already in your wishlist');
      }

      wishlist.books.push(bookId);
      await wishlist.save();
    }

    // Populate before returning
    await wishlist.populate('books', 'title author price coverImage stock rating');

    res.status(200).json({
      success: true,
      message: 'Book added to wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a book from the wishlist
 * @route   DELETE /api/wishlist/:bookId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found');
    }

    wishlist.books.pull(bookId);
    await wishlist.save();

    await wishlist.populate('books', 'title author price coverImage stock rating');

    res.status(200).json({
      success: true,
      message: 'Book removed from wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Move a book from wishlist to cart
 * @route   POST /api/wishlist/move-to-cart
 * @access  Private
 */
const moveToCart = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      throw new ApiError(400, 'Book ID is required');
    }

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found');
    }

    if (!wishlist.books.includes(bookId)) {
      throw new ApiError(404, 'Book not found in wishlist');
    }

    wishlist.books.pull(bookId);
    await wishlist.save();

    // Add to cart (find or create)
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ book: bookId, quantity: 1 }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.book.toString() === bookId.toString()
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ book: bookId, quantity: 1 });
      }

      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Book moved from wishlist to cart',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};

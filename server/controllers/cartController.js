const Cart = require('../models/Cart');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get the current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.book',
      'title price coverImage stock author'
    );

    if (!cart) {
      cart = { items: [] };
    }

    res.status(200).json({
      success: true,
      count: cart.items.length,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a book to the cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const qty = quantity || 1;

    if (!bookId) {
      throw new ApiError(400, 'Book ID is required');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create a new cart with this item
      cart = await Cart.create({
        user: req.user._id,
        items: [{ book: bookId, quantity: qty }],
      });
    } else {
      // Check if the book is already in the cart
      const existingItem = cart.items.find(
        (item) => item.book.toString() === bookId.toString()
      );

      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        cart.items.push({ book: bookId, quantity: qty });
      }

      await cart.save();
    }

    // Populate before returning
    await cart.populate('items.book', 'title price coverImage stock author');

    res.status(200).json({
      success: true,
      message: 'Book added to cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:bookId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId.toString()
    );

    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    if (quantity <= 0) {
      // Remove the item if quantity is zero or negative
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.book', 'title price coverImage stock author');

    res.status(200).json({
      success: true,
      message: quantity <= 0 ? 'Item removed from cart' : 'Cart item updated',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/cart/:bookId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.book.toString() !== bookId.toString()
    );

    await cart.save();
    await cart.populate('items.book', 'title price coverImage stock author');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear the entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = generateToken(user._id);

    // Send welcome email (non-blocking — don't await)
    sendEmail(
      user.email,
      'Welcome to BookStore!',
      `<h1>Welcome, ${user.name}!</h1>
       <p>Thank you for registering at BookStore. Start exploring our collection today!</p>`
    ).catch((err) => console.error('Welcome email failed:', err.message));

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user with email & password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been blocked. Please contact support');
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login / Register with Google OAuth
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  try {
    const { googleId, email, name, profileImage } = req.body;

    // Try to find by googleId first, then by email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // If user exists but doesn't have googleId, link it
      if (!user.googleId) {
        user.googleId = googleId;
        if (profileImage) user.profileImage = profileImage;
        await user.save();
      }
    } else {
      // Create new user (no password for Google users)
      user = await User.create({
        name,
        email,
        googleId,
        profileImage: profileImage || undefined,
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been blocked. Please contact support');
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password – send reset token via email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'No account found with that email');
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and store the token with an expiry (30 minutes)
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min

    await user.save();

    // Build reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await sendEmail(
      user.email,
      'BookStore – Password Reset Request',
      `<h2>Password Reset</h2>
       <p>You requested a password reset. Click the link below to set a new password:</p>
       <a href="${resetUrl}" target="_blank">${resetUrl}</a>
       <p>This link is valid for 30 minutes. If you did not request this, please ignore this email.</p>`
    );

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the incoming token to compare with the stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid (non-expired) reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (name, phone, address)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = req.user;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password (authenticated)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch user WITH the password field
    const user = await User.findById(req.user._id).select('+password');

    // Verify old password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    // Set new password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();

    // Return a fresh token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password changed successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload / update profile image
 * @route   PUT /api/auth/profile/image
 * @access  Private
 */
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload an image file');
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'bookstore/profiles'
    );

    // Update user record
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
};

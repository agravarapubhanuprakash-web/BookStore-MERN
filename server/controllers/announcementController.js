const Announcement = require('../models/Announcement');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all active announcements
 * @route   GET /api/announcements
 * @access  Public
 */
const getActiveAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all announcements (admin)
 * @route   GET /api/announcements/all
 * @access  Admin
 */
const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new announcement
 * @route   POST /api/announcements
 * @access  Admin
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, type, isActive } = req.body;

    if (!title || !message) {
      throw new ApiError(400, 'Title and message are required');
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'info',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an announcement
 * @route   PUT /api/announcements/:id
 * @access  Admin
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      throw new ApiError(404, 'Announcement not found');
    }

    const { title, message, type, isActive } = req.body;

    if (title !== undefined) announcement.title = title;
    if (message !== undefined) announcement.message = message;
    if (type !== undefined) announcement.type = type;
    if (isActive !== undefined) announcement.isActive = isActive;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an announcement
 * @route   DELETE /api/announcements/:id
 * @access  Admin
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      throw new ApiError(404, 'Announcement not found');
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};

const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Multer Configuration
 * --------------------------------------------------
 * Uses memory storage so files are held as Buffer
 * objects in req.file.buffer (no temporary files on disk).
 */
const storage = multer.memoryStorage();

/**
 * fileFilter
 * --------------------------------------------------
 * Accepts only image files: jpeg, jpg, png, webp.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed'),
      false
    );
  }
};

/**
 * upload – Multer instance
 * --------------------------------------------------
 * Memory storage, image-only filter, 5 MB size limit.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

/**
 * uploadToCloudinary
 * --------------------------------------------------
 * Uploads a file buffer to Cloudinary using a readable
 * stream (via streamifier).
 *
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder    - Cloudinary folder name
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Pipe the buffer into the Cloudinary upload stream
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { upload, uploadToCloudinary };

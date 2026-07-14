const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Create client/public/images/books directory if it doesn't exist
const targetDir = path.join(__dirname, '../../client/public/images/books');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 2. Define category Unsplash covers mapping
const categoryCovers = {
  'Programming': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop',
  'Artificial Intelligence': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=400&auto=format&fit=crop',
  'Machine Learning': 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=400&auto=format&fit=crop',
  'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop',
  'Fantasy': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
  'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop',
  'Mystery': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400&auto=format&fit=crop',
  'Thriller': 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=400&auto=format&fit=crop',
  'Science Fiction': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop',
  'Horror': 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=400&auto=format&fit=crop',
  'Biography': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'Business': 'https://images.unsplash.com/photo-1664575185263-ab28c94625b0?q=80&w=400&auto=format&fit=crop',
  'Self-Help': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop',
  "Children's Books": 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop',
  'Comics': 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=400&auto=format&fit=crop',
  'Academic': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop',
  'Engineering': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400&auto=format&fit=crop',
  'Competitive Exams': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop',
  'Poetry': 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?q=80&w=400&auto=format&fit=crop',
  'Religion': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop',
  'Health': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop',
  'Cooking': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop',
  'History': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop',
  'Travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400&auto=format&fit=crop',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop'
};

// 3. Tiny valid JPEG fallback buffer (1x1 white pixel)
const minimalJpgBuffer = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64'
);

// Slugify function matching titles to local filenames
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Recursive https downloader following redirect locations
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Follow Redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP Status ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const main = async () => {
  const { categories, books, users, reviews } = require('./seedData');

  console.log(`Starting cover image generation/download for ${books.length} books...`);

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const slug = slugify(book.title);
    const filename = `${slug}.jpg`;
    const destPath = path.join(targetDir, filename);

    // Skip if cover file already exists locally
    if (fs.existsSync(destPath)) {
      console.log(`[Existing] ${book.title} -> ${filename}`);
      continue;
    }

    // Try downloading the book cover
    let downloadSuccess = false;
    
    // First try: Open Library ISBN cover
    if (book.isbn) {
      const olUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
      try {
        console.log(`[Downloading from Open Library] ${book.title}...`);
        await downloadFile(olUrl, destPath);
        
        // Open library returns a 1x1 blank image if cover is not found. Check if downloaded size is tiny
        const stats = fs.statSync(destPath);
        if (stats.size > 1000) { // If larger than 1KB, it's a real cover!
          downloadSuccess = true;
        } else {
          fs.unlinkSync(destPath); // Remove tiny 1x1 image
          console.log(`  Open Library cover empty for ISBN: ${book.isbn}`);
        }
      } catch (err) {
        console.log(`  Open Library download failed for ISBN: ${book.isbn} (${err.message})`);
      }
    }

    // Second try: Category themed Unsplash photo
    if (!downloadSuccess) {
      const unsplashUrl = categoryCovers[book.categoryName] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop';
      try {
        console.log(`[Downloading Fallback Unsplash] ${book.title} (${book.categoryName})...`);
        await downloadFile(unsplashUrl, destPath);
        downloadSuccess = true;
      } catch (err) {
        console.log(`  Unsplash fallback failed: ${err.message}`);
      }
    }

    // Third try: Offline/Failure fallback (Minimal solid white JPEG)
    if (!downloadSuccess) {
      console.log(`[Offline Fallback Copy] Creating blank JPEG for ${book.title}`);
      fs.writeFileSync(destPath, minimalJpgBuffer);
    }
  }

  // Rewrite seedData.js with coverImage property on each book
  console.log('Updating seedData.js books with local paths...');
  const updatedBooks = books.map((book) => {
    const slug = slugify(book.title);
    return {
      ...book,
      coverImage: `/images/books/${slug}.jpg`
    };
  });

  const seedDataCode = `// Autogenerated seedData.js with local coverImage paths
const categories = ${JSON.stringify(categories, null, 2)};

const books = ${JSON.stringify(updatedBooks, null, 2)};

const users = ${JSON.stringify(users, null, 2)};

const reviews = ${JSON.stringify(reviews, null, 2)};

module.exports = {
  categories,
  books,
  users,
  reviews
};
`;

  fs.writeFileSync(path.join(__dirname, 'seedData.js'), seedDataCode);
  console.log('seedData.js updated and all cover files compiled successfully!');
};

main().catch((err) => {
  console.error('Execution failed:', err.message);
  process.exit(1);
});

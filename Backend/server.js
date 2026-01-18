const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
app.use(express.json());  // ← important! parses JSON body
// Enable CORS for frontend (adjust origin as needed)
app.use(cors({ origin: 'http://localhost:3000' }));


// Serve static files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer config: Store files on disk, limit size to 5MB, filter image types
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// Upload API endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});
// Add this near the bottom, before app.listen()

// Add this near the bottom, before app.listen()

app.post('/api/save-post', express.json(), (req, res) => {
  const { title, content } = req.body;

  // Very basic validation
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }

  // For now: just log it (later save to database)
  console.log('New post received:');
  console.log('Title:', title || '(no title)');
  console.log('Content length:', content.length);
  console.log('Content preview:', content.substring(0, 200) + '...');

  // Simulate success (in real app → save to MongoDB / file / etc.)
  res.status(201).json({
    message: 'Post saved successfully',
    id: Date.now(), // fake ID
    savedAt: new Date().toISOString()
  });
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
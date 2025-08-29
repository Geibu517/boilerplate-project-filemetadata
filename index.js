const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('public')); // serve html form if present

// Use disk storage for multer (uploads saved to /uploads)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // keep original name (but safe)
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Home: optional form for manual testing
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST handling file upload — field name must be "upfile"
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  // multer will put file info in req.file
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname, mimetype, size } = req.file;

  res.json({
    name: originalname,
    type: mimetype,
    size: size
  });
});

// Keep server compatible with hosting
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`File Metadata Microservice listening on port ${PORT}`);
});

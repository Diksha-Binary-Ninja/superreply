import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from 'axios'; // Import axios to make API calls
import * as PlayHT from 'playht'; // Correct import syntax

// Initialize environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

PlayHT.init({
    userId: "3zprzWX323aMSxy06qqvkPzlgeX2", // Use your actual User ID from PlayHT
    apiKey: "c7b17422704d4fdaae98287547c36f94", // Use your actual API Key from PlayHT
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configure Multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Oops, this file is too big or not supported! Please try again.'));
    } else {
      cb(null, true);
    }
  },
});

// Route: Upload voice file
app.post('/upload', upload.single('voiceFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).json({ message: 'File uploaded successfully.', filePath: req.file.path });
});

// Route: Synthesize new voice file
app.post('/synthesize', async (req, res) => {
    const { text } = req.body;
  
    if (!text) {
      return res.status(400).send('Text is required.');
    }
  
    // Generate unique filename
    const outputFilePath = path.join('output', `${Date.now()}-synthesized.mp3`);
  
    try {
      // Use PlayHT to stream audio
      const stream = await PlayHT.stream(text, { voiceEngine: 'Play3.0-mini' });
  
      // Write stream data to file
      const writeStream = fs.createWriteStream(outputFilePath);
      stream.on('data', (chunk) => {
        writeStream.write(chunk);
      });
  
      stream.on('end', () => {
        writeStream.end();
        res.status(200).json({ message: 'Voice synthesized successfully.', outputFilePath });
      });
  
      stream.on('error', (err) => {
        console.error('Error in streaming:', err);
        res.status(500).send('Error in synthesizing the voice.');
      });
  
    } catch (error) {
      console.error('Error synthesizing voice:', error);
      res.status(500).send('Error synthesizing voice: ' + error.message);
    }
  });
// Route: Download new voice file
app.get('/download', (req, res) => {
  const filePath = req.query.filePath;

  // Ensure the file exists before attempting to download
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).send('File not found.');
  }

  // Provide the file for download
  res.download(filePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Photography Website Server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const photoLikesApi = require('./api/photo-likes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for logging
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Middleware
app.use(bodyParser.json());

// Serve static files
app.use(express.static(__dirname));

// API Endpoints

// Get all photo likes
app.get('/api/photo-likes', (req, res) => {
    console.log('GET request received for photo likes');
    const allLikes = photoLikesApi.getAllPhotoLikes();
    console.log('Sending photo likes:', allLikes);
    res.json(allLikes);
});

// Update a photo's like count
app.post('/api/photo-likes', (req, res) => {
    console.log('POST request received with body:', req.body);
    const { photoId, increment } = req.body;
    
    if (photoId === undefined || increment === undefined) {
        console.log('Error: Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const updatedLikes = photoLikesApi.updatePhotoLike(photoId, increment);
    console.log(`Updated likes for photo ${photoId} to ${updatedLikes}`);
    res.json({ likes: updatedLikes });
});

// Handle all other routes - serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} in your browser`);
});
// Photo likes API handler

// In-memory storage for photo likes (replace with database in production)
const photoLikes = {};

// Function to get all photo likes
function getAllPhotoLikes() {
    console.log('getAllPhotoLikes called, returning:', photoLikes);
    return photoLikes;
}

// Function to update a photo's like count
function updatePhotoLike(photoId, increment) {
    console.log(`updatePhotoLike called with photoId: ${photoId}, increment: ${increment}`);
    
    // Convert photoId to string to ensure consistent keys
    const photoKey = String(photoId);
    
    // Initialize if not exists
    if (!photoLikes[photoKey]) {
        photoLikes[photoKey] = 0;
    }
    
    // Update like count
    photoLikes[photoKey] += increment;
    
    // Ensure count never goes below 0
    if (photoLikes[photoKey] < 0) {
        photoLikes[photoKey] = 0;
    }
    
    console.log(`Updated photoLikes[${photoKey}] to ${photoLikes[photoKey]}`);
    return photoLikes[photoKey];
}

module.exports = {
    getAllPhotoLikes,
    updatePhotoLike
};
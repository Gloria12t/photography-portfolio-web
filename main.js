// Photography Portfolio JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Initialize EmailJS - ADD YOUR USER ID HERE
    if (typeof emailjs !== 'undefined') {
        emailjs.init("taktqDnu6srQX04wq"); // Replace with your actual EmailJS User ID
        console.log('EmailJS initialized');
    }
    
    // ===== Header Auto-Hide on Scroll =====
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    const scrollThreshold = 100; // Adjust this value as needed
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Check if we've scrolled past the threshold
        if (currentScroll > scrollThreshold) {
            // Scrolling down
            if (currentScroll > lastScrollTop) {
                header.classList.add('header-hidden');
            } 
            // Scrolling up
            else {
                header.classList.remove('header-hidden');
            }
        } else {
            // At the top of the page
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
    });
    
    // ===== Smooth Scrolling for Navigation =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== Initialize Lightbox =====
    // Check if lightbox exists before trying to use it
    if (typeof lightbox !== 'undefined' && lightbox !== null) {
        try {
            lightbox.option({
                'resizeDuration': 200,
                'wrapAround': true,
                'fadeDuration': 300,
                'imageFadeDuration': 300
            });
            console.log('Lightbox initialized successfully');
        } catch (error) {
            console.error('Error initializing lightbox:', error);
        }
    } else {
        console.warn('Lightbox is not defined');
    }
    
    // ===== Gallery Functionality: Like Buttons =====
    // Initialize variables
    const photoItems = document.querySelectorAll('.photo-item');
    
    // Initialize like buttons right away
    initializeLikeButtons();
    
    // ===== Contact Form Handling with EmailJS =====
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hide any existing messages
            formSuccess.style.display = 'none';
            formError.style.display = 'none';
            
            // Simple form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if(name && email && subject && message) {
                // Check if EmailJS is available
                if (typeof emailjs !== 'undefined') {
                    // Create template parameters for EmailJS
                    const templateParams = {
                        from_name: name,
                        from_email: email,
                        subject: subject,
                        message: message
                    };
                    
                    // ADD YOUR SERVICE ID AND TEMPLATE ID HERE
                    emailjs.send('service_4knk6nk', 'template_6tp06za', templateParams)
                        .then(function(response) {
                            console.log('Email sent successfully!', response);
                            // Show success message
                            formSuccess.style.display = 'flex';
                            contactForm.reset();
                            
                            // Hide success message after 5 seconds
                            setTimeout(() => {
                                formSuccess.style.display = 'none';
                            }, 5000);
                        })
                        .catch(function(error) {
                            console.error('EmailJS error:', error);
                            formError.style.display = 'flex';
                        });
                } else {
                    // Fallback if EmailJS is not available
                    console.error('EmailJS is not available');
                    formSuccess.style.display = 'flex'; // Still show success in case of local testing
                    contactForm.reset();
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        formSuccess.style.display = 'none';
                    }, 5000);
                }
            } else {
                // Show error message for incomplete form
                formError.style.display = 'flex';
            }
        });
    }
    
    // ===== Back to Top Button =====
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if(window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // New function to fetch all likes from server
    async function fetchAllPhotoLikes() {
        try {
            console.log("Fetching photo likes from server");
            const response = await fetch('/api/photo-likes');
            if (!response.ok) {
                throw new Error('Failed to fetch photo likes');
            }
            const data = await response.json();
            console.log("Received photo likes data:", data);
            return data;
        } catch (error) {
            console.error('Error fetching photo likes:', error);
            return {}; // Return empty object in case of error
        }
    }

    // New function to update a photo's like count
    async function updatePhotoLike(photoId, increment) {
        try {
            console.log(`Updating photo ${photoId} likes by ${increment}`);
            const response = await fetch('/api/photo-likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    photoId,
                    increment
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update photo like');
            }
            
            const data = await response.json();
            console.log(`Updated likes for photo ${photoId}:`, data);
            return data;
        } catch (error) {
            console.error('Error updating photo like:', error);
            return null;
        }
    }

    // Updated function to handle like button clicks
    async function handleLikeClick(button, photoIndex) {
        console.log(`Handling like click for photo ${photoIndex}`);
        const countElement = button.querySelector('span');
        const isCurrentlyLiked = button.classList.contains('liked');
        
        // Update UI immediately for responsive feel
        if (isCurrentlyLiked) {
            button.classList.remove('liked');
            countElement.textContent = parseInt(countElement.textContent) - 1;
        } else {
            button.classList.add('liked');
            countElement.textContent = parseInt(countElement.textContent) + 1;
        }
        
        // Track like status in localStorage for this user
        localStorage.setItem(`photo-${photoIndex}-liked`, !isCurrentlyLiked ? 'true' : 'false');
        
        // Update server-side like count
        const result = await updatePhotoLike(photoIndex, isCurrentlyLiked ? -1 : 1);
        
        // If server request failed, revert UI changes
        if (!result) {
            if (isCurrentlyLiked) {
                button.classList.add('liked');
                countElement.textContent = parseInt(countElement.textContent) + 1;
            } else {
                button.classList.remove('liked');
                countElement.textContent = parseInt(countElement.textContent) - 1;
            }
            // Revert localStorage
            localStorage.setItem(`photo-${photoIndex}-liked`, isCurrentlyLiked ? 'true' : 'false');
            
            console.error('Failed to update like on server');
        } else {
            // Update count with accurate value from server
            countElement.textContent = result.likes;
        }
    }
    
    // Updated function to initialize like buttons
    async function initializeLikeButtons() {
        console.log("initializeLikeButtons started");
        
        const likeButtons = document.querySelectorAll('.photo-like-btn');
        console.log("Found like buttons:", likeButtons.length);
        
        // Fetch all photo likes from server
        console.log("About to fetch photo likes from server");
        const photoLikes = await fetchAllPhotoLikes();
        console.log("Received photo likes from server:", photoLikes);
        
        likeButtons.forEach((button, index) => {
            const count = button.querySelector('span');
            
            // Set initial count from server data
            count.textContent = photoLikes[index] || 0;
            
            // Check if previously liked by this user
            if (localStorage.getItem(`photo-${index}-liked`) === 'true') {
                button.classList.add('liked');
            }
            
            // Remove existing event listeners by cloning and replacing the button
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add event listener
            newButton.addEventListener('click', function(e) {
                console.log('Button clicked, index:', index);
                console.log('Current like status:', newButton.classList.contains('liked'));
                e.preventDefault();
                e.stopPropagation();
                
                handleLikeClick(newButton, index);
            });
        });
    }
});
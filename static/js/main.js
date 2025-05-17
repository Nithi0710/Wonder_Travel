// Main.js - General scripts for the Tourist Management System

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Initialize animations for elements with animate-fadeIn class
    const animatedElements = document.querySelectorAll('.animate-fadeIn');
    
    if (animatedElements.length > 0) {
        animatedElements.forEach(element => {
            // Add a slight delay for each consecutive element
            const delay = parseFloat(element.dataset.delay || 0);
            element.style.animationDelay = `${delay}s`;
        });
    }

    // Add glow effect to buttons with glow-btn class
    const glowButtons = document.querySelectorAll('.glow-btn');
    
    if (glowButtons.length > 0) {
        glowButtons.forEach(button => {
            button.addEventListener('mousemove', function(e) {
                const x = e.pageX - this.offsetLeft;
                const y = e.pageY - this.offsetTop;
                
                this.style.setProperty('--x', `${x}px`);
                this.style.setProperty('--y', `${y}px`);
            });
        });
    }

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Toggle active class on the clicked item
                item.classList.toggle('active');
                
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
            });
        });
    }

    // Flash message auto-dismiss
    const flashMessages = document.querySelectorAll('.flash-message');
    
    if (flashMessages.length > 0) {
        flashMessages.forEach(message => {
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 500);
            }, 5000);
        });
    }

    // Create random stars for blinking effect on specific pages (like success page)
    const blinkingStars = document.querySelector('.blinking-stars');
    
    if (blinkingStars) {
        createRandomStars(blinkingStars, 50);
    }

    // Add hover effects for hover-card elements
    const hoverCards = document.querySelectorAll('.hover-card');
    
    if (hoverCards.length > 0) {
        hoverCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.classList.add('hover-active');
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('hover-active');
            });
        });
    }

    // Destination card hover effects
    const destinationCards = document.querySelectorAll('.destination-card');
    
    if (destinationCards.length > 0) {
        destinationCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const bookBtn = this.querySelector('.book-btn');
                if (bookBtn) {
                    bookBtn.classList.add('glow-btn');
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const bookBtn = this.querySelector('.book-btn');
                if (bookBtn) {
                    bookBtn.classList.remove('glow-btn');
                }
            });
        });
    }

    // Dashboard tab switching
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardContents = document.querySelectorAll('.dashboard-content');
    
    if (dashboardTabs.length > 0 && dashboardContents.length > 0) {
        dashboardTabs.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and contents
                dashboardTabs.forEach(t => t.classList.remove('active'));
                dashboardContents.forEach(c => c.style.display = 'none');
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                dashboardContents[index].style.display = 'block';
            });
        });
    }
});

// Function to create random blinking stars for animations
function createRandomStars(container, count) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 3 + 2;
        
        // Random animation delay
        const delay = Math.random() * 2;
        
        // Apply styles
        star.style.top = `${top}%`;
        star.style.left = `${left}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        
        container.appendChild(star);
    }
}

// Function to format price in Indian Rupees format
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
}

// Function to format date in a readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show loading spinner
function showLoading(container) {
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    container.innerHTML = '';
    container.appendChild(loadingSpinner);
}

// Show error message
function showError(container, message) {
    container.innerHTML = `
        <div class="flash-message flash-error">
            <p>${message}</p>
        </div>
    `;
}

// Smooth scroll animations and interactions for Glow landing page

// Backend API Configuration
const API_BASE = window.location.origin; // Use current domain
const API_ENDPOINT = `${API_BASE}/generate-simple`; // Using simple endpoint for testing

// Simple mode - no auth required for testing
const SIMPLE_MODE = true;

// Check if user is logged in
function isLoggedIn() {
    return SIMPLE_MODE || localStorage.getItem('token') !== null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token') || 'demo-token';
}

// Redirect to auth if not logged in
function requireAuth() {
    if (SIMPLE_MODE) return true;
    
    if (!isLoggedIn()) {
        showNotification('Please login to generate images', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1500);
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations and interactions
    initParallaxEffect();
    initScrollAnimations();
    initUploadInteractions();
    initButtonEffects();
    
    // Initialize gallery if on gallery page
    if (document.getElementById('gallery-grid')) {
        initGallery();
    }
    
    // Handle URL hash for pre-filling prompts
    handleUrlHash();
    
    // Initialize generate button functionality
    initGenerateButton();
    
    // Initialize upload section generate button
    initUploadSectionGenerate();
    
    // Initialize template buttons
    initTemplateButtons();
    
    // Load trending examples
    loadTrendingExamples();
});

// 3D Parallax effect for hero title
function initParallaxEffect() {
    const heroTitle = document.querySelector('[data-parallax]');
    
    if (!heroTitle) return;
    
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        // Calculate mouse position as percentage
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;
        
        // Apply subtle 3D transform
        const translateX = xPercent * 10;
        const translateY = yPercent * 10;
        const rotateX = yPercent * 5;
        const rotateY = xPercent * 5;
        
        heroTitle.style.transform = `
            translate3d(${translateX}px, ${translateY}px, 0)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
        `;
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        heroTitle.style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0)';
    });
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Stagger animation for grid items
                if (entry.target.classList.contains('example-card') || 
                    entry.target.classList.contains('step-card')) {
                    const siblings = Array.from(entry.target.parentNode.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(
        '.example-card, .step-card, .glass-card'
    );
    
    animatableElements.forEach(el => {
        observer.observe(el);
    });
}

// Upload area interactions
function initUploadInteractions() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('photo-upload');
    const promptOptions = document.querySelectorAll('.prompt-option');
    
    if (!uploadArea || !fileInput) return;
    
    // File upload drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--neon-blue)';
        uploadArea.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--glass-border)';
        uploadArea.style.boxShadow = 'none';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--glass-border)';
        uploadArea.style.boxShadow = 'none';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Legacy prompt selection (if exists)
    if (promptOptions.length > 0) {
        promptOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                promptOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                option.classList.add('active');
                
                // Add selection effect
                option.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    option.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }
}

// Store uploaded file globally
let uploadedFile = null;

// Handle file upload
function handleFileUpload(file) {
    const uploadArea = document.querySelector('.upload-area');
    const uploadIcon = uploadArea.querySelector('.upload-icon');
    const uploadText = uploadArea.querySelector('p');
    const uploadButton = uploadArea.querySelector('.upload-button');
    const previewArea = document.getElementById('uploaded-preview');
    const previewImage = document.getElementById('preview-image');
    const fileName = document.getElementById('file-name');
    const generateBtn = document.getElementById('generate-now-btn');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    // Store file globally
    uploadedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        fileName.textContent = file.name;
        
        // Hide upload elements and show preview
        uploadIcon.style.display = 'none';
        uploadText.style.display = 'none';
        uploadButton.style.display = 'none';
        previewArea.style.display = 'block';
        
        // Generate button is always visible now
        
        uploadArea.style.borderColor = 'var(--neon-blue)';
        uploadArea.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.3)';
    };
    reader.readAsDataURL(file);
    
    showNotification('Photo uploaded successfully!', 'success');
}

// Enhanced button effects
function initButtonEffects() {
    const buttons = document.querySelectorAll('.cta-button');
    
    buttons.forEach(button => {
        // Ripple effect on click
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Enhanced hover glow
        button.addEventListener('mouseenter', () => {
            button.style.filter = 'brightness(1.1) drop-shadow(0 0 20px currentColor)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.filter = 'none';
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        color: var(--text-primary);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.borderColor = 'var(--neon-blue)';
    } else if (type === 'error') {
        notification.style.borderColor = 'var(--neon-pink)';
    }
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Email form validation
document.addEventListener('submit', (e) => {
    const emailInput = e.target.querySelector('.email-input');
    if (emailInput) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }
        
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Thanks! We\'ll be in touch soon.', 'success');
        emailInput.value = '';
    }
});

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .prompt-option.active .prompt-preview {
        box-shadow: 0 0 30px var(--neon-blue);
        border: 2px solid var(--neon-blue);
    }
`;
document.head.appendChild(style);

// Gallery functionality
function initGallery() {
    if (typeof promptsData === 'undefined') {
        console.error('Prompts data not loaded');
        return;
    }
    
    const galleryGrid = document.getElementById('gallery-grid');
    const modal = document.getElementById('prompt-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrompt = document.getElementById('modal-prompt');
    const copyBtn = document.getElementById('copy-prompt');
    const useBtn = document.getElementById('use-template');
    
    let currentPrompt = null;
    
    // Load prompt cards
    promptsData.forEach((prompt, index) => {
        const card = createPromptCard(prompt, index);
        galleryGrid.appendChild(card);
    });
    
    // Animate cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.prompt-card').forEach(card => {
        observer.observe(card);
    });
    
    // Modal interactions
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Copy prompt functionality
    copyBtn.addEventListener('click', async () => {
        if (!currentPrompt) return;
        
        try {
            await navigator.clipboard.writeText(currentPrompt.prompt);
            showNotification('Prompt copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentPrompt.prompt;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Prompt copied to clipboard!', 'success');
        }
    });
    
    // Use template functionality
    useBtn.addEventListener('click', () => {
        if (!currentPrompt) return;
        
        // Store selected prompt in localStorage
        localStorage.setItem('selectedPrompt', JSON.stringify(currentPrompt));
        
        // Redirect to index.html with hash
        window.location.href = 'index.html#upload';
    });
    
    function createPromptCard(prompt, index) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="prompt-card-image">
                <img src="${prompt.image}" alt="${prompt.title}" loading="lazy">
                <div class="prompt-card-overlay">
                    <div class="prompt-preview">${prompt.prompt.substring(0, 100)}...</div>
                </div>
            </div>
            <div class="prompt-card-title">${prompt.title}</div>
        `;
        
        card.addEventListener('click', () => openModal(prompt));
        
        return card;
    }
    
    function openModal(prompt) {
        currentPrompt = prompt;
        modalImg.src = prompt.image;
        modalImg.alt = prompt.title;
        modalTitle.textContent = prompt.title;
        modalPrompt.value = prompt.prompt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentPrompt = null;
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Handle URL hash for pre-filling prompts
function handleUrlHash() {
    const hash = window.location.hash;
    
    if (hash === '#upload') {
        // Check if there's a selected prompt in localStorage
        const selectedPrompt = localStorage.getItem('selectedPrompt');
        
        if (selectedPrompt) {
            try {
                const prompt = JSON.parse(selectedPrompt);
                prefillPrompt(prompt);
                localStorage.removeItem('selectedPrompt');
                
                // Scroll to upload section
                setTimeout(() => {
                    const uploadSection = document.querySelector('.upload-section');
                    if (uploadSection) {
                        uploadSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } catch (err) {
                console.error('Error parsing selected prompt:', err);
            }
        }
    }
}

// Pre-fill prompt in upload section
function prefillPrompt(prompt) {
    // Add a hidden textarea to store the selected prompt
    let promptInput = document.getElementById('selected-prompt');
    
    if (!promptInput) {
        promptInput = document.createElement('textarea');
        promptInput.id = 'selected-prompt';
        promptInput.style.cssText = `
            width: 100%;
            min-height: 80px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            padding: 15px;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 0.9rem;
            margin-top: 15px;
            resize: vertical;
            outline: none;
        `;
        promptInput.placeholder = 'Selected prompt will appear here...';
        
        // Add to prompt selector
        const promptSelector = document.querySelector('.prompt-selector');
        if (promptSelector) {
            const label = document.createElement('h4');
            label.textContent = 'Selected Prompt:';
            label.style.marginTop = '20px';
            label.style.marginBottom = '10px';
            promptSelector.appendChild(label);
            promptSelector.appendChild(promptInput);
        }
    }
    
    // Fill the prompt
    promptInput.value = prompt.prompt;
    
    // Show notification
    showNotification(`Template "${prompt.title}" loaded!`, 'success');
    
    // Highlight the prompt input
    promptInput.style.borderColor = 'var(--neon-blue)';
    promptInput.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
    
    setTimeout(() => {
        promptInput.style.borderColor = 'var(--glass-border)';
        promptInput.style.boxShadow = 'none';
    }, 3000);
}

// Generate Button Functionality with Backend Integration
function initGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    if (!generateBtn) return;
    
    generateBtn.addEventListener('click', async () => {
        // Check authentication first
        if (!requireAuth()) return;
        
        const uploadedFile = getUploadedFile();
        const selectedPrompt = getSelectedPrompt();
        
        if (!uploadedFile) {
            showNotification('Please upload a photo first!', 'error');
            document.querySelector('.upload-section')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        if (!selectedPrompt) {
            showNotification('Please select a style or prompt!', 'error');
            return;
        }
        
        await generateAILook(uploadedFile, selectedPrompt);
    });
}

// Upload Section Generate Button
function initUploadSectionGenerate() {
    const generateNowBtn = document.getElementById('generate-now-btn');
    if (!generateNowBtn) return;
    
    generateNowBtn.addEventListener('click', async () => {
        // Check authentication first
        if (!requireAuth()) return;
        
        const uploadedFile = getUploadedFile();
        const selectedPrompt = getSelectedPrompt();
        
        if (!uploadedFile) {
            showNotification('Please upload a photo first!', 'error');
            return;
        }
        
        if (!selectedPrompt) {
            showNotification('Please enter a prompt or select a template!', 'error');
            return;
        }
        
        await generateAILook(uploadedFile, selectedPrompt);
    });
}

// Get uploaded file from global variable
function getUploadedFile() {
    return uploadedFile;
}

// Get selected prompt from UI
function getSelectedPrompt() {
    const customPrompt = document.getElementById('custom-prompt');
    if (customPrompt?.value.trim()) {
        return customPrompt.value.trim();
    }
    
    const selectedPromptTextarea = document.getElementById('selected-prompt');
    if (selectedPromptTextarea?.value) {
        return selectedPromptTextarea.value;
    }
    
    return null;
}

// Template Button Functionality
function initTemplateButtons() {
    const templateButtons = document.querySelectorAll('.template-btn');
    const customPrompt = document.getElementById('custom-prompt');
    
    templateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prompt = button.getAttribute('data-prompt');
            if (customPrompt) {
                customPrompt.value = prompt;
                customPrompt.focus();
                
                // Visual feedback
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'translateY(-2px)';
                }, 150);
                
                showNotification('Template loaded! You can edit it or generate directly.', 'success');
            }
        });
    });
}

// Backend API Integration - Generate AI Look
async function generateAILook(imageFile, prompt) {
    const token = getAuthToken();
    
    // Show loading state
    const generateBtn = document.getElementById('generate-now-btn') || document.getElementById('generate-btn');
    const originalText = generateBtn?.textContent || 'Generate';
    if (generateBtn) {
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;
    }
    
    // Show loading animation
    showLoadingAnimation();
    
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('prompt', prompt);
        
        console.log('Sending request to:', API_ENDPOINT);
        console.log('Form data:', { hasImage: !!imageFile, promptLength: prompt.length });
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle specific error cases
            if (errorData.requiresUpgrade) {
                hideLoadingAnimation();
                showUpgradeModal(errorData.currentPlan);
                return;
            }
            
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
            // Hide loading and show result
            hideLoadingAnimation();
            displayGeneratedImage(result.imageUrl);
            
            // Show remaining images count
            const remaining = result.remainingImages;
            const message = remaining === -1 
                ? 'Your viral look is ready!' 
                : `Your viral look is ready! ${remaining} generations remaining.`;
            
            showNotification(message, 'success');
        } else {
            throw new Error(result.error || 'Generation failed');
        }
        
    } catch (error) {
        console.error('Generation failed:', error);
        hideLoadingAnimation();
        
        if (error.message.includes('401') || error.message.includes('token')) {
            showNotification('Session expired. Please login again.', 'error');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 2000);
        } else {
            showNotification(error.message || 'Generation failed. Please try again.', 'error');
        }
    } finally {
        // Reset button state
        if (generateBtn) {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }
}

// Loading Animation System
function showLoadingAnimation() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h3>Creating Your Viral Look...</h3>
            <p>This may take a few moments</p>
        </div>
    `;
    
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 10, 15, 0.9);
        backdrop-filter: blur(10px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // Fade in
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 100);
    
    // Add loading spinner styles
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
        .loading-content {
            text-align: center;
            color: var(--text-primary);
        }
        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 3px solid var(--glass-border);
            border-top: 3px solid var(--neon-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinnerStyle);
}

function hideLoadingAnimation() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 300);
    }
}

// Display Generated Image Result
function displayGeneratedImage(imageUrl) {
    const resultModal = document.createElement('div');
    resultModal.innerHTML = `
        <div class="result-modal-content">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            <h3>Your Viral Look is Ready! ✨</h3>
            <div class="result-image">
                <img src="${imageUrl}" alt="Generated Look">
            </div>
            <div class="result-actions">
                <button class="cta-button primary" onclick="downloadImage('${imageUrl}')">Download Image</button>
                <button class="cta-button secondary" onclick="shareImage('${imageUrl}')">Share</button>
            </div>
        </div>
    `;
    
    resultModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 1500;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(resultModal);
    
    // Fade in
    setTimeout(() => {
        resultModal.style.opacity = '1';
    }, 100);
    
    // Add result modal styles
    const resultStyle = document.createElement('style');
    resultStyle.textContent = `
        .result-modal-content {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            position: relative;
        }
        .result-image img {
            width: 100%;
            max-width: 400px;
            border-radius: 15px;
            margin: 20px 0;
        }
        .result-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }
    `;
    document.head.appendChild(resultStyle);
}

// Utility functions for download and share
function downloadImage(imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'glow-viral-look.jpg';
    link.click();
}

function shareImage(imageUrl) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out my viral AI look!',
            text: 'Created with Glow - Viral AI Looks Instantly',
            url: imageUrl
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(imageUrl);
        showNotification('Image URL copied to clipboard!', 'success');
    }
}

// Load Trending Examples - Static Implementation
function loadTrendingExamples() {
    // Add click handlers for "Use This Prompt" buttons
    document.querySelectorAll('.use-prompt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prompt = btn.getAttribute('data-prompt');
            const customPromptInput = document.getElementById('custom-prompt');
            
            if (customPromptInput) {
                customPromptInput.value = prompt;
                showNotification('Prompt loaded! Scroll up to upload your photo.', 'success');
                
                // Scroll to upload section
                document.querySelector('.upload-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Show upgrade modal when usage limit exceeded
function showUpgradeModal(currentPlan) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="upgrade-modal-content">
            <h3>🚀 Upgrade Required</h3>
            <p>You've used all your free generations!</p>
            <p>Current Plan: <strong>${currentPlan}</strong></p>
            <div class="upgrade-actions">
                <button class="cta-button primary" onclick="window.location.href='pricing.html'">View Plans</button>
                <button class="cta-button secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Maybe Later</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .upgrade-modal-content {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .upgrade-actions {
            display: flex;
            gap: 15px;
            margin-top: 20px;
            justify-content: center;
        }
    `;
    document.head.appendChild(modalStyle);
}

// Display profile dropdown in header
function displayUserStatus() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
        const profileDropdown = document.createElement('div');
        profileDropdown.className = 'profile-dropdown';
        profileDropdown.innerHTML = `
            <div class="profile-trigger" onclick="toggleProfileDropdown()">
                <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=667eea&color=fff&size=40`}" alt="Profile" class="profile-avatar">
                <span class="profile-name">${user.name || user.email.split('@')[0]}</span>
                <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L2 4h8L6 8z"/>
                </svg>
            </div>
            <div class="profile-menu" id="profile-menu">
                <div class="profile-header">
                    <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=667eea&color=fff&size=50`}" alt="Profile" class="profile-avatar-large">
                    <div class="profile-info">
                        <div class="profile-name-large">${user.name || 'User'}</div>
                        <div class="profile-email">${user.email}</div>
                    </div>
                </div>
                <div class="profile-plan">
                    <div class="plan-info">
                        <span class="plan-label">Current Plan</span>
                        <span class="plan-badge ${(user.plan || 'FREE').toLowerCase()}">${user.plan || 'FREE'}</span>
                    </div>
                    <div class="plan-usage">
                        <span class="usage-text">${user.images_used || 0}/${user.images_limit === -1 ? '∞' : user.images_limit || 3} images used</span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="profile-action-btn" onclick="window.location.href='pricing.html'">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0L10 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6L8 0z"/>
                        </svg>
                        Upgrade Plan
                    </button>
                    <button class="profile-action-btn" onclick="logout()">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3 3h8v2H3V3zm0 4h8v2H3V7zm0 4h5v2H3v-2zm10-1l-3-3v2H8v2h2v2l3-3z"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(profileDropdown);
    }
}

// Toggle profile dropdown
function toggleProfileDropdown() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.profile-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        const menu = document.getElementById('profile-menu');
        if (menu) menu.classList.remove('show');
    }
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Show/hide auth buttons based on login status
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const heroButtons = document.querySelector('.hero-buttons');
    
    if (isLoggedIn()) {
        if (authButtons) authButtons.style.display = 'none';
        if (heroButtons) heroButtons.style.display = 'flex';
        displayUserStatus();
    } else {
        if (authButtons) authButtons.style.display = 'block';
        if (heroButtons) heroButtons.style.display = 'flex';
    }
}

// Initialize user status on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
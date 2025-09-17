// Simplified Pricing Page - No Payment Integration
const API_BASE = window.location.origin + '/api';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return false;
    }
    return token;
}

// Update UI to show all features are free
function updatePlanUI() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Mark all plans as available for free
    document.querySelectorAll('.plan-button').forEach((button, index) => {
        if (index === 0) { // Free plan
            button.classList.add('current');
            button.disabled = true;
            button.textContent = 'Free Forever';
        } else {
            button.disabled = true;
            button.textContent = 'No Longer Available';
            button.style.opacity = '0.5';
        }
    });
    
    // Add notice
    const notice = document.createElement('div');
    notice.innerHTML = `
        <div style="
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--neon-blue);
            border-radius: 15px;
            padding: 20px;
            margin: 30px auto;
            max-width: 600px;
            text-align: center;
            color: var(--text-primary);
        ">
            <h3 style="color: var(--neon-blue); margin-bottom: 10px;">🎉 Great News!</h3>
            <p>All premium features are now completely free! Enjoy unlimited AI generations with no restrictions.</p>
        </div>
    `;
    
    const pricingGrid = document.querySelector('.pricing-grid');
    pricingGrid.parentNode.insertBefore(notice, pricingGrid.nextSibling);
}

// Notification System
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
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updatePlanUI();
});
// Pricing and Payment JavaScript
const API_BASE = 'http://localhost:8080';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return false;
    }
    return token;
}

// Purchase Plan Function
async function purchasePlan(planName) {
    const token = checkAuth();
    if (!token) return;
    
    try {
        // Create order
        const response = await fetch(`${API_BASE}/payment/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ planName })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error);
        }
        
        // Initialize Razorpay
        const options = {\n            key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay key\n            amount: data.amount,\n            currency: data.currency,\n            name: 'Glow AI',\n            description: `${data.plan.name} Plan - ${data.plan.images === -1 ? 'Unlimited' : data.plan.images} Images`,\n            order_id: data.orderId,\n            handler: function(response) {\n                verifyPayment(response, planName);\n            },\n            prefill: {\n                name: JSON.parse(localStorage.getItem('user')).name,\n                email: JSON.parse(localStorage.getItem('user')).email\n            },\n            theme: {\n                color: '#667eea'\n            },\n            modal: {\n                ondismiss: function() {\n                    showNotification('Payment cancelled', 'error');\n                }\n            }\n        };\n        \n        const rzp = new Razorpay(options);\n        rzp.open();\n        \n    } catch (error) {\n        showNotification(error.message || 'Payment failed', 'error');\n    }\n}\n\n// Verify Payment\nasync function verifyPayment(response, planName) {\n    const token = localStorage.getItem('token');\n    \n    try {\n        const verifyResponse = await fetch(`${API_BASE}/payment/verify`, {\n            method: 'POST',\n            headers: {\n                'Content-Type': 'application/json',\n                'Authorization': `Bearer ${token}`\n            },\n            body: JSON.stringify({\n                orderId: response.razorpay_order_id,\n                paymentId: response.razorpay_payment_id,\n                signature: response.razorpay_signature,\n                planName\n            })\n        });\n        \n        const data = await verifyResponse.json();\n        \n        if (data.success) {\n            showNotification(data.message, 'success');\n            \n            // Update user data in localStorage\n            const user = JSON.parse(localStorage.getItem('user'));\n            user.plan = planName;\n            localStorage.setItem('user', JSON.stringify(user));\n            \n            setTimeout(() => {\n                window.location.href = 'index.html';\n            }, 2000);\n        } else {\n            showNotification(data.error || 'Payment verification failed', 'error');\n        }\n    } catch (error) {\n        showNotification('Payment verification failed', 'error');\n    }\n}\n\n// Update UI based on current plan\nfunction updatePlanUI() {\n    const user = JSON.parse(localStorage.getItem('user') || '{}');\n    const currentPlan = user.plan || 'FREE';\n    \n    // Update current plan button\n    document.querySelectorAll('.plan-button').forEach(button => {\n        button.classList.remove('current');\n        button.disabled = false;\n        button.textContent = 'Upgrade Now';\n    });\n    \n    // Mark current plan\n    const planCards = document.querySelectorAll('.pricing-card');\n    planCards.forEach((card, index) => {\n        const plans = ['FREE', 'BASIC', 'PRO', 'UNLIMITED'];\n        if (plans[index] === currentPlan) {\n            const button = card.querySelector('.plan-button');\n            button.classList.add('current');\n            button.disabled = true;\n            button.textContent = 'Current Plan';\n        }\n    });\n}\n\n// Notification System\nfunction showNotification(message, type = 'info') {\n    const notification = document.createElement('div');\n    notification.className = `notification ${type}`;\n    notification.textContent = message;\n    \n    notification.style.cssText = `\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        padding: 15px 25px;\n        background: var(--glass-bg);\n        backdrop-filter: blur(20px);\n        border: 1px solid var(--glass-border);\n        border-radius: 10px;\n        color: var(--text-primary);\n        z-index: 1000;\n        transform: translateX(100%);\n        transition: transform 0.3s ease;\n        max-width: 300px;\n    `;\n    \n    if (type === 'success') {\n        notification.style.borderColor = 'var(--neon-blue)';\n    } else if (type === 'error') {\n        notification.style.borderColor = 'var(--neon-pink)';\n    }\n    \n    document.body.appendChild(notification);\n    \n    setTimeout(() => {\n        notification.style.transform = 'translateX(0)';\n    }, 100);\n    \n    setTimeout(() => {\n        notification.style.transform = 'translateX(100%)';\n        setTimeout(() => {\n            notification.remove();\n        }, 300);\n    }, 3000);\n}\n\n// Initialize\ndocument.addEventListener('DOMContentLoaded', () => {\n    checkAuth();\n    updatePlanUI();\n});
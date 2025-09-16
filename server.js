// Backend API for Glow - Complete Freemium System
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const Razorpay = require('razorpay');
const app = express();

// Debug environment variables
console.log('Environment check:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');

// API Keys from Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-key';

// Supabase Client
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );
    console.log('✅ Supabase client initialized');
} else {
    console.log('❌ Supabase credentials missing');
}

// Razorpay Client
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay client initialized');
} else {
    console.log('⚠️ Razorpay credentials missing - payments disabled');
}

// Pricing Plans
const PLANS = {
    FREE: { name: 'Free', images: 3, price: 0 },
    BASIC: { name: 'Basic', images: 10, price: 200 },
    PRO: { name: 'Pro', images: 50, price: 499 },
    UNLIMITED: { name: 'Unlimited', images: -1, price: 1000 }
};

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();
            
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Configure multer for file uploads
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// User Registration
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        
        if (error) throw error;
        
        // Create user profile
        await supabase.from('users').insert({
            id: data.user.id,
            email,
            name,
            plan: 'FREE',
            images_used: 0,
            images_limit: 3
        });
        
        const token = jwt.sign({ userId: data.user.id }, JWT_SECRET);
        
        res.json({
            success: true,
            token,
            user: { id: data.user.id, email, name, plan: 'FREE' }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        const token = jwt.sign({ userId: data.user.id }, JWT_SECRET);
        
        const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        res.json({
            success: true,
            token,
            user: userProfile
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Generate AI Look Endpoint (Protected)
app.post('/generate', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const imageFile = req.file;
        const user = req.user;
        
        // Check usage limits
        if (user.plan !== 'UNLIMITED' && user.images_used >= user.images_limit) {
            return res.status(403).json({
                success: false,
                error: 'Usage limit exceeded',
                requiresUpgrade: true,
                currentPlan: user.plan
            });
        }
        
        if (!imageFile || !prompt) {
            return res.status(400).json({ 
                success: false,
                error: 'Image and prompt required' 
            });
        }
        
        console.log(`Processing for user ${user.email}:`, { 
            prompt: prompt.substring(0, 50) + '...', 
            plan: user.plan,
            usage: `${user.images_used}/${user.images_limit}`
        });
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // TODO: Replace with actual Gemini API call
        const result = {
            success: true,
            imageUrl: `https://picsum.photos/500/600?random=${Date.now()}`,
            originalPrompt: prompt,
            processingTime: '3.2s',
            message: 'AI generation completed successfully!'
        };
        
        // Update usage count
        await supabase
            .from('users')
            .update({ images_used: user.images_used + 1 })
            .eq('id', user.id);
        
        // Add generation history
        await supabase.from('generations').insert({
            user_id: user.id,
            prompt,
            image_url: result.imageUrl,
            created_at: new Date().toISOString()
        });
        
        res.json({
            ...result,
            remainingImages: user.plan === 'UNLIMITED' ? -1 : (user.images_limit - user.images_used - 1)
        });
        
        // Clean up
        setTimeout(() => {
            if (fs.existsSync(imageFile.path)) {
                fs.unlinkSync(imageFile.path);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Generation failed',
            details: error.message 
        });
    }
});

// Create Payment Order
app.post('/payment/create-order', authenticateToken, async (req, res) => {
    try {
        const { planName } = req.body;
        const plan = PLANS[planName];
        
        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan' });
        }
        
        const order = await razorpay.orders.create({
            amount: plan.price * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                userId: req.user.id,
                planName
            }
        });
        
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment and Upgrade Plan
app.post('/payment/verify', authenticateToken, async (req, res) => {
    try {
        const { orderId, paymentId, signature, planName } = req.body;
        const plan = PLANS[planName];
        
        // Verify payment signature (simplified)
        // In production, properly verify using Razorpay webhook
        
        // Update user plan
        await supabase
            .from('users')
            .update({
                plan: planName,
                images_limit: plan.images,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id);
        
        // Record payment
        await supabase.from('payments').insert({
            user_id: req.user.id,
            order_id: orderId,
            payment_id: paymentId,
            amount: plan.price,
            plan: planName,
            status: 'completed',
            created_at: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: `Successfully upgraded to ${plan.name} plan!`,
            newPlan: planName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile
app.get('/user/profile', authenticateToken, async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Get Pricing Plans
app.get('/plans', (req, res) => {
    res.json({
        success: true,
        plans: PLANS
    });
});

// Simple Generate Endpoint (No Auth Required - For Testing)
app.post('/generate-simple', upload.single('image'), async (req, res) => {
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        const { prompt } = req.body;
        const imageFile = req.file;
        
        console.log('Simple generation request:', { 
            prompt: prompt?.substring(0, 50) + '...', 
            hasFile: !!imageFile,
            fileSize: imageFile?.size,
            geminiKey: GEMINI_API_KEY ? 'Present' : 'Missing'
        });
        
        if (!imageFile || !prompt) {
            return res.status(400).json({ 
                success: false,
                error: 'Image and prompt required' 
            });
        }
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // TODO: Replace with actual Gemini API call
        // if (GEMINI_API_KEY) {
        //     const geminiResult = await callGeminiAPI(imageFile, prompt);
        //     return res.json(geminiResult);
        // }
        
        // Mock response for testing
        const result = {
            success: true,
            imageUrl: `https://picsum.photos/500/600?random=${Date.now()}`,
            originalPrompt: prompt,
            processingTime: '2.1s',
            message: 'AI generation completed successfully! (Demo mode)'
        };
        
        res.json(result);
        
        // Clean up uploaded file
        if (imageFile && fs.existsSync(imageFile.path)) {
            setTimeout(() => {
                try {
                    fs.unlinkSync(imageFile.path);
                } catch (err) {
                    console.log('Cleanup error:', err.message);
                }
            }, 5000);
        }
        
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Generation failed',
            details: error.message 
        });
    }
});

// Handle OPTIONS requests
app.options('/generate-simple', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// TODO: Implement Gemini Nano API Integration
async function callGeminiNanoAPI(imagePath, prompt, apiKey) {
    // This is where you'll integrate with Google Gemini Nano
    // Example structure:
    /*
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-nano:generateContent', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt,
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64ImageData
                    }
                }]
            }]
        })
    });
    
    return await response.json();
    */
    
    throw new Error('Gemini Nano integration not implemented yet');
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        apiKeyConfigured: !!GEMINI_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Glow API Server running on port ${PORT}`);
    console.log(`📝 API Key configured: ${!!GEMINI_API_KEY}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
});

module.exports = app;
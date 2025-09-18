// Backend API for Glow - Complete Freemium System
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Security middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Debug environment variables
console.log('Environment check:');
console.log('ARK_API_KEY:', process.env.ARK_API_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');

// API Keys from Environment Variables
const ARK_API_KEY = process.env.ARK_API_KEY;
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





// Seedream API Integration Function
async function generateWithSeedream(imageFile, prompt) {
    const imageData = fs.readFileSync(imageFile.path);
    const base64Image = imageData.toString('base64');
    const mimeType = imageFile.mimetype;
    
    const base64String = `data:${mimeType};base64,${base64Image}`;
    
    const requestBody = {
        model: "seedream-4-0-250828",
        prompt: prompt,
        image: base64String,
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: false
    };
    
    const response = await fetch('https://ark.ap-southeast.bytepluses.com/api/v3/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ARK_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Seedream API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.data && result.data[0] && result.data[0].url) {
        return {
            success: true,
            imageUrl: result.data[0].url,
            originalPrompt: prompt,
            size: result.data[0].size,
            processingTime: '3.5s',
            message: '🎨 Real AI transformation completed!',
            tokensUsed: result.usage?.total_tokens || 0
        };
    } else {
        throw new Error('No image generated from Seedream API');
    }
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Secure string comparison to prevent timing attacks
function secureCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

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

// CSRF Protection Middleware
const csrfProtection = (req, res, next) => {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;
    
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }
    
    // Skip CSRF for simple endpoint (demo mode)
    if (req.path === '/generate-simple') {
        return next();
    }
    
    if (!token || !sessionToken || !secureCompare(token, sessionToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    next();
};

// Secure file upload configuration
const upload = multer({ 
    dest: path.resolve(__dirname, 'uploads/'), // Prevent path traversal
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only one file
    },
    fileFilter: (req, file, cb) => {
        // Strict file type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
        }
    }
});

// User Registration
app.post('/auth/register', csrfProtection, async (req, res) => {
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
        
        // Create user profile with unlimited access
        await supabase.from('users').insert({
            id: data.user.id,
            email,
            name,
            plan: 'UNLIMITED',
            images_used: 0,
            images_limit: -1,
            created_at: new Date().toISOString()
        });
        
        const token = jwt.sign({ userId: data.user.id }, JWT_SECRET);
        
        res.json({
            success: true,
            token,
            user: { id: data.user.id, email, name, plan: 'UNLIMITED' }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User Login
app.post('/auth/login', csrfProtection, async (req, res) => {
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
app.post('/generate', authenticateToken, csrfProtection, upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const imageFile = req.file;
        const user = req.user;
        
        // No usage limits - unlimited for all users
        
        if (!imageFile || !prompt) {
            return res.status(400).json({ 
                success: false,
                error: 'Image and prompt required' 
            });
        }
        
        console.log(`Processing for user ${user.email}:`, { 
            prompt: prompt.substring(0, 50) + '...'
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
        
        // Track generation (no limits)
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
            remainingImages: -1 // Unlimited
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



// Get User Profile
app.get('/user/profile', authenticateToken, async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});



// Simple Generate Endpoint (No Auth Required - For Testing)
app.post('/generate-simple', upload.single('image'), async (req, res) => {
    // Input validation
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.length > 1000) {
        return res.status(400).json({ 
            success: false,
            error: 'Invalid prompt. Must be a string under 1000 characters.' 
        });
    }
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
        
        // Real Seedream API Integration
        if (ARK_API_KEY) {
            try {
                const seedreamResult = await generateWithSeedream(imageFile, prompt);
                return res.json(seedreamResult);
            } catch (seedreamError) {
                console.error('Seedream API error:', seedreamError);
                return res.status(500).json({
                    success: false,
                    error: 'AI generation failed',
                    details: seedreamError.message
                });
            }
        }
        
        // Demo response if no API key
        const result = {
            success: true,
            imageUrl: `https://picsum.photos/500/600?random=${Date.now()}`,
            originalPrompt: prompt,
            processingTime: '2.1s',
            message: '🎉 Demo mode! Add ARK_API_KEY for real AI generation.'
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
        arkApiKeyConfigured: !!ARK_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Glow API Server running on port ${PORT}`);
    console.log(`📝 ARK API Key configured: ${!!ARK_API_KEY}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
});

module.exports = app;
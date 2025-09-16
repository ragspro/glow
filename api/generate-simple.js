// Simple Generate API Endpoint for Vercel
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Handle file upload
        await new Promise((resolve, reject) => {
            upload.single('image')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        const { prompt } = req.body;
        const imageFile = req.file;
        
        console.log('Generation request:', {
            hasPrompt: !!prompt,
            hasFile: !!imageFile,
            promptLength: prompt?.length || 0
        });
        
        if (!prompt) {
            return res.status(400).json({ 
                success: false,
                error: 'Prompt is required' 
            });
        }
        
        if (!imageFile) {
            return res.status(400).json({ 
                success: false,
                error: 'Image file is required' 
            });
        }
        
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate demo response
        const randomId = Math.floor(Math.random() * 1000);
        const result = {
            success: true,
            imageUrl: `https://picsum.photos/500/600?random=${randomId}`,
            originalPrompt: prompt.substring(0, 100) + '...',
            processingTime: '1.5s',
            message: 'Demo generation completed! Add Gemini API key for real AI generation.'
        };
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Server error occurred',
            details: error.message
        });
    }
};
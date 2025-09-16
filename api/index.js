// Main API handler for Vercel
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Generate endpoint
app.post('/generate-simple', upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const imageFile = req.file;
        
        console.log('Generation request:', {
            hasPrompt: !!prompt,
            hasFile: !!imageFile
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
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo response
        const randomId = Math.floor(Math.random() * 1000);
        const result = {
            success: true,
            imageUrl: `https://picsum.photos/500/600?random=${randomId}`,
            originalPrompt: prompt.substring(0, 100) + '...',
            processingTime: '1.5s',
            message: 'Demo generation completed!'
        };
        
        return res.json(result);
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Server error occurred'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
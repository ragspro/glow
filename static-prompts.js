// Static prompts data for immediate loading - Organized by categories
window.staticPrompts = [
    // FREE PROMPTS (3)
    {
        title: "Viral Instagram Post Creator",
        prompt: "Create a viral Instagram post about [topic]. Include: Eye-catching hook in first line, 3-5 engaging bullet points, relevant emojis, trending hashtags, call-to-action. Make it shareable and comment-worthy.",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop",
        category: "social-media",
        isPremium: false,
        trending: true,
        aiTool: "ChatGPT/Gemini"
    },
    {
        title: "YouTube Thumbnail Text",
        prompt: "Generate viral YouTube thumbnail text for [video topic]. Create 3-5 word phrases that are: Bold, curiosity-driven, emotion-triggering, easy to read. Include power words like 'SECRET', 'SHOCKING', 'INSTANT'.",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=500&fit=crop",
        category: "youtube",
        isPremium: false,
        trending: true,
        aiTool: "ChatGPT/Gemini"
    },
    {
        title: "Viral Ad Copy Generator",
        prompt: "Write viral ad copy for [product/service]. Structure: Attention-grabbing headline, pain point identification, solution presentation, social proof, urgency creator, clear CTA. Keep under 150 words, highly persuasive.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
        category: "advertising",
        isPremium: false,
        trending: true,
        aiTool: "ChatGPT/Gemini"
    },
    
    // PREMIUM PROMPTS - CHATGPT/GEMINI TEXT PROMPTS
    {
        title: "Viral TikTok Script Writer",
        prompt: "Create a viral TikTok script for [topic]. Include: Hook in first 3 seconds, trending audio suggestions, visual cues, engagement triggers, hashtag strategy. Format: Scene-by-scene breakdown with timing.",
        image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=500&fit=crop",
        category: "tiktok",
        isPremium: true,
        trending: false,
        aiTool: "ChatGPT/Gemini"
    },
    {
        title: "Email Marketing Sequence",
        prompt: "Write a 5-email viral marketing sequence for [product]. Each email: Compelling subject line, story-driven content, value delivery, soft pitch, clear CTA. Progressive trust building, urgency creation.",
        image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=500&fit=crop",
        category: "email-marketing",
        isPremium: true,
        trending: false,
        aiTool: "ChatGPT/Gemini"
    },
    {
        title: "Viral LinkedIn Post",
        prompt: "Create viral LinkedIn post about [professional topic]. Structure: Personal story/experience, lesson learned, actionable insights, question for engagement. Professional tone, 1300 characters max.",
        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=500&fit=crop",
        category: "linkedin",
        isPremium: true,
        trending: false,
        aiTool: "ChatGPT/Gemini"
    },
    {
        title: "Product Launch Copy",
        prompt: "Write viral product launch copy for [product]. Include: Problem agitation, solution reveal, unique selling proposition, social proof, limited-time offer, FOMO creation, multiple CTAs.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
        category: "product-launch",
        isPremium: true,
        trending: false,
        aiTool: "ChatGPT/Gemini"
    },
    
    // PREMIUM PROMPTS - IMAGE GENERATION
    {
        title: "Viral Meme Template",
        prompt: "Create viral meme image: [subject] with exaggerated facial expression, bold text overlay, high contrast colors, trending meme format, shareable design, social media optimized dimensions",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
        category: "meme",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney/DALL-E"
    },
    {
        title: "Instagram Story Ad",
        prompt: "Design Instagram story ad for [product]: Vertical 9:16 format, eye-catching visuals, minimal text, clear product focus, swipe-up CTA, brand colors, mobile-optimized",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop",
        category: "instagram-ads",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney/DALL-E"
    },
    {
        title: "YouTube Thumbnail Design",
        prompt: "Create viral YouTube thumbnail: Shocked face expression, bright colors (red/yellow), bold text overlay, arrow pointing, high contrast, clickbait style, 1280x720 resolution",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=500&fit=crop",
        category: "youtube-thumbnail",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney/DALL-E"
    },
    {
        title: "Facebook Ad Creative",
        prompt: "Design Facebook ad image: Product showcase, lifestyle context, emotional appeal, clear value proposition, minimal text, square 1:1 format, scroll-stopping visual",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
        category: "facebook-ads",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney/DALL-E"
    },
    {
        title: "Viral Infographic",
        prompt: "Create viral infographic about [topic]: Clean layout, data visualization, bold typography, brand colors, shareable format, mobile-friendly, statistics-driven",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop",
        category: "infographic",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney/DALL-E"
    },
    {
        title: "Product Mockup Creator",
        prompt: "Generate product mockup: [product] in realistic environment, professional lighting, lifestyle context, clean background, commercial photography style, high-end presentation",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
        category: "product-mockup",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney/DALL-E"
    }
];

// Categories for filtering
window.promptCategories = {
    'social-media': '📱 Social Media',
    'youtube': '🎥 YouTube',
    'advertising': '📢 Advertising',
    'tiktok': '🎵 TikTok',
    'email-marketing': '📧 Email Marketing',
    'linkedin': '💼 LinkedIn',
    'product-launch': '🚀 Product Launch',
    'meme': '😂 Memes',
    'instagram-ads': '📸 Instagram Ads',
    'youtube-thumbnail': '🖼️ YouTube Thumbnails',
    'facebook-ads': '👥 Facebook Ads',
    'infographic': '📊 Infographics',
    'product-mockup': '📦 Product Mockups'
};
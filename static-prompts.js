// Static prompts data for immediate loading - Organized by categories
window.staticPrompts = [
    // FREE PROMPTS (3)
    {
        title: "Viral Instagram Post Creator",
        prompt: "Create a viral Instagram post about [topic]. Include: Eye-catching hook in first line, 3-5 engaging bullet points, relevant emojis, trending hashtags, call-to-action. Make it shareable and comment-worthy.",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop",
        category: "chatgpt",
        isPremium: false,
        trending: true,
        aiTool: "ChatGPT"
    },
    {
        title: "YouTube Thumbnail Text",
        prompt: "Generate viral YouTube thumbnail text for [video topic]. Create 3-5 word phrases that are: Bold, curiosity-driven, emotion-triggering, easy to read. Include power words like 'SECRET', 'SHOCKING', 'INSTANT'.",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=500&fit=crop",
        category: "gemini",
        isPremium: false,
        trending: true,
        aiTool: "Gemini"
    },
    {
        title: "Viral Ad Copy Generator",
        prompt: "Write viral ad copy for [product/service]. Structure: Attention-grabbing headline, pain point identification, solution presentation, social proof, urgency creator, clear CTA. Keep under 150 words, highly persuasive.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
        category: "chatgpt",
        isPremium: false,
        trending: true,
        aiTool: "ChatGPT"
    },
    
    // PREMIUM PROMPTS - CHATGPT/GEMINI TEXT PROMPTS
    {
        title: "Viral TikTok Script Writer",
        prompt: "Create a viral TikTok script for [topic]. Include: Hook in first 3 seconds, trending audio suggestions, visual cues, engagement triggers, hashtag strategy. Format: Scene-by-scene breakdown with timing.",
        image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=500&fit=crop",
        category: "chatgpt",
        isPremium: true,
        trending: false,
        aiTool: "ChatGPT"
    },
    {
        title: "Email Marketing Sequence",
        prompt: "Write a 5-email viral marketing sequence for [product]. Each email: Compelling subject line, story-driven content, value delivery, soft pitch, clear CTA. Progressive trust building, urgency creation.",
        image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=500&fit=crop",
        category: "gemini",
        isPremium: true,
        trending: false,
        aiTool: "Gemini"
    },
    {
        title: "Viral LinkedIn Post",
        prompt: "Create viral LinkedIn post about [professional topic]. Structure: Personal story/experience, lesson learned, actionable insights, question for engagement. Professional tone, 1300 characters max.",
        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=500&fit=crop",
        category: "chatgpt",
        isPremium: true,
        trending: false,
        aiTool: "ChatGPT"
    },
    {
        title: "Product Launch Copy",
        prompt: "Write viral product launch copy for [product]. Include: Problem agitation, solution reveal, unique selling proposition, social proof, limited-time offer, FOMO creation, multiple CTAs.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
        category: "gemini",
        isPremium: true,
        trending: false,
        aiTool: "Gemini"
    },
    
    // PREMIUM PROMPTS - IMAGE GENERATION
    {
        title: "Viral Meme Template",
        prompt: "Create viral meme image: [subject] with exaggerated facial expression, bold text overlay, high contrast colors, trending meme format, shareable design, social media optimized dimensions",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop",
        category: "midjourney",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney"
    },
    {
        title: "Instagram Story Ad",
        prompt: "Design Instagram story ad for [product]: Vertical 9:16 format, eye-catching visuals, minimal text, clear product focus, swipe-up CTA, brand colors, mobile-optimized",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop",
        category: "midjourney",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney"
    },
    {
        title: "YouTube Thumbnail Design",
        prompt: "Create viral YouTube thumbnail: Shocked face expression, bright colors (red/yellow), bold text overlay, arrow pointing, high contrast, clickbait style, 1280x720 resolution",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=500&fit=crop",
        category: "midjourney",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney"
    },
    {
        title: "Facebook Ad Creative",
        prompt: "Design Facebook ad image: Product showcase, lifestyle context, emotional appeal, clear value proposition, minimal text, square 1:1 format, scroll-stopping visual",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
        category: "midjourney",
        isPremium: true,
        trending: false,
        aiTool: "Midjourney"
    },
    {
        title: "Viral Video Script",
        prompt: "Create viral video script for [topic]: Hook in first 5 seconds, engaging storyline, emotional peaks, clear call-to-action, optimized for social media platforms, 60-90 seconds duration",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop",
        category: "veo",
        isPremium: true,
        trending: false,
        aiTool: "Veo"
    },
    {
        title: "Product Demo Video",
        prompt: "Generate product demo video: [product] showcase with smooth transitions, professional lighting, clear product benefits, engaging background music, call-to-action overlay, mobile-optimized format",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
        category: "veo",
        isPremium: true,
        trending: false,
        aiTool: "Veo"
    }
];

// AI Tools for filtering
window.promptCategories = {
    'chatgpt': '🤖 ChatGPT',
    'gemini': '💎 Gemini',
    'midjourney': '🎨 Midjourney',
    'veo': '📹 Veo'
};
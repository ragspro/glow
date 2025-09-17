-- Glow Prompt Hub Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Google OAuth in Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Enable Google provider
-- 3. Add your Google OAuth credentials

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    plan TEXT DEFAULT 'UNLIMITED',
    images_used INTEGER DEFAULT 0,
    images_limit INTEGER DEFAULT -1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts table for storing viral prompts
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'general',
    is_trending BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    copies INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User prompt interactions
CREATE TABLE IF NOT EXISTS public.user_prompt_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    prompt_id UUID REFERENCES public.prompts(id),
    action TEXT NOT NULL, -- 'view', 'copy', 'favorite'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample viral prompts
INSERT INTO public.prompts (title, prompt, image_url, category, is_trending, is_premium) VALUES
('Cyberpunk Portrait', 'Professional headshot with cyberpunk aesthetic, neon blue and pink lighting, futuristic makeup, glowing eyes, dark urban background, high contrast, cinematic lighting', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=500&fit=crop', 'portrait', true, false),
('Vintage 1970s Style', 'Vintage 1970s portrait with retro clothing, warm faded colors, soft film grain effect, nostalgic vibes, analog photography aesthetic', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop', 'vintage', true, false),
('Professional Headshot', 'Corporate headshot with sharp business attire, neutral office background, bright flattering lighting, LinkedIn style, professional photography', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop', 'professional', true, false),
('Anime Style Portrait', 'Transform into anime character, large expressive eyes, colorful hair, Japanese animation style, Studio Ghibli inspired, soft cel shading', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop', 'anime', false, true),
('Renaissance Painting', 'Classical Renaissance portrait painting style, oil painting texture, dramatic chiaroscuro lighting, ornate period clothing, museum quality', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=500&fit=crop', 'art', false, true),
('Superhero Comic Style', 'Comic book superhero style, bold colors, dynamic pose, cape flowing, city skyline background, Marvel/DC aesthetic, heroic lighting', 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=500&fit=crop', 'comic', false, true),
('Bollywood Glamour', 'Bollywood movie poster style, dramatic lighting, ornate Indian clothing, jewelry, vibrant colors, cinematic composition', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop', 'bollywood', false, true),
('Steampunk Victorian', 'Steampunk Victorian era portrait, brass goggles, mechanical accessories, vintage clothing, sepia tones, industrial background', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=500&fit=crop', 'steampunk', false, true),
('Minimalist Black & White', 'Minimalist black and white portrait, clean composition, dramatic shadows, high contrast, artistic photography style', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop', 'minimalist', false, true),
('Fantasy Elf Character', 'Fantasy elf character, pointed ears, magical forest background, ethereal lighting, fantasy RPG game style, mystical atmosphere', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop', 'fantasy', false, true);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prompt_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Everyone can view prompts
CREATE POLICY "Anyone can view prompts" ON public.prompts
    FOR SELECT USING (true);

-- Only authenticated users can interact with prompts
CREATE POLICY "Authenticated users can interact" ON public.user_prompt_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update prompt stats
CREATE OR REPLACE FUNCTION public.increment_prompt_stat(prompt_uuid UUID, stat_type TEXT)
RETURNS void AS $$
BEGIN
    IF stat_type = 'view' THEN
        UPDATE public.prompts SET views = views + 1 WHERE id = prompt_uuid;
    ELSIF stat_type = 'copy' THEN
        UPDATE public.prompts SET copies = copies + 1 WHERE id = prompt_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
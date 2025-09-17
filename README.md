# 🌟 Glow AI - Viral AI Looks Generator

A complete freemium AI image generation platform with authentication, payment integration, and 30+ professional prompts.

## ✨ Features

- 🎨 **30+ AI Prompts** - Professional, Cinematic, Bollywood, Figurine styles
- 🔐 **Authentication System** - Secure login/register with Supabase
- 🆓 **Completely Free** - Unlimited AI generations for all users
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Generation** - Gemini AI integration
- 🎯 **Usage Tracking** - Per-user limits and analytics

## 🚀 Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/ragspro/glow.git
cd glow
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env
# Add your API keys to .env file
```

4. **Setup Database**
- Run `supabase-schema.sql` in your Supabase SQL Editor

5. **Start Development Server**
```bash
npm start
```

## 🔑 Required API Keys

- **Gemini AI**: https://makersuite.google.com/app/apikey
- **Supabase**: https://supabase.com (3 keys needed)


## 💰 Pricing

- **Free Forever**: Unlimited AI generations for all users

## 📁 Project Structure

```
glow/
├── index.html          # Main landing page
├── gallery.html        # 30+ AI prompts gallery
├── auth.html          # Login/Register page
├── pricing.html       # Payment plans
├── server.js          # Backend API with freemium logic
├── prompts.js         # 30+ professional AI prompts
├── style.css          # Glassmorphism design
└── deployment-guide.md # Complete setup guide
```

## 🌐 Deployment

Deploy to any platform:
- **Vercel** (Recommended)
- **Railway**
- **DigitalOcean App Platform**

See `deployment-guide.md` for detailed instructions.

## 🎯 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

- **AI**: Google Gemini

## 📊 Features Overview

### Authentication Flow
1. User registers → Gets unlimited generations
2. Generate unlimited images immediately

### AI Generation
1. Upload photo
2. Select/write prompt
3. Generate with Gemini AI
4. Download result

## 🔧 Configuration

All configuration is done via environment variables in `.env`:

```env
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

JWT_SECRET=your_jwt_secret
```

## 📱 Pages

- **Landing Page** - Hero, trending prompts, upload system
- **Gallery** - 30+ professional AI prompts with copy/use functionality
- **Authentication** - Login/register with social options
- **Pricing** - Information page (all features free)

## 🎨 Design

- **Glassmorphism** - Modern glass-like UI elements
- **Neon Gradients** - Vibrant color schemes
- **Responsive** - Mobile-first design
- **Animations** - Smooth transitions and effects

## 🚀 Ready to Launch!

Complete free AI platform ready for production with:
- ✅ User authentication

- ✅ Usage tracking
- ✅ Professional UI
- ✅ 30+ AI prompts
- ✅ Mobile responsive

---

**Built with ❤️ for viral AI content creation**
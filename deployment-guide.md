# 🚀 Glow AI Deployment Guide

## 📋 Complete Setup Checklist

### 1. 🔑 API Keys Setup

#### **Gemini API Key**
- Visit: https://makersuite.google.com/app/apikey
- Create new API key
- Add to `.env`: `GEMINI_API_KEY=your_key_here`

#### **Supabase Setup**
- Visit: https://supabase.com
- Create new project
- Go to Settings → API
- Copy these keys to `.env`:
  ```
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_KEY=your_service_key
  ```
- Run `supabase-schema.sql` in SQL Editor

#### **Razorpay Setup**
- Visit: https://dashboard.razorpay.com
- Go to Settings → API Keys
- Add to `.env`:
  ```
  RAZORPAY_KEY_ID=rzp_test_your_key
  RAZORPAY_KEY_SECRET=your_secret
  ```
- Update `pricing.js` line 31 with your Razorpay key

### 2. 💻 Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:8080
```

### 3. 🌐 Deploy to glow.ragspro.com

#### **Option A: Using Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

#### **Option B: Using Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway deploy
```

#### **Option C: Using DigitalOcean App Platform**
- Connect GitHub repo
- Add environment variables
- Deploy automatically

### 4. 🔧 Environment Variables

Create `.env` file with:
```env
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET=your-super-secret-jwt-key
PORT=8080
NODE_ENV=production
```

### 5. 📊 Freemium System Features

#### **Free Plan (3 images)**
- User registers → Gets 3 free generations
- After 3 images → Redirect to pricing page

#### **Paid Plans**
- **Basic**: ₹200 → 10 images
- **Pro**: ₹499 → 50 images  
- **Unlimited**: ₹1000 → Unlimited images

#### **Payment Flow**
1. User clicks upgrade
2. Razorpay payment gateway
3. Payment success → Plan upgraded
4. User can generate more images

### 6. 🗄️ Database Tables

#### **Users Table**
- id, email, name, plan, images_used, images_limit

#### **Generations Table**  
- user_id, prompt, image_url, created_at

#### **Payments Table**
- user_id, order_id, payment_id, amount, plan, status

### 7. 🔐 Authentication Flow

1. **Register/Login** → `auth.html`
2. **JWT Token** stored in localStorage
3. **Protected Routes** require authentication
4. **Usage Tracking** per user

### 8. 🎨 Frontend Pages

- `index.html` - Main landing page
- `gallery.html` - 30+ AI prompts
- `auth.html` - Login/Register
- `pricing.html` - Payment plans

### 9. 🚀 Production Checklist

- [ ] All API keys added to `.env`
- [ ] Supabase database schema created
- [ ] Razorpay webhook configured
- [ ] Domain pointed to deployment
- [ ] SSL certificate enabled
- [ ] Environment variables set in hosting platform

### 10. 📱 Testing

1. **Register new user** → Should get 3 free images
2. **Generate 3 images** → Should prompt for upgrade
3. **Purchase plan** → Should unlock more images
4. **Generate more images** → Should work after payment

## 🎯 Ready to Launch!

Your complete freemium AI image generation platform is ready with:
- ✅ Authentication system
- ✅ Payment integration  
- ✅ Usage tracking
- ✅ Professional UI
- ✅ 30+ AI prompts
- ✅ Mobile responsive

Just add your API keys and deploy! 🚀
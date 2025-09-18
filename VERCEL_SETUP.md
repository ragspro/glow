# 🚀 Vercel Environment Variables Setup

## 📋 Required Environment Variables

Go to your Vercel dashboard → Project Settings → Environment Variables

Add these exact variables:

### 🔑 **Gemini AI API Key**
```
Name: GEMINI_API_KEY
Value: [YOUR_GEMINI_API_KEY]
```

### 🗄️ **Supabase Configuration**
```
Name: SUPABASE_URL
Value: [YOUR_SUPABASE_URL]

Name: SUPABASE_ANON_KEY  
Value: [YOUR_SUPABASE_ANON_KEY]

Name: SUPABASE_SERVICE_KEY
Value: [YOUR_SUPABASE_SERVICE_KEY]
```

### 🔐 **JWT Secret**
```
Name: JWT_SECRET
Value: glow-ai-super-secret-jwt-key-2024
```

### ⚙️ **Server Configuration**
```
Name: NODE_ENV
Value: production
```

## 🔄 After Adding Variables:

1. **Redeploy** your project in Vercel
2. **Test** image generation on glow.ragspro.com
3. **Check** Vercel function logs for errors

## 🧪 Testing Steps:

1. Go to glow.ragspro.com
2. Upload an image
3. Enter a prompt
4. Click "Generate Now"
5. Should work with real Gemini AI!

## 🔍 Troubleshooting:

- **Check Vercel Function Logs** for errors
- **Verify Environment Variables** are set correctly
- **Redeploy** after adding variables
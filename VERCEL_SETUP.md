# 🚀 Vercel Environment Variables Setup

## 📋 Required Environment Variables

Go to your Vercel dashboard → Project Settings → Environment Variables

Add these exact variables:

### 🔑 **Gemini AI API Key**
```
Name: GEMINI_API_KEY
Value: AIzaSyADNwtbNuujiS_grE9lOqap2dUQFtZDpPs
```

### 🗄️ **Supabase Configuration**
```
Name: SUPABASE_URL
Value: https://xmponioxmzfftfrowcrf.supabase.co

Name: SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcG9uaW94bXpmZnRmcm93Y3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTg1NTQsImV4cCI6MjA3MzU5NDU1NH0.sFIGvTn6q69Z8D2lSW-f0SYRmE2AgLB2Y1ZVm2g0dj4

Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcG9uaW94bXpmZnRmcm93Y3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAxODU1NCwiZXhwIjoyMDczNTk0NTU0fQ.GU5BMjYkAygir-GbVbjZsLHgU7inrhUmAuD1q66B5DM
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
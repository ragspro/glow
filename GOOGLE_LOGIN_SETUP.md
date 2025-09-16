# 🔐 Google Login Setup Guide

## 📋 Supabase Google OAuth Configuration

### 1. **Supabase Dashboard Setup**

Go to your Supabase project: https://supabase.com/dashboard/project/xmponioxmzfftfrowcrf

#### **Authentication Settings:**
1. Go to **Authentication** → **Settings** → **Auth Providers**
2. Find **Google** provider
3. Enable Google OAuth

#### **Google OAuth Configuration:**
```
Client ID: [Get from Google Console]
Client Secret: [Get from Google Console]
```

### 2. **Google Cloud Console Setup**

#### **Create Google OAuth App:**
1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**

#### **OAuth Client Configuration:**
```
Application Type: Web Application
Name: Glow AI App

Authorized JavaScript Origins:
- https://glow.ragspro.com
- http://localhost:3000 (for testing)

Authorized Redirect URIs:
- https://xmponioxmzfftfrowcrf.supabase.co/auth/v1/callback
- https://glow.ragspro.com/auth-callback.html
```

### 3. **Required URLs for Google Console**

#### **Authorized Origins:**
```
https://glow.ragspro.com
https://xmponioxmzfftfrowcrf.supabase.co
```

#### **Redirect URIs:**
```
https://xmponioxmzfftfrowcrf.supabase.co/auth/v1/callback
https://glow.ragspro.com/auth-callback.html
```

### 4. **Supabase Configuration**

After getting Google Client ID and Secret:

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **Google Provider Settings:**
   ```
   Client ID: [Your Google Client ID]
   Client Secret: [Your Google Client Secret]
   ```

### 5. **Site URL Configuration**

In Supabase Authentication Settings:
```
Site URL: https://glow.ragspro.com
Additional Redirect URLs:
- https://glow.ragspro.com/auth-callback.html
- https://glow.ragspro.com/
```

## ✅ **Features Added:**

### **Profile Dropdown:**
- ✅ User avatar (from Google or generated)
- ✅ Name and email display
- ✅ Current plan badge (FREE/BASIC/PRO/UNLIMITED)
- ✅ Usage counter (X/Y images used)
- ✅ Upgrade plan button
- ✅ Logout option

### **Google Login:**
- ✅ "Continue with Google" button
- ✅ OAuth callback handling
- ✅ Automatic user profile creation
- ✅ Avatar from Google account

## 🚀 **Testing Steps:**

1. **Setup Google OAuth** in Google Console
2. **Configure Supabase** with Google credentials
3. **Test Google Login** on glow.ragspro.com
4. **Verify Profile Dropdown** shows user info
5. **Test Logout** functionality

## 🔧 **Troubleshooting:**

- **"Redirect URI mismatch"** → Check Google Console URLs
- **"Invalid client"** → Verify Client ID/Secret in Supabase
- **Login not working** → Check browser console for errors

Your callback URL is ready: `https://xmponioxmzfftfrowcrf.supabase.co/auth/v1/callback` 🎯
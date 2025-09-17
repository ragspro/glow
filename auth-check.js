// Global authentication state manager
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabaseUrl = 'https://xmponioxmzfftfrowcrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcG9uaW94bXpmZnRmcm93Y3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTg1NTQsImV4cCI6MjA3MzU5NDU1NH0.sFIGvTn6q69Z8D2lSW-f0SYRmE2AgLB2Y1ZVm2g0dj4';
const supabase = createClient(supabaseUrl, supabaseKey);

class AuthManager {
    constructor() {
        this.user = null;
        this.init();
    }

    async init() {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth error:', error);
            return;
        }

        if (session) {
            this.user = session.user;
            console.log('User already logged in:', this.user);
            this.updateGlobalUI();
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Global auth state change:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
                this.user = session.user;
                this.updateGlobalUI();
                this.showNotification('✅ Successfully logged in!', 'success');
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.updateGlobalUI();
                this.showNotification('👋 Logged out successfully', 'info');
            }
        });
    }

    updateGlobalUI() {
        // Update header UI across all pages
        const loginBtns = document.querySelectorAll('#login-header-btn, #login-btn, #gallery-login-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        const userName = document.getElementById('user-name');
        const avatar = document.querySelector('.avatar');

        if (this.user) {
            // Hide login buttons
            loginBtns.forEach(btn => {
                if (btn) btn.style.display = 'none';
            });

            // Show profile dropdown
            if (profileDropdown) {
                profileDropdown.style.display = 'block';
            }

            // Update user name
            if (userName) {
                userName.textContent = this.user.user_metadata.name || this.user.email.split('@')[0];
            }

            // Update avatar
            if (avatar && this.user.user_metadata.avatar_url) {
                avatar.style.backgroundImage = `url(${this.user.user_metadata.avatar_url})`;
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
            }

            // Update auth status if on gallery page
            const authStatus = document.getElementById('auth-status');
            if (authStatus) {
                authStatus.innerHTML = `
                    <div class="premium-status">
                        <span class="premium-badge">PREMIUM</span>
                        <span>Welcome ${this.user.user_metadata.name || this.user.email.split('@')[0]}! All prompts unlocked</span>
                    </div>
                `;
            }

        } else {
            // Show login buttons
            loginBtns.forEach(btn => {
                if (btn) btn.style.display = 'block';
            });

            // Hide profile dropdown
            if (profileDropdown) {
                profileDropdown.style.display = 'none';
            }

            // Update auth status if on gallery page
            const authStatus = document.getElementById('auth-status');
            if (authStatus) {
                authStatus.innerHTML = `
                    <div class="free-prompts-info">
                        <span class="free-badge">FREE</span>
                        <span>3 prompts available • <button class="login-btn" id="gallery-login-btn">Login for 15+ prompts</button></span>
                    </div>
                `;
            }
        }
    }

    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'https://glow.ragspro.com/gallery.html'
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('❌ Login failed: ' + error.message, 'error');
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('❌ Logout failed: ' + error.message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            color: white;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-size: 14px;
        `;
        
        if (type === 'success') {
            notification.style.borderColor = '#22c55e';
        } else if (type === 'error') {
            notification.style.borderColor = '#ef4444';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    isAuthenticated() {
        return !!this.user;
    }

    getUser() {
        return this.user;
    }
}

// Initialize global auth manager
const authManager = new AuthManager();

// Export for global use
window.authManager = authManager;
window.supabase = supabase;
// Supabase Authentication System
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmponioxmzfftfrowcrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcG9uaW94bXpmZnRmcm93Y3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTg1NTQsImV4cCI6MjA3MzU5NDU1NH0.sFIGvTn6q69Z8D2lSW-f0SYRmE2AgLB2Y1ZVm2g0dj4';

const supabase = createClient(supabaseUrl, supabaseKey);

class AuthSystem {
    constructor() {
        this.user = null;
        this.init();
    }

    async init() {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.user = session.user;
            this.updateUI();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.user = session.user;
                this.updateUI();
                this.showNotification('Successfully logged in!', 'success');
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.updateUI();
                this.showNotification('Logged out successfully', 'info');
            }
        });
    }

    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/gallery.html'
                }
            });
            
            if (error) throw error;
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed: ' + error.message, 'error');
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed: ' + error.message, 'error');
        }
    }

    isAuthenticated() {
        return !!this.user;
    }

    updateUI() {
        // Update login buttons
        const loginBtns = document.querySelectorAll('#login-btn, #google-login-btn, #final-login-btn');
        const authStatus = document.getElementById('auth-status');
        
        if (this.isAuthenticated()) {
            loginBtns.forEach(btn => {
                if (btn) {
                    btn.textContent = `👋 ${this.user.user_metadata.name || 'User'} | Logout`;
                    btn.onclick = () => this.signOut();
                }
            });
            
            if (authStatus) {
                authStatus.innerHTML = `
                    <div class="logged-in-info">
                        <span class="premium-badge">PREMIUM</span>
                        <span>Welcome ${this.user.user_metadata.name}! • Access to all 500+ prompts</span>
                    </div>
                `;
            }
        } else {
            loginBtns.forEach(btn => {
                if (btn) {
                    btn.textContent = btn.id === 'google-login-btn' ? '🚀 Login with Google - It\'s Free!' : 'Login for Full Access';
                    btn.onclick = () => this.signInWithGoogle();
                }
            });
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
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            color: var(--text-primary);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        if (type === 'success') {
            notification.style.borderColor = 'var(--neon-blue)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--neon-pink)';
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
}

// Initialize auth system
const auth = new AuthSystem();

// Export for use in other files
window.authSystem = auth;
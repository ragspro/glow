// Glow Prompt Hub - Viral Gemini Prompts with Supabase Auth
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabaseUrl = 'https://xmponioxmzfftfrowcrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcG9uaW94bXpmZnRmcm93Y3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTg1NTQsImV4cCI6MjA3MzU5NDU1NH0.sFIGvTn6q69Z8D2lSW-f0SYRmE2AgLB2Y1ZVm2g0dj4';
const supabase = createClient(supabaseUrl, supabaseKey);

class PromptHub {
    constructor() {
        this.user = null;
        this.freePromptLimit = 3;
        this.init();
    }

    async init() {
        // Initialize with proper auth check
        this.initializeAuth();

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Gallery: Auth state changed:', event, session);
            if (event === 'SIGNED_IN') {
                this.user = session.user;
                console.log('User signed in, updating UI');
                this.updateHeaderUI();
                this.updateAuthStatus();
                // Force re-render prompts to remove locks
                setTimeout(() => {
                    this.renderPrompts();
                }, 100);
                this.showToast('Welcome! All prompts unlocked');
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.updateHeaderUI();
                this.renderPrompts();
                this.updateAuthStatus();
                this.showToast('Logged out');
            }
        });

        this.setupEventListeners();
        this.setupHeaderAuth();
        this.handleURLFilter();
    }
    
    async initializeAuth() {
        try {
            // Check current session first
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this.user = session.user;
                console.log('Gallery: User found in session:', this.user);
            }
            
            // Also check global auth manager
            if (window.authManager && window.authManager.getUser()) {
                this.user = window.authManager.getUser();
                console.log('Gallery: User found in authManager:', this.user);
            }
            
            // Update UI immediately
            this.updateHeaderUI();
            this.updateAuthStatus();
            this.renderPrompts();
            
        } catch (error) {
            console.error('Auth initialization error:', error);
            // Fallback to no user
            this.user = null;
            this.updateHeaderUI();
            this.updateAuthStatus();
            this.renderPrompts();
        }
    }
    
    setupHeaderAuth() {
        // Setup header authentication
        const loginBtns = document.querySelectorAll('#login-header-btn, #gallery-login-btn');
        
        loginBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
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
                    this.showToast('❌ Login failed: ' + error.message);
                }
            });
        });
        
        // Profile dropdown functionality
        const profileBtn = document.getElementById('profile-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                if (dropdownMenu) dropdownMenu.style.display = 'none';
            }
        });
    }
    
    updateHeaderUI() {
        const loginHeaderBtn = document.getElementById('login-header-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        const userName = document.getElementById('user-name');
        const avatar = document.querySelector('.avatar');
        
        console.log('Gallery: Updating header UI, user:', this.user);
        
        if (this.user) {
            if (loginHeaderBtn) loginHeaderBtn.style.display = 'none';
            if (profileDropdown) profileDropdown.style.display = 'block';
            if (userName) {
                userName.textContent = this.user.user_metadata.name || this.user.email.split('@')[0];
            }
            // Update avatar with user's profile picture
            if (avatar && this.user.user_metadata.avatar_url) {
                avatar.style.backgroundImage = `url(${this.user.user_metadata.avatar_url})`;
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
            }
        } else {
            if (loginHeaderBtn) loginHeaderBtn.style.display = 'block';
            if (profileDropdown) profileDropdown.style.display = 'none';
        }
    }



    renderPrompts() {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';

        // Use static prompts data
        const allPrompts = window.staticPrompts || [];
        
        if (allPrompts.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Loading prompts...</p>';
            return;
        }
        
        console.log('Rendering prompts, user:', this.user);
        
        allPrompts.forEach((prompt, index) => {
            // If user is logged in, no prompts should be locked
            const isLocked = !this.user && prompt.isPremium;
            console.log(`Prompt ${prompt.title}: isLocked=${isLocked}, isPremium=${prompt.isPremium}, user=${!!this.user}`);
            const card = this.createPromptCard(prompt, index, isLocked);
            grid.appendChild(card);
        });
        
        // Add category filtering
        this.setupCategoryFilter();
    }

    createPromptCard(prompt, index, isLocked) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.style.cssText = `
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 15px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        card.innerHTML = `
            <div class="card-image" style="position: relative; height: 250px; overflow: hidden; border-radius: 15px;">
                <img src="${prompt.image}" alt="${prompt.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                ${isLocked ? '<div class="lock-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);"><div style="color: white; font-size: 32px;">🔒</div></div>' : ''}
                ${prompt.aiTool ? `<div class="ai-tool-badge" style="position: absolute; top: 10px; left: 10px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 6px 12px; border-radius: 15px; font-size: 11px; font-weight: 600; z-index: 10;">${prompt.aiTool}</div>` : ''}
                ${!isLocked ? '<div class="click-hint" style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 10px; font-size: 10px; opacity: 0; transition: opacity 0.3s;">Click to view</div>' : ''}
            </div>
        `;
        
        // Add click handler
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Card clicked, isLocked:', isLocked, 'user:', this.user, 'prompt:', prompt.title);
            if (isLocked) {
                this.showLoginModal();
            } else {
                this.showPromptModal(prompt);
            }
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            const img = card.querySelector('img');
            const hint = card.querySelector('.click-hint');
            if (img) img.style.transform = 'scale(1.05)';
            if (hint) hint.style.opacity = '1';
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
        });
        
        card.addEventListener('mouseleave', () => {
            const img = card.querySelector('img');
            const hint = card.querySelector('.click-hint');
            if (img) img.style.transform = 'scale(1)';
            if (hint) hint.style.opacity = '0';
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        });

        return card;
    }

    setupEventListeners() {
        // Copy prompt functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                this.copyPrompt(e.target.dataset.prompt);
            }
            
            if (e.target.classList.contains('gemini-btn')) {
                this.openInGemini(e.target.dataset.prompt);
            }
            
            if (e.target.classList.contains('unlock-btn') || e.target.id === 'login-btn') {
                this.showLoginModal();
            }
        });

        // Modal functionality
        const modal = document.getElementById('prompt-modal');
        const closeBtn = document.getElementById('modal-close');
        const copyModalBtn = document.getElementById('copy-prompt');
        const openGeminiBtn = document.getElementById('open-gemini');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (copyModalBtn) {
            copyModalBtn.addEventListener('click', () => {
                const prompt = document.getElementById('modal-prompt').value;
                this.copyPrompt(prompt);
            });
        }

        if (openGeminiBtn) {
            openGeminiBtn.addEventListener('click', () => {
                const prompt = document.getElementById('modal-prompt').value;
                this.openInGemini(prompt);
            });
        }
    }

    copyPrompt(prompt) {
        navigator.clipboard.writeText(prompt).then(() => {
            this.showToast('✅ Prompt copied! Paste in Gemini to generate image');
        }).catch(() => {
            this.showToast('❌ Failed to copy prompt');
        });
    }

    openInGemini(prompt) {
        const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`;
        window.open(geminiUrl, '_blank');
        this.showToast('🚀 Opening Gemini... Paste your image and send!');
    }

    handleURLFilter() {
        // Check if there's a filter parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        
        if (filterParam) {
            // Find and activate the corresponding filter button
            const filterBtn = document.querySelector(`[data-category="${filterParam}"]`);
            if (filterBtn) {
                filterBtn.click();
            }
        }
    }
    
    setupCategoryFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const grid = document.getElementById('gallery-grid');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'rgba(255,255,255,0.1)';
                });
                btn.classList.add('active');
                btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                
                // Filter prompts
                const category = btn.dataset.category;
                const allPrompts = window.staticPrompts || [];
                
                grid.innerHTML = '';
                
                const filteredPrompts = category === 'all' ? allPrompts : allPrompts.filter(p => p.category === category || p.aiTool?.toLowerCase().includes(category));
                
                filteredPrompts.forEach((prompt, index) => {
                    const isLocked = !this.user && prompt.isPremium;
                    const card = this.createPromptCard(prompt, index, isLocked);
                    grid.appendChild(card);
                });
            });
        });
    }
    
    showPromptModal(prompt) {
        const modal = document.createElement('div');
        modal.className = 'prompt-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
            padding: 20px;
        `;
        
        const toolUrls = {
            'ChatGPT': 'https://chat.openai.com',
            'Gemini': 'https://gemini.google.com',
            'Midjourney': 'https://discord.com/channels/@me',
            'Veo': 'https://veo.google.com'
        };
        
        modal.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 25px; max-width: 500px; width: 100%; position: relative; max-height: 90vh; overflow-y: auto;">
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${prompt.image}" alt="${prompt.title}" style="width: 100%; max-width: 250px; height: 150px; object-fit: cover; border-radius: 15px; margin-bottom: 15px;">
                    <h3 style="color: white; margin-bottom: 10px; font-size: 18px;">${prompt.title}</h3>
                    <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 12px; border-radius: 15px; font-size: 11px; font-weight: 600;">${prompt.aiTool}</span>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: white; margin-bottom: 10px; font-size: 14px;">Prompt:</h4>
                    <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 12px; color: rgba(255,255,255,0.9); line-height: 1.4; font-size: 13px;">${prompt.prompt}</div>
                </div>
                
                <div style="display: flex; gap: 8px; justify-content: center; flex-direction: column;">
                    <button onclick="navigator.clipboard.writeText('${prompt.prompt.replace(/'/g, "\\'")}'').then(() => promptHub.showToast('Prompt copied!'))" style="width: 100%; padding: 12px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-weight: 500; font-size: 14px;">Copy Prompt</button>
                    <button onclick="window.open('${toolUrls[prompt.aiTool] || '#'}', '_blank')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; font-size: 14px;">Open ${prompt.aiTool}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        
        modal.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 40px; text-align: center; max-width: 400px; position: relative;">
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
                <h3 style="color: white; margin-bottom: 15px; font-size: 24px;">Login Required</h3>
                <p style="color: rgba(255,255,255,0.8); margin-bottom: 30px; line-height: 1.5;">Please login with Google to access all premium prompts and unlock the full collection.</p>
                <button id="google-login-modal-btn" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 15px; background: white; color: #333; border: none; border-radius: 10px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Login with Google
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add click handler for login button
        const loginBtn = modal.querySelector('#google-login-modal-btn');
        loginBtn.addEventListener('click', async () => {
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: 'https://glow.ragspro.com/gallery.html'
                    }
                });
                
                if (error) throw error;
                modal.remove();
            } catch (error) {
                console.error('Login error:', error);
                this.showToast('Login failed: ' + error.message);
            }
        });
    }

    async loginWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'https://glow.ragspro.com/gallery.html'
                }
            });
            
            if (error) throw error;
            
            // Close modal if it exists
            const modal = document.querySelector('.login-modal');
            if (modal) modal.remove();
            
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('❌ Login failed: ' + error.message);
        }
    }

    updateAuthStatus() {
        const authStatus = document.getElementById('auth-status');
        if (this.user) {
            authStatus.innerHTML = `
                <div class="premium-status">
                    <span class="premium-badge">PREMIUM</span>
                    <span>Welcome ${this.user.user_metadata.name || this.user.email.split('@')[0]}! All prompts unlocked</span>
                </div>
            `;
        } else {
            authStatus.innerHTML = `
                <div class="free-prompts-info">
                    <span class="free-badge">FREE</span>
                    <span>3 prompts available • <button class="login-btn" id="gallery-login-btn">Login for 15+ prompts</button></span>
                </div>
            `;
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('❌ Logout failed: ' + error.message);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize Prompt Hub
const promptHub = new PromptHub();
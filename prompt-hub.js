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
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.user = session.user;
            this.updateHeaderUI();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.user = session.user;
                this.updateHeaderUI();
                this.renderPrompts();
                this.updateAuthStatus();
                this.showToast('🎉 Welcome! All prompts unlocked');
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.updateHeaderUI();
                this.renderPrompts();
                this.updateAuthStatus();
                this.showToast('👋 Logged out');
            }
        });

        this.renderPrompts();
        this.setupEventListeners();
        this.updateAuthStatus();
        this.setupHeaderAuth();
        this.handleURLFilter();
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
                            redirectTo: 'http://localhost:8080/gallery.html'
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
        
        if (this.user) {
            if (loginHeaderBtn) loginHeaderBtn.style.display = 'none';
            if (profileDropdown) profileDropdown.style.display = 'block';
            if (userName) {
                userName.textContent = this.user.user_metadata.name || this.user.email.split('@')[0];
            }
        } else {
            if (loginHeaderBtn) loginHeaderBtn.style.display = 'block';
            if (profileDropdown) profileDropdown.style.display = 'none';
        }
    }

    init() {
        this.renderPrompts();
        this.setupEventListeners();
        this.updateAuthStatus();
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
        
        allPrompts.forEach((prompt, index) => {
            const isLocked = !this.user && prompt.isPremium;
            const card = this.createPromptCard(prompt, index, isLocked);
            grid.appendChild(card);
        });
        
        // Add category filtering
        this.setupCategoryFilter();
    }

    createPromptCard(prompt, index, isLocked) {
        const card = document.createElement('div');
        card.className = `prompt-card ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${prompt.image}" alt="${prompt.title}" loading="lazy">
                ${isLocked ? '<div class="lock-overlay"><div class="lock-icon">🔒</div></div>' : ''}
                ${prompt.trending ? '<div class="trending-badge">🔥 Trending</div>' : ''}
                ${prompt.aiTool ? `<div class="ai-tool-badge" style="position: absolute; bottom: 10px; left: 10px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">${prompt.aiTool}</div>` : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${prompt.title}</h3>
                <p class="card-prompt">${this.truncateText(prompt.prompt, 80)}</p>
                <div class="card-actions">
                    ${isLocked ? 
                        '<button class="unlock-btn">🔓 Login to Unlock</button>' :
                        `<button class="copy-btn" data-prompt="${this.escapeHtml(prompt.prompt)}">📋 Copy</button>
                         <button class="gemini-btn" data-prompt="${this.escapeHtml(prompt.prompt)}">🚀 Open in Gemini</button>`
                    }
                </div>
            </div>
        `;

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
    
    showLoginModal() {
        // Create simple login modal
        const modal = document.createElement('div');
        modal.className = 'login-modal';
        modal.innerHTML = `
            <div class="login-content">
                <h3>🔓 Unlock 15+ Viral Prompts</h3>
                <p>Login with Google to access all premium prompts for ChatGPT, Gemini & more</p>
                <button class="google-login-btn" onclick="promptHub.loginWithGoogle()">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>
                <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async loginWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'http://localhost:8080/gallery.html'
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
                    <span>Welcome ${this.user.user_metadata.name}! 15+ prompts unlocked • <button class="logout-btn" onclick="promptHub.logout()">Logout</button></span>
                </div>
            `;
        } else {
            authStatus.innerHTML = `
                <div class="free-prompts-info">
                    <span class="free-badge">FREE</span>
                    <span>3 prompts available • <button class="login-btn" id="login-btn">Login for 15+ prompts</button></span>
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
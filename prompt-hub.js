// Glow Prompt Hub - Viral Gemini Prompts with Freemium Model
class PromptHub {
    constructor() {
        this.isLoggedIn = localStorage.getItem('glow_logged_in') === 'true';
        this.freePromptLimit = 3;
        this.init();
    }

    init() {
        this.renderPrompts();
        this.setupEventListeners();
        this.updateAuthStatus();
    }

    renderPrompts() {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';

        promptsData.forEach((prompt, index) => {
            const isLocked = !this.isLoggedIn && index >= this.freePromptLimit;
            const card = this.createPromptCard(prompt, index, isLocked);
            grid.appendChild(card);
        });
    }

    createPromptCard(prompt, index, isLocked) {
        const card = document.createElement('div');
        card.className = `prompt-card ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${prompt.image}" alt="${prompt.title}" loading="lazy">
                ${isLocked ? '<div class="lock-overlay"><div class="lock-icon">🔒</div></div>' : ''}
                ${index < 3 ? '<div class="trending-badge">🔥 Trending</div>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${prompt.title}</h3>
                <p class="card-prompt">${this.truncateText(prompt.prompt, 80)}</p>
                <div class="card-actions">
                    ${isLocked ? 
                        '<button class="unlock-btn">🔓 Unlock with Login</button>' :
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

    showLoginModal() {
        // Create simple login modal
        const modal = document.createElement('div');
        modal.className = 'login-modal';
        modal.innerHTML = `
            <div class="login-content">
                <h3>🔓 Unlock 30+ Viral Prompts</h3>
                <p>Login with Google to access all premium prompts</p>
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

    loginWithGoogle() {
        // Simulate login (replace with actual Supabase auth)
        localStorage.setItem('glow_logged_in', 'true');
        this.isLoggedIn = true;
        document.querySelector('.login-modal').remove();
        this.renderPrompts();
        this.updateAuthStatus();
        this.showToast('🎉 Welcome! All prompts unlocked');
    }

    updateAuthStatus() {
        const authStatus = document.getElementById('auth-status');
        if (this.isLoggedIn) {
            authStatus.innerHTML = `
                <div class="premium-status">
                    <span class="premium-badge">PREMIUM</span>
                    <span>30+ prompts unlocked • <button class="logout-btn" onclick="promptHub.logout()">Logout</button></span>
                </div>
            `;
        }
    }

    logout() {
        localStorage.removeItem('glow_logged_in');
        this.isLoggedIn = false;
        this.renderPrompts();
        this.updateAuthStatus();
        this.showToast('👋 Logged out');
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
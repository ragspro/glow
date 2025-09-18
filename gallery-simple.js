// Simple Gallery Script - No Complex Auth
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabase = createClient(
    'https://xmponioxmzfftfrowcrf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcG9uaW94bXpmZnRmcm93Y3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTg1NTQsImV4cCI6MjA3MzU5NDU1NH0.sFIGvTn6q69Z8D2lSW-f0SYRmE2AgLB2Y1ZVm2g0dj4'
);

let currentUser = null;

// Fast initialization
document.addEventListener('DOMContentLoaded', () => {
    // Quick UI setup
    updateUI();
    loadPrompts();
    setupEventListeners();
    
    // Check auth in background
    checkAuth();
});

async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user !== currentUser) {
            currentUser = session?.user || null;
            updateUI();
            loadPrompts();
        }
    } catch (error) {
        console.log('Auth check failed');
    }
}

function updateUI() {
    const loginBtn = document.getElementById('login-header-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const userName = document.getElementById('user-name');
    const authStatus = document.getElementById('auth-status');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileDropdown) {
            profileDropdown.style.display = 'block';
            profileDropdown.style.position = 'relative';
        }
        if (userName) {
            userName.textContent = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User';
        }
        if (authStatus) {
            authStatus.innerHTML = '<div class="premium-status" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; text-align: center;"><span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 600; margin-right: 10px;">PREMIUM</span><span style="color: white;">All prompts unlocked</span></div>';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (profileDropdown) profileDropdown.style.display = 'none';
        if (authStatus) {
            authStatus.innerHTML = '<div class="free-prompts-info" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; text-align: center;"><span style="background: rgba(156, 163, 175, 0.2); color: #9CA3AF; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 600; margin-right: 10px;">FREE</span><span style="color: white;">3 prompts available • <button id="gallery-login-btn" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px;">Login for 15+ prompts</button></span></div>';
        }
    }
}

function loadPrompts(filterCategory = 'all') {
    const grid = document.getElementById('gallery-grid');
    if (!grid || !window.staticPrompts) return;
    
    grid.innerHTML = '';
    
    // Filter prompts based on category
    let filteredPrompts = window.staticPrompts;
    if (filterCategory !== 'all') {
        filteredPrompts = window.staticPrompts.filter(prompt => 
            prompt.category === filterCategory || 
            prompt.aiTool?.toLowerCase().includes(filterCategory)
        );
    }
    
    filteredPrompts.forEach((prompt, index) => {
        const isLocked = !currentUser && prompt.isPremium;
        const card = createCard(prompt, isLocked);
        grid.appendChild(card);
    });
}

function createCard(prompt, isLocked) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.style.cssText = `
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 15px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    card.innerHTML = `
        <div style="position: relative; height: 250px; overflow: hidden;">
            <img src="${prompt.image}" alt="${prompt.title}" style="width: 100%; height: 100%; object-fit: cover;">
            ${isLocked ? '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 32px;">🔒</div></div>' : ''}
            <div style="position: absolute; top: 10px; left: 10px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 6px 12px; border-radius: 15px; font-size: 11px; font-weight: 600;">${prompt.aiTool}</div>
        </div>
    `;
    
    card.onclick = () => {
        if (isLocked) {
            showLoginModal();
        } else {
            showModal(prompt);
        }
    };
    
    return card;
}

function showModal(prompt) {
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
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 25px; max-width: 500px; width: 100%; position: relative;">
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
            
            <div style="display: flex; gap: 8px; flex-direction: column;">
                <button onclick="navigator.clipboard.writeText('${prompt.prompt.replace(/'/g, "\\'")}').then(() => alert('Copied!'))" style="width: 100%; padding: 12px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-weight: 500;">Copy Prompt</button>
                <button onclick="window.open('https://chat.openai.com', '_blank')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500;">Open ${prompt.aiTool}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showLoginModal() {
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
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 40px; text-align: center; max-width: 400px; position: relative;">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
            <h3 style="color: white; margin-bottom: 15px;">Login Required</h3>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 30px;">Login to access all prompts</p>
            <button onclick="loginWithGoogle()" style="width: 100%; padding: 15px; background: white; color: #333; border: none; border-radius: 10px; font-weight: 500; cursor: pointer;">Login with Google</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function loginWithGoogle() {
    try {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://glow.ragspro.com/gallery.html'
            }
        });
    } catch (error) {
        alert('Login failed');
    }
}

function setupEventListeners() {
    // Profile dropdown with fixed positioning
    const profileBtn = document.getElementById('profile-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (profileBtn && dropdownMenu) {
        profileBtn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Fix positioning
                const rect = profileBtn.getBoundingClientRect();
                dropdownMenu.style.position = 'fixed';
                dropdownMenu.style.top = (rect.bottom + 10) + 'px';
                dropdownMenu.style.right = (window.innerWidth - rect.right) + 'px';
                dropdownMenu.style.left = 'auto';
            }
        };
        
        // Close dropdown when clicking outside
        document.onclick = (e) => {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.style.display = 'none';
            }
        };
    }
    
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await supabase.auth.signOut();
            location.reload();
        };
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.onclick = () => {
            // Update active button
            filterBtns.forEach(b => {
                b.style.background = 'rgba(255,255,255,0.1)';
                b.style.color = 'white';
            });
            btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            btn.style.color = 'white';
            
            // Filter prompts
            const category = btn.dataset.category;
            loadPrompts(category);
        };
    });
    
    // Login buttons - delegate event handling
    document.onclick = (e) => {
        if (e.target.id === 'login-header-btn' || e.target.id === 'gallery-login-btn') {
            loginWithGoogle();
        }
    };
}

// Global functions
window.loginWithGoogle = loginWithGoogle;
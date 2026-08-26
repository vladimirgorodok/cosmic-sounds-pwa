// ============================================
// КОСМИЧЕСКАЯ СТАНЦИЯ — Звуки Космоса
// Main Application Logic
// ============================================

class CosmicSoundsApp {
  constructor() {
    this.currentTab = 'programs';
    this.currentCategory = 'all';
    this.counter = 0;
    this.counterGoal = 108;
    this.installPrompt = null;
    this.deferredPrompt = null;

    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.createParticles();
    this.renderPrograms();
    this.renderNumbers();
    this.setupEventListeners();
    this.checkURLParams();
    this.setupInstallPrompt();
  }

  // ---- Service Worker ----
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then((reg) => console.log('[App] SW registered:', reg.scope))
        .catch((err) => console.warn('[App] SW registration failed:', err));
    }
  }

  // ---- Particles ----
  createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (10 + Math.random() * 20) + 's';
      particle.style.animationDelay = (Math.random() * 15) + 's';
      particle.style.width = (2 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  }

  // ---- Tab Switching ----
  switchTab(tabId) {
    // Update top tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.nav-tab[onclick="app.switchTab('${tabId}')"]`);
    if (activeTab) activeTab.classList.add('active');

    // Update bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(t => t.classList.remove('active'));
    const activeNav = document.querySelector(`.bottom-nav-item[onclick="app.switchMainTab('${tabId}')"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const activeSection = document.getElementById(tabId);
    if (activeSection) activeSection.classList.add('active');

    this.currentTab = tabId;

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchMainTab(tabId) {
    this.switchTab(tabId);
  }

  // ---- Programs Rendering ----
  renderPrograms() {
    const grid = document.getElementById('soundGrid');
    if (!grid) return;

    const filtered = this.currentCategory === 'all' 
      ? soundPrograms 
      : soundPrograms.filter(s => s.category === this.currentCategory);

    grid.innerHTML = filtered.map(sound => this.createSoundCard(sound)).join('');
  }

  createSoundCard(sound) {
    const tags = sound.tags.map(tag => `<span class="meta-tag">${tag}</span>`).join('');
    const specialTag = sound.special === 'water' 
      ? '<span class="meta-tag water">💧 вода</span>' 
      : '';

    return `
      <div class="sound-card" onclick="app.openDetail('${sound.id}')" style="--card-accent: ${sound.color}">
        <div class="sound-card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="sound-icon">${sound.icon}</span>
            <div class="sound-name">${sound.name}</div>
          </div>
          <div class="sound-code">${sound.code}</div>
        </div>
        <div class="sound-purpose">${sound.purpose}</div>
        <div class="sound-meta">
          ${tags}
          ${specialTag}
          <span class="meta-tag highlight">#${sound.codeNumber}</span>
        </div>
      </div>
    `;
  }

  // ---- Category Filter ----
  filterCategory(categoryId) {
    this.currentCategory = categoryId;

    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    const activeChip = document.querySelector(`.category-chip[data-category="${categoryId}"]`);
    if (activeChip) activeChip.classList.add('active');

    this.renderPrograms();
  }

  // ---- Detail View ----
  openDetail(soundId) {
    const sound = soundPrograms.find(s => s.id === soundId);
    if (!sound) return;

    const detailView = document.getElementById('detailView');
    const detailContent = document.getElementById('detailContent');

    const recommendations = sound.recommendations.map(r => `<li>${r}</li>`).join('');
    const approaches = sound.approaches.length > 0 
      ? `<p><strong>Рекомендуемые подходы:</strong> ${sound.approaches.join(', ')}</p>` 
      : '';

    const waterSection = sound.special === 'water' ? `
      <div class="detail-section">
        <h3>💧 Зарядка Воды</h3>
        <div class="water-charging">
          <div class="water-visual">
            <div class="water-wave"></div>
          </div>
          <div class="water-label">Звучать на воду и выпивать<br>До 1,5 л в день</div>
        </div>
      </div>
    ` : '';

    detailContent.innerHTML = `
      <div class="detail-hero">
        <div class="detail-icon" style="background: linear-gradient(135deg, ${sound.color}33, ${sound.color}11);">
          <span style="position:relative;z-index:1;">${sound.icon}</span>
        </div>
        <div class="detail-title">${sound.name}</div>
        <div class="detail-code">${sound.code}</div>
        <div class="detail-code-number">Код программы: ${sound.codeNumber}</div>
      </div>

      <div class="detail-section">
        <h3>🎯 Назначение</h3>
        <p>${sound.purpose}</p>
      </div>

      <div class="detail-section">
        <h3>📋 Рекомендации</h3>
        <ul>${recommendations}</ul>
        ${approaches}
      </div>

      ${waterSection}

      <div class="detail-section">
        <h3>🏷️ Категория</h3>
        <div class="sound-meta" style="margin-top:12px;">
          ${sound.tags.map(t => `<span class="meta-tag">${t}</span>`).join('')}
          <span class="meta-tag highlight">#${sound.codeNumber}</span>
        </div>
      </div>

      <div style="text-align:center; margin-top:20px;">
        <button class="counter-btn" onclick="app.startPracticeFromDetail(${sound.approaches.length > 0 ? sound.approaches[0] : 108})" style="width:auto;padding:14px 32px;height:auto;border-radius:24px;font-size:14px;">
          🧘 Начать Практику
        </button>
      </div>
    `;

    detailView.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeDetail() {
    const detailView = document.getElementById('detailView');
    detailView.classList.remove('active');
    document.body.style.overflow = '';
  }

  startPracticeFromDetail(goal) {
    this.closeDetail();
    this.switchTab('practice');
    this.setGoal(goal);
  }

  // ---- Numbers Rendering ----
  renderNumbers() {
    const grid = document.getElementById('numberGrid');
    if (!grid) return;

    grid.innerHTML = numberEnergies.map(n => `
      <div class="number-card" style="border-color: ${n.color}33;">
        <div class="number-value" style="color: ${n.color};">${n.number}</div>
        <div class="number-title">${n.title}</div>
        <div class="number-meaning">${n.meaning}</div>
      </div>
    `).join('');
  }

  // ---- Practice Counter ----
  incrementCounter() {
    this.counter++;
    this.updateCounterDisplay();

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (this.counter >= this.counterGoal) {
      this.onCounterComplete();
    }
  }

  updateCounterDisplay() {
    const display = document.getElementById('counterDisplay');
    const circle = document.getElementById('progressCircle');
    const percent = document.getElementById('progressPercent');

    if (display) display.textContent = this.counter;

    if (circle) {
      const circumference = 2 * Math.PI * 52;
      const offset = circumference - (this.counter / this.counterGoal) * circumference;
      circle.style.strokeDashoffset = Math.max(0, offset);
    }

    if (percent) {
      const p = Math.min(100, Math.round((this.counter / this.counterGoal) * 100));
      percent.textContent = p + '%';
    }
  }

  setGoal(goal) {
    this.counterGoal = goal;
    this.counter = 0;
    this.updateCounterDisplay();

    const goalText = document.querySelector('.counter-goal');
    if (goalText) goalText.textContent = `Цель: ${goal} повторений`;

    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.goal-btn[data-goal="${goal}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  resetCounter() {
    this.counter = 0;
    this.updateCounterDisplay();

    const btn = document.querySelector('.counter-btn');
    if (btn) btn.classList.remove('complete');

    this.showToast('Счётчик сброшен. Начните заново ✨');
  }

  onCounterComplete() {
    const btn = document.querySelector('.counter-btn');
    if (btn) btn.classList.add('complete');

    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50, 100, 200]);
    }

    this.showToast('🎉 Практика завершена! Космическая энергия активирована.');
  }

  // ---- Toast ----
  showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ---- Install Prompt ----
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.hideInstallPrompt();
      this.showToast('⭐ Приложение установлено!');
    });
  }

  showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) prompt.classList.add('show');
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) prompt.classList.remove('show');
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      this.showToast('Установка началась...');
    }

    this.deferredPrompt = null;
    this.hideInstallPrompt();
  }

  // ---- URL Params ----
  checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['programs', 'guide', 'practice', 'numbers'].includes(tab)) {
      this.switchTab(tab);
    }
  }

  // ---- Event Listeners ----
  setupEventListeners() {
    // Close detail on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDetail();
      }
      // Space or Enter for counter when on practice tab
      if (this.currentTab === 'practice' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        this.incrementCounter();
      }
    });

    // Swipe to close detail
    let touchStartY = 0;
    const detailView = document.getElementById('detailView');

    if (detailView) {
      detailView.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      detailView.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        if (touchEndY - touchStartY > 100) {
          this.closeDetail();
        }
      }, { passive: true });
    }
  }
}

// Initialize app
const app = new CosmicSoundsApp();

// Global functions for onclick handlers
function switchTab(tabId) { app.switchTab(tabId); }
function switchMainTab(tabId) { app.switchMainTab(tabId); }
function openDetail(soundId) { app.openDetail(soundId); }
function closeDetail() { app.closeDetail(); }
function incrementCounter() { app.incrementCounter(); }
function setGoal(goal) { app.setGoal(goal); }
function resetCounter() { app.resetCounter(); }
function filterCategory(catId) { app.filterCategory(catId); }
function installApp() { app.installApp(); }
function hideInstallPrompt() { app.hideInstallPrompt(); }

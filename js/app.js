/**
 * MASAR - Core Application Coordinator & Router & Modals Controller
 */

import { db } from './engine/db.js';
import { FinancialEngine } from './engine/financialEngine.js';
import { SMSParser } from './engine/smsParser.js';
import { cloudAuth, generateAvatarUrl } from './engine/firebase.js';
import { Icons } from './icons.js';

import { DashboardView } from './views/dashboardView.js';
import { TransactionsView } from './views/transactionsView.js';
import { AccountsView } from './views/accountsView.js';
import { BudgetsView } from './views/budgetsView.js';
import { SavingsView } from './views/savingsView.js';
import { InvestmentsView } from './views/investmentsView.js';
import { ObligationsView } from './views/obligationsView.js';
import { DebtsView } from './views/debtsView.js';
import { PurchasesView } from './views/purchasesView.js';
import { AnalyticsView } from './views/analyticsView.js';
import { SettingsView } from './views/settingsView.js';
import { LandingView } from './views/landingView.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.deferredInstallPrompt = null;
    this.views = {
      dashboard: DashboardView,
      transactions: TransactionsView,
      accounts: AccountsView,
      budgets: BudgetsView,
      savings: SavingsView,
      investments: InvestmentsView,
      obligations: ObligationsView,
      debts: DebtsView,
      purchases: PurchasesView,
      analytics: AnalyticsView,
      settings: SettingsView
    };
  }

  init() {
    this.initTheme();
    this.initPWA();
    this.initNavigation();
    this.initGlobalEvents();

    // Subscribe to DB changes to re-render current view smoothly
    db.subscribe(() => {
      this.renderCurrentView();
    });

    // Subscribe to Cloud Auth changes
    cloudAuth.subscribe(() => {
      this.updateHeaderAuthStatus();
      this.renderCurrentView();
    });

    // Handle initial route or hash
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigateTo(initialHash);
    this.updateHeaderAuthStatus();
  }

  // --- THEME ENGINE ---
  initTheme() {
    const savedTheme = db.state.settings.theme || 'system';
    this.applyTheme(savedTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (db.state.settings.theme === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  applyTheme(theme) {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  // --- PWA SERVICE WORKER & INSTALL PROMPT ---
  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration skipped or failed:', err);
        });
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const installBanner = document.getElementById('pwa-install-banner');
      if (installBanner) installBanner.style.display = 'flex';
    });
  }

  // --- NAVIGATION & ROUTING ---
  initNavigation() {
    // Desktop Sidebar Links
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) this.navigateTo(view);
      });
    });

    // Mobile Bottom Navigation Buttons
    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view) this.navigateTo(view);
      });
    });

    // Mobile Hamburger Menu Toggle
    const menuToggle = document.getElementById('btn-mobile-menu');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Close sidebar on click outside on mobile
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
      }
    });

    window.addEventListener('hashchange', () => {
      const view = window.location.hash.replace('#', '') || 'dashboard';
      if (this.views[view] && view !== this.currentView) {
        this.navigateTo(view, false);
      }
    });
  }

  navigateTo(viewName, updateHash = true) {
    if (!this.views[viewName]) viewName = 'dashboard';
    this.currentView = viewName;

    if (updateHash) {
      window.location.hash = viewName;
    }

    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    document.querySelector('.sidebar')?.classList.remove('mobile-open');

    const titles = {
      dashboard: { title: 'الرئيسية', subtitle: 'نظرة عامة على الوضع المالي والسيولة' },
      transactions: { title: 'العمليات', subtitle: 'سجل الحركات المالية والتحويلات' },
      accounts: { title: 'الحسابات والمحافظ', subtitle: 'خزينة البطاقات والآيبان والأرصدة' },
      budgets: { title: 'الميزانية', subtitle: 'سقف الإنفاق الشهري ومتابعة الاستهلاك' },
      savings: { title: 'الادخار والأهداف', subtitle: 'صناديق الطوارئ وأهداف الشراء المستقبلية' },
      investments: { title: 'الاستثمار', subtitle: 'متابعة عوائد المحافظ والأصول' },
      obligations: { title: 'الالتزامات الدورية', subtitle: 'الاشتراكات والفواتير الثابتة والأقساط' },
      debts: { title: 'الديون والمستحقات', subtitle: 'متابعة ما لك وما عليك وتسجيل الدفعات' },
      purchases: { title: 'المشتريات المخططة', subtitle: 'جدولة الرغبات والاحتياجات حسب السيولة' },
      analytics: { title: 'التحليلات ومسار التدفق', subtitle: 'مخطط مسار المال من الاكتساب إلى الصرف' },
      settings: { title: 'الإعدادات والسحابة', subtitle: 'المزامنة السحابية، المظهر، والنسخ' }
    };

    const headerTitle = document.getElementById('header-page-title');
    const headerSubtitle = document.getElementById('header-page-subtitle');
    if (headerTitle && titles[viewName]) {
      headerTitle.textContent = titles[viewName].title;
      if (headerSubtitle) headerSubtitle.textContent = titles[viewName].subtitle;
    }

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView() {
    const user = cloudAuth.currentUser;
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.app-header');
    const mobileNav = document.querySelector('.mobile-bottom-nav');
    const mainWrapper = document.querySelector('.main-wrapper');
    const mainContent = document.getElementById('main-view-container');

    if (!user) {
      // User is not logged in -> Show Landing / Gateway View
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
      if (mobileNav) mobileNav.style.display = 'none';
      if (mainWrapper) {
        mainWrapper.style.marginRight = '0';
        mainWrapper.style.padding = '0';
      }
      if (mainContent) {
        LandingView.render(mainContent);
      }
      return;
    }

    // User is logged in -> Restore standard app interface
    if (sidebar) sidebar.style.display = '';
    if (header) header.style.display = '';
    if (mobileNav) mobileNav.style.display = '';
    if (mainWrapper) {
      mainWrapper.style.marginRight = '';
      mainWrapper.style.padding = '';
    }

    if (mainContent && this.views[this.currentView]) {
      this.views[this.currentView].render(mainContent);
    }
  }

  updateHeaderAuthStatus() {
    const user = cloudAuth.currentUser;
    const syncStatus = cloudAuth.syncStatus;
    const headerPill = document.getElementById('header-cloud-status');
    if (headerPill) {
      if (user) {
        const avatarImg = user.photoURL 
          ? `<img src="${user.photoURL}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;" alt="Avatar">`
          : `<span class="sync-dot ${syncStatus}"></span>`;
        headerPill.innerHTML = `
          ${avatarImg}
          <span>${user.displayName || user.email?.split('@')[0] || 'حسابي'}</span>
        `;
      } else {
        headerPill.innerHTML = `
          <span class="sync-dot offline"></span>
          <span>تسجيل الدخول</span>
        `;
      }
    }
  }

  initGlobalEvents() {
    document.querySelectorAll('.btn-global-quick-add').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openTransactionModal();
      });
    });

    document.querySelectorAll('.btn-global-paste-sms').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openSMSModal();
      });
    });

    document.getElementById('header-cloud-status')?.addEventListener('click', () => {
      if (cloudAuth.currentUser) {
        this.openProfileModal();
      } else {
        this.openAuthModal();
      }
    });

    document.getElementById('pwa-btn-install')?.addEventListener('click', async () => {
      if (this.deferredInstallPrompt) {
        this.deferredInstallPrompt.prompt();
        const { outcome } = await this.deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          document.getElementById('pwa-install-banner').style.display = 'none';
        }
        this.deferredInstallPrompt = null;
      }
    document.getElementById('pwa-btn-dismiss')?.addEventListener('click', () => {
      document.getElementById('pwa-install-banner').style.display = 'none';
    });
  }

  // --- MODALS & AUTHENTICATION ENGINE ---

  // 0. Cloud Auth Modal (Google & Firebase Login)
  openAuthModal(defaultMode = 'login') {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent  = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    let authMode        = defaultMode;
    let selectedGender  = 'male';
    let selectedStyle   = 'notionists';
    let selectedBgColor = 'b6e3f4';
    let isLoading       = false;

    const renderAuth = () => {
      const getPreviewUrl = () => {
        const nameVal = modalContent.querySelector('#auth-name')?.value?.trim() || 'User';
        return generateAvatarUrl({
          style: selectedStyle === 'female' ? 'notionists' : selectedStyle,
          gender: selectedStyle === 'female' ? 'female' : (selectedStyle === 'notionists' ? 'male' : 'none'),
          seed: nameVal,
          bgColor: selectedBgColor
        });
      };

      modalContent.innerHTML = `
        <div class="modal-sheet animate-fade-in" style="max-width: 460px;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.25rem;">☁️</span>
              <h3>${authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h3>
            </div>
            <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
          </div>

          <div class="modal-body">
            <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-md); text-align: center; line-height: 1.6;">
              ${authMode === 'login'
                ? 'سجّل دخولك لمزامنة بياناتك المالية بين جميع أجهزتك فوراً.'
                : 'أنشئ حساباً مجانياً لحفظ بياناتك المالية بأمان على السحابة.'}
            </p>

            <!-- Google One-Click Login -->
            <button class="btn btn-glass" id="btn-auth-google"
              style="width: 100%; padding: 0.8rem; font-weight: 700; margin-bottom: var(--space-md);
                     display: flex; align-items: center; justify-content: center; gap: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              المتابعة بحساب Google
            </button>

            <div style="display:flex;align-items:center;gap:var(--space-sm);margin:var(--space-md) 0;color:var(--text-tertiary);font-size:0.75rem;">
              <div style="flex:1;height:1px;background:var(--border-subtle);"></div>
              <span>أو بالبريد الإلكتروني</span>
              <div style="flex:1;height:1px;background:var(--border-subtle);"></div>
            </div>

            ${authMode === 'signup' ? `
              <div class="form-group">
                <label class="form-label">الاسم الكريم</label>
                <input type="text" id="auth-name" class="form-input" placeholder="اسمك الكامل" autocomplete="name" required>
              </div>

              <!-- Live Interactive Avatar & Background Customizer -->
              <div style="background: var(--bg-surface-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.1rem; margin-bottom: var(--space-md); text-align: center;">
                <label class="form-label" style="text-align: center; margin-bottom: 8px; font-weight: 700;">تخصيص صورتك الشخصية ولون الخلفية:</label>
                
                <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
                  <img id="auth-avatar-preview-img" src="${getPreviewUrl()}" style="width: 76px; height: 76px; border-radius: 50%; border: 3px solid var(--primary); box-shadow: 0 4px 14px rgba(0,0,0,0.2); transition: transform 0.2s ease;">
                </div>

                <!-- Avatar Archetype Styles -->
                <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 6px; font-weight: 600;">اختر نمط الشخصية:</div>
                <div class="segmented-control" id="auth-style-select" style="display: flex; width: 100%; margin-bottom: 12px; gap: 4px; overflow-x: auto; padding: 3px;">
                  <button type="button" class="segmented-btn ${selectedStyle === 'notionists' ? 'active' : ''}" data-style="notionists" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">👨 شباب</button>
                  <button type="button" class="segmented-btn ${selectedStyle === 'female' ? 'active' : ''}" data-style="female" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">👩 بنات</button>
                  <button type="button" class="segmented-btn ${selectedStyle === 'bottts' ? 'active' : ''}" data-style="bottts" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">🐧 بطريق</button>
                  <button type="button" class="segmented-btn ${selectedStyle === 'micah' ? 'active' : ''}" data-style="micah" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">👑 VIP</button>
                  <button type="button" class="segmented-btn ${selectedStyle === 'adventurer' ? 'active' : ''}" data-style="adventurer" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">⚔️ مغامر</button>
                </div>

                <!-- Avatar Background Colors Palette -->
                <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 6px; font-weight: 600;">اختر لون خلفية الصورة:</div>
                <div id="auth-bg-palette" style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                  <button type="button" class="avatar-color-btn ${selectedBgColor === 'b6e3f4' ? 'active' : ''}" data-color="b6e3f4" title="أزرق كاش" style="width: 30px; height: 30px; border-radius: 50%; background: #b6e3f4; border: ${selectedBgColor === 'b6e3f4' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer; transform: ${selectedBgColor === 'b6e3f4' ? 'scale(1.15)' : 'none'}; transition: all 0.2s;"></button>
                  <button type="button" class="avatar-color-btn ${selectedBgColor === 'c0aede' ? 'active' : ''}" data-color="c0aede" title="بنفسجي ليلكي" style="width: 30px; height: 30px; border-radius: 50%; background: #c0aede; border: ${selectedBgColor === 'c0aede' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer; transform: ${selectedBgColor === 'c0aede' ? 'scale(1.15)' : 'none'}; transition: all 0.2s;"></button>
                  <button type="button" class="avatar-color-btn ${selectedBgColor === 'd1fae5' ? 'active' : ''}" data-color="d1fae5" title="زمردي منعش" style="width: 30px; height: 30px; border-radius: 50%; background: #d1fae5; border: ${selectedBgColor === 'd1fae5' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer; transform: ${selectedBgColor === 'd1fae5' ? 'scale(1.15)' : 'none'}; transition: all 0.2s;"></button>
                  <button type="button" class="avatar-color-btn ${selectedBgColor === 'fef3c7' ? 'active' : ''}" data-color="fef3c7" title="ذهبي كهرماني" style="width: 30px; height: 30px; border-radius: 50%; background: #fef3c7; border: ${selectedBgColor === 'fef3c7' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer; transform: ${selectedBgColor === 'fef3c7' ? 'scale(1.15)' : 'none'}; transition: all 0.2s;"></button>
                  <button type="button" class="avatar-color-btn ${selectedBgColor === 'ffd5dc' ? 'active' : ''}" data-color="ffd5dc" title="وردي ناعم" style="width: 30px; height: 30px; border-radius: 50%; background: #ffd5dc; border: ${selectedBgColor === 'ffd5dc' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer; transform: ${selectedBgColor === 'ffd5dc' ? 'scale(1.15)' : 'none'}; transition: all 0.2s;"></button>
                  <button type="button" class="avatar-color-btn ${selectedBgColor === 'ffdfbf' ? 'active' : ''}" data-color="ffdfbf" title="مشمشي دافئ" style="width: 30px; height: 30px; border-radius: 50%; background: #ffdfbf; border: ${selectedBgColor === 'ffdfbf' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer; transform: ${selectedBgColor === 'ffdfbf' ? 'scale(1.15)' : 'none'}; transition: all 0.2s;"></button>
                  <button type="button" class="avatar-color-btn ${selectedBgColor === '334155' ? 'active' : ''}" data-color="334155" title="كربوني داكن" style="width: 30px; height: 30px; border-radius: 50%; background: #334155; border: ${selectedBgColor === '334155' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer; transform: ${selectedBgColor === '334155' ? 'scale(1.15)' : 'none'}; transition: all 0.2s;"></button>
                </div>
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input type="email" id="auth-email" class="form-input"
                placeholder="example@gmail.com"
                autocomplete="email"
                style="direction: ltr; text-align: right;">
            </div>

            <div class="form-group">
              <label class="form-label">كلمة المرور</label>
              <input type="password" id="auth-password" class="form-input"
                placeholder="${authMode === 'signup' ? '6 خانات على الأقل' : '••••••••'}" 
                autocomplete="${authMode === 'signup' ? 'new-password' : 'current-password'}"
                style="direction: ltr; text-align: right;">
            </div>

            <div id="auth-error-box"
              style="display:none;padding:0.6rem 0.8rem;background:var(--danger-surface);
                     border:1px solid var(--danger-border);border-radius:var(--radius-sm);
                     font-size:0.8125rem;color:var(--danger-text);margin-bottom:var(--space-sm);
                     line-height:1.5;">
            </div>

            <button class="btn btn-primary" id="btn-submit-auth"
              style="width:100%;margin-top:var(--space-sm);padding:0.8rem;font-size:1rem;">
              ${authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </button>

            <div style="text-align:center;margin-top:var(--space-md);font-size:0.8125rem;">
              ${authMode === 'login' ? `
                <span style="color:var(--text-tertiary);">ليس لديك حساب؟</span>
                <a href="#" id="link-switch-auth"
                  style="color:var(--primary);font-weight:700;text-decoration:none;margin-right:6px;">
                  إنشاء حساب جديد
                </a>
              ` : `
                <span style="color:var(--text-tertiary);">لديك حساب بالفعل؟</span>
                <a href="#" id="link-switch-auth"
                  style="color:var(--primary);font-weight:700;text-decoration:none;margin-right:6px;">
                  تسجيل الدخول
                </a>
              `}
            </div>
          </div>
        </div>
      `;

      const updatePreview = () => {
        const previewImg = modalContent.querySelector('#auth-avatar-preview-img');
        if (previewImg) previewImg.src = getPreviewUrl();
      };

      // Name input listener for live avatar update
      modalContent.querySelector('#auth-name')?.addEventListener('input', updatePreview);

      // Style selection buttons
      modalContent.querySelectorAll('#auth-style-select .segmented-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modalContent.querySelectorAll('#auth-style-select .segmented-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedStyle = btn.getAttribute('data-style');
          selectedGender = selectedStyle === 'female' ? 'female' : (selectedStyle === 'notionists' ? 'male' : 'none');
          updatePreview();
        });
      });

      // Background color palette buttons
      modalContent.querySelectorAll('#auth-bg-palette .avatar-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modalContent.querySelectorAll('#auth-bg-palette .avatar-color-btn').forEach(b => {
            b.style.border = '2px solid transparent';
            b.style.transform = 'none';
            b.classList.remove('active');
          });
          btn.classList.add('active');
          btn.style.border = '3px solid var(--primary)';
          btn.style.transform = 'scale(1.15)';
          selectedBgColor = btn.getAttribute('data-color');
          updatePreview();
        });
      });

      const showError = (msg) => {
        const errBox = modalContent.querySelector('#auth-error-box');
        if (!errBox) return;
        errBox.textContent = msg;
        errBox.style.display = 'block';
      };

      const setLoading = (loading) => {
        isLoading = loading;
        const submitBtn = modalContent.querySelector('#btn-submit-auth');
        const googleBtn = modalContent.querySelector('#btn-auth-google');
        if (submitBtn) submitBtn.disabled = loading;
        if (googleBtn) googleBtn.disabled = loading;
        if (submitBtn) submitBtn.textContent = loading
          ? '⏳ جارٍ المعالجة...'
          : (authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب');
      };

      // Google sign-in
      modalContent.querySelector('#btn-auth-google')?.addEventListener('click', async () => {
        if (isLoading) return;
        setLoading(true);
        try {
          await cloudAuth.signInWithGoogle();
          this.closeModal();
          this.showToast('مرحباً! تم تسجيل الدخول عبر Google وربط السحابة ✅');
        } catch (e) {
          showError(e.message);
        } finally {
          setLoading(false);
        }
      });

      // Submit Email/Password
      modalContent.querySelector('#btn-submit-auth')?.addEventListener('click', async () => {
        if (isLoading) return;
        const email    = modalContent.querySelector('#auth-email')?.value?.trim();
        const password = modalContent.querySelector('#auth-password')?.value;
        const name     = modalContent.querySelector('#auth-name')?.value?.trim();

        if (!email || !password) {
          showError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
          return;
        }

        if (authMode === 'signup' && !name) {
          showError('يرجى كتابة اسمك الكريم.');
          return;
        }

        setLoading(true);
        try {
          if (authMode === 'signup') {
            await cloudAuth.signUpWithEmail(email, password, name, selectedGender, selectedBgColor, selectedStyle);
            this.showToast(`أهلاً بك يا ${name}! تم إنشاء حسابك بنجاح 🎉`);
          } else {
            await cloudAuth.signInWithEmail(email, password);
            this.showToast('مرحباً بعودتك! تم تسجيل الدخول ومزامنة بياناتك ✅');
          }
          this.closeModal();
        } catch (err) {
          showError(err.message);
        } finally {
          setLoading(false);
        }
      });

      // Allow Enter key
      modalContent.querySelector('#auth-password')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') modalContent.querySelector('#btn-submit-auth')?.click();
      });

      // Switch mode
      modalContent.querySelector('#link-switch-auth')?.addEventListener('click', (e) => {
        e.preventDefault();
        authMode = authMode === 'login' ? 'signup' : 'login';
        renderAuth();
      });

      this.bindModalCloseEvents(modalContent, modalBackdrop);

      setTimeout(() => {
        const firstInput = modalContent.querySelector('#auth-name') || modalContent.querySelector('#auth-email');
        firstInput?.focus();
      }, 100);
    };

    renderAuth();
    modalBackdrop.classList.add('open');
  }

  // 1. Bank SMS Parser Modal
  openSMSModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <span style="font-size: 1.25rem;">📱</span>
            <h3>لصق وتحليل رسالة البنك الذكي</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-md);">
            انسخ نص رسالة الإشعار البنكي (الراجحي، الأهلي، الإنماء، STC Pay، مدى، نقاط البيع، Apple Pay) والصقها هنا:
          </p>

          <div class="form-group">
            <textarea id="sms-raw-input" class="form-textarea" placeholder="مثال: شراء نقاط البيع بطاقة:0932 لدى tamwinat alhajrih بمبلغ 0.25 ريال سعودي..." style="min-height: 100px; font-size: 0.875rem;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-md);">
            <button class="btn btn-glass btn-sm" id="btn-parse-sms" style="font-weight: 700;">
              ⚡ تحليل الرسالة الآن
            </button>
          </div>

          <div id="sms-parsed-result" style="display: none;"></div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-parsed-txn" disabled style="padding: 0.65rem 1.5rem; font-weight: 800;">
            ${Icons.check}
            تأكيد وتسجيل العملية
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    let parsedData = null;

    const parseAction = () => {
      const raw = modalContent.querySelector('#sms-raw-input').value;
      if (!raw.trim()) return;

      parsedData = SMSParser.parse(raw);
      const resContainer = modalContent.querySelector('#sms-parsed-result');
      const saveBtn = modalContent.querySelector('#btn-save-parsed-txn');
      if (!resContainer || !parsedData) return;

      resContainer.style.display = 'block';
      resContainer.innerHTML = `
        <div style="background: var(--bg-surface-secondary); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--border-default); display: flex; flex-direction: column; gap: var(--space-sm);">
          
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size: 0.8125rem; font-weight: 800; color: var(--primary);">✅ البيانات المستخرجة بدقة:</div>
            ${parsedData.paymentMethod ? `<span class="badge badge-neutral" style="font-size:0.7rem;">${parsedData.paymentMethod}</span>` : ''}
          </div>

          <div class="form-row">
            <div>
              <label class="form-label">نوع العملية:</label>
              <select id="parsed-type" class="form-select">
                <option value="expense" ${parsedData.type === 'expense' ? 'selected' : ''}>مصروف 📤</option>
                <option value="income" ${parsedData.type === 'income' ? 'selected' : ''}>دخل وارد 📥</option>
                <option value="transfer" ${parsedData.type === 'transfer' ? 'selected' : ''}>تحويل 🔁</option>
              </select>
            </div>
            <div>
              <label class="form-label">المبلغ المستخرج:</label>
              <input type="number" id="parsed-amount" class="form-input" value="${parsedData.amount || ''}" step="any" style="font-weight:800; font-size:1.1rem; color:var(--primary);">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">التاجر / الجهة المستفيدة:</label>
            <input type="text" id="parsed-merchant" class="form-input" value="${parsedData.merchant || ''}" placeholder="اسم المتجر">
          </div>

          <div class="form-row">
            <div>
              <label class="form-label">الحساب البنكي المطابق:</label>
              <select id="parsed-account" class="form-select">
                ${db.state.accounts.map(a => `<option value="${a.id}" ${a.id === parsedData.resolvedAccountId ? 'selected' : ''}>🏦 ${a.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">التصنيف المقترح:</label>
              <select id="parsed-category" class="form-select">
                ${db.state.categories.map(c => `<option value="${c.id}" ${c.id === parsedData.suggestedCategoryId ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row" style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">
            <div>
              <span>التاريخ المستخرج:</span>
              <strong style="color: var(--text-primary);">${parsedData.date || 'اليوم'}</strong>
            </div>
            <div>
              <span>الوقت:</span>
              <strong style="color: var(--text-primary);">${parsedData.time || ''}</strong>
            </div>
            ${parsedData.postBalance !== null ? `
              <div>
                <span>الرصيد بعد العملية:</span>
                <strong style="color: var(--success);">${parsedData.postBalance} ريال</strong>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      if (saveBtn) saveBtn.removeAttribute('disabled');
    };

    modalContent.querySelector('#btn-parse-sms').addEventListener('click', parseAction);
    modalContent.querySelector('#sms-raw-input').addEventListener('paste', () => setTimeout(parseAction, 100));

    modalContent.querySelector('#btn-save-parsed-txn').addEventListener('click', () => {
      const type = modalContent.querySelector('#parsed-type').value;
      const amount = Number(modalContent.querySelector('#parsed-amount').value);
      const merchant = modalContent.querySelector('#parsed-merchant').value;
      const accountId = modalContent.querySelector('#parsed-account').value;
      const categoryId = modalContent.querySelector('#parsed-category').value;
      const raw = modalContent.querySelector('#sms-raw-input').value;

      if (!amount || isNaN(amount)) {
        alert('يرجى التأكد من إدخال مبلغ صحيح.');
        return;
      }

      db.addTransaction({
        type,
        amount,
        merchant,
        accountId,
        categoryId,
        cardId: parsedData?.resolvedCardId || null,
        date: parsedData?.date || new Date().toISOString().split('T')[0],
        time: parsedData?.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        rawMessage: raw,
        description: `عملية عبر رسالة بنكية (${merchant || 'تاجر'})`
      });

      this.closeModal();
      this.showToast('تم تسجيل العملية بنجاح من الرسالة البنكية! ✨');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 0.1 Profile & Cloud Status Modal (Interactive Avatar & Background Customizer)
  openProfileModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent  = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    const user = cloudAuth.currentUser;
    if (!user) {
      this.openAuthModal();
      return;
    }

    const currentProfile = db.state.settings.userProfile || {};
    let selectedStyle    = currentProfile.avatarStyle || 'notionists';
    let selectedBgColor  = currentProfile.avatarBgColor || 'b6e3f4';
    let selectedGender   = currentProfile.gender || 'male';

    const getPreviewUrl = () => {
      const nameVal = modalContent.querySelector('#profile-edit-name')?.value?.trim() || user.displayName || user.email;
      return generateAvatarUrl({
        style: selectedStyle === 'female' ? 'notionists' : selectedStyle,
        gender: selectedStyle === 'female' ? 'female' : (selectedStyle === 'notionists' ? 'male' : 'none'),
        seed: nameVal,
        bgColor: selectedBgColor
      });
    };

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in" style="max-width: 460px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:var(--space-xs);">
            <span style="font-size:1.25rem;">👤</span>
            <h3>الملف الشخصي والحساب السحابي</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body" style="text-align: center;">
          
          <!-- Avatar Preview -->
          <div style="display: flex; justify-content: center; align-items: center; margin-bottom: var(--space-sm);">
            <img id="profile-modal-avatar-img" src="${user.photoURL || getPreviewUrl()}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary); box-shadow: var(--shadow-md); transition: transform 0.2s;">
          </div>
          
          <div class="form-group" style="text-align: right; margin-bottom: var(--space-sm);">
            <label class="form-label">الاسم المعروض:</label>
            <input type="text" id="profile-edit-name" class="form-input" value="${user.displayName || ''}" placeholder="اسمك">
          </div>

          <!-- Customizer Container -->
          <div style="background: var(--bg-surface-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.9rem; margin-bottom: var(--space-md); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 6px; font-weight: 700;">تغيير نمط الشخصية:</div>
            <div class="segmented-control" id="profile-style-select" style="display: flex; width: 100%; margin-bottom: 10px; gap: 4px; overflow-x: auto; padding: 3px;">
              <button type="button" class="segmented-btn ${selectedStyle === 'notionists' ? 'active' : ''}" data-style="notionists" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">👨 شباب</button>
              <button type="button" class="segmented-btn ${selectedStyle === 'female' ? 'active' : ''}" data-style="female" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">👩 بنات</button>
              <button type="button" class="segmented-btn ${selectedStyle === 'bottts' ? 'active' : ''}" data-style="bottts" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">🐧 بطريق</button>
              <button type="button" class="segmented-btn ${selectedStyle === 'micah' ? 'active' : ''}" data-style="micah" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">👑 VIP</button>
              <button type="button" class="segmented-btn ${selectedStyle === 'adventurer' ? 'active' : ''}" data-style="adventurer" style="flex: 1; font-size: 0.75rem; padding: 4px 6px; white-space: nowrap;">⚔️ مغامر</button>
            </div>

            <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 6px; font-weight: 700;">تغيير لون خلفية الصورة:</div>
            <div id="profile-bg-palette" style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="avatar-color-btn ${selectedBgColor === 'b6e3f4' ? 'active' : ''}" data-color="b6e3f4" title="أزرق كاش" style="width: 28px; height: 28px; border-radius: 50%; background: #b6e3f4; border: ${selectedBgColor === 'b6e3f4' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer;"></button>
              <button type="button" class="avatar-color-btn ${selectedBgColor === 'c0aede' ? 'active' : ''}" data-color="c0aede" title="بنفسجي ليلكي" style="width: 28px; height: 28px; border-radius: 50%; background: #c0aede; border: ${selectedBgColor === 'c0aede' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer;"></button>
              <button type="button" class="avatar-color-btn ${selectedBgColor === 'd1fae5' ? 'active' : ''}" data-color="d1fae5" title="زمردي منعش" style="width: 28px; height: 28px; border-radius: 50%; background: #d1fae5; border: ${selectedBgColor === 'd1fae5' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer;"></button>
              <button type="button" class="avatar-color-btn ${selectedBgColor === 'fef3c7' ? 'active' : ''}" data-color="fef3c7" title="ذهبي كهرماني" style="width: 28px; height: 28px; border-radius: 50%; background: #fef3c7; border: ${selectedBgColor === 'fef3c7' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer;"></button>
              <button type="button" class="avatar-color-btn ${selectedBgColor === 'ffd5dc' ? 'active' : ''}" data-color="ffd5dc" title="وردي ناعم" style="width: 28px; height: 28px; border-radius: 50%; background: #ffd5dc; border: ${selectedBgColor === 'ffd5dc' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer;"></button>
              <button type="button" class="avatar-color-btn ${selectedBgColor === 'ffdfbf' ? 'active' : ''}" data-color="ffdfbf" title="مشمشي دافئ" style="width: 28px; height: 28px; border-radius: 50%; background: #ffdfbf; border: ${selectedBgColor === 'ffdfbf' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer;"></button>
              <button type="button" class="avatar-color-btn ${selectedBgColor === '334155' ? 'active' : ''}" data-color="334155" title="كربوني داكن" style="width: 28px; height: 28px; border-radius: 50%; background: #334155; border: ${selectedBgColor === '334155' ? '3px solid var(--primary)' : '2px solid transparent'}; cursor: pointer;"></button>
            </div>
          </div>

          <div style="background: var(--success-surface); border: 1px solid var(--success-border); padding: 0.6rem var(--space-md); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="sync-dot synced"></span>
              <span style="font-size: 0.8125rem; font-weight: 600; color: var(--success-text);">قاعدة بيانات Firestore نشطة ومزامنة</span>
            </div>
            <span class="badge badge-success">متزامن ☁️</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            <button class="btn btn-primary" id="btn-save-profile-customs" style="width: 100%; padding: 0.75rem; font-weight: 800;">
              💾 حفظ وتحديث الصورة والبيانات
            </button>
            <button class="btn btn-glass" id="btn-modal-logout" style="width: 100%; color: var(--danger-text); border-color: var(--danger-border); padding: 0.65rem;">
              تسجيل الخروج من هذا الجهاز
            </button>
          </div>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    const updatePreview = () => {
      const previewImg = modalContent.querySelector('#profile-modal-avatar-img');
      if (previewImg) previewImg.src = getPreviewUrl();
    };

    modalContent.querySelector('#profile-edit-name')?.addEventListener('input', updatePreview);

    modalContent.querySelectorAll('#profile-style-select .segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('#profile-style-select .segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStyle = btn.getAttribute('data-style');
        selectedGender = selectedStyle === 'female' ? 'female' : (selectedStyle === 'notionists' ? 'male' : 'none');
        updatePreview();
      });
    });

    modalContent.querySelectorAll('#profile-bg-palette .avatar-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('#profile-bg-palette .avatar-color-btn').forEach(b => {
          b.style.border = '2px solid transparent';
          b.classList.remove('active');
        });
        btn.classList.add('active');
        btn.style.border = '3px solid var(--primary)';
        selectedBgColor = btn.getAttribute('data-color');
        updatePreview();
      });
    });

    modalContent.querySelector('#btn-save-profile-customs')?.addEventListener('click', async () => {
      const newName = modalContent.querySelector('#profile-edit-name')?.value?.trim() || user.displayName;
      const newPhoto = getPreviewUrl();
      const saveBtn = modalContent.querySelector('#btn-save-profile-customs');
      if (saveBtn) saveBtn.disabled = true;

      try {
        await cloudAuth.updateUserProfile({
          displayName: newName,
          photoURL: newPhoto,
          gender: selectedGender,
          avatarBgColor: selectedBgColor,
          avatarStyle: selectedStyle
        });
        this.updateHeaderAuthStatus();
        this.showToast('تم تحديث الصورة الشخصية والاسم سحابياً بنجاح! ✨');
        this.closeModal();
      } catch (err) {
        alert(err.message);
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });

    modalContent.querySelector('#btn-modal-logout')?.addEventListener('click', async () => {
      await cloudAuth.signOut();
      this.closeModal();
      this.showToast('تم تسجيل الخروج ومسح البيانات من هذا الجهاز للخصوصية 🔒');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 0.2 Set Budget Limit Modal (Custom Sheet replacing prompt)
  openSetBudgetModal(categoryId, currentLimit = 0, month = '2026-08') {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent  = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    const cat = (db.state.categories || []).find(c => c.id === categoryId) || { name: 'الميزانية', emoji: '🎯' };

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in" style="max-width: 420px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:var(--space-xs);">
            <span style="font-size:1.3rem;">${cat.emoji}</span>
            <h3>تحديد سقف ميزانية ${cat.name}</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-lg); line-height: 1.5;">
            حدد الحد الأقصى للمصروف المسموح به في بند <strong>${cat.name}</strong> لشهر <strong>${month}</strong>:
          </p>

          <div class="form-group">
            <label class="form-label">سقف الميزانية الشهري (ريال):</label>
            <input type="number" id="budget-input-limit" class="form-input"
                   placeholder="0" value="${currentLimit || ''}" min="0" step="any"
                   style="font-size: 1.25rem; font-weight: 700; padding: 0.75rem;">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-budget-modal">
            ${Icons.check}
            حفظ السقف المالي
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-budget-modal')?.addEventListener('click', () => {
      const val = Number(modalContent.querySelector('#budget-input-limit').value);
      if (isNaN(val) || val < 0) {
        alert('يرجى إدخال مبلغ صحيح.');
        return;
      }
      db.setBudget(categoryId, val, month);
      this.closeModal();
      this.showToast(`تم ضبط ميزانية ${cat.name} بمبلغ ${val.toLocaleString('en-US')} ريال 🎯`);
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
    setTimeout(() => modalContent.querySelector('#budget-input-limit')?.focus(), 100);
  }

  // 0.3 Categories Manager Modal
  openCategoryManagerModal(defaultType = 'expense') {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent  = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    let activeType = defaultType;

    const renderManager = () => {
      const categories = (db.state.categories || []).filter(c => c.type === activeType);

      modalContent.innerHTML = `
        <div class="modal-sheet animate-fade-in" style="max-width: 540px;">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:var(--space-xs);">
              <span style="font-size:1.25rem;">🏷️</span>
              <h3>إدارة وتخصيص التصنيفات</h3>
            </div>
            <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
          </div>

          <div class="modal-body">
            <!-- Type Tabs -->
            <div class="segmented-control" id="cat-mgr-type" style="width: 100%; display: flex; margin-bottom: var(--space-md);">
              <button type="button" class="segmented-btn ${activeType === 'expense' ? 'active' : ''}" data-type="expense" style="flex: 1;">تصنيفات المصاريف 📤</button>
              <button type="button" class="segmented-btn ${activeType === 'income' ? 'active' : ''}" data-type="income" style="flex: 1;">تصنيفات الدخل 📥</button>
            </div>

            <!-- Add New Category Form -->
            <div style="background: var(--bg-surface-secondary); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: var(--space-lg);">
              <p style="font-size: 0.8125rem; font-weight: 700; margin-bottom: var(--space-xs);">+ إضافة تصنيف رئيسي جديد</p>
              <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
                <input type="text" id="new-cat-emoji" class="form-input" placeholder="🎨" style="width: 50px; text-align: center; font-size: 1.1rem;" maxlength="2" value="📌">
                <input type="text" id="new-cat-name" class="form-input" placeholder="اسم التصنيف (مثال: قهوة، سفر، صيانة...)" style="flex: 1; min-width: 160px;">
                <button class="btn btn-primary btn-sm" id="btn-add-new-cat">إضافة</button>
              </div>
            </div>

            <!-- Existing Categories List -->
            <div style="display: flex; flex-direction: column; gap: var(--space-sm); max-height: 360px; overflow-y: auto;">
              ${categories.map(cat => `
                <div style="background: var(--bg-surface); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.25rem;">${cat.emoji}</span>
                      <strong style="font-size: 0.9375rem;">${cat.name}</strong>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <button class="btn btn-glass btn-sm btn-add-subcat" data-cat-id="${cat.id}" style="padding: 2px 8px; font-size: 0.75rem;">+ قسم فرعي</button>
                      <button class="btn btn-glass btn-icon btn-sm btn-del-cat" data-cat-id="${cat.id}" style="color: var(--danger);" title="حذف التصنيف">${Icons.trash}</button>
                    </div>
                  </div>

                  <!-- Subcategories Badges -->
                  <div style="display: flex; flex-wrap: wrap; gap: 4px; padding-right: 28px;">
                    ${(cat.subcategories || []).map(sub => `
                      <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: var(--bg-surface-secondary); border-radius: var(--radius-full); font-size: 0.75rem; color: var(--text-secondary); border: 1px solid var(--border-subtle);">
                        <span>${sub}</span>
                        <span class="btn-del-subcat" data-cat-id="${cat.id}" data-sub-name="${sub}" style="cursor: pointer; color: var(--text-tertiary); font-weight: bold; margin-right: 2px;">×</span>
                      </span>
                    `).join('')}
                    ${(!cat.subcategories || cat.subcategories.length === 0) ? `<span style="font-size: 0.7rem; color: var(--text-tertiary);">لا توجد أقسام فرعية</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" id="modal-cancel-btn" style="width: 100%;">تم</button>
          </div>
        </div>
      `;

      // Event Listeners
      modalContent.querySelectorAll('#cat-mgr-type .segmented-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeType = btn.getAttribute('data-type');
          renderManager();
        });
      });

      // Add category
      modalContent.querySelector('#btn-add-new-cat')?.addEventListener('click', () => {
        const name = modalContent.querySelector('#new-cat-name')?.value?.trim();
        const emoji = modalContent.querySelector('#new-cat-emoji')?.value?.trim() || '📌';
        if (!name) {
          alert('يرجى كتابة اسم التصنيف.');
          return;
        }
        db.addCategory({ name, emoji, type: activeType });
        renderManager();
        this.showToast('تمت إضافة التصنيف بنجاح ✅');
      });

      // Add subcategory
      modalContent.querySelectorAll('.btn-add-subcat').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          const subName = prompt('اكتب اسم القسم الفرعي الجديد:');
          if (subName && subName.trim()) {
            db.addSubcategory(catId, subName.trim());
            renderManager();
            this.showToast('تمت إضافة القسم الفرعي ✅');
          }
        });
      });

      // Delete subcategory
      modalContent.querySelectorAll('.btn-del-subcat').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          const subName = btn.getAttribute('data-sub-name');
          db.deleteSubcategory(catId, subName);
          renderManager();
        });
      });

      // Delete category
      modalContent.querySelectorAll('.btn-del-cat').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
            db.deleteCategory(catId);
            renderManager();
            this.showToast('تم حذف التصنيف');
          }
        });
      });

      this.bindModalCloseEvents(modalContent, modalBackdrop);
    };

    renderManager();
    modalBackdrop.classList.add('open');
  }

  // 2. Manual Transaction Modal (With Strict Expense/Income Category Separation)
  openTransactionModal(prefill = {}) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    let selectedType = prefill.type || 'expense';

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <span style="font-size: 1.25rem;">✍️</span>
            <h3>تسجيل عملية مالية</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">نوع الحركة المالية:</label>
            <div class="segmented-control" id="form-txn-type" style="width: 100%; display: flex;">
              <button type="button" class="segmented-btn ${selectedType === 'expense' ? 'active' : ''}" data-type="expense" style="flex: 1;">مصروف 📤</button>
              <button type="button" class="segmented-btn ${selectedType === 'income' ? 'active' : ''}" data-type="income" style="flex: 1;">دخل وارد 📥</button>
              <button type="button" class="segmented-btn ${selectedType === 'transfer' ? 'active' : ''}" data-type="transfer" style="flex: 1;">تحويل 🔁</button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المبلغ (ريال):</label>
              <input type="number" id="txn-form-amount" class="form-input" placeholder="0.00" value="${prefill.amount || ''}" step="any" required autofocus style="font-size: 1.15rem; font-weight: 700;">
            </div>
            <div class="form-group">
              <label class="form-label">الرسوم البنكية (إن وجدت):</label>
              <input type="number" id="txn-form-fee" class="form-input" placeholder="0.00" value="${prefill.fee || 0}" step="any">
            </div>
          </div>

          <div class="form-group" id="group-merchant">
            <label class="form-label" id="label-merchant">اسم التاجر / المتجر / المستفيد:</label>
            <input type="text" id="txn-form-merchant" class="form-input" placeholder="مثال: أسواق بنده، ساسكو، راتب شهري..." value="${prefill.merchant || ''}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" id="label-from-acc">من حساب / محفظة:</label>
              <select id="txn-form-from-acc" class="form-select">
                ${(db.state.accounts || []).map(a => `<option value="${a.id}">🏦 ${a.name}</option>`).join('')}
                <option value="cash">💵 النقدية في اليد (كاش)</option>
              </select>
            </div>

            <div class="form-group" id="group-to-acc" style="display: none;">
              <label class="form-label">إلى حساب / محفظة:</label>
              <select id="txn-form-to-acc" class="form-select">
                ${(db.state.accounts || []).map(a => `<option value="${a.id}">🏦 ${a.name}</option>`).join('')}
                <option value="cash">💵 النقدية في اليد (كاش)</option>
              </select>
            </div>

            <div class="form-group" id="group-category">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xs);">
                <label class="form-label" style="margin-bottom: 0;">التصنيف:</label>
                <button type="button" id="btn-modal-manage-cats" style="background: none; border: none; color: var(--primary); font-size: 0.75rem; font-weight: 700; cursor: pointer;">+ تعديل التصنيفات</button>
              </div>
              <select id="txn-form-cat" class="form-select"></select>
            </div>
          </div>

          <!-- Dynamic Subcategory Row -->
          <div class="form-group" id="group-subcategory">
            <label class="form-label">القسم الفرعي (اختياري):</label>
            <select id="txn-form-subcat" class="form-select">
              <option value="">بدون قسم فرعي</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">التاريخ:</label>
              <input type="date" id="txn-form-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">الوقت:</label>
              <input type="time" id="txn-form-time" class="form-input" value="${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}">
            </div>
          </div>

          <div class="form-group" id="group-for-other">
            <label style="display: flex; align-items: center; gap: var(--space-xs); font-size: 0.8125rem; cursor: pointer;">
              <input type="checkbox" id="txn-form-for-other">
              <span>هذا المبلغ <strong>مخصص لشخص آخر</strong> (أمانة/وساطة - لا يُحسب كدخل شخصي)</span>
            </label>
          </div>

          <div class="form-group">
            <label class="form-label">ملاحظات / وصف إضافي:</label>
            <input type="text" id="txn-form-desc" class="form-input" placeholder="ملاحظة اختيارية..." value="${prefill.description || ''}">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-manual-txn">
            ${Icons.check}
            حفظ العملية
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    // Populate category dropdown strictly filtered by type (Expense vs Income)
    const updateCategoryDropdown = () => {
      const catSelect = modalContent.querySelector('#txn-form-cat');
      if (!catSelect) return;

      const filtered = (db.state.categories || []).filter(c => c.type === selectedType);
      
      if (filtered.length === 0) {
        catSelect.innerHTML = `<option value="">لا توجد تصنيفات لهذا النوع</option>`;
      } else {
        catSelect.innerHTML = filtered.map(c => 
          `<option value="${c.id}" ${c.id === prefill.categoryId ? 'selected' : ''}>${c.emoji} ${c.name}</option>`
        ).join('');
      }

      updateSubcategoryDropdown();
    };

    // Populate subcategories for chosen category
    const updateSubcategoryDropdown = () => {
      const catSelect = modalContent.querySelector('#txn-form-cat');
      const subcatSelect = modalContent.querySelector('#txn-form-subcat');
      if (!catSelect || !subcatSelect) return;

      const currentCatId = catSelect.value;
      const cat = (db.state.categories || []).find(c => c.id === currentCatId);

      if (cat && cat.subcategories && cat.subcategories.length > 0) {
        subcatSelect.innerHTML = `
          <option value="">بدون قسم فرعي</option>
          ${cat.subcategories.map(s => `<option value="${s}" ${s === prefill.subCategory ? 'selected' : ''}>${s}</option>`).join('')}
        `;
      } else {
        subcatSelect.innerHTML = `<option value="">بدون قسم فرعي</option>`;
      }
    };

    const updateTypeUI = (type) => {
      selectedType = type;
      const groupToAcc = modalContent.querySelector('#group-to-acc');
      const groupCategory = modalContent.querySelector('#group-category');
      const groupSubcategory = modalContent.querySelector('#group-subcategory');
      const groupForOther = modalContent.querySelector('#group-for-other');
      const labelFrom = modalContent.querySelector('#label-from-acc');
      const labelMerchant = modalContent.querySelector('#label-merchant');

      if (type === 'transfer') {
        if (groupToAcc) groupToAcc.style.display = 'block';
        if (groupCategory) groupCategory.style.display = 'none';
        if (groupSubcategory) groupSubcategory.style.display = 'none';
        if (groupForOther) groupForOther.style.display = 'none';
        if (labelFrom) labelFrom.textContent = 'من حساب:';
        if (labelMerchant) labelMerchant.textContent = 'ملاحظة التحويل:';
      } else {
        if (groupToAcc) groupToAcc.style.display = 'none';
        if (groupCategory) groupCategory.style.display = 'block';
        if (groupSubcategory) groupSubcategory.style.display = 'block';
        if (groupForOther) groupForOther.style.display = type === 'income' ? 'block' : 'none';
        if (labelFrom) labelFrom.textContent = type === 'income' ? 'إيداع في حساب:' : 'من حساب / محفظة:';
        if (labelMerchant) labelMerchant.textContent = type === 'income' ? 'مصدر الدخل / جهة التحويل:' : 'اسم التاجر / المتجر / المستفيد:';
        updateCategoryDropdown();
      }
    };

    updateTypeUI(selectedType);

    // Change Type Event
    modalContent.querySelectorAll('#form-txn-type .segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('#form-txn-type .segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateTypeUI(btn.getAttribute('data-type'));
      });
    });

    // Category Change -> Update Subcategories
    modalContent.querySelector('#txn-form-cat')?.addEventListener('change', () => {
      updateSubcategoryDropdown();
    });

    // Manage Categories Link inside Modal
    modalContent.querySelector('#btn-modal-manage-cats')?.addEventListener('click', () => {
      this.openCategoryManagerModal(selectedType);
    });

    // Submit Transaction
    modalContent.querySelector('#btn-save-manual-txn').addEventListener('click', () => {
      const amount = Number(modalContent.querySelector('#txn-form-amount').value);
      const fee = Number(modalContent.querySelector('#txn-form-fee').value) || 0;
      const merchant = modalContent.querySelector('#txn-form-merchant').value;
      const accountId = modalContent.querySelector('#txn-form-from-acc').value;
      const toAccountId = selectedType === 'transfer' ? modalContent.querySelector('#txn-form-to-acc').value : null;
      const categoryId = selectedType !== 'transfer' ? modalContent.querySelector('#txn-form-cat').value : null;
      const subCategory = selectedType !== 'transfer' ? modalContent.querySelector('#txn-form-subcat').value : null;
      const date = modalContent.querySelector('#txn-form-date').value;
      const time = modalContent.querySelector('#txn-form-time').value;
      const isForSomeoneElse = modalContent.querySelector('#txn-form-for-other')?.checked || false;
      const description = modalContent.querySelector('#txn-form-desc').value;

      if (!amount || isNaN(amount) || amount <= 0) {
        alert('يرجى كتابة مبلغ صحيح للعملية.');
        return;
      }

      db.addTransaction({
        type: selectedType,
        amount,
        fee,
        merchant,
        accountId,
        toAccountId,
        categoryId,
        subCategory,
        date,
        time,
        isForSomeoneElse,
        description
      });

      this.closeModal();
      this.showToast('تم حفظ العملية المالية بنجاح! ✅');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 3. Details Modal
  openTransactionDetailsModal(txn) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    const cat = db.state.categories.find(c => c.id === txn.categoryId);
    const acc = db.state.accounts.find(a => a.id === txn.accountId);

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <span style="font-size: 1.25rem;">📄</span>
            <h3>تفاصيل الحركة المالية</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div style="text-align: center; margin-bottom: var(--space-lg); padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-lg);">
            <div style="font-size: 0.8125rem; color: var(--text-tertiary);">${txn.merchant || 'عملية مالية'}</div>
            <div class="stat-value-huge" style="justify-content: center; margin: 4px 0;">
              <span class="num">${txn.amount.toLocaleString('en-US')}</span>
              <span class="currency-symbol">ريال</span>
            </div>
            <span class="badge ${txn.type === 'expense' ? 'badge-danger' : txn.type === 'income' ? 'badge-success' : 'badge-info'}">
              ${txn.type === 'expense' ? 'مصروف' : txn.type === 'income' ? 'دخل وارد' : 'تحويل داخلي'}
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-xs); font-size: 0.875rem;">
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
              <span style="color: var(--text-tertiary);">التاريخ والوقت:</span>
              <span class="num">${txn.date} ${txn.time || ''}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
              <span style="color: var(--text-tertiary);">الحساب:</span>
              <strong>${acc ? acc.name : (txn.accountId === 'cash' ? 'النقدية في اليد' : 'غير محدد')}</strong>
            </div>
            ${cat ? `
              <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                <span style="color: var(--text-tertiary);">التصنيف:</span>
                <span>${cat.emoji} ${cat.name} ${txn.subCategory ? `(${txn.subCategory})` : ''}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          <button class="btn btn-danger btn-sm" id="btn-delete-txn">
            ${Icons.trash}
            حذف العملية
          </button>
          <button class="btn btn-subtle btn-sm" id="modal-cancel-btn">إغلاق</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-delete-txn')?.addEventListener('click', () => {
      if (confirm('هل أنت متأكد من حذف هذه العملية المالية؟')) {
        db.deleteTransaction(txn.id);
        this.closeModal();
        this.showToast('تم حذف العملية.');
      }
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 4. Add Bank / Sub-Account / Card Modal
  openAddAccountModal(prefillBankId = null) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    const banks = db.state.banks || [];
    const selectedBankId = prefillBankId || (banks.length > 0 ? banks[0].id : 'bank-rajhi');

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in" style="max-width: 500px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:1.25rem;">🏛️</span>
            <h3>${prefillBankId ? 'إضافة حساب فرعي أو بطاقة للبنك' : 'إضافة بنك / حساب / بطاقة'}</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          
          <!-- 1. Select Bank / Wallet -->
          <div class="form-group">
            <label class="form-label">اختر البنك أو المحفظة الرقمية:</label>
            <select id="acc-bank-id" class="form-select" style="font-weight:700;">
              ${banks.map(b => `<option value="${b.id}" ${b.id === selectedBankId ? 'selected' : ''}>${b.logo || '🏛️'} ${b.name}</option>`).join('')}
            </select>
          </div>

          <!-- Custom Bank Name & Color (Shown if custom bank selected) -->
          <div id="custom-bank-box" style="display: ${selectedBankId === 'bank-custom' ? 'block' : 'none'}; background: var(--bg-surface-secondary); padding: 10px; border-radius: var(--radius-md); margin-bottom: var(--space-md); border: 1px dashed var(--border-default);">
            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label">اسم البنك / المحفظة المخصصة:</label>
              <input type="text" id="acc-custom-bank-name" class="form-input" placeholder="مثال: بنك أجنبي، محفظة إلكترونية...">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">لون تمييز البنك:</label>
              <input type="color" id="acc-custom-bank-color" value="#4F6DF5" style="width:100%;height:38px;border:none;border-radius:var(--radius-sm);cursor:pointer;">
            </div>
          </div>

          <!-- 2. Account / Instrument Type -->
          <div class="form-group">
            <label class="form-label">نوع الحساب / الأداة المالية:</label>
            <select id="acc-type" class="form-select" style="font-weight:700;">
              <option value="checking">🏦 حساب جاري أساسي (مرتبط بمدى والعمليات اليومية)</option>
              <option value="savings">💰 حساب ادخار / عوائد (بدون بطاقة غالباً)</option>
              <option value="sub_account">📑 حساب فرعي مخصص (طوارئ، مصاريف، تجارة)</option>
              <option value="credit_card">💳 بطاقة ائتمانية ذاتية (حد ائتماني مستقل)</option>
              <option value="prepaid_card">⚡ بطاقة مسبقة الدفع / سفر (شحن فوري من الحسابات)</option>
              <option value="digital_wallet">📱 محفظة رقمية</option>
            </select>
          </div>

          <!-- 3. Account Name -->
          <div class="form-group">
            <label class="form-label">اسم الحساب / البطاقة:</label>
            <input type="text" id="acc-name" class="form-input" placeholder="مثال: الحساب الجاري، بطاقة السفر، حساب التوفير..." required>
          </div>

          <!-- 4. Initial Balance / Credit Limit -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" id="label-acc-balance">الرصيد الافتتاحي (ريال):</label>
              <input type="number" id="acc-init-bal" class="form-input" placeholder="0.00" value="0" step="any">
            </div>
            <div class="form-group" id="group-credit-limit" style="display:none;">
              <label class="form-label">سقف الائتمان (الحد):</label>
              <input type="number" id="acc-credit-limit" class="form-input" placeholder="مثال: 10000" step="any">
            </div>
          </div>

          <!-- 5. Optional IBAN & Account Number -->
          <div id="group-bank-details">
            <div class="form-group">
              <label class="form-label">الآيبان (IBAN) - اختياري:</label>
              <input type="text" id="acc-iban" class="form-input" placeholder="SA..." style="font-family: var(--font-num); direction: ltr; text-align: left;">
            </div>

            <div class="form-group">
              <label class="form-label">رقم الحساب البنكي - اختياري:</label>
              <input type="text" id="acc-num" class="form-input" placeholder="مثال: 45892019283" style="font-family: var(--font-num); direction: ltr; text-align: left;">
            </div>
          </div>

          <!-- 6. Optional Linked Card Inline -->
          <div style="background: var(--bg-surface-secondary); padding: 12px; border-radius: var(--radius-md); margin-top: var(--space-md); border: 1px solid var(--border-subtle);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 0.8125rem; font-weight: 700;">💳 ربط بطاقة بنكية بهذا الحساب الآن (اختياري):</span>
            </div>
            <div class="form-row">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.75rem;">آخر 4 أرقام من البطاقة:</label>
                <input type="text" id="acc-card-last4" class="form-input" placeholder="مثال: 0932" maxlength="4" style="font-family: var(--font-num); direction: ltr; font-weight: 700;">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.75rem;">شبكة البطاقة:</label>
                <select id="acc-card-network" class="form-select">
                  <option value="مدى">مدى (mada)</option>
                  <option value="فيزا">فيزا (Visa)</option>
                  <option value="ماستركارد">ماستركارد (Mastercard)</option>
                  <option value="Apple Pay">Apple Pay</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-acc" style="padding: 0.65rem 1.5rem; font-weight: 800;">
            ${Icons.check}
            حفظ الحساب
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    // Dynamic bank selection logic
    const bankSelect = modalContent.querySelector('#acc-bank-id');
    const customBankBox = modalContent.querySelector('#custom-bank-box');
    bankSelect?.addEventListener('change', () => {
      if (bankSelect.value === 'bank-custom') {
        customBankBox.style.display = 'block';
      } else {
        customBankBox.style.display = 'none';
      }
    });

    // Dynamic type logic
    const typeSelect = modalContent.querySelector('#acc-type');
    const creditLimitGroup = modalContent.querySelector('#group-credit-limit');
    const labelBal = modalContent.querySelector('#label-acc-balance');

    typeSelect?.addEventListener('change', () => {
      const val = typeSelect.value;
      if (val === 'credit_card') {
        creditLimitGroup.style.display = 'block';
        labelBal.textContent = 'المبلغ المستحق حالياً (ريال):';
      } else {
        creditLimitGroup.style.display = 'none';
        labelBal.textContent = 'الرصيد الافتتاحي (ريال):';
      }
    });

    // Save Account
    modalContent.querySelector('#btn-save-acc')?.addEventListener('click', () => {
      const bankId = modalContent.querySelector('#acc-bank-id').value;
      const accountType = modalContent.querySelector('#acc-type').value;
      const name = modalContent.querySelector('#acc-name').value.trim();
      const initialBalance = Number(modalContent.querySelector('#acc-init-bal').value) || 0;
      const creditLimit = Number(modalContent.querySelector('#acc-credit-limit')?.value) || 0;
      const iban = modalContent.querySelector('#acc-iban').value.trim();
      const accountNumber = modalContent.querySelector('#acc-num').value.trim();
      const customBankName = modalContent.querySelector('#acc-custom-bank-name')?.value.trim();
      const customBankColor = modalContent.querySelector('#acc-custom-bank-color')?.value;
      
      const cardLast4 = modalContent.querySelector('#acc-card-last4')?.value.trim();
      const cardNetwork = modalContent.querySelector('#acc-card-network')?.value;

      if (!name) {
        alert('يرجى كتابة اسم الحساب.');
        return;
      }

      // Add Account
      const newAcc = db.addAccount({
        bankId,
        accountType,
        name,
        accountNumber: accountNumber || '',
        initialBalance,
        creditLimit: accountType === 'credit_card' ? creditLimit : null,
        iban: iban || '',
        customBankName: bankId === 'bank-custom' ? (customBankName || 'بنك مخصص') : null,
        color: bankId === 'bank-custom' ? customBankColor : null
      });

      // Add Card if last 4 digits were provided
      if (cardLast4 && cardLast4.length === 4 && newAcc) {
        db.addCard({
          accountId: newAcc.id,
          name: `بطاقة ${cardNetwork} (${name})`,
          last4: cardLast4,
          type: cardNetwork
        });
      }

      this.closeModal();
      this.showToast('تمت إضافة الحساب والبطاقة بنجاح! 🏛️');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 4.1 Quick Card Recharge / Internal Transfer Modal
  openRechargeCardModal(targetAccountId) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    const targetAcc = db.state.accounts.find(a => a.id === targetAccountId);
    if (!targetAcc) return;

    const sourceAccounts = db.state.accounts.filter(a => a.id !== targetAccountId);

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in" style="max-width: 440px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:1.25rem;">⚡</span>
            <h3>شحن بطاقة / حساب (${targetAcc.name})</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-md);">
            تحويل فوري من أحد حساباتك الجارية لتغذية رصيد البطاقة بدون أي رسوم.
          </p>

          <div class="form-group">
            <label class="form-label">الخصم من حساب:</label>
            <select id="recharge-from-acc" class="form-select" style="font-weight:700;">
              ${sourceAccounts.map(a => {
                const bal = FinancialEngine.getAccountBalance(a.id, db.state);
                return `<option value="${a.id}">🏦 ${a.name} (المتوفر: ${bal.toLocaleString('en-US')} ريال)</option>`;
              }).join('')}
              <option value="cash">💵 النقدية في اليد (كاش)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">المبلغ المراد شحنه (ريال):</label>
            <input type="number" id="recharge-amount" class="form-input" placeholder="مثال: 500" step="any" required style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-primary" id="btn-submit-recharge" style="padding: 0.65rem 1.5rem; font-weight: 800;">
            ⚡ شحن البطاقة الآن
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-submit-recharge')?.addEventListener('click', () => {
      const fromAccId = modalContent.querySelector('#recharge-from-acc').value;
      const amount = Number(modalContent.querySelector('#recharge-amount').value);

      if (!amount || amount <= 0) {
        alert('يرجى كتابة مبلغ شحن صحيح.');
        return;
      }

      // Add Transfer Transaction
      db.addTransaction({
        type: 'transfer',
        amount,
        merchant: `شحن بطاقة ${targetAcc.name}`,
        accountId: fromAccId,
        toAccountId: targetAcc.id,
        categoryId: 'cat-housing',
        description: `تغذية وشحن رصيد بطاقة (${targetAcc.name})`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      });

      this.closeModal();
      this.showToast(`تم شحن بطاقة ${targetAcc.name} بمبلغ ${amount} ريال بنجاح! ⚡`);
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 5. Add Card Modal
  openAddCardModal(accountId) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>ربط بطاقة جديدة بالحساب</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم البطاقة / الوصف:</label>
            <input type="text" id="card-name" class="form-input" placeholder="مثال: بطاقة مدى ابل باي..." required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">آخر 4 أرقام من البطاقة:</label>
              <input type="text" id="card-last4" class="form-input" placeholder="2825" maxlength="4" style="font-family: var(--font-num); direction: ltr; font-weight: 700; font-size: 1.1rem;" required>
            </div>
            <div class="form-group">
              <label class="form-label">نوع البطاقة:</label>
              <select id="card-type" class="form-select">
                <option value="Mada">مدى (mada)</option>
                <option value="Visa">فيزا (Visa)</option>
                <option value="Mastercard">ماستركارد (Mastercard)</option>
                <option value="Apple Pay">Apple Pay</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-card">
            ${Icons.check}
            ربط البطاقة
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-card').addEventListener('click', () => {
      const name = modalContent.querySelector('#card-name').value;
      const last4 = modalContent.querySelector('#card-last4').value;
      const type = modalContent.querySelector('#card-type').value;

      if (!last4 || last4.length !== 4) {
        alert('يرجى إدخال آخر 4 أرقام من البطاقة.');
        return;
      }

      db.addCard({ accountId, name: name || `بطاقة ${type}`, last4, type });
      this.closeModal();
      this.showToast('تم ربط البطاقة بنجاح! 💳');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 6. Reconciliation Modal
  openReconciliationModal(accountId) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    const isCash = accountId === 'cash';
    const acc = isCash ? { name: 'النقدية في اليد (كاش)' } : db.state.accounts.find(a => a.id === accountId);
    const calculatedBal = isCash ? FinancialEngine.getCashBalance(db.state) : FinancialEngine.getAccountBalance(accountId, db.state);

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>مطابقة وتسوية رصيد (${acc.name})</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div style="display: flex; justify-content: space-between; padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); margin-bottom: var(--space-md);">
            <span style="font-size: 0.875rem; color: var(--text-tertiary);">الرصيد المحسوب حالياً:</span>
            <span class="num" style="font-size: 1.15rem; font-weight: 700;">${calculatedBal.toLocaleString('en-US')} ريال</span>
          </div>

          <div class="form-group">
            <label class="form-label">الرصيد الفعلي الحقيقي الآن (ريال):</label>
            <input type="number" id="recon-actual-bal" class="form-input" placeholder="0.00" step="any" value="${calculatedBal}">
          </div>

          <div class="form-group">
            <label class="form-label">سبب التسوية:</label>
            <select id="recon-reason" class="form-select">
              <option value="رسوم بنكية غير مسجلة">رسوم أو ضريبة بنكية</option>
              <option value="عملية ناقصة أو نقدية">عملية سابقة غير مسجلة</option>
              <option value="تصحيح رصيد افتتاحي">تصحيح رصيد افتتاحي</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-recon">
            ${Icons.check}
            اعتماد التسوية
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-recon').addEventListener('click', () => {
      const actualVal = Number(modalContent.querySelector('#recon-actual-bal').value);
      const reason = modalContent.querySelector('#recon-reason').value;

      if (isNaN(actualVal)) return;

      const diff = actualVal - calculatedBal;
      db.addAdjustment({
        accountId,
        previousBalance: calculatedBal,
        newBalance: actualVal,
        difference: diff,
        reason
      });

      this.closeModal();
      this.showToast('تمت تسوية الرصيد بنجاح! ⚖️');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 7. Add Savings Goal Modal
  openAddSavingsGoalModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <span style="font-size: 1.25rem;">🎯</span>
            <h3>إنشاء هدف ادخار وصندوق جديد</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label class="form-label">اسم الصندوق / الهدف:</label>
              <input type="text" id="sg-name" class="form-input" placeholder="مثال: صندوق الطوارئ، سيارة جديدة..." required>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">الرمز:</label>
              <select id="sg-emoji" class="form-select">
                <option value="🎯">🎯 هدف عام</option>
                <option value="🛡️">🛡️ صندوق طوارئ</option>
                <option value="🕌">🕌 صدقة وزكاة</option>
                <option value="🚗">🚗 سيارة</option>
                <option value="🏠">🏠 منزل</option>
                <option value="💻">💻 أجهزة</option>
                <option value="✈️">✈️ سفر</option>
                <option value="💍">💍 زواج</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المبلغ المستهدف (ريال):</label>
              <input type="number" id="sg-target" class="form-input" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">المدخر حالياً (ريال):</label>
              <input type="number" id="sg-current" class="form-input" value="0">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">تاريخ بدء الادخار / الحول:</label>
              <input type="date" id="sg-start-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ تحقيق الهدف (اختياري):</label>
              <input type="date" id="sg-date" class="form-input">
            </div>
          </div>

          <div class="form-group" style="margin-top: var(--space-xs);">
            <label style="display: flex; align-items: center; gap: var(--space-xs); font-size: 0.8125rem; cursor: pointer;">
              <input type="checkbox" id="sg-is-hawl-passed">
              <span>🕌 <strong>دار عليه الحول</strong> (مرت سنة كاملة على ملكية هذا المال وتجب فيه الزكاة بنسبة 2.5%)</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-sg">
            ${Icons.check}
            إنشاء الصندوق
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-sg').addEventListener('click', () => {
      const name = modalContent.querySelector('#sg-name').value;
      const emoji = modalContent.querySelector('#sg-emoji').value;
      const targetAmount = Number(modalContent.querySelector('#sg-target').value);
      const currentAmount = Number(modalContent.querySelector('#sg-current').value) || 0;
      let startDate = modalContent.querySelector('#sg-start-date').value;
      const targetDate = modalContent.querySelector('#sg-date').value;
      const isHawlPassed = modalContent.querySelector('#sg-is-hawl-passed').checked;

      if (!name || !targetAmount || isNaN(targetAmount)) {
        alert('يرجى كتابة اسم الهدف والمبلغ المستهدف.');
        return;
      }

      if (isHawlPassed) {
        // Set start date to 1 year ago so it's marked as Hawl passed
        startDate = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().split('T')[0];
      }

      db.addSavingsGoal({ name, emoji, targetAmount, currentAmount, startDate, targetDate });
      this.closeModal();
      this.showToast('تم إنشاء هدف الادخار وتفعيل تتبع الزكاة بنجاح! 🎯');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 8. Add Investment Modal
  openAddInvestmentModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>إضافة محفظة أو أصل استثماري</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم الأصل / المحفظة:</label>
            <input type="text" id="inv-name" class="form-input" placeholder="مثال: أسهم النمو، صكوك..." required>
          </div>

          <div class="form-group">
            <label class="form-label">المنصة / الوسيط:</label>
            <input type="text" id="inv-platform" class="form-input" placeholder="مثال: دراية، صكوك، الراجحي...">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">رأس المال المودع (ريال):</label>
              <input type="number" id="inv-contrib" class="form-input" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">التقييم والقيمة الحالية (ريال):</label>
              <input type="number" id="inv-val" class="form-input" placeholder="0.00" required>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-inv">حفظ الأصل</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-inv').addEventListener('click', () => {
      const name = modalContent.querySelector('#inv-name').value;
      const platform = modalContent.querySelector('#inv-platform').value;
      const contributions = Number(modalContent.querySelector('#inv-contrib').value);
      const currentValue = Number(modalContent.querySelector('#inv-val').value);

      if (!name || isNaN(contributions)) return;

      db.addInvestment({ name, platform, contributions, currentValue });
      this.closeModal();
      this.showToast('تمت إضافة الأصل الاستثماري! 📈');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 9. Add Obligation Modal
  openAddObligationModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>إضافة التزام دوري أو اشتراك</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم الالتزام:</label>
            <input type="text" id="ob-name" class="form-input" placeholder="مثال: فاتورة الإنترنت، قسط..." required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المبلغ (ريال):</label>
              <input type="number" id="ob-amount" class="form-input" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">التكرار:</label>
              <select id="ob-recurrence" class="form-select">
                <option value="monthly">شهري</option>
                <option value="annual">سنوي</option>
                <option value="quarterly">ربع سنوي</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">تاريخ الاستحقاق:</label>
              <input type="date" id="ob-due" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
              <label class="form-label">التصنيف:</label>
              <select id="ob-cat" class="form-select">
                ${db.state.categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-ob">حفظ الالتزام</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-ob').addEventListener('click', () => {
      const name = modalContent.querySelector('#ob-name').value;
      const amount = Number(modalContent.querySelector('#ob-amount').value);
      const recurrence = modalContent.querySelector('#ob-recurrence').value;
      const dueDate = modalContent.querySelector('#ob-due').value;
      const categoryId = modalContent.querySelector('#ob-cat').value;

      if (!name || !amount) return;

      db.addObligation({ name, amount, recurrence, dueDate, categoryId });
      this.closeModal();
      this.showToast('تمت إضافة الالتزام بنجاح! 📋');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 10. Add Debt Modal
  openAddDebtModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>تسجيل دين أو مستحق مالي</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">النوع:</label>
            <div class="segmented-control" id="debt-type-select" style="width: 100%; display: flex;">
              <button type="button" class="segmented-btn active" data-val="receivable" style="flex: 1;">🤝 مستحقات لي</button>
              <button type="button" class="segmented-btn" data-val="debt" style="flex: 1;">📋 دين علي</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">اسم الشخص / الجهة:</label>
            <input type="text" id="debt-person" class="form-input" placeholder="الاسم..." required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المبلغ (ريال):</label>
              <input type="number" id="debt-amount" class="form-input" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ الاستحقاق:</label>
              <input type="date" id="debt-due" class="form-input">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-debt">حفظ القيد</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    let selectedDebtType = 'receivable';
    modalContent.querySelectorAll('#debt-type-select .segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('#debt-type-select .segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDebtType = btn.getAttribute('data-val');
      });
    });

    modalContent.querySelector('#btn-save-debt').addEventListener('click', () => {
      const person = modalContent.querySelector('#debt-person').value;
      const amount = Number(modalContent.querySelector('#debt-amount').value);
      const dueDate = modalContent.querySelector('#debt-due').value;

      if (!person || !amount) return;

      db.addDebt({ type: selectedDebtType, person, amount, dueDate });
      this.closeModal();
      this.showToast('تم حفظ القيد بنجاح! 🤝');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 11. Add Planned Purchase Modal
  openAddPurchaseModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>تخطيط مشتريات مستقبلية جديدة</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم المنتج / الغرض:</label>
            <input type="text" id="pur-name" class="form-input" placeholder="مثال: شاشة عمل مريحة..." required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">السعر المتوقع (ريال):</label>
              <input type="number" id="pur-price" class="form-input" placeholder="0.00" required>
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ الشراء المستهدف:</label>
              <input type="date" id="pur-date" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">نوع الشراء:</label>
              <select id="pur-type" class="form-select">
                <option value="need">🎯 احتياج أساسي (Need)</option>
                <option value="want">✨ رغبة / كماليات (Want)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">الأولوية:</label>
              <select id="pur-priority" class="form-select">
                <option value="high">أولوية عالية</option>
                <option value="medium" selected>أولوية متوسطة</option>
                <option value="low">أولوية منخفضة</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-pur">حفظ في المشتريات</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-pur').addEventListener('click', () => {
      const name = modalContent.querySelector('#pur-name').value;
      const expectedPrice = Number(modalContent.querySelector('#pur-price').value);
      const targetDate = modalContent.querySelector('#pur-date').value;
      const type = modalContent.querySelector('#pur-type').value;
      const priority = modalContent.querySelector('#pur-priority').value;

      if (!name || !expectedPrice) return;

      db.addPurchase({ name, expectedPrice, targetDate, type, priority });
      this.closeModal();
      this.showToast('تمت إضافة المنتج إلى قائمة التخطيط! 🛍️');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 12. Purchase Completion Flow
  openPurchaseCompletionModal(purchase) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>تسجيل إتمام شراء "${purchase.name}"</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-md);">
            سيتم خصم المبلغ الفعلي من حسابك وتسجيل المصروف دون تكرار.
          </p>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">السعر الفعلي للشراء (ريال):</label>
              <input type="number" id="pur-actual-price" class="form-input" value="${purchase.expectedPrice}" step="any" required>
            </div>
            <div class="form-group">
              <label class="form-label">الحساب الذي صُرف منه:</label>
              <select id="pur-comp-acc" class="form-select">
                ${db.state.accounts.map(a => `<option value="${a.id}">🏦 ${a.name}</option>`).join('')}
                <option value="cash">💵 النقدية في اليد (كاش)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-pur-comp">تأكيد وخصم المصروف</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-pur-comp').addEventListener('click', () => {
      const actualPrice = Number(modalContent.querySelector('#pur-actual-price').value);
      const accountId = modalContent.querySelector('#pur-comp-acc').value;

      if (!actualPrice) return;

      const newTxn = db.addTransaction({
        type: 'expense',
        amount: actualPrice,
        merchant: purchase.name,
        accountId,
        categoryId: 'cat-shopping',
        date: new Date().toISOString().split('T')[0],
        description: `شراء مخطط مكتمل: ${purchase.name}`
      });

      db.updatePurchase(purchase.id, {
        status: 'purchased',
        actualPrice,
        linkedTransactionId: newTxn.id
      });

      this.closeModal();
      this.showToast('تم تسجيل الشراء وخصمه من الحساب! 🛒✨');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  bindModalCloseEvents(modalContent, modalBackdrop) {
    modalContent.querySelector('#modal-close-btn')?.addEventListener('click', () => this.closeModal());
    modalContent.querySelector('#modal-cancel-btn')?.addEventListener('click', () => this.closeModal());
    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) this.closeModal();
    };
  }

  closeModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

// Global App Instance
window.app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
  });
} else {
  window.app.init();
}


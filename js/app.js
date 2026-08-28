/**
 * MASAR - Core Application Coordinator & Router & Modals Controller
 */

import { db } from './engine/db.js';
import { FinancialEngine } from './engine/financialEngine.js';
import { SMSParser } from './engine/smsParser.js';
import { cloudAuth } from './engine/firebase.js';
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
    const mainContent = document.getElementById('main-view-container');
    if (mainContent && this.views[this.currentView]) {
      this.views[this.currentView].render(mainContent);
    }
  }

  updateHeaderAuthStatus() {
    const user = cloudAuth.currentUser;
    const syncStatus = cloudAuth.syncStatus;
    const headerPill = document.getElementById('header-cloud-status');
    if (headerPill) {
      headerPill.innerHTML = `
        <span class="sync-dot ${syncStatus}"></span>
        <span>${user ? user.displayName : 'سحابي (تسجيل)'}</span>
      `;
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
      this.openAuthModal();
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
    });

    document.getElementById('pwa-btn-dismiss')?.addEventListener('click', () => {
      document.getElementById('pwa-install-banner').style.display = 'none';
    });
  }

  // --- MODALS & AUTHENTICATION ENGINE ---

  // 0. Cloud Auth Modal (Google & Firebase Login)
  openAuthModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent  = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    let authMode   = 'login';
    let isLoading  = false;

    const renderAuth = () => {
      modalContent.innerHTML = `
        <div class="modal-sheet animate-fade-in" style="max-width: 440px;">
          <div class="modal-header">
            <h3>☁️ ${authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h3>
            <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
          </div>

          <div class="modal-body">
            <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-lg); text-align: center; line-height: 1.6;">
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
                <label class="form-label">الاسم الكامل</label>
                <input type="text" id="auth-name" class="form-input" placeholder="اسمك الكامل" autocomplete="name">
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

      const showError = (msg) => {
        const errBox = modalContent.querySelector('#auth-error-box');
        if (!errBox) return;
        // إذا كان الخطأ configuration-not-found → إرشادات Firebase Console
        if (msg.includes('configuration-not-found') || msg.includes('Configuration')) {
          errBox.innerHTML = `
            ⚠️ Firebase Authentication غير مفعّل بعد.<br>
            <a href="https://console.firebase.google.com/project/cash-plus-90e0c/authentication/providers"
               target="_blank"
               style="color:var(--primary);font-weight:700;">
              اضغط هنا لتفعيله في Firebase Console
            </a>
            <br><small style="color:var(--text-tertiary);">فعّل Email/Password وGoogle ثم أعد المحاولة</small>
          `;
        } else {
          errBox.textContent = msg;
        }
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

        setLoading(true);
        try {
          if (authMode === 'signup') {
            await cloudAuth.signUpWithEmail(email, password, name);
            this.showToast('تم إنشاء حسابك السحابي بنجاح! 🎉');
          } else {
            await cloudAuth.signInWithEmail(email, password);
            this.showToast('مرحباً! تم تسجيل الدخول وربط السحابة ✅');
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

      // Focus email field
      setTimeout(() => modalContent.querySelector('#auth-email')?.focus(), 100);
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
      <div class="modal-sheet animate-fade-in">
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
            <textarea id="sms-raw-input" class="form-textarea" placeholder="مثال: شراء عبر نقاط البيع بطاقة:2825 فيزا-ابل باي لدى:MATHNA CA مبلغ:85 SAR رصيد:11,790 SAR..." style="min-height: 100px;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-md);">
            <button class="btn btn-glass btn-sm" id="btn-parse-sms">
              ⚡ تحليل الرسالة الآن
            </button>
          </div>

          <div id="sms-parsed-result" style="display: none;"></div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-parsed-txn" disabled>
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
          
          <div style="font-size: 0.8125rem; font-weight: 700; color: var(--primary);">✅ البيانات المستخرجة:</div>

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
              <input type="number" id="parsed-amount" class="form-input" value="${parsedData.amount || ''}" step="any">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">التاجر / الجهة المستفيدة:</label>
            <input type="text" id="parsed-merchant" class="form-input" value="${parsedData.merchant || ''}">
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
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        rawMessage: raw,
        description: `عملية عبر رسالة بنكية (${merchant || 'تاجر'})`
      });

      this.closeModal();
      this.showToast('تم تسجيل العملية بنجاح من الرسالة البنكية! ✨');
    });

    this.bindModalCloseEvents(modalContent, modalBackdrop);
  }

  // 2. Manual Transaction Modal
  openTransactionModal(prefill = {}) {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <span style="font-size: 1.25rem;">✍️</span>
            <h3>تسجيل عملية مالية جديدة</h3>
          </div>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">نوع الحركة المالية:</label>
            <div class="segmented-control" id="form-txn-type" style="width: 100%; display: flex;">
              <button type="button" class="segmented-btn ${(!prefill.type || prefill.type === 'expense') ? 'active' : ''}" data-type="expense" style="flex: 1;">مصروف 📤</button>
              <button type="button" class="segmented-btn ${prefill.type === 'income' ? 'active' : ''}" data-type="income" style="flex: 1;">دخل وارد 📥</button>
              <button type="button" class="segmented-btn ${prefill.type === 'transfer' ? 'active' : ''}" data-type="transfer" style="flex: 1;">تحويل 🔁</button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المبلغ:</label>
              <input type="number" id="txn-form-amount" class="form-input" placeholder="0.00" value="${prefill.amount || ''}" step="any" required>
            </div>
            <div class="form-group">
              <label class="form-label">الرسوم البنكية (إن وجدت):</label>
              <input type="number" id="txn-form-fee" class="form-input" placeholder="0.00" value="${prefill.fee || 0}" step="any">
            </div>
          </div>

          <div class="form-group" id="group-merchant">
            <label class="form-label">اسم التاجر / الجهة المستفيدة / المصدر:</label>
            <input type="text" id="txn-form-merchant" class="form-input" placeholder="مثال: أسواق التميمي، ساسكو، سداد إيجار..." value="${prefill.merchant || ''}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" id="label-from-acc">من حساب / محفظة:</label>
              <select id="txn-form-from-acc" class="form-select">
                ${db.state.accounts.map(a => `<option value="${a.id}">🏦 ${a.name}</option>`).join('')}
                <option value="cash">💵 النقدية في اليد (كاش)</option>
              </select>
            </div>

            <div class="form-group" id="group-to-acc" style="display: none;">
              <label class="form-label">إلى حساب / محفظة:</label>
              <select id="txn-form-to-acc" class="form-select">
                ${db.state.accounts.map(a => `<option value="${a.id}">🏦 ${a.name}</option>`).join('')}
                <option value="cash">💵 النقدية في اليد (كاش)</option>
              </select>
            </div>

            <div class="form-group" id="group-category">
              <label class="form-label">التصنيف:</label>
              <select id="txn-form-cat" class="form-select">
                ${db.state.categories.map(c => `<option value="${c.id}" ${c.id === prefill.categoryId ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
              </select>
            </div>
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

          <div class="form-group" style="margin-top: var(--space-xs);">
            <label style="display: flex; align-items: center; gap: var(--space-xs); font-size: 0.875rem; cursor: pointer;">
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
          <button class="btn btn-emerald" id="btn-save-manual-txn">
            ${Icons.check}
            حفظ العملية
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    let selectedType = prefill.type || 'expense';

    const updateTypeUI = (type) => {
      selectedType = type;
      const groupToAcc = modalContent.querySelector('#group-to-acc');
      const groupCategory = modalContent.querySelector('#group-category');
      const labelFrom = modalContent.querySelector('#label-from-acc');

      if (type === 'transfer') {
        if (groupToAcc) groupToAcc.style.display = 'block';
        if (groupCategory) groupCategory.style.display = 'none';
        if (labelFrom) labelFrom.textContent = 'من حساب:';
      } else {
        if (groupToAcc) groupToAcc.style.display = 'none';
        if (groupCategory) groupCategory.style.display = 'block';
        if (labelFrom) labelFrom.textContent = type === 'income' ? 'إيداع في حساب:' : 'من حساب / محفظة:';
      }
    };

    updateTypeUI(selectedType);

    modalContent.querySelectorAll('#form-txn-type .segmented-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('#form-txn-type .segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateTypeUI(btn.getAttribute('data-type'));
      });
    });

    modalContent.querySelector('#btn-save-manual-txn').addEventListener('click', () => {
      const amount = Number(modalContent.querySelector('#txn-form-amount').value);
      const fee = Number(modalContent.querySelector('#txn-form-fee').value) || 0;
      const merchant = modalContent.querySelector('#txn-form-merchant').value;
      const accountId = modalContent.querySelector('#txn-form-from-acc').value;
      const toAccountId = selectedType === 'transfer' ? modalContent.querySelector('#txn-form-to-acc').value : null;
      const categoryId = selectedType !== 'transfer' ? modalContent.querySelector('#txn-form-cat').value : null;
      const date = modalContent.querySelector('#txn-form-date').value;
      const time = modalContent.querySelector('#txn-form-time').value;
      const isForSomeoneElse = modalContent.querySelector('#txn-form-for-other').checked;
      const description = modalContent.querySelector('#txn-form-desc').value;

      if (!amount || isNaN(amount)) {
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

  // 4. Add Account Modal
  openAddAccountModal() {
    const modalBackdrop = document.getElementById('global-modal-backdrop');
    const modalContent = document.getElementById('global-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-sheet animate-fade-in">
        <div class="modal-header">
          <h3>إضافة حساب بنكي / محفظة جديدة</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم البنك / المزود:</label>
            <select id="acc-bank-id" class="form-select">
              ${db.state.banks.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">اسم الحساب في التطبيق:</label>
            <input type="text" id="acc-name" class="form-input" placeholder="مثال: الحساب الجاري، حساب الادخار..." required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">رقم الحساب الحقيقي:</label>
              <input type="text" id="acc-num" class="form-input" placeholder="رقم الحساب البنكي">
            </div>
            <div class="form-group">
              <label class="form-label">الرصيد الافتتاحي (ريال):</label>
              <input type="number" id="acc-init-bal" class="form-input" placeholder="0.00" value="0">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">الآيبان (IBAN):</label>
            <input type="text" id="acc-iban" class="form-input" placeholder="SA..." style="font-family: var(--font-num); direction: ltr; text-align: left;">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-acc">
            ${Icons.check}
            حفظ الحساب
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-acc').addEventListener('click', () => {
      const bankId = modalContent.querySelector('#acc-bank-id').value;
      const name = modalContent.querySelector('#acc-name').value;
      const accountNumber = modalContent.querySelector('#acc-num').value;
      const initialBalance = Number(modalContent.querySelector('#acc-init-bal').value) || 0;
      const iban = modalContent.querySelector('#acc-iban').value;

      if (!name) {
        alert('يرجى كتابة اسم الحساب.');
        return;
      }

      db.addAccount({
        bankId,
        name,
        accountNumber: accountNumber || '000000',
        initialBalance,
        iban: iban || 'SA0000000000000000000000'
      });

      this.closeModal();
      this.showToast('تمت إضافة الحساب بنجاح! 🏦');
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
          <h3>إنشاء هدف ادخار جديد</h3>
          <button class="btn btn-glass btn-icon btn-sm" id="modal-close-btn">${Icons.close}</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label class="form-label">اسم الهدف:</label>
              <input type="text" id="sg-name" class="form-input" placeholder="مثال: صندوق الطوارئ..." required>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">الرمز:</label>
              <select id="sg-emoji" class="form-select">
                <option value="🎯">🎯 هدف</option>
                <option value="🛡️">🛡️ طوارئ</option>
                <option value="💻">💻 أجهزة</option>
                <option value="🚗">🚗 سيارة</option>
                <option value="✈️">✈️ سفر</option>
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

          <div class="form-group">
            <label class="form-label">تاريخ الهدف:</label>
            <input type="date" id="sg-date" class="form-input">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-subtle" id="modal-cancel-btn">إلغاء</button>
          <button class="btn btn-emerald" id="btn-save-sg">إنشاء الهدف</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');

    modalContent.querySelector('#btn-save-sg').addEventListener('click', () => {
      const name = modalContent.querySelector('#sg-name').value;
      const emoji = modalContent.querySelector('#sg-emoji').value;
      const targetAmount = Number(modalContent.querySelector('#sg-target').value);
      const currentAmount = Number(modalContent.querySelector('#sg-current').value) || 0;
      const targetDate = modalContent.querySelector('#sg-date').value;

      if (!name || !targetAmount) return;

      db.addSavingsGoal({ name, emoji, targetAmount, currentAmount, targetDate });
      this.closeModal();
      this.showToast('تم إنشاء هدف الادخار بنجاح! 🎯');
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


/**
 * MASAR - Database & Storage Layer (Single Source of Truth)
 * Full offline persistence with IndexedDB / LocalStorage fallback & seed data
 */

const STORAGE_KEY = 'masar_financial_os_v1';

// ─── Clean Empty State — User starts fresh, enters their own data ─────────────
const DEFAULT_SEED_DATA = {
  settings: {
    theme: 'system',
    currency: 'SAR',
    startDayOfMonth: 1,
    hideSensitive: false,
    userProfile: {
      name: '',
      role: ''
    }
  },

  // Reference lists — banks & categories are kept as helpers (not user data)
  banks: [
    { id: 'bank-1',  name: 'مصرف الراجحي',                    code: 'RJHI', color: '#1B365D' },
    { id: 'bank-2',  name: 'البنك الأهلي السعودي (SNB)',       code: 'NCBK', color: '#005A36' },
    { id: 'bank-3',  name: 'مصرف الإنماء',                    code: 'INMA', color: '#886221' },
    { id: 'bank-4',  name: 'بنك الجزيرة',                     code: 'BJAZ', color: '#E8412A' },
    { id: 'bank-5',  name: 'البنك السعودي الفرنسي (Alfransi)', code: 'BSFR', color: '#002D6B' },
    { id: 'bank-6',  name: 'بنك الرياض',                      code: 'RIBL', color: '#1C3D77' },
    { id: 'bank-7',  name: 'البنك السعودي للاستثمار (SAIB)',   code: 'SAIB', color: '#004B8D' },
    { id: 'bank-8',  name: 'بنك الاتحاد',                     code: 'UBNK', color: '#D41E2E' },
    { id: 'bank-9',  name: 'STC Pay (محفظة رقمية)',            code: 'STCP', color: '#4F008C' },
    { id: 'bank-10', name: 'Apple Pay / نقدية',                code: 'CASH', color: '#1D1D1F' },
    { id: 'bank-11', name: 'بنك آخر',                         code: 'OTHR', color: '#64748B' }
  ],

  categories: [
    { id: 'cat-housing',         name: 'السكن والفواتير',        emoji: '🏠', type: 'expense', color: '#6366F1', subcategories: ['الإيجار', 'الكهرباء والمياه', 'الإنترنت والاتصالات', 'صيانة المنزل'] },
    { id: 'cat-food',            name: 'الطعام والمشروبات',      emoji: '🍽️', type: 'expense', color: '#F59E0B', subcategories: ['سوبرماركت ومؤونة', 'مطاعم', 'كافيهات', 'توصيل طلبات'] },
    { id: 'cat-transport',       name: 'المواصلات والسيارة',     emoji: '🚗', type: 'expense', color: '#10B981', subcategories: ['بنزين ووقود', 'صيانة', 'تطبيقات توصيل', 'مواقف ورسوم'] },
    { id: 'cat-shopping',        name: 'التسوق والمشتريات',      emoji: '🛍️', type: 'expense', color: '#EC4899', subcategories: ['ملابس وأحذية', 'إلكترونيات', 'مستلزمات منزلية', 'أونلاين'] },
    { id: 'cat-health',          name: 'الصحة والعناية',         emoji: '💊', type: 'expense', color: '#06B6D4', subcategories: ['صيدلية وأدوية', 'عيادات وفحوصات', 'عناية شخصية'] },
    { id: 'cat-entertainment',   name: 'الترفيه والاشتراكات',    emoji: '🎬', type: 'expense', color: '#8B5CF6', subcategories: ['اشتراكات رقمية', 'ألعاب ورياضة', 'سفر وترفيه'] },
    { id: 'cat-education',       name: 'التعليم والتطوير',       emoji: '📚', type: 'expense', color: '#0EA5E9', subcategories: ['كورسات', 'كتب', 'دورات مهنية'] },
    { id: 'cat-obligations',     name: 'التزامات وأقساط',        emoji: '📋', type: 'expense', color: '#EF4444', subcategories: ['أقساط', 'تمويل', 'تأمين', 'رسوم حكومية'] },
    { id: 'cat-income-salary',   name: 'الراتب والدخل الثابت',   emoji: '💰', type: 'income',  color: '#059669', subcategories: ['راتب شهري', 'بدلات', 'مكافآت'] },
    { id: 'cat-income-freelance',name: 'دخل العمل الحر',         emoji: '💻', type: 'income',  color: '#10B981', subcategories: ['برمجة وتطوير', 'تصميم واستشارات', 'كتابة محتوى'] },
    { id: 'cat-income-project',  name: 'دخل المشاريع والتجارة', emoji: '📈', type: 'income',  color: '#3B82F6', subcategories: ['أرباح متجر', 'شراكات', 'مبيعات'] },
    { id: 'cat-income-other',    name: 'عوائد أخرى',             emoji: '🎁', type: 'income',  color: '#F59E0B', subcategories: ['هدايا وعيديات', 'عوائد استثمار', 'استرداد مالي'] }
  ],

  // ─── All user data starts empty ────────────────────────────────────────────
  accounts:     [],
  cards:        [],
  cash:         { initialBalance: 0 },
  transactions: [],
  budgets:      [],
  savingsGoals: [],
  investments:  [],
  obligations:  [],
  debts:        [],
  purchases:    [],
  adjustments:  []
};


// Main Database Manager Class
class Database {
  constructor() {
    this.state = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SEED_DATA, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load from localStorage, using default seed:', e);
    }
    this.save(DEFAULT_SEED_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
  }

  save(data = this.state) {
    this.state = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    this.notify();
  }

  // Save from cloud without firing subscribers (prevents infinite sync loop)
  saveQuiet(data) {
    if (!data || typeof data !== 'object') return;
    this.state = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to saveQuiet to localStorage:', e);
    }
    // Re-render current view without triggering cloud push again
    if (window.app && window.app.renderCurrentView) {
      window.app.renderCurrentView();
      window.app.updateHeaderAuthStatus();
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }


  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
  }

  // --- Transactions ---
  addTransaction(txn) {
    const newTxn = {
      id: 'txn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      currency: this.state.settings.currency || 'SAR',
      ...txn
    };
    this.state.transactions.unshift(newTxn);
    this.save();
    return newTxn;
  }

  updateTransaction(id, updates) {
    const idx = this.state.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.transactions[idx] = { ...this.state.transactions[idx], ...updates };
      this.save();
      return this.state.transactions[idx];
    }
    return null;
  }

  deleteTransaction(id) {
    this.state.transactions = this.state.transactions.filter(t => t.id !== id);
    this.save();
  }

  // --- Accounts & Banks ---
  addAccount(acc) {
    const newAcc = {
      id: 'acc-' + Date.now(),
      currency: this.state.settings.currency || 'SAR',
      initialBalance: Number(acc.initialBalance) || 0,
      ...acc
    };
    this.state.accounts.push(newAcc);
    this.save();
    return newAcc;
  }

  updateAccount(id, updates) {
    const idx = this.state.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.state.accounts[idx] = { ...this.state.accounts[idx], ...updates };
      this.save();
      return this.state.accounts[idx];
    }
    return null;
  }

  deleteAccount(id) {
    this.state.accounts = this.state.accounts.filter(a => a.id !== id);
    this.state.cards = this.state.cards.filter(c => c.accountId !== id);
    this.save();
  }

  addCard(card) {
    const newCard = {
      id: 'card-' + Date.now(),
      status: 'active',
      ...card
    };
    this.state.cards.push(newCard);
    this.save();
    return newCard;
  }

  deleteCard(id) {
    this.state.cards = this.state.cards.filter(c => c.id !== id);
    this.save();
  }

  // --- Savings Goals ---
  addSavingsGoal(goal) {
    const newGoal = {
      id: 'sg-' + Date.now(),
      currentAmount: Number(goal.currentAmount) || 0,
      targetAmount: Number(goal.targetAmount) || 0,
      ...goal
    };
    this.state.savingsGoals.push(newGoal);
    this.save();
    return newGoal;
  }

  updateSavingsGoal(id, updates) {
    const idx = this.state.savingsGoals.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.state.savingsGoals[idx] = { ...this.state.savingsGoals[idx], ...updates };
      this.save();
      return this.state.savingsGoals[idx];
    }
    return null;
  }

  deleteSavingsGoal(id) {
    this.state.savingsGoals = this.state.savingsGoals.filter(g => g.id !== id);
    this.save();
  }

  // --- Investments ---
  addInvestment(inv) {
    const newInv = {
      id: 'inv-' + Date.now(),
      contributions: Number(inv.contributions) || 0,
      withdrawals: Number(inv.withdrawals) || 0,
      currentValue: Number(inv.currentValue) || 0,
      currency: this.state.settings.currency || 'SAR',
      ...inv
    };
    this.state.investments.push(newInv);
    this.save();
    return newInv;
  }

  updateInvestment(id, updates) {
    const idx = this.state.investments.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.state.investments[idx] = { ...this.state.investments[idx], ...updates };
      this.save();
      return this.state.investments[idx];
    }
    return null;
  }

  deleteInvestment(id) {
    this.state.investments = this.state.investments.filter(i => i.id !== id);
    this.save();
  }

  // --- Recurring Obligations ---
  addObligation(ob) {
    const newOb = {
      id: 'ob-' + Date.now(),
      amount: Number(ob.amount) || 0,
      reminder: true,
      status: 'active',
      ...ob
    };
    this.state.obligations.push(newOb);
    this.save();
    return newOb;
  }

  updateObligation(id, updates) {
    const idx = this.state.obligations.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.state.obligations[idx] = { ...this.state.obligations[idx], ...updates };
      this.save();
      return this.state.obligations[idx];
    }
    return null;
  }

  deleteObligation(id) {
    this.state.obligations = this.state.obligations.filter(o => o.id !== id);
    this.save();
  }

  // --- Debts & Receivables ---
  addDebt(debt) {
    const newDebt = {
      id: 'debt-' + Date.now(),
      amount: Number(debt.amount) || 0,
      status: 'pending',
      payments: [],
      ...debt
    };
    this.state.debts.push(newDebt);
    this.save();
    return newDebt;
  }

  addDebtPayment(debtId, payment) {
    const debt = this.state.debts.find(d => d.id === debtId);
    if (debt) {
      debt.payments = debt.payments || [];
      debt.payments.push({
        id: 'p-' + Date.now(),
        amount: Number(payment.amount) || 0,
        date: payment.date || new Date().toISOString().split('T')[0],
        notes: payment.notes || ''
      });
      // Check if fully paid
      const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= debt.amount) {
        debt.status = 'completed';
      }
      this.save();
    }
  }

  deleteDebt(id) {
    this.state.debts = this.state.debts.filter(d => d.id !== id);
    this.save();
  }

  // --- Planned Purchases ---
  addPurchase(pur) {
    const newPur = {
      id: 'pur-' + Date.now(),
      expectedPrice: Number(pur.expectedPrice) || 0,
      status: 'planned',
      ...pur
    };
    this.state.purchases.push(newPur);
    this.save();
    return newPur;
  }

  updatePurchase(id, updates) {
    const idx = this.state.purchases.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.purchases[idx] = { ...this.state.purchases[idx], ...updates };
      this.save();
      return this.state.purchases[idx];
    }
    return null;
  }

  deletePurchase(id) {
    this.state.purchases = this.state.purchases.filter(p => p.id !== id);
    this.save();
  }

  // --- Budgets ---
  setBudget(categoryId, limit, month = '2026-08') {
    let budget = this.state.budgets.find(b => b.categoryId === categoryId && b.month === month);
    if (budget) {
      budget.limit = Number(limit) || 0;
    } else {
      this.state.budgets.push({
        id: 'b-' + Date.now(),
        month,
        categoryId,
        limit: Number(limit) || 0
      });
    }
    this.save();
  }

  // --- Account Reconciliation ---
  addAdjustment(adj) {
    const newAdj = {
      id: 'adj-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...adj
    };
    this.state.adjustments = this.state.adjustments || [];
    this.state.adjustments.unshift(newAdj);
    this.save();
    return newAdj;
  }

  // --- Backup & Restore ---
  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.accounts && data.transactions) {
        this.save(data);
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  }

  resetToDefault() {
    this.save(JSON.parse(JSON.stringify(DEFAULT_SEED_DATA)));
  }
}

export const db = new Database();

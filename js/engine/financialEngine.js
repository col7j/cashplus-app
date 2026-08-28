/**
 * MASAR - Single Source of Truth Financial Calculation Engine
 * All calculations are derived strictly from ledger transactions and state.
 */

import { db } from './db.js';

export class FinancialEngine {
  /**
   * Get dynamic balance of a specific account calculated from ledger
   */
  static getAccountBalance(accountId, state = db.state) {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return 0;

    let balance = Number(account.initialBalance) || 0;

    state.transactions.forEach(txn => {
      const amount = Number(txn.amount) || 0;
      const fee = Number(txn.fee) || 0;

      if (txn.type === 'income' && txn.accountId === accountId) {
        // Income adds to account balance (even if for someone else, physical money enters the account)
        balance += amount;
      } else if (txn.type === 'expense' && txn.accountId === accountId) {
        balance -= (amount + fee);
      } else if (txn.type === 'transfer') {
        if (txn.accountId === accountId) {
          // Outgoing transfer
          balance -= (amount + fee);
        }
        if (txn.toAccountId === accountId) {
          // Incoming transfer
          balance += amount;
        }
      }
    });

    // Add adjustments if any
    if (state.adjustments && state.adjustments.length > 0) {
      state.adjustments
        .filter(adj => adj.accountId === accountId)
        .forEach(adj => {
          balance += (Number(adj.difference) || 0);
        });
    }

    return balance;
  }

  /**
   * Get calculated cash balance (Cash in Hand)
   */
  static getCashBalance(state = db.state) {
    let balance = Number(state.cash?.initialBalance) || 0;

    state.transactions.forEach(txn => {
      const amount = Number(txn.amount) || 0;
      if (txn.accountId === 'cash') {
        if (txn.type === 'income') balance += amount;
        if (txn.type === 'expense') balance -= amount;
      }
      if (txn.type === 'transfer') {
        if (txn.accountId === 'cash') balance -= amount;
        if (txn.toAccountId === 'cash') balance += amount;
      }
    });

    return balance;
  }

  /**
   * Get total savings across goals and savings accounts
   */
  static getTotalSavings(state = db.state) {
    // Sum of savings goals current amounts
    return state.savingsGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
  }

  /**
   * Get total market value of investments
   */
  static getTotalInvestments(state = db.state) {
    return state.investments.reduce((sum, inv) => sum + (Number(inv.currentValue) || 0), 0);
  }

  /**
   * Total Money across all liquid accounts + cash + investments
   */
  static getTotalMoney(state = db.state) {
    const liquidTotal = state.accounts.reduce((sum, acc) => sum + this.getAccountBalance(acc.id, state), 0);
    const cashTotal = this.getCashBalance(state);
    const investmentsTotal = this.getTotalInvestments(state);
    return liquidTotal + cashTotal + investmentsTotal;
  }

  /**
   * Available Liquidity (Free money after subtracting allocated savings goals)
   */
  static getAvailableMoney(state = db.state) {
    const liquidTotal = state.accounts.reduce((sum, acc) => {
      // Exclude dedicated locked savings accounts if specified
      if (acc.name.includes('ادخار') || acc.name.includes('طوارئ')) return sum;
      return sum + this.getAccountBalance(acc.id, state);
    }, 0);
    const cashTotal = this.getCashBalance(state);
    return Math.max(0, liquidTotal + cashTotal);
  }

  /**
   * Summary for a specific month (e.g. '2026-08')
   */
  static getMonthlySummary(month = '2026-08', state = db.state) {
    let income = 0;
    let expense = 0;
    let savingsTransfers = 0;
    let forOthers = 0;

    state.transactions.forEach(txn => {
      if (txn.date && txn.date.startsWith(month)) {
        const amount = Number(txn.amount) || 0;
        const fee = Number(txn.fee) || 0;

        if (txn.type === 'income') {
          if (txn.isForSomeoneElse) {
            forOthers += amount;
          } else {
            income += amount;
          }
        } else if (txn.type === 'expense') {
          expense += (amount + fee);
        } else if (txn.type === 'transfer') {
          // Check if transferring to savings account
          const toAcc = state.accounts.find(a => a.id === txn.toAccountId);
          if (toAcc && (toAcc.name.includes('ادخار') || toAcc.name.includes('طوارئ'))) {
            savingsTransfers += amount;
          }
        }
      }
    });

    const netCashFlow = income - expense;
    const savingsRate = income > 0 ? ((savingsTransfers / income) * 100).toFixed(1) : 0;

    return {
      month,
      income,
      expense,
      forOthers,
      savingsTransfers,
      netCashFlow,
      savingsRate
    };
  }

  /**
   * Get category spending breakdown for a specific month
   */
  static getCategorySpending(month = '2026-08', state = db.state) {
    const categoryTotals = {};

    state.categories.forEach(c => {
      if (c.type === 'expense') {
        categoryTotals[c.id] = {
          category: c,
          total: 0,
          subcategories: {},
          transactionsCount: 0
        };
      }
    });

    state.transactions.forEach(txn => {
      if (txn.type === 'expense' && txn.date && txn.date.startsWith(month) && txn.categoryId) {
        if (!categoryTotals[txn.categoryId]) {
          const cat = state.categories.find(c => c.id === txn.categoryId) || {
            id: txn.categoryId,
            name: 'أخرى',
            emoji: '📦',
            color: '#64748B'
          };
          categoryTotals[txn.categoryId] = {
            category: cat,
            total: 0,
            subcategories: {},
            transactionsCount: 0
          };
        }

        const amount = Number(txn.amount) || 0;
        categoryTotals[txn.categoryId].total += amount;
        categoryTotals[txn.categoryId].transactionsCount += 1;

        const sub = txn.subCategory || 'عام';
        categoryTotals[txn.categoryId].subcategories[sub] = (categoryTotals[txn.categoryId].subcategories[sub] || 0) + amount;
      }
    });

    return Object.values(categoryTotals).sort((a, b) => b.total - a.total);
  }

  /**
   * Calculate budget utilization per category
   */
  static getBudgetsStatus(month = '2026-08', state = db.state) {
    const spendingList = this.getCategorySpending(month, state);
    const spendingMap = {};
    spendingList.forEach(s => {
      spendingMap[s.category.id] = s.total;
    });

    return state.categories
      .filter(c => c.type === 'expense')
      .map(category => {
        const budgetItem = state.budgets.find(b => b.categoryId === category.id && b.month === month);
        const limit = budgetItem ? Number(budgetItem.limit) : 0;
        const spent = spendingMap[category.id] || 0;
        const remaining = Math.max(0, limit - spent);
        const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
        const isOver = spent > limit && limit > 0;
        const overAmount = isOver ? spent - limit : 0;

        return {
          category,
          limit,
          spent,
          remaining,
          percentage,
          isOver,
          overAmount
        };
      });
  }

  /**
   * Get upcoming recurring obligations in a window (e.g. 7, 30, 90, 365 days)
   */
  static getUpcomingObligations(daysWindow = 30, state = db.state) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysWindow);

    return state.obligations.filter(ob => {
      if (ob.status !== 'active') return false;
      const due = new Date(ob.dueDate);
      return due >= today && due <= futureDate;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  /**
   * Calculate analytical monthly equivalent of all obligations
   */
  static getObligationsMonthlyEquivalent(state = db.state) {
    return state.obligations
      .filter(ob => ob.status === 'active')
      .reduce((sum, ob) => {
        const amt = Number(ob.amount) || 0;
        switch (ob.recurrence) {
          case 'monthly': return sum + amt;
          case 'annual': return sum + (amt / 12);
          case 'quarterly': return sum + (amt / 3);
          case 'semi-annual': return sum + (amt / 6);
          case 'weekly': return sum + (amt * 4.33);
          default: return sum + amt;
        }
      }, 0);
  }

  /**
   * Deterministic Financial Health Ratios & Runway
   */
  static getFinancialRatios(state = db.state) {
    const summary = this.getMonthlySummary('2026-08', state);
    const available = this.getAvailableMoney(state);
    const totalInvestments = this.getTotalInvestments(state);
    const totalSavings = this.getTotalSavings(state);
    
    // Calculate average monthly spend (approx from current or 3000 default)
    const avgMonthlySpend = summary.expense > 0 ? summary.expense : 4500;
    const runwayMonths = (available / (avgMonthlySpend || 1)).toFixed(1);

    const investmentRate = summary.income > 0 ? ((totalInvestments / summary.income) * 100).toFixed(1) : '0.0';
    const wealthRate = summary.income > 0 ? (((totalSavings + totalInvestments) / (summary.income * 12)) * 100).toFixed(1) : '0.0';

    return {
      runwayMonths: Number(runwayMonths),
      avgMonthlySpend,
      investmentRate,
      wealthRate,
      savingsRate: summary.savingsRate
    };
  }

  /**
   * Format numbers to clean Arabic currency string
   */
  static formatMoney(num, currency = 'SAR') {
    const val = Number(num) || 0;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(val);

    return {
      amount: formatted,
      currency: currency === 'SAR' ? 'ريال' : currency
    };
  }
}

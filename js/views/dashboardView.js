/**
 * Cash Plus (كاش بلس) - Dashboard View
 * فلوسك تستاهل أكثر
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { InsightsEngine } from '../engine/insightsEngine.js';
import { cloudAuth } from '../engine/firebase.js';

export class DashboardView {
  static render(container) {
    const totalMoney     = FinancialEngine.getTotalMoney(db.state);
    const availableMoney = FinancialEngine.getAvailableMoney(db.state);
    const savings        = FinancialEngine.getTotalSavings(db.state);
    const investments    = FinancialEngine.getTotalInvestments(db.state);
    const summary        = FinancialEngine.getMonthlySummary('2026-08', db.state);
    const budgets        = FinancialEngine.getBudgetsStatus('2026-08', db.state);
    const upcoming       = FinancialEngine.getUpcomingObligations(30, db.state);
    const purchases      = db.state.purchases.filter(p => p.status === 'planned' || p.status === 'ready');
    const insights       = InsightsEngine.generateInsights('2026-08', db.state);

    const fmt = (n) => FinancialEngine.formatMoney(n);
    const user = cloudAuth.currentUser;
    const syncStatus = cloudAuth.syncStatus;

    const netFlow = summary.netCashFlow;
    const spendRatio = summary.income > 0 ? Math.min(100, Math.round((summary.expense / summary.income) * 100)) : 0;

    container.innerHTML = `
      <div class="animate-fade-in">

        <!-- Page Greeting -->
        <div style="margin-bottom: var(--space-xl);">
          <p style="font-size: 0.8125rem; font-weight: 600; color: var(--primary-text); margin-bottom: 4px; letter-spacing: 0.03em; text-transform: uppercase;">
            ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em; color: var(--text-primary);">
            مرحباً، ${user ? user.displayName : db.state.settings.userProfile?.name || 'ضيف'} 👋
          </h2>
          <p style="font-size: 0.9375rem; color: var(--text-tertiary); margin-top: 2px;">
            هذه نظرة شاملة على وضعك المالي الكامل اليوم.
          </p>
        </div>

        <!-- Hero Financial Grid: 4 Stat Cards -->
        <div class="hero-financial-grid">

          <!-- 1. Total Wealth -->
          <div class="surface-hero">
            <div class="stat-header">
              <span class="stat-label">
                <span class="stat-dot stat-dot-primary"></span>
                إجمالي الثروة
              </span>
              <span class="badge badge-neutral" style="font-size: 0.7rem;">صافي</span>
            </div>
            <div class="stat-value-huge">
              <span class="num">${fmt(totalMoney).amount}</span>
              <span class="currency-symbol">${fmt(totalMoney).currency}</span>
            </div>
            <div class="stat-footer-bar">
              <span>الحسابات + الادخار + الاستثمار</span>
              <span class="badge badge-primary" style="font-size: 0.7rem;">محدّث</span>
            </div>
          </div>

          <!-- 2. Free Liquidity -->
          <div class="surface-hero">
            <div class="stat-header">
              <span class="stat-label">
                <span class="stat-dot" style="background: var(--info);"></span>
                السيولة الحرة
              </span>
              <span class="badge badge-neutral" style="font-size: 0.7rem;">متاح فوراً</span>
            </div>
            <div class="stat-value-huge">
              <span class="num">${fmt(availableMoney).amount}</span>
              <span class="currency-symbol">${fmt(availableMoney).currency}</span>
            </div>
            <div class="stat-footer-bar">
              <span>الحسابات الجارية والنقدية</span>
            </div>
          </div>

          <!-- 3. Savings -->
          <div class="surface-hero">
            <div class="stat-header">
              <span class="stat-label">
                <span class="stat-dot stat-dot-success"></span>
                صناديق الادخار
              </span>
              <span class="badge badge-success" style="font-size: 0.7rem;">محمية</span>
            </div>
            <div class="stat-value-huge">
              <span class="num">${fmt(savings).amount}</span>
              <span class="currency-symbol">${fmt(savings).currency}</span>
            </div>
            <div class="stat-footer-bar">
              <span>${db.state.savingsGoals?.length || 0} أهداف ادخار نشطة</span>
            </div>
          </div>

          <!-- 4. Investments -->
          <div class="surface-hero">
            <div class="stat-header">
              <span class="stat-label">
                <span class="stat-dot" style="background: #A78BFA;"></span>
                الاستثمارات
              </span>
            </div>
            <div class="stat-value-huge">
              <span class="num">${fmt(investments).amount}</span>
              <span class="currency-symbol">${fmt(investments).currency}</span>
            </div>
            <div class="stat-footer-bar">
              <span>${db.state.investments?.length || 0} أصول ومحافظ</span>
              <span class="badge badge-neutral" style="font-size: 0.7rem;">عوائد دورية</span>
            </div>
          </div>

        </div>

        <!-- Main Content: Left + Right Columns -->
        <div style="display: grid; grid-template-columns: 2fr 1.1fr; gap: var(--space-lg);" class="dash-split-layout">

          <!-- LEFT COLUMN -->
          <div style="display: flex; flex-direction: column; gap: var(--space-lg);">

            <!-- Monthly Cash Flow Summary -->
            <div class="surface">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-lg);">
                <div>
                  <p style="font-size: 0.8125rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">التدفق الشهري</p>
                  <h3 style="font-size: 1.1rem; font-weight: 700;">أغسطس 2026</h3>
                </div>

                <!-- Week selector pill -->
                <div class="weekly-pill-selector">
                  <span class="day-pill">S</span>
                  <span class="day-pill">M</span>
                  <span class="day-pill">T</span>
                  <span class="day-pill active">W</span>
                  <span class="day-pill">T</span>
                  <span class="day-pill">F</span>
                  <span class="day-pill">S</span>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">
                <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">إجمالي الدخل</p>
                  <div style="font-size: 1.2rem; font-weight: 700; color: var(--success-text);">
                    <span class="num">${fmt(summary.income).amount}</span>
                    <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-right: 2px;">${fmt(summary.income).currency}</span>
                  </div>
                </div>

                <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">إجمالي المصروف</p>
                  <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary);">
                    <span class="num">${fmt(summary.expense).amount}</span>
                    <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-right: 2px;">${fmt(summary.expense).currency}</span>
                  </div>
                </div>

                <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">صافي الفائض</p>
                  <div style="font-size: 1.2rem; font-weight: 700; color: ${netFlow >= 0 ? 'var(--success-text)' : 'var(--danger-text)'};">
                    <span class="num">${fmt(netFlow).amount}</span>
                    <span style="font-size: 0.7rem; color: var(--text-tertiary); margin-right: 2px;">${fmt(summary.income).currency}</span>
                  </div>
                </div>
              </div>

              <!-- Spend-to-Income Progress Bar -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 6px;">
                  <span>نسبة المصروف إلى الدخل</span>
                  <span class="num">${spendRatio}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill ${spendRatio > 90 ? 'progress-fill-danger' : spendRatio > 70 ? 'progress-fill-warning' : 'progress-fill-success'}"
                       style="width: ${spendRatio}%;"></div>
                </div>
              </div>
            </div>

            <!-- Budgets -->
            <div class="surface">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                <div>
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">الميزانية الشهرية</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">سقوف الإنفاق</h3>
                </div>
                <a href="#budgets" class="btn btn-glass btn-sm" style="text-decoration: none;">إدارة</a>
              </div>

              <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                ${budgets.slice(0, 5).map(b => `
                  <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                      <div style="display: flex; align-items: center; gap: var(--space-xs);">
                        <span style="font-size: 1rem;">${b.category.emoji}</span>
                        <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary);">${b.category.name}</span>
                      </div>
                      <div style="font-size: 0.8125rem;">
                        <span class="num" style="font-weight: 700;">${b.spent.toLocaleString('en-US')}</span>
                        <span style="color: var(--text-tertiary);"> / <span class="num">${b.limit.toLocaleString('en-US')}</span> ريال</span>
                        ${b.isOver ? '<span class="badge badge-danger" style="margin-right: 4px; font-size: 0.65rem;">تجاوز</span>' : ''}
                      </div>
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar-fill ${b.isOver ? 'progress-fill-danger' : b.percentage > 80 ? 'progress-fill-warning' : 'progress-fill-success'}"
                           style="width: ${Math.min(100, b.percentage)}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Latest Transactions -->
            <div class="surface">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                <div>
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">آخر الحركات</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">العمليات المسجلة</h3>
                </div>
                <a href="#transactions" class="btn btn-glass btn-sm" style="text-decoration: none;">عرض الكل</a>
              </div>

              <div class="transaction-list">
                ${db.state.transactions.slice(0, 6).map(txn => {
                  const isExp = txn.type === 'expense';
                  const isInc = txn.type === 'income';
                  const cat   = db.state.categories?.find(c => c.id === txn.categoryId);
                  const acc   = db.state.accounts?.find(a => a.id === txn.accountId);

                  return `
                    <div class="transaction-item" data-id="${txn.id}">
                      <div class="txn-left-info">
                        <div class="txn-icon-wrapper ${isExp ? 'txn-icon-expense' : isInc ? 'txn-icon-income' : 'txn-icon-transfer'}">
                          ${cat ? cat.emoji : (isInc ? '↓' : '↑')}
                        </div>
                        <div class="txn-details">
                          <h4>${txn.merchant || txn.description || 'عملية مالية'}</h4>
                          <div class="txn-meta">
                            <span>${cat ? cat.name : (isInc ? 'دخل' : 'تحويل')}</span>
                            <span>·</span>
                            <span>${acc ? acc.name : 'محفظة'}</span>
                            <span>·</span>
                            <span>${txn.date}</span>
                          </div>
                        </div>
                      </div>
                      <div class="txn-amount-box">
                        <div class="txn-amount-text ${isExp ? 'txn-amount-expense' : isInc ? 'txn-amount-income' : 'txn-amount-transfer'}">
                          <span class="num">${isInc ? '+' : isExp ? '-' : ''}${Number(txn.amount).toLocaleString('en-US')}</span>
                          <span class="currency-symbol">ريال</span>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN -->
          <div style="display: flex; flex-direction: column; gap: var(--space-lg);">

            <!-- Cloud Auth Pill Card -->
            <div class="surface" style="border-color: ${user ? 'var(--success-border)' : 'var(--primary-border)'};">
              <div style="display: flex; align-items: center; gap: var(--space-sm);">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: ${user ? 'var(--success-surface)' : 'var(--primary-surface)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid ${user ? 'var(--success-border)' : 'var(--primary-border)'};">
                  ${user && user.photoURL
                    ? `<img src="${user.photoURL}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;">`
                    : `<span style="font-size:1rem;">☁️</span>`}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.875rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${user ? user.displayName : 'وضع محلي (Offline)'}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">
                    ${user ? `متزامن عبر Google` : 'سجّل للمزامنة بين أجهزتك'}
                  </div>
                </div>
                <div class="cloud-sync-pill" id="dash-cloud-btn" style="flex-shrink: 0;">
                  <span class="sync-dot ${syncStatus}"></span>
                  <span>${user ? (syncStatus === 'syncing' ? '...' : 'سحابي') : 'دخول'}</span>
                </div>
              </div>
            </div>

            <!-- Insights -->
            <div class="surface">
              <div style="margin-bottom: var(--space-md);">
                <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">تحليلات تلقائية</p>
                <h3 style="font-size: 1.05rem; font-weight: 700;">مؤشرات ذكية</h3>
              </div>

              ${insights.length > 0 ? insights.slice(0, 4).map(ins => `
                <div class="insight-card ${ins.type}">
                  <div style="font-size: 1.1rem; flex-shrink: 0;">${ins.icon}</div>
                  <div class="insight-content">
                    <h5>${ins.title}</h5>
                    <p>${ins.description}</p>
                  </div>
                </div>
              `).join('') : `
                <div style="padding: var(--space-md) 0; text-align: center; color: var(--text-tertiary); font-size: 0.875rem;">
                  وضعك المالي متوازن ومستقر
                </div>
              `}
            </div>

            <!-- Upcoming Obligations -->
            <div class="surface">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                <div>
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">الالتزامات</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">مستحقات قادمة</h3>
                </div>
                <a href="#obligations" class="btn btn-glass btn-sm" style="text-decoration: none;">الكل</a>
              </div>

              ${upcoming.length === 0
                ? `<p style="font-size: 0.8125rem; color: var(--text-tertiary);">لا توجد مستحقات قريبة.</p>`
                : upcoming.slice(0, 4).map(ob => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid var(--border-subtle);">
                    <div>
                      <div style="font-size: 0.875rem; font-weight: 600;">${ob.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-tertiary);">${ob.dueDate}</div>
                    </div>
                    <span class="num" style="font-weight: 700; color: var(--danger-text); font-size: 0.9375rem;">${Number(ob.amount).toLocaleString('en-US')} ريال</span>
                  </div>
                `).join('')}
            </div>

            <!-- Planned Purchases -->
            ${purchases.length > 0 ? `
            <div class="surface">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                <div>
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">مشتريات قيد التخطيط</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">قائمة الرغبات</h3>
                </div>
                <a href="#purchases" class="btn btn-glass btn-sm" style="text-decoration: none;">الكل</a>
              </div>

              ${purchases.slice(0, 3).map(p => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                      <span class="badge ${p.type === 'need' ? 'badge-primary' : 'badge-neutral'}" style="font-size: 0.65rem;">${p.type === 'need' ? 'احتياج' : 'رغبة'}</span>
                      <span style="font-size: 0.875rem; font-weight: 600;">${p.name}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">${p.targetDate || 'غير محدد التاريخ'}</div>
                  </div>
                  <span class="num" style="font-weight: 700; font-size: 0.9375rem;">${Number(p.expectedPrice).toLocaleString('en-US')} ريال</span>
                </div>
              `).join('')}
            </div>
            ` : ''}

          </div>
        </div>

      </div>
    `;

    // Event Listeners
    container.querySelector('#dash-cloud-btn')?.addEventListener('click', () => {
      window.app.openAuthModal();
    });

    container.querySelectorAll('.transaction-item').forEach(el => {
      el.addEventListener('click', () => {
        const id  = el.dataset.id;
        const txn = db.state.transactions.find(t => t.id === id);
        if (txn) window.app.openTransactionDetailsModal(txn);
      });
    });
  }
}

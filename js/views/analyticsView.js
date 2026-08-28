/**
 * Cash Plus (كاش بلس) — Analytics View
 * التحليلات المالية والإحصائيات
 */

import { db }               from '../engine/db.js';
import { FinancialEngine }  from '../engine/financialEngine.js';

export class AnalyticsView {
  static render(container) {
    const currentMonth   = '2026-08';
    const summary        = FinancialEngine.getMonthlySummary(currentMonth, db.state);
    const categoryData   = FinancialEngine.getCategorySpending(currentMonth, db.state);
    const ratios         = FinancialEngine.getFinancialRatios(db.state);
    const budgets        = FinancialEngine.getBudgetsStatus(currentMonth, db.state);

    const fmt = (n) => Number(n || 0).toLocaleString('en-US');
    const totalExpense = summary.expense || 0;
    const totalIncome  = summary.income  || 0;
    const netFlow      = summary.netCashFlow || 0;

    // Top merchants from expenses
    const merchantMap = {};
    db.state.transactions?.forEach(t => {
      if (t.type === 'expense') {
        const key = t.merchant || t.description || 'أخرى';
        merchantMap[key] = (merchantMap[key] || 0) + Number(t.amount || 0);
      }
    });
    const topMerchants = Object.entries(merchantMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Income sources
    const incomeList = db.state.transactions?.filter(
      t => t.type === 'income' && t.date?.startsWith(currentMonth)
    ) || [];

    const hasData = db.state.transactions?.length > 0;

    container.innerHTML = `
      <div class="animate-fade-in">

        <!-- Header -->
        <div style="margin-bottom: var(--space-xl);">
          <p style="font-size: 0.8rem; font-weight: 600; color: var(--primary-text); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;">الإحصائيات والتحليلات</p>
          <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em;">التحليل المالي</h2>
          <p style="font-size: 0.9rem; color: var(--text-tertiary); margin-top: 4px;">أغسطس 2026</p>
        </div>

        ${!hasData ? `
          <!-- Empty State -->
          <div class="surface" style="text-align: center; padding: var(--space-2xl);">
            <div style="font-size: 3rem; margin-bottom: var(--space-md);">📊</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">لا توجد بيانات بعد</h3>
            <p style="font-size: 0.875rem; color: var(--text-tertiary);">
              أضف حساباتك البنكية وعملياتك المالية أولاً لتظهر التحليلات هنا.
            </p>
          </div>
        ` : `

        <!-- 4 KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl);" class="analytics-kpi-grid">

          <div class="surface" style="text-align: center; padding: var(--space-lg);">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">إجمالي الدخل</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--success-text);">
              <span class="num">${fmt(totalIncome)}</span>
            </div>
            <p style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 4px;">ريال</p>
          </div>

          <div class="surface" style="text-align: center; padding: var(--space-lg);">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">إجمالي المصروف</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">
              <span class="num">${fmt(totalExpense)}</span>
            </div>
            <p style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 4px;">ريال</p>
          </div>

          <div class="surface" style="text-align: center; padding: var(--space-lg);">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">صافي الفائض</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: ${netFlow >= 0 ? 'var(--success-text)' : 'var(--danger-text)'};">
              <span class="num">${fmt(Math.abs(netFlow))}</span>
            </div>
            <p style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 4px;">${netFlow >= 0 ? 'فائض' : 'عجز'}</p>
          </div>

          <div class="surface" style="text-align: center; padding: var(--space-lg);">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">نسبة الادخار</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">
              <span class="num">${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%</span>
            </div>
            <p style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 4px;">من الدخل</p>
          </div>

        </div>

        <!-- Main Grid: Category + Merchants -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-lg);" class="analytics-main-grid">

          <!-- Category Spending Breakdown -->
          <div class="surface">
            <div style="margin-bottom: var(--space-md);">
              <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">توزيع المصاريف</p>
              <h3 style="font-size: 1.05rem; font-weight: 700;">الإنفاق حسب التصنيف</h3>
            </div>

            ${categoryData.length === 0 ? `
              <p style="color: var(--text-tertiary); font-size: 0.875rem; text-align: center; padding: var(--space-lg) 0;">لا توجد مصاريف مسجلة هذا الشهر</p>
            ` : categoryData.map(cat => {
              const pct = totalExpense > 0 ? Math.min(100, (cat.total / totalExpense) * 100) : 0;
              return `
                <div style="margin-bottom: var(--space-md);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1rem;">${cat.category?.emoji || '📌'}</span>
                      <span style="font-size: 0.875rem; font-weight: 600;">${cat.category?.name || cat.categoryId}</span>
                    </div>
                    <div style="font-size: 0.8125rem;">
                      <span class="num" style="font-weight: 700;">${fmt(cat.total)}</span>
                      <span style="color: var(--text-tertiary); font-size: 0.7rem;"> ريال</span>
                      <span style="color: var(--text-tertiary); font-size: 0.7rem; margin-right: 4px;">(${pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill progress-fill-primary" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Top Merchants -->
          <div class="surface">
            <div style="margin-bottom: var(--space-md);">
              <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">أعلى المصاريف</p>
              <h3 style="font-size: 1.05rem; font-weight: 700;">أكثر جهات الإنفاق</h3>
            </div>

            ${topMerchants.length === 0 ? `
              <p style="color: var(--text-tertiary); font-size: 0.875rem; text-align: center; padding: var(--space-lg) 0;">لا توجد بيانات</p>
            ` : topMerchants.map(([name, amount], i) => `
              <div style="display: flex; align-items: center; gap: var(--space-sm); padding: 0.6rem 0; border-bottom: 1px solid var(--border-subtle);">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-tertiary); width: 20px; flex-shrink: 0;">${i + 1}</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</div>
                  <div style="height: 3px; background: var(--bg-surface-secondary); border-radius: 2px; margin-top: 4px;">
                    <div style="height: 3px; width: ${topMerchants[0][1] > 0 ? (amount/topMerchants[0][1]*100).toFixed(0) : 0}%; background: var(--primary); border-radius: 2px;"></div>
                  </div>
                </div>
                <span class="num" style="font-weight: 700; font-size: 0.875rem; flex-shrink: 0;">${fmt(amount)} ر</span>
              </div>
            `).join('')}
          </div>

        </div>

        <!-- Budget Health -->
        ${budgets.length > 0 ? `
          <div class="surface" style="margin-bottom: var(--space-lg);">
            <div style="margin-bottom: var(--space-md);">
              <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">صحة الميزانية</p>
              <h3 style="font-size: 1.05rem; font-weight: 700;">مقارنة المصروف بالحد المقرر</h3>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-md);">
              ${budgets.map(b => `
                <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid ${b.isOver ? 'var(--danger-border)' : 'var(--border-subtle)'};">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                    <span>${b.category?.emoji || '📌'}</span>
                    <span style="font-size: 0.8125rem; font-weight: 600;">${b.category?.name || ''}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">
                    <span class="num">${fmt(b.spent)}</span> / <span class="num">${fmt(b.limit)}</span> ريال
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill ${b.isOver ? 'progress-fill-danger' : b.percentage > 80 ? 'progress-fill-warning' : 'progress-fill-success'}"
                         style="width: ${Math.min(100, b.percentage)}%;"></div>
                  </div>
                  <div style="font-size: 0.7rem; margin-top: 4px; text-align: left; color: ${b.isOver ? 'var(--danger-text)' : 'var(--text-tertiary)'};">
                    ${b.isOver ? '⚠️ تجاوز الحد' : `${b.percentage.toFixed(0)}% مستخدم`}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Financial Ratios -->
        <div class="surface">
          <div style="margin-bottom: var(--space-md);">
            <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">المؤشرات المالية</p>
            <h3 style="font-size: 1.05rem; font-weight: 700;">نسب الصحة المالية</h3>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);">

            <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);" class="num">
                ${ratios.savingsRate?.toFixed(1) || 0}%
              </div>
              <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">معدل الادخار</p>
              <p style="font-size: 0.7rem; color: var(--text-tertiary);">المستهدف: أكثر من 20%</p>
            </div>

            <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--info);" class="num">
                ${ratios.expenseRatio?.toFixed(1) || 0}%
              </div>
              <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">نسبة الإنفاق</p>
              <p style="font-size: 0.7rem; color: var(--text-tertiary);">المستهدف: أقل من 80%</p>
            </div>

            <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--success-text);" class="num">
                ${ratios.emergencyFundMonths?.toFixed(1) || 0}
              </div>
              <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">أشهر صندوق الطوارئ</p>
              <p style="font-size: 0.7rem; color: var(--text-tertiary);">المستهدف: 6 أشهر</p>
            </div>

          </div>
        </div>

        `}
      </div>
    `;
  }
}

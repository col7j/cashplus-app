/**
 * Cash Plus (كاش بلس) — Analytics & Financial Intelligence View
 * التحليلات المالية، توزيع الإنفاق، ومؤشرات التدفق
 */

import { db }              from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';

export class AnalyticsView {
  static render(container) {
    const allTxns = db.state.transactions || [];
    
    // Group available months from transactions or default to current month
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    
    const summary      = FinancialEngine.getMonthlySummary(currentMonth, db.state);
    const categoryData = FinancialEngine.getCategorySpending(currentMonth, db.state);
    const ratios       = FinancialEngine.getFinancialRatios(db.state);
    const budgets      = FinancialEngine.getBudgetsStatus(currentMonth, db.state);

    const fmt = (n) => Number(n || 0).toLocaleString('en-US');
    const totalExpense = summary.expense || 0;
    const totalIncome  = summary.income  || 0;
    const netFlow      = summary.netCashFlow || 0;
    const savingsRate  = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    // Top merchants from expenses
    const merchantMap = {};
    allTxns.forEach(t => {
      if (t.type === 'expense') {
        const key = t.merchant || t.description || 'مصروف عام';
        merchantMap[key] = (merchantMap[key] || 0) + Number(t.amount || 0);
      }
    });
    const topMerchants = Object.entries(merchantMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const hasData = allTxns.length > 0;

    container.innerHTML = `
      <div class="animate-fade-in" style="max-width: 1100px; margin: 0 auto;">

        <!-- Header Section -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md);">
          <div>
            <p style="font-size: 0.8125rem; font-weight: 600; color: var(--primary-text); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;">الذكاء المالي والإحصاء</p>
            <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em;">التحليلات المالية</h2>
            <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: 2px;">نظرة تفصيلية على مصادر دخلك، وجهات صرفك، ومؤشرات الأمان المالي</p>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <button class="btn btn-primary btn-sm" id="btn-analytics-add-txn">
              + تسجيل عملية جديدة
            </button>
          </div>
        </div>

        ${!hasData ? `
          <!-- Empty State with Clear Visual Explanation -->
          <div class="surface" style="text-align: center; padding: 3.5rem 1.5rem; margin-bottom: var(--space-xl);">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-surface); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto var(--space-md) auto;">
              📊
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">بانتظار تسجيل عملياتك الأولى</h3>
            <p style="font-size: 0.9375rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto var(--space-lg) auto; line-height: 1.6;">
              بمجرد تسجيل عمليات الصرف أو استلام الدخل (أو لصق رسالة بنكية)، سيقوم المحرك المالي بتحليل نمط إنفاقك وتوليد المخططات والنسب تلقائياً.
            </p>
            <button class="btn btn-primary" id="btn-empty-add-txn" style="padding: 0.75rem 1.75rem; font-size: 0.9375rem;">
              ⚡ سجّل عملية الآن لتفعيل التحليلات
            </button>
          </div>
        ` : `

        <!-- 4 Key Metric Hero Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl);" class="analytics-kpi-grid">

          <div class="surface" style="padding: var(--space-lg); border-top: 3px solid var(--success);">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); font-weight: 600; margin-bottom: 6px;">إجمالي الدخل الشهري</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--success-text);">
              <span class="num">${fmt(totalIncome)}</span>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">ريال</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">وارد إلى الحسابات</p>
          </div>

          <div class="surface" style="padding: var(--space-lg); border-top: 3px solid var(--primary);">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); font-weight: 600; margin-bottom: 6px;">إجمالي المصروفات</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">
              <span class="num">${fmt(totalExpense)}</span>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">ريال</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">منصرف من المحافظ</p>
          </div>

          <div class="surface" style="padding: var(--space-lg); border-top: 3px solid ${netFlow >= 0 ? 'var(--success)' : 'var(--danger)'};">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); font-weight: 600; margin-bottom: 6px;">صافي الفائض / العجز</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: ${netFlow >= 0 ? 'var(--success-text)' : 'var(--danger-text)'};">
              <span class="num">${netFlow >= 0 ? '+' : ''}${fmt(netFlow)}</span>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">ريال</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">${netFlow >= 0 ? 'فائض مالي متاح للادخار' : 'عجز في السيولة'}</p>
          </div>

          <div class="surface" style="padding: var(--space-lg); border-top: 3px solid #8B5CF6;">
            <p style="font-size: 0.75rem; color: var(--text-tertiary); font-weight: 600; margin-bottom: 6px;">نسبة الادخار المحققة</p>
            <div style="font-size: 1.5rem; font-weight: 800; color: #8B5CF6;">
              <span class="num">${savingsRate}%</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">الموصى به عالمياً: 20%+</p>
          </div>

        </div>

        <!-- Two Column Detailed Breakdown -->
        <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-xl);" class="analytics-main-grid">

          <!-- 1. Category Breakdown with Visual Bars -->
          <div class="surface">
            <div style="margin-bottom: var(--space-lg); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">توزيع المصاريف</p>
                <h3 style="font-size: 1.1rem; font-weight: 700;">أين ذهبت أموالك؟</h3>
              </div>
              <span class="badge badge-neutral">${categoryData.length} تصنيفات</span>
            </div>

            ${categoryData.length === 0 ? `
              <p style="color: var(--text-tertiary); font-size: 0.875rem; text-align: center; padding: 2rem 0;">لا توجد مصاريف مسجلة لهذا الشهر</p>
            ` : categoryData.map(cat => {
              const pct = totalExpense > 0 ? Math.min(100, (cat.total / totalExpense) * 100) : 0;
              return `
                <div style="margin-bottom: var(--space-md);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.1rem;">${cat.category?.emoji || '📌'}</span>
                      <span style="font-size: 0.9375rem; font-weight: 600;">${cat.category?.name || cat.categoryId}</span>
                    </div>
                    <div style="font-size: 0.875rem;">
                      <span class="num" style="font-weight: 700;">${fmt(cat.total)}</span>
                      <span style="color: var(--text-tertiary); font-size: 0.75rem;"> ريال</span>
                      <span class="badge badge-neutral" style="margin-right: 6px; font-size: 0.7rem;">${pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div class="progress-bar-container" style="height: 7px;">
                    <div class="progress-bar-fill progress-fill-primary" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- 2. Top Merchants List -->
          <div class="surface">
            <div style="margin-bottom: var(--space-lg);">
              <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">أعلى وجهات الصرف</p>
              <h3 style="font-size: 1.1rem; font-weight: 700;">المتاجر والجهات الأكثر استهلاكاً</h3>
            </div>

            ${topMerchants.length === 0 ? `
              <p style="color: var(--text-tertiary); font-size: 0.875rem; text-align: center; padding: 2rem 0;">لا توجد بيانات متاجر</p>
            ` : topMerchants.map(([name, amount], i) => `
              <div style="display: flex; align-items: center; gap: var(--space-md); padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle);">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: var(--text-tertiary); flex-shrink: 0;">
                  ${i + 1}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.9375rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</div>
                  <div style="height: 4px; background: var(--bg-surface-secondary); border-radius: 2px; margin-top: 6px;">
                    <div style="height: 4px; width: ${topMerchants[0][1] > 0 ? (amount / topMerchants[0][1] * 100).toFixed(0) : 0}%; background: var(--primary); border-radius: 2px;"></div>
                  </div>
                </div>
                <div style="text-align: left; flex-shrink: 0;">
                  <span class="num" style="font-weight: 700; font-size: 0.9375rem;">${fmt(amount)}</span>
                  <span style="font-size: 0.75rem; color: var(--text-tertiary);"> ريال</span>
                </div>
              </div>
            `).join('')}
          </div>

        </div>

        <!-- 3. Financial Health Ratios Section -->
        <div class="surface">
          <div style="margin-bottom: var(--space-lg);">
            <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">مؤشرات الأمان</p>
            <h3 style="font-size: 1.1rem; font-weight: 700;">صحة مركزك المالي</h3>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);" class="analytics-kpi-grid">

            <div style="padding: var(--space-lg); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-subtle);">
              <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary);" class="num">
                ${ratios.savingsRate?.toFixed(0) || 0}%
              </div>
              <p style="font-size: 0.875rem; font-weight: 600; margin-top: 6px;">معدل الادخار</p>
              <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 2px;">نسبة الفائض المحتفظ به من إجمالي الدخل</p>
            </div>

            <div style="padding: var(--space-lg); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-subtle);">
              <div style="font-size: 1.75rem; font-weight: 800; color: var(--info);" class="num">
                ${ratios.expenseRatio?.toFixed(0) || 0}%
              </div>
              <p style="font-size: 0.875rem; font-weight: 600; margin-top: 6px;">نسبة الاستهلاك</p>
              <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 2px;">نسبة المصاريف المستهلكة من الدخل</p>
            </div>

            <div style="padding: var(--space-lg); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-subtle);">
              <div style="font-size: 1.75rem; font-weight: 800; color: var(--success-text);" class="num">
                ${ratios.emergencyFundMonths?.toFixed(1) || 0}
              </div>
              <p style="font-size: 0.875rem; font-weight: 600; margin-top: 6px;">أشهر صندوق الطوارئ</p>
              <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 2px;">تغطية السيولة لمصاريفك في حال انقطاع الدخل</p>
            </div>

          </div>
        </div>

        `}
      </div>
    `;

    // Event listeners
    container.querySelector('#btn-analytics-add-txn')?.addEventListener('click', () => {
      window.app.openTransactionModal();
    });
    container.querySelector('#btn-empty-add-txn')?.addEventListener('click', () => {
      window.app.openTransactionModal();
    });
  }
}

/**
 * MASAR - Recurring Obligations & Subscriptions View (الالتزامات الدورية والاشتراكات)
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class ObligationsView {
  static render(container) {
    let currentHorizon = 30; // days

    function renderContent() {
      const monthlyEquiv = FinancialEngine.getObligationsMonthlyEquivalent(db.state);
      const upcomingList = FinancialEngine.getUpcomingObligations(currentHorizon, db.state);
      const totalUpcomingInHorizon = upcomingList.reduce((s, o) => s + Number(o.amount), 0);

      container.innerHTML = `
        <div class="animate-fade-in">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">الفواتير المتكررة، الاشتراكات، والالتزامات الثابتة</span>
              <h2 style="font-size: 1.5rem; font-weight: 700;">الالتزامات الدورية</h2>
            </div>
            <button class="btn btn-primary btn-sm" id="ob-btn-add">
              ${Icons.plus}
              إضافة التزام دوري
            </button>
          </div>

          <!-- Monthly Equivalent & Horizon Surface -->
          <div class="surface surface-glass" style="margin-bottom: var(--space-xl); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-lg);">
            <div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary);">التكلفة الشهرية المكافئة لجميع الالتزامات (Monthly Equivalent)</div>
              <div class="stat-value-huge" style="margin: 4px 0 0 0;">
                <span class="num">${Math.round(monthlyEquiv).toLocaleString('en-US')}</span>
                <span class="currency-symbol">ريال / شهرياً</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">
                تشمل الاشتراكات السنوية والشهرية موزعة تحليلياً
              </div>
            </div>

            <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: left;">
              <div style="font-size: 0.75rem; color: var(--text-tertiary);">المستحق في الأفق الحالي (${currentHorizon} يوم)</div>
              <div class="num" style="font-size: 1.35rem; font-weight: 700; color: var(--danger);">
                ${totalUpcomingInHorizon.toLocaleString('en-US')} ريال
              </div>
            </div>
          </div>

          <!-- Horizon Selector Toolbar -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-sm);">
            <h3 style="font-size: 1.1rem; font-weight: 700;">جدول الاستحقاقات القادمة</h3>
            <div class="segmented-control" id="horizon-segments">
              <button class="segmented-btn ${currentHorizon === 7 ? 'active' : ''}" data-horizon="7">خلال 7 أيام</button>
              <button class="segmented-btn ${currentHorizon === 30 ? 'active' : ''}" data-horizon="30">خلال 30 يوم</button>
              <button class="segmented-btn ${currentHorizon === 90 ? 'active' : ''}" data-horizon="90">خلال 3 أشهر</button>
              <button class="segmented-btn ${currentHorizon === 365 ? 'active' : ''}" data-horizon="365">خلال سنة</button>
            </div>
          </div>

          <!-- Obligations List -->
          <div class="surface">
            ${upcomingList.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">🎉</div>
                <h3>لا توجد التزامات مستحقة</h3>
                <p>لا توجد التزامات أو فواتير قادمة خلال هذه الفترة الزمنية.</p>
              </div>
            ` : `
              <div class="transaction-list">
                ${upcomingList.map(ob => {
                  const cat = db.state.categories.find(c => c.id === ob.categoryId);
                  const recurrenceArabic = {
                    monthly: 'شهري',
                    annual: 'سنوي',
                    quarterly: 'ربع سنوي',
                    weekly: 'أسبوعي',
                    'semi-annual': 'نصف سنوي',
                    'one-time': 'مرة واحدة'
                  }[ob.recurrence] || ob.recurrence;

                  return `
                    <div class="transaction-item" style="cursor: default;">
                      <div class="txn-left-info">
                        <div class="txn-icon-wrapper txn-icon-expense">
                          ${cat ? cat.emoji : '📋'}
                        </div>
                        <div class="txn-details">
                          <h4>${ob.name}</h4>
                          <div class="txn-meta">
                            <span class="badge badge-neutral">${recurrenceArabic}</span>
                            <span>•</span>
                            <span>تاريخ الاستحقاق: <strong style="color: var(--text-primary);">${ob.dueDate}</strong></span>
                            ${cat ? `<span>• ${cat.name}</span>` : ''}
                          </div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <div class="txn-amount-box">
                          <div class="num" style="font-size: 1.15rem; font-weight: 700; color: var(--danger);">
                            ${Number(ob.amount).toLocaleString('en-US')} ريال
                          </div>
                        </div>
                        <button class="btn btn-subtle btn-sm pay-ob-btn" data-ob-id="${ob.id}" title="تسجيل كسداد فعلي">
                          سداد الآن
                        </button>
                        <button class="btn btn-glass btn-icon btn-sm delete-ob-btn" data-ob-id="${ob.id}" style="color: var(--danger);" title="حذف">
                          ${Icons.trash}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      `;

      // Horizon click handlers
      container.querySelectorAll('#horizon-segments .segmented-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentHorizon = Number(btn.getAttribute('data-horizon'));
          renderContent();
        });
      });

      // Add Obligation
      container.querySelector('#ob-btn-add')?.addEventListener('click', () => {
        window.app.openAddObligationModal();
      });

      // Pay Obligation (Opens transaction modal prefilled)
      container.querySelectorAll('.pay-ob-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const obId = btn.getAttribute('data-ob-id');
          const ob = db.state.obligations.find(o => o.id === obId);
          if (ob) {
            window.app.openTransactionModal({
              type: 'expense',
              amount: ob.amount,
              merchant: ob.name,
              categoryId: ob.categoryId,
              description: `سداد التزام دوري (${ob.name})`
            });
          }
        });
      });

      // Delete Obligation
      container.querySelectorAll('.delete-ob-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const obId = btn.getAttribute('data-ob-id');
          if (confirm('هل أنت متأكد من حذف هذا الالتزام؟')) {
            db.deleteObligation(obId);
            renderContent();
          }
        });
      });
    }

    renderContent();
  }
}

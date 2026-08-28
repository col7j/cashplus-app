/**
 * MASAR - Debts & Receivables View (الديون والمستحقات)
 */

import { db } from '../engine/db.js';
import { Icons } from '../icons.js';

export class DebtsView {
  static render(container) {
    let currentTab = 'receivables'; // 'receivables' (لي) or 'debts' (علي)

    function renderContent() {
      const receivables = db.state.debts.filter(d => d.type === 'receivable');
      const debts = db.state.debts.filter(d => d.type === 'debt');

      const totalReceivables = receivables.reduce((sum, d) => {
        const paid = (d.payments || []).reduce((pSum, p) => pSum + Number(p.amount), 0);
        return sum + Math.max(0, Number(d.amount) - paid);
      }, 0);

      const totalDebts = debts.reduce((sum, d) => {
        const paid = (d.payments || []).reduce((pSum, p) => pSum + Number(p.amount), 0);
        return sum + Math.max(0, Number(d.amount) - paid);
      }, 0);

      const currentList = currentTab === 'receivables' ? receivables : debts;

      container.innerHTML = `
        <div class="animate-fade-in">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">متابعة ما لك وما عليك وتسجيل دفعات السداد</span>
              <h2 style="font-size: 1.5rem; font-weight: 700;">الديون والمستحقات</h2>
            </div>
            <button class="btn btn-primary btn-sm" id="debt-btn-add">
              ${Icons.plus}
              إضافة قيد جديد
            </button>
          </div>

          <!-- Total Balances Overview -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-xl);">
            <div class="surface surface-glass" style="border-right: 4px solid var(--success);">
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">🤝 مستحقات لك عند الآخرين</span>
              <div class="stat-value-lg">
                <span class="num" style="color: var(--success);">${totalReceivables.toLocaleString('en-US')}</span>
                <span class="currency-symbol">ريال</span>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">${receivables.length} ذمة مدينة</span>
            </div>

            <div class="surface surface-glass" style="border-right: 4px solid var(--danger);">
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">📋 ديون والتزامات عليك للآخرين</span>
              <div class="stat-value-lg">
                <span class="num" style="color: var(--danger);">${totalDebts.toLocaleString('en-US')}</span>
                <span class="currency-symbol">ريال</span>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">${debts.length} التزام دائن</span>
            </div>
          </div>

          <!-- Tab Switcher -->
          <div style="display: flex; justify-content: center; margin-bottom: var(--space-lg);">
            <div class="segmented-control" id="debts-segments">
              <button class="segmented-btn ${currentTab === 'receivables' ? 'active' : ''}" data-tab="receivables">مستحقات لي (${receivables.length})</button>
              <button class="segmented-btn ${currentTab === 'debts' ? 'active' : ''}" data-tab="debts">ديون علي (${debts.length})</button>
            </div>
          </div>

          <!-- List -->
          <div class="surface">
            ${currentList.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">✨</div>
                <h3>السجل نظيف ومكتمل</h3>
                <p>لا توجد قيود مسجلة في هذا القسم حالياً.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                ${currentList.map(item => {
                  const totalPaid = (item.payments || []).reduce((s, p) => s + Number(p.amount), 0);
                  const remaining = Math.max(0, Number(item.amount) - totalPaid);
                  const isCompleted = item.status === 'completed' || remaining === 0;

                  return `
                    <div style="padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-xs);">
                        <div>
                          <div style="display: flex; align-items: center; gap: var(--space-xs);">
                            <h4 style="font-size: 1.05rem; font-weight: 700;">${item.person}</h4>
                            <span class="badge ${isCompleted ? 'badge-success' : 'badge-warning'}">${isCompleted ? 'تم السداد بالكامل' : 'متبقي ذمة'}</span>
                          </div>
                          ${item.dueDate ? `<div style="font-size: 0.75rem; color: var(--text-tertiary);">تاريخ الوعد/الاستحقاق: ${item.dueDate}</div>` : ''}
                        </div>
                        <div style="text-align: left;">
                          <div style="font-size: 0.75rem; color: var(--text-tertiary);">المتبقي:</div>
                          <div class="num" style="font-size: 1.25rem; font-weight: 700; color: ${item.type === 'receivable' ? 'var(--success)' : 'var(--danger)'};">
                            ${remaining.toLocaleString('en-US')} ريال
                          </div>
                          <div style="font-size: 0.75rem; color: var(--text-tertiary);">من أصل ${Number(item.amount).toLocaleString('en-US')} ريال</div>
                        </div>
                      </div>

                      ${item.notes ? `<p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">${item.notes}</p>` : ''}

                      <!-- Payments history pills if any -->
                      ${(item.payments && item.payments.length > 0) ? `
                        <div style="margin-bottom: var(--space-sm); padding-top: var(--space-xs); border-top: 1px dashed var(--border-default);">
                          <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary);">سجل الدفعات المستلمة/المسددة:</span>
                          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                            ${item.payments.map(p => `
                              <span class="badge badge-neutral" style="font-size: 0.7rem;">
                                ${p.date}: ${Number(p.amount).toLocaleString('en-US')} ريال ${p.notes ? `(${p.notes})` : ''}
                              </span>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}

                      <!-- Actions -->
                      <div style="display: flex; align-items: center; justify-content: flex-end; gap: var(--space-xs); border-top: 1px solid var(--border-subtle); padding-top: var(--space-xs);">
                        ${!isCompleted ? `
                          <button class="btn btn-subtle btn-sm add-payment-btn" data-debt-id="${item.id}">
                            + تسجيل سداد دفعة
                          </button>
                        ` : ''}
                        <button class="btn btn-glass btn-icon btn-sm delete-debt-btn" data-debt-id="${item.id}" style="color: var(--danger);" title="حذف">
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

      // Tab switcher
      container.querySelectorAll('#debts-segments .segmented-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentTab = btn.getAttribute('data-tab');
          renderContent();
        });
      });

      // Add Debt / Receivable
      container.querySelector('#debt-btn-add')?.addEventListener('click', () => {
        window.app.openAddDebtModal();
      });

      // Add Payment
      container.querySelectorAll('.add-payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const debtId = btn.getAttribute('data-debt-id');
          const debt = db.state.debts.find(d => d.id === debtId);
          if (!debt) return;
          const amount = prompt(`أدخل قيمة الدفعة المسددة لـ "${debt.person}" (ريال):`);
          if (amount && !isNaN(Number(amount))) {
            const note = prompt('ملاحظة اختيارية للدفعة (مثل: تحويل بنكي / كاش):', 'سداد جزئي');
            db.addDebtPayment(debtId, { amount: Number(amount), notes: note });
            renderContent();
            window.app.showToast('تم تسجيل الدفعة بنجاح! 🤝');
          }
        });
      });

      // Delete
      container.querySelectorAll('.delete-debt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const debtId = btn.getAttribute('data-debt-id');
          if (confirm('هل أنت متأكد من حذف هذا القيد؟')) {
            db.deleteDebt(debtId);
            renderContent();
          }
        });
      });
    }

    renderContent();
  }
}

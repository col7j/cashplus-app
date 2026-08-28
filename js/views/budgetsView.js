/**
 * MASAR - Monthly Budgets View (الميزانيات وسقوف الصرف الشهرية)
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class BudgetsView {
  static render(container) {
    let selectedMonth = '2026-08';

    function renderContent() {
      const budgetStatuses = FinancialEngine.getBudgetsStatus(selectedMonth, db.state);
      const totalBudgeted = budgetStatuses.reduce((s, b) => s + b.limit, 0);
      const totalSpent = budgetStatuses.reduce((s, b) => s + b.spent, 0);
      const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
      const overallPercent = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

      container.innerHTML = `
        <div class="animate-fade-in">
          <!-- Header & Month Switcher -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">التحكم في سقف الإنفاق وضبط الصرف</span>
              <h2 style="font-size: 1.5rem; font-weight: 700;">الميزانية الشهرية</h2>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-sm);">
              <select id="budget-month-select" class="form-select" style="max-width: 180px; padding: 0.5rem 0.85rem; font-size: 0.875rem;">
                <option value="2026-08" ${selectedMonth === '2026-08' ? 'selected' : ''}>أغسطس 2026</option>
                <option value="2026-07" ${selectedMonth === '2026-07' ? 'selected' : ''}>يوليو 2026</option>
                <option value="2026-06" ${selectedMonth === '2026-06' ? 'selected' : ''}>يونيو 2026</option>
              </select>
            </div>
          </div>

          <!-- Total Budget Progress Surface -->
          <div class="surface surface-glass" style="margin-bottom: var(--space-xl);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-sm);">
              <div>
                <span style="font-size: 0.8125rem; color: var(--text-tertiary);">إجمالي الميزانية المرصودة للشهر</span>
                <div class="stat-value-huge" style="margin: 4px 0 0 0;">
                  <span class="num">${totalBudgeted.toLocaleString('en-US')}</span>
                  <span class="currency-symbol">ريال</span>
                </div>
              </div>
              <div style="display: flex; gap: var(--space-lg); text-align: left;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">المصروف الفعلي</div>
                  <div class="num" style="font-size: 1.25rem; font-weight: 700; color: ${totalSpent > totalBudgeted ? 'var(--danger)' : 'var(--text-primary)'};">
                    ${totalSpent.toLocaleString('en-US')} ريال
                  </div>
                </div>
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">المتبقي حتى نهاية الشهر</div>
                  <div class="num" style="font-size: 1.25rem; font-weight: 700; color: var(--success);">
                    ${totalRemaining.toLocaleString('en-US')} ريال
                  </div>
                </div>
              </div>
            </div>

            <!-- Big Main Bar -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--text-tertiary); margin-bottom: 6px;">
                <span>نسبة الاستهلاك الإجمالية</span>
                <span class="num">${overallPercent}%</span>
              </div>
              <div class="progress-bar-container" style="height: 12px;">
                <div class="progress-bar-fill ${totalSpent > totalBudgeted ? 'progress-fill-danger' : overallPercent > 80 ? 'progress-fill-warning' : 'progress-fill-primary'}" style="width: ${overallPercent}%;"></div>
              </div>
            </div>
          </div>

          <!-- Category Budgets Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-lg);">
            ${budgetStatuses.map(b => `
              <div class="surface" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid ${b.category.color};">
                <div>
                  <!-- Category Header -->
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: var(--space-xs);">
                      <span style="font-size: 1.5rem;">${b.category.emoji}</span>
                      <div>
                        <h3 style="font-size: 1.05rem; font-weight: 700;">${b.category.name}</h3>
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">استهلكت ${b.percentage}%</span>
                      </div>
                    </div>
                    ${b.isOver ? `<span class="badge badge-danger">تجاوز بـ ${b.overAmount.toLocaleString('en-US')} ريال</span>` : ''}
                  </div>

                  <!-- Spend & Limit Numbers -->
                  <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <div>
                      <span style="font-size: 0.75rem; color: var(--text-tertiary);">المصروف:</span>
                      <span class="num" style="font-size: 1.15rem; font-weight: 700;">${b.spent.toLocaleString('en-US')}</span>
                      <span class="currency-symbol">ريال</span>
                    </div>
                    <div style="text-align: left;">
                      <span style="font-size: 0.75rem; color: var(--text-tertiary);">السقف المحدد:</span>
                      <span class="num" style="font-size: 1.15rem; font-weight: 700; color: var(--text-secondary);">${b.limit.toLocaleString('en-US')}</span>
                      <span class="currency-symbol">ريال</span>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="progress-bar-container" style="margin-bottom: var(--space-md);">
                    <div class="progress-bar-fill ${b.isOver ? 'progress-fill-danger' : b.percentage > 80 ? 'progress-fill-warning' : 'progress-fill-success'}" style="width: ${b.percentage}%;"></div>
                  </div>

                  <!-- Subcategories Breakdown list if available -->
                  <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: var(--space-md);">
                    <span>الأقسام الفرعية: ${b.category.subcategories.join('، ')}</span>
                  </div>
                </div>

                <!-- Footer / Edit Limit Button -->
                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
                  <span style="font-size: 0.8125rem; color: var(--text-tertiary);">المتبقي: <strong class="num" style="color: ${b.remaining === 0 && b.isOver ? 'var(--danger)' : 'var(--success)'};">${b.remaining.toLocaleString('en-US')} ريال</strong></span>
                  <button class="btn btn-subtle btn-sm edit-limit-btn" data-cat-id="${b.category.id}" data-current-limit="${b.limit}">
                    ${Icons.edit}
                    تعديل السقف
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Month Change Event
      container.querySelector('#budget-month-select').addEventListener('change', (e) => {
        selectedMonth = e.target.value;
        renderContent();
      });

      // Edit Budget Limit
      container.querySelectorAll('.edit-limit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          const currentLimit = Number(btn.getAttribute('data-current-limit')) || 0;
          window.app.openSetBudgetModal(catId, currentLimit, selectedMonth);
        });
      });
    }

    renderContent();
  }
}

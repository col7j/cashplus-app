/**
 * MASAR - Savings & Goals View (صناديق وأهداف الادخار)
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class SavingsView {
  static render(container) {
    function renderContent() {
      const totalSavings = FinancialEngine.getTotalSavings(db.state);
      const totalTargets = db.state.savingsGoals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
      const overallProgress = totalTargets > 0 ? Math.round((totalSavings / totalTargets) * 100) : 0;

      container.innerHTML = `
        <div class="animate-fade-in">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">تخصيص الأموال لأهداف وصناديق طوارئ محددة</span>
              <h2 style="font-size: 1.5rem; font-weight: 700;">صناديق الادخار</h2>
            </div>
            <button class="btn btn-primary btn-sm" id="savings-btn-add">
              ${Icons.plus}
              هدف ادخار جديد
            </button>
          </div>

          <!-- Total Savings Overview -->
          <div class="surface surface-glass" style="margin-bottom: var(--space-xl); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-lg);">
            <div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary);">إجمالي ما تم ادخاره في جميع الأهداف</div>
              <div class="stat-value-huge" style="margin: 4px 0 0 0;">
                <span class="num">${FinancialEngine.formatMoney(totalSavings).amount}</span>
                <span class="currency-symbol">ريال</span>
              </div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary); margin-top: 4px;">
                من أصل مستهدف كلي: <strong class="num">${totalTargets.toLocaleString('en-US')} ريال</strong>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <div style="text-align: center; padding: var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md);">
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">نسبة تحقيق الأهداف</div>
                <div class="num" style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${overallProgress}%</div>
              </div>
            </div>
          </div>

          <!-- Savings Goals Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-lg);">
            ${db.state.savingsGoals.map(goal => {
              const current = Number(goal.currentAmount) || 0;
              const target = Number(goal.targetAmount) || 0;
              const remaining = Math.max(0, target - current);
              const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

              // Calculate months left and required monthly contribution
              let requiredMonthly = 0;
              let monthsLeft = 0;
              if (goal.targetDate && remaining > 0) {
                const targetD = new Date(goal.targetDate);
                const now = new Date();
                monthsLeft = Math.max(1, Math.ceil((targetD - now) / (1000 * 60 * 60 * 24 * 30)));
                requiredMonthly = Math.round(remaining / monthsLeft);
              }

              return `
                <div class="surface surface-glass" style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <!-- Goal Header -->
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-md);">
                      <div style="display: flex; align-items: center; gap: var(--space-xs);">
                        <span style="font-size: 1.75rem;">${goal.emoji || '🎯'}</span>
                        <div>
                          <h3 style="font-size: 1.1rem; font-weight: 700;">${goal.name}</h3>
                          ${goal.targetDate ? `<span style="font-size: 0.75rem; color: var(--text-tertiary);">الهدف: ${goal.targetDate} (${monthsLeft} أشهر متبقية)</span>` : ''}
                        </div>
                      </div>
                      <span class="badge ${progress >= 100 ? 'badge-success' : 'badge-neutral'}">${progress}%</span>
                    </div>

                    <!-- Amounts Info -->
                    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--space-sm);">
                      <div>
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">المدخر حالياً:</span>
                        <div class="num" style="font-size: 1.35rem; font-weight: 700; color: var(--primary);">${current.toLocaleString('en-US')} ريال</div>
                      </div>
                      <div style="text-align: left;">
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">المستهدف:</span>
                        <div class="num" style="font-size: 1.1rem; font-weight: 600; color: var(--text-secondary);">${target.toLocaleString('en-US')} ريال</div>
                      </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="progress-bar-container" style="margin-bottom: var(--space-md); height: 10px;">
                      <div class="progress-bar-fill progress-fill-primary" style="width: ${progress}%;"></div>
                    </div>

                    <!-- Monthly Contribution Recommendation -->
                    ${remaining > 0 && monthsLeft > 0 ? `
                      <div style="padding: 0.5rem 0.75rem; background: var(--bg-surface-secondary); border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--text-secondary); margin-bottom: var(--space-md);">
                        💡 الادخار الشهري المقترح للوصول بالموعد: <strong class="num" style="color: var(--text-primary);">${requiredMonthly.toLocaleString('en-US')} ريال/شهر</strong>
                      </div>
                    ` : ''}

                    ${goal.notes ? `<p style="font-size: 0.8125rem; color: var(--text-tertiary); margin-bottom: var(--space-md);">${goal.notes}</p>` : ''}
                  </div>

                  <!-- Goal Actions -->
                  <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); gap: var(--space-xs);">
                    <button class="btn btn-subtle btn-sm add-funds-btn" data-goal-id="${goal.id}">
                      + تغذية الهدف
                    </button>
                    <button class="btn btn-glass btn-icon btn-sm delete-goal-btn" data-goal-id="${goal.id}" style="color: var(--danger);" title="حذف الهدف">
                      ${Icons.trash}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Add Goal
      container.querySelector('#savings-btn-add')?.addEventListener('click', () => {
        window.app.openAddSavingsGoalModal();
      });

      // Add Funds to Goal
      container.querySelectorAll('.add-funds-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const goalId = btn.getAttribute('data-goal-id');
          const goal = db.state.savingsGoals.find(g => g.id === goalId);
          if (!goal) return;
          const amount = prompt(`أدخل المبلغ المراد إضافته إلى "${goal.name}" (ريال):`);
          if (amount && !isNaN(Number(amount))) {
            goal.currentAmount = (Number(goal.currentAmount) || 0) + Number(amount);
            db.save();
            renderContent();
            window.app.showToast(`تمت إضافة ${amount} ريال إلى ${goal.name}! 🎯`);
          }
        });
      });

      // Delete Goal
      container.querySelectorAll('.delete-goal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const goalId = btn.getAttribute('data-goal-id');
          if (confirm('هل تريد حذف هذا الهدف الادخاري؟')) {
            db.deleteSavingsGoal(goalId);
            renderContent();
          }
        });
      });
    }

    renderContent();
  }
}

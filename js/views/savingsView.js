/**
 * Cash Plus (كاش بلس) - Savings & Goals View (صناديق وأهداف الادخار وحاسبة الزكاة)
 */

import { db }              from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons }           from '../icons.js';

export class SavingsView {
  static render(container) {
    function renderContent() {
      const goals = db.state.savingsGoals || [];
      const totalSavings = FinancialEngine.getTotalSavings(db.state);
      const totalTargets = goals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
      const overallProgress = totalTargets > 0 ? Math.min(100, Math.round((totalSavings / totalTargets) * 100)) : 0;

      // Zakat Calculations (2.5% = 1/40)
      const now = new Date();
      let totalZakatDue = 0;
      let totalZakatEligibleAmount = 0;

      const enrichedGoals = goals.map(goal => {
        const current = Number(goal.currentAmount) || 0;
        const target = Number(goal.targetAmount) || 0;
        const remaining = Math.max(0, target - current);
        const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

        // Start date / Hawl tracking
        let startDate = goal.startDate ? new Date(goal.startDate) : null;
        if (!startDate && goal.id && goal.id.startsWith('sg-')) {
          const timestamp = Number(goal.id.replace('sg-', ''));
          if (!isNaN(timestamp)) startDate = new Date(timestamp);
        }
        if (!startDate) startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); // default 1 year

        const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const isHawlPassed = daysPassed >= 354; // Lunar/Solar year (~354-365 days)
        const daysLeftInHawl = Math.max(0, 354 - daysPassed);
        const monthsLeftInHawl = Math.ceil(daysLeftInHawl / 30);

        // Zakat on current savings (2.5%)
        const zakatAmount = current * 0.025;

        if (isHawlPassed && current > 0) {
          totalZakatDue += zakatAmount;
          totalZakatEligibleAmount += current;
        }

        // Target Date calculations
        let requiredMonthly = 0;
        let monthsLeft = 0;
        if (goal.targetDate && remaining > 0) {
          const targetD = new Date(goal.targetDate);
          monthsLeft = Math.max(1, Math.ceil((targetD - now) / (1000 * 60 * 60 * 24 * 30)));
          requiredMonthly = Math.round(remaining / monthsLeft);
        }

        return {
          ...goal,
          current,
          target,
          remaining,
          progress,
          startDate,
          daysPassed,
          isHawlPassed,
          daysLeftInHawl,
          monthsLeftInHawl,
          zakatAmount,
          monthsLeft,
          requiredMonthly
        };
      });

      container.innerHTML = `
        <div class="animate-fade-in" style="max-width: 1100px; margin: 0 auto;">

          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <p style="font-size: 0.8125rem; font-weight: 600; color: var(--primary-text); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;">إدارة الثروة والأهداف</p>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em;">صناديق الادخار والزكاة</h2>
              <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: 2px;">تخصيص الأموال لأهداف محددة ومتابعة حول الزكاة السنوي</p>
            </div>
            <button class="btn btn-primary btn-sm" id="savings-btn-add">
              ${Icons.plus}
              هدف ادخار جديد
            </button>
          </div>

          <!-- Total Savings & Zakat Banner -->
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-xl);" class="settings-split">

            <!-- 1. Total Savings Overview -->
            <div class="surface">
              <div style="font-size: 0.75rem; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">إجمالي المدخرات المحققة</div>
              <div class="stat-value-huge" style="margin: 6px 0 2px 0;">
                <span class="num">${FinancialEngine.formatMoney(totalSavings).amount}</span>
                <span class="currency-symbol">ريال</span>
              </div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary); margin-bottom: var(--space-md);">
                من أصل مستهدف كلي: <strong class="num" style="color: var(--text-secondary);">${totalTargets.toLocaleString('en-US')} ريال</strong>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 6px;">
                  <span>نسبة تحقيق الأهداف الكلية</span>
                  <span class="num" style="font-weight: 700; color: var(--primary);">${overallProgress}%</span>
                </div>
                <div class="progress-bar-container" style="height: 8px;">
                  <div class="progress-bar-fill progress-fill-primary" style="width: ${overallProgress}%;"></div>
                </div>
              </div>
            </div>

            <!-- 2. Islamic Zakat Calculator Card -->
            <div class="surface" style="background: linear-gradient(145deg, rgba(20, 184, 166, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%); border: 1px solid rgba(20, 184, 166, 0.25);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs);">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 1.25rem;">🕌</span>
                  <span style="font-size: 0.875rem; font-weight: 700; color: #10B981;">حاسبة زكاة المدخرات</span>
                </div>
                <span class="badge badge-success">2.5% سنوياً</span>
              </div>

              <div style="margin: 10px 0;">
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">إجمالي الزكاة المستحقة (دار عليها الحول):</div>
                <div style="font-size: 1.6rem; font-weight: 800; color: #10B981; margin-top: 2px;">
                  <span class="num">${totalZakatDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span style="font-size: 0.875rem; font-weight: 600;">ريال</span>
                </div>
              </div>

              <p style="font-size: 0.75rem; color: var(--text-tertiary); line-height: 1.5; margin: 0;">
                ✨ تجب الزكاة بنسبة ربع العشر (2.5%) على المبالغ المدخرة التي بلغت النصاب وحال عليها الحول (مضى عليها عام كامل).
              </p>
            </div>

          </div>

          <!-- Savings Goals Cards Grid -->
          ${enrichedGoals.length === 0 ? `
            <div class="surface" style="text-align: center; padding: 3rem 1.5rem;">
              <div style="font-size: 3rem; margin-bottom: var(--space-sm);">🎯</div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">لا توجد صناديق ادخار بعد</h3>
              <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-bottom: var(--space-lg);">
                أنشئ صندوق طوارئ، أو صندوق لشراء سيارة، أو هدف مالي لتتبع نمو أموالك ومقدار زكاتها تلقائياً.
              </p>
              <button class="btn btn-primary btn-sm" id="savings-btn-empty-add">+ إنشاء أول هدف ادخار</button>
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-lg);">
              ${enrichedGoals.map(goal => `
                <div class="surface" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid ${goal.isHawlPassed ? '#10B981' : 'var(--primary)'};">
                  <div>
                    <!-- Goal Header -->
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-md);">
                      <div style="display: flex; align-items: center; gap: var(--space-xs);">
                        <span style="font-size: 1.75rem;">${goal.emoji || '🎯'}</span>
                        <div>
                          <h3 style="font-size: 1.1rem; font-weight: 700;">${goal.name}</h3>
                          ${goal.targetDate ? `<span style="font-size: 0.75rem; color: var(--text-tertiary);">الموعد: ${goal.targetDate} (${goal.monthsLeft} أشهر متبقية)</span>` : ''}
                        </div>
                      </div>
                      <span class="badge ${goal.progress >= 100 ? 'badge-success' : 'badge-neutral'}">${goal.progress}%</span>
                    </div>

                    <!-- Amounts Info -->
                    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--space-sm);">
                      <div>
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">المدخر حالياً:</span>
                        <div class="num" style="font-size: 1.35rem; font-weight: 700; color: var(--primary);">${goal.current.toLocaleString('en-US')} ريال</div>
                      </div>
                      <div style="text-align: left;">
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">المستهدف:</span>
                        <div class="num" style="font-size: 1.05rem; font-weight: 600; color: var(--text-secondary);">${goal.target.toLocaleString('en-US')} ريال</div>
                      </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="progress-bar-container" style="margin-bottom: var(--space-md); height: 8px;">
                      <div class="progress-bar-fill progress-fill-primary" style="width: ${goal.progress}%;"></div>
                    </div>

                    <!-- Zakat Status Box -->
                    <div style="padding: 0.65rem 0.85rem; border-radius: var(--radius-md); font-size: 0.8125rem; margin-bottom: var(--space-md); background: ${goal.isHawlPassed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-secondary)'}; border: 1px solid ${goal.isHawlPassed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'};">
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                        <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; color: ${goal.isHawlPassed ? '#10B981' : 'var(--text-secondary)'};">
                          <span>${goal.isHawlPassed ? '🕌 دار عليه الحول (سنة)' : '⏳ الحول جاري'}</span>
                        </div>
                        <span class="badge ${goal.isHawlPassed ? 'badge-success' : 'badge-neutral'}" style="font-size: 0.7rem;">
                          ${goal.isHawlPassed ? 'واجبة الزكاة' : `متبقي ${goal.monthsLeftInHawl} أشهر`}
                        </span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-tertiary);">
                        <span>مبلغ الزكاة (2.5%):</span>
                        <strong class="num" style="font-size: 0.875rem; color: ${goal.isHawlPassed ? '#10B981' : 'var(--text-primary)'};">
                          ${goal.zakatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                        </strong>
                      </div>
                    </div>

                    <!-- Monthly Contribution Recommendation -->
                    ${goal.remaining > 0 && goal.monthsLeft > 0 ? `
                      <div style="padding: 0.5rem 0.75rem; background: var(--bg-surface-secondary); border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--text-secondary); margin-bottom: var(--space-md);">
                        💡 الادخار الشهري المقترح: <strong class="num" style="color: var(--text-primary);">${goal.requiredMonthly.toLocaleString('en-US')} ريال/شهر</strong>
                      </div>
                    ` : ''}

                    ${goal.notes ? `<p style="font-size: 0.8125rem; color: var(--text-tertiary); margin-bottom: var(--space-md);">${goal.notes}</p>` : ''}
                  </div>

                  <!-- Goal Actions -->
                  <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); gap: var(--space-xs);">
                    <button class="btn btn-subtle btn-sm add-funds-btn" data-goal-id="${goal.id}">
                      + تغذية الصندوق
                    </button>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <button class="btn btn-glass btn-icon btn-sm toggle-hawl-btn" data-goal-id="${goal.id}" title="تحديد اكتمال سنة (حول)">
                        ${goal.isHawlPassed ? '🔄' : '⏱️'}
                      </button>
                      <button class="btn btn-glass btn-icon btn-sm delete-goal-btn" data-goal-id="${goal.id}" style="color: var(--danger);" title="حذف الهدف">
                        ${Icons.trash}
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;

      // Event Listeners
      container.querySelector('#savings-btn-add')?.addEventListener('click', () => {
        window.app.openAddSavingsGoalModal();
      });

      container.querySelector('#savings-btn-empty-add')?.addEventListener('click', () => {
        window.app.openAddSavingsGoalModal();
      });

      // Add Funds to Goal
      container.querySelectorAll('.add-funds-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const goalId = btn.getAttribute('data-goal-id');
          const goal = db.state.savingsGoals.find(g => g.id === goalId);
          if (!goal) return;
          const amount = prompt(`أدخل المبلغ المراد إضافته إلى "${goal.name}" (ريال):`);
          if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
            goal.currentAmount = (Number(goal.currentAmount) || 0) + Number(amount);
            db.save();
            renderContent();
            window.app.showToast(`تمت إضافة ${amount} ريال إلى ${goal.name}! 🎯`);
          }
        });
      });

      // Toggle Hawl Completed (مرور سنة)
      container.querySelectorAll('.toggle-hawl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const goalId = btn.getAttribute('data-goal-id');
          const goal = db.state.savingsGoals.find(g => g.id === goalId);
          if (!goal) return;
          
          const isCurrentlyPassed = goal.startDate ? (new Date() - new Date(goal.startDate)) >= 354 * 24 * 3600 * 1000 : false;
          if (isCurrentlyPassed) {
            goal.startDate = new Date().toISOString().split('T')[0]; // reset to today
            window.app.showToast('تم إعادة تعيين بدء الحول لهذا الصندوق ⏱️');
          } else {
            goal.startDate = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().split('T')[0]; // set to 1 year ago
            window.app.showToast('تم تحديد مرور سنة (حول كامل) وتفعيل الزكاة 🕌');
          }
          db.save();
          renderContent();
        });
      });

      // Delete Goal
      container.querySelectorAll('.delete-goal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const goalId = btn.getAttribute('data-goal-id');
          if (confirm('هل تريد حذف هذا الصندوق الادخاري؟')) {
            db.deleteSavingsGoal(goalId);
            renderContent();
            window.app.showToast('تم حذف الصندوق');
          }
        });
      });
    }

    renderContent();
  }
}

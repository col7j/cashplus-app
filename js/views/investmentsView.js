/**
 * MASAR - Investments Portfolio View (تتبع وتوثيق المحافظ الاستثمارية)
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class InvestmentsView {
  static render(container) {
    function renderContent() {
      const totalInvested = db.state.investments.reduce((s, i) => s + (Number(i.contributions) - Number(i.withdrawals)), 0);
      const totalCurrentVal = FinancialEngine.getTotalInvestments(db.state);
      const totalProfitLoss = totalCurrentVal - totalInvested;
      const roiPercent = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(1) : '0.0';

      container.innerHTML = `
        <div class="animate-fade-in">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">متابعة وتوثيق المحافظ والفرص الاستثمارية</span>
              <h2 style="font-size: 1.5rem; font-weight: 700;">المحافظ الاستثمارية</h2>
            </div>
            <button class="btn btn-primary btn-sm" id="inv-btn-add">
              ${Icons.plus}
              إضافة محفظة / أصل
            </button>
          </div>

          <!-- Total Investment Overview -->
          <div class="surface surface-glass" style="margin-bottom: var(--space-xl); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-lg);">
            <div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary);">القيمة السوقية الإجمالية للاستثمارات</div>
              <div class="stat-value-huge" style="margin: 4px 0 0 0;">
                <span class="num">${FinancialEngine.formatMoney(totalCurrentVal).amount}</span>
                <span class="currency-symbol">ريال</span>
              </div>
            </div>

            <div style="display: flex; gap: var(--space-lg); text-align: left;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">إجمالي رأس المال المستثمر</div>
                <div class="num" style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">
                  ${totalInvested.toLocaleString('en-US')} ريال
                </div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">صافي الأرباح / الخسائر (ROI)</div>
                <div class="num" style="font-size: 1.25rem; font-weight: 700; color: ${totalProfitLoss >= 0 ? 'var(--success)' : 'var(--danger)'};">
                  ${totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toLocaleString('en-US')} ريال (${roiPercent}%)
                </div>
              </div>
            </div>
          </div>

          <!-- Investment Portfolios Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--space-lg);">
            ${db.state.investments.map(inv => {
              const netContrib = (Number(inv.contributions) || 0) - (Number(inv.withdrawals) || 0);
              const val = Number(inv.currentValue) || 0;
              const profit = val - netContrib;
              const roi = netContrib > 0 ? ((profit / netContrib) * 100).toFixed(1) : '0.0';

              return `
                <div class="surface" style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-md);">
                      <div>
                        <span class="badge badge-neutral" style="margin-bottom: 4px;">📈 ${inv.platform || 'منصة استثمار'}</span>
                        <h3 style="font-size: 1.15rem; font-weight: 700;">${inv.name}</h3>
                      </div>
                      <span class="badge ${profit >= 0 ? 'badge-success' : 'badge-danger'}">
                        ${profit >= 0 ? '+' : ''}${roi}%
                      </span>
                    </div>

                    <div style="background: var(--bg-surface-secondary); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-md); display: flex; flex-direction: column; gap: var(--space-xs);">
                      <div style="display: flex; justify-content: space-between; font-size: 0.8125rem;">
                        <span style="color: var(--text-tertiary);">القيمة الحالية:</span>
                        <strong class="num" style="font-size: 1.15rem; color: var(--primary);">${val.toLocaleString('en-US')} ريال</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.8125rem;">
                        <span style="color: var(--text-tertiary);">رأس المال المودع:</span>
                        <span class="num">${netContrib.toLocaleString('en-US')} ريال</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.8125rem;">
                        <span style="color: var(--text-tertiary);">الربح / العائد:</span>
                        <span class="num" style="font-weight: 700; color: ${profit >= 0 ? 'var(--success)' : 'var(--danger)'};">${profit >= 0 ? '+' : ''}${profit.toLocaleString('en-US')} ريال</span>
                      </div>
                    </div>

                    ${inv.notes ? `<p style="font-size: 0.8125rem; color: var(--text-tertiary); margin-bottom: var(--space-md);">${inv.notes}</p>` : ''}
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); gap: var(--space-xs);">
                    <button class="btn btn-subtle btn-sm update-val-btn" data-inv-id="${inv.id}" data-current-val="${val}">
                      تحديث التقييم الحالي
                    </button>
                    <button class="btn btn-glass btn-icon btn-sm delete-inv-btn" data-inv-id="${inv.id}" style="color: var(--danger);" title="حذف الأصل">
                      ${Icons.trash}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Add Investment
      container.querySelector('#inv-btn-add')?.addEventListener('click', () => {
        window.app.openAddInvestmentModal();
      });

      // Update Valuation
      container.querySelectorAll('.update-val-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const invId = btn.getAttribute('data-inv-id');
          const currentVal = btn.getAttribute('data-current-val');
          const newVal = prompt('أدخل القيمة السوقية الحالية للمحفظة (ريال):', currentVal);
          if (newVal !== null && !isNaN(Number(newVal))) {
            db.updateInvestment(invId, { currentValue: Number(newVal) });
            renderContent();
            window.app.showToast('تم تحديث التقييم الاستثماري! 📈');
          }
        });
      });

      // Delete Investment
      container.querySelectorAll('.delete-inv-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const invId = btn.getAttribute('data-inv-id');
          if (confirm('هل تريد حذف هذه المحفظة الاستثمارية؟')) {
            db.deleteInvestment(invId);
            renderContent();
          }
        });
      });
    }

    renderContent();
  }
}

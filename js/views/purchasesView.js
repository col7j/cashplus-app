/**
 * MASAR - Planned Purchases View (المشتريات المخططة وإدارة الرغبات والاحتياجات)
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class PurchasesView {
  static render(container) {
    function renderContent() {
      const activePurchases = db.state.purchases.filter(p => p.status !== 'purchased' && p.status !== 'cancelled');
      const purchasedItems = db.state.purchases.filter(p => p.status === 'purchased');
      const totalPlannedCost = activePurchases.reduce((s, p) => s + (Number(p.expectedPrice) || 0), 0);
      const availableMoney = FinancialEngine.getAvailableMoney(db.state);
      const isExceeding = totalPlannedCost > availableMoney;

      container.innerHTML = `
        <div class="animate-fade-in">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">التخطيط المالي للمشتريات الكبرى وتصنيف الاحتياجات والرغبات</span>
              <h2 style="font-size: 1.5rem; font-weight: 700;">المشتريات المخططة</h2>
            </div>
            <button class="btn btn-primary btn-sm" id="pur-btn-add">
              ${Icons.plus}
              إضافة مشتريات جديدة
            </button>
          </div>

          <!-- Total Planned Overview & Liquidity Warning -->
          <div class="surface surface-glass" style="margin-bottom: var(--space-xl); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-lg);">
            <div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary);">إجمالي تكلفة المشتريات المخططة</div>
              <div class="stat-value-huge" style="margin: 4px 0 0 0;">
                <span class="num">${totalPlannedCost.toLocaleString('en-US')}</span>
                <span class="currency-symbol">ريال</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px;">
                السيولة الحرة المتاحة حالياً: <strong class="num">${availableMoney.toLocaleString('en-US')} ريال</strong>
              </div>
            </div>

            <div style="padding: var(--space-md); background: ${isExceeding ? 'var(--danger-surface)' : 'var(--success-surface)'}; border: 1px solid ${isExceeding ? 'var(--danger-border)' : 'var(--success-border)'}; border-radius: var(--radius-md); max-width: 380px;">
              <div style="font-size: 0.8125rem; font-weight: 700; color: ${isExceeding ? 'var(--danger)' : 'var(--success)'}; margin-bottom: 2px;">
                ${isExceeding ? '⚠️ المشتريات تتجاوز السيولة المتاحة' : '✅ السيولة تغطي جميع المشتريات المخططة'}
              </div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">
                ${isExceeding ? `المشتريات تتجاوز السيولة المتاحة بـ ${(totalPlannedCost - availableMoney).toLocaleString('en-US')} ريال. خطط لادخار المبلغ تدريجياً.` : 'يمكنك تنفيذ المشتريات ذات الأولوية العالية بأمان دون التأثير على التزاماتك.'}
              </p>
            </div>
          </div>

          <!-- Planned Items List -->
          <div style="margin-bottom: var(--space-2xl);">
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: var(--space-md);">قائمة المشتريات النشطة (${activePurchases.length})</h3>

            ${activePurchases.length === 0 ? `
              <div class="surface empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3>قائمة المشتريات فارغة</h3>
                <p>أضف المنتجات أو الأجهزة التي تخطط لشرائها مستقبلاً لتقييم الاحتياج وجدولة الادخار.</p>
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--space-lg);">
                ${activePurchases.map(p => {
                  const cat = db.state.categories.find(c => c.id === p.categoryId);
                  
                  // Calculate months remaining and suggested monthly savings
                  let monthlySaving = null;
                  let monthsLeft = 0;
                  if (p.targetDate) {
                    const tDate = new Date(p.targetDate);
                    const now = new Date();
                    monthsLeft = Math.max(1, Math.ceil((tDate - now) / (1000 * 60 * 60 * 24 * 30)));
                    monthlySaving = Math.round(Number(p.expectedPrice) / monthsLeft);
                  }

                  const priorityMap = {
                    high: { label: 'أولوية عالية', badge: 'badge-danger' },
                    medium: { label: 'أولوية متوسطة', badge: 'badge-warning' },
                    low: { label: 'أولوية منخفضة', badge: 'badge-neutral' }
                  }[p.priority || 'medium'];

                  return `
                    <div class="surface" style="display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        <!-- Header with Type & Priority -->
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-sm);">
                          <div>
                            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                              <span class="badge ${p.type === 'need' ? 'badge-info' : 'badge-neutral'}">${p.type === 'need' ? '🎯 احتياج أساسي' : '✨ رغبة'}</span>
                              <span class="badge ${priorityMap.badge}">${priorityMap.label}</span>
                            </div>
                            <h4 style="font-size: 1.1rem; font-weight: 700;">${p.name}</h4>
                          </div>
                          <div style="text-align: left;">
                            <div class="num" style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">
                              ${Number(p.expectedPrice).toLocaleString('en-US')} ريال
                            </div>
                          </div>
                        </div>

                        ${p.targetDate ? `
                          <div style="padding: 0.5rem 0.75rem; background: var(--bg-surface-secondary); border-radius: var(--radius-sm); font-size: 0.75rem; margin-bottom: var(--space-sm);">
                            <div>📅 موعد الشراء المستهدف: <strong>${p.targetDate}</strong> (${monthsLeft} أشهر)</div>
                            ${monthlySaving ? `<div style="margin-top: 2px; color: var(--text-secondary);">💡 الادخار المقترح: <strong class="num">${monthlySaving.toLocaleString('en-US')} ريال/شهر</strong></div>` : ''}
                          </div>
                        ` : ''}

                        ${p.notes ? `<p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-md);">${p.notes}</p>` : ''}
                      </div>

                      <!-- Footer Actions (Mark Purchased / Delete) -->
                      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); gap: var(--space-xs);">
                        <button class="btn btn-primary btn-sm mark-purchased-btn" data-pur-id="${p.id}">
                          ${Icons.check}
                          تم الشراء الآن
                        </button>
                        <button class="btn btn-glass btn-icon btn-sm delete-pur-btn" data-pur-id="${p.id}" style="color: var(--danger);" title="حذف">
                          ${Icons.trash}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Previously Purchased History -->
          ${purchasedItems.length > 0 ? `
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: var(--space-md);">سجل المشتريات المكتملة (${purchasedItems.length})</h3>
              <div class="surface">
                <div class="transaction-list">
                  ${purchasedItems.map(p => `
                    <div class="transaction-item" style="cursor: default;">
                      <div class="txn-left-info">
                        <div class="txn-icon-wrapper txn-icon-income">✅</div>
                        <div class="txn-details">
                          <h4>${p.name}</h4>
                          <div class="txn-meta">
                            <span>السعر الفعلي: ${Number(p.actualPrice || p.expectedPrice).toLocaleString('en-US')} ريال</span>
                            ${p.expectedPrice && p.actualPrice ? `<span>• الفارق: ${(Number(p.expectedPrice) - Number(p.actualPrice)).toLocaleString('en-US')} ريال</span>` : ''}
                          </div>
                        </div>
                      </div>
                      <span class="badge badge-success">تم الشراء</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

        </div>
      `;

      // Add Purchase
      container.querySelector('#pur-btn-add')?.addEventListener('click', () => {
        window.app.openAddPurchaseModal();
      });

      // Mark Purchased (Completes purchase and converts to actual transaction)
      container.querySelectorAll('.mark-purchased-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const purId = btn.getAttribute('data-pur-id');
          const p = db.state.purchases.find(item => item.id === purId);
          if (p) {
            window.app.openPurchaseCompletionModal(p);
          }
        });
      });

      // Delete
      container.querySelectorAll('.delete-pur-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const purId = btn.getAttribute('data-pur-id');
          if (confirm('هل تريد حذف هذا العنصر من المشتريات؟')) {
            db.deletePurchase(purId);
            renderContent();
          }
        });
      });
    }

    renderContent();
  }
}

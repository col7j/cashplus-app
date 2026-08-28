/**
 * MASAR - Accounts, Banks, Cards & Vault View (إدارة الحسابات والخزينة)
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class AccountsView {
  static render(container) {
    let hideSensitive = db.state.settings.hideSensitive ?? false;

    function renderContent() {
      const cashBalance = FinancialEngine.getCashBalance(db.state);
      const totalLiquid = db.state.accounts.reduce((s, a) => s + FinancialEngine.getAccountBalance(a.id, db.state), 0) + cashBalance;

      container.innerHTML = `
        <div class="animate-fade-in">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">خزينة بيانات الحسابات والبطاقات</span>
              <h2 style="font-size: 1.5rem; font-weight: 700;">الحسابات والمحافظ</h2>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-xs);">
              <button class="btn btn-glass btn-sm" id="acc-btn-toggle-mask">
                ${hideSensitive ? Icons.eye : Icons.eyeOff}
                ${hideSensitive ? 'إظهار البيانات الحساسة' : 'إخفاء البيانات'}
              </button>
              <button class="btn btn-primary btn-sm" id="acc-btn-add">
                ${Icons.plus}
                إضافة حساب جديد
              </button>
            </div>
          </div>

          <!-- Total Liquid Overview -->
          <div class="surface surface-glass" style="margin-bottom: var(--space-xl); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary);">إجمالي السيولة النقدية في الحسابات والكاش</div>
              <div class="stat-value-huge" style="margin: 4px 0 0 0;">
                <span class="num">${FinancialEngine.formatMoney(totalLiquid).amount}</span>
                <span class="currency-symbol">ريال</span>
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm);">
              <div style="padding: var(--space-sm) var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">الحسابات النشطة</div>
                <div style="font-size: 1.15rem; font-weight: 700;" class="num">${db.state.accounts.length}</div>
              </div>
              <div style="padding: var(--space-sm) var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">البطاقات المرتبطة</div>
                <div style="font-size: 1.15rem; font-weight: 700;" class="num">${db.state.cards.length}</div>
              </div>
            </div>
          </div>

          <!-- Physical Cash Account Surface -->
          <div class="surface" style="margin-bottom: var(--space-lg); border-right: 4px solid #10B981;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);">
              <div style="display: flex; align-items: center; gap: var(--space-md);">
                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                  💵
                </div>
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">النقدية في اليد (الكاش)</h3>
                  <p style="font-size: 0.75rem;">لتتبع عمليات السحب من الصراف والمصروفات النقدية المباشرة</p>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-lg);">
                <div style="text-align: left;">
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">الرصيد النقدي المتوفر</div>
                  <div class="num" style="font-size: 1.35rem; font-weight: 700; color: #10B981;">${cashBalance.toLocaleString('en-US')} ريال</div>
                </div>
                <button class="btn btn-subtle btn-sm" id="acc-btn-reconcile-cash">تسوية الكاش</button>
              </div>
            </div>
          </div>

          <!-- Accounts Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-lg);">
            ${db.state.accounts.map(acc => {
              const bank = db.state.banks.find(b => b.id === acc.bankId) || { name: 'بنك عام', color: '#4F46E5' };
              const currentBalance = FinancialEngine.getAccountBalance(acc.id, db.state);
              const linkedCards = db.state.cards.filter(c => c.accountId === acc.id);

              const maskedIBAN = hideSensitive ? acc.iban.replace(/.(?=.{4})/g, '•') : acc.iban;
              const maskedAccNum = hideSensitive ? acc.accountNumber.replace(/.(?=.{4})/g, '•') : acc.accountNumber;

              return `
                <div class="surface surface-glass" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid ${acc.color || bank.color};">
                  <div>
                    <!-- Bank & Account Header -->
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-md);">
                      <div>
                        <span class="badge badge-neutral" style="margin-bottom: 4px;">🏦 ${bank.name}</span>
                        <h3 style="font-size: 1.15rem; font-weight: 700;">${acc.name}</h3>
                        <div style="font-size: 0.75rem; color: var(--text-tertiary);">${acc.accountHolder || ''}</div>
                      </div>
                      <div style="text-align: left;">
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">الرصيد الفعلي</span>
                        <div class="stat-value-lg">
                          <span class="num">${currentBalance.toLocaleString('en-US')}</span>
                          <span class="currency-symbol">${acc.currency}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Vault Details (Copyable Box) -->
                    <div style="background: var(--bg-surface-secondary); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-md); display: flex; flex-direction: column; gap: var(--space-xs);">
                      
                      <!-- IBAN Row -->
                      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem;">
                        <span style="color: var(--text-tertiary);">IBAN:</span>
                        <div style="display: flex; align-items: center; gap: var(--space-xs);">
                          <code style="font-family: var(--font-mono); direction: ltr; font-weight: 600;">${maskedIBAN}</code>
                          <button class="btn btn-glass btn-icon btn-sm copy-btn" data-copy="${acc.iban}" title="نسخ الآيبان">${Icons.copy}</button>
                        </div>
                      </div>

                      <!-- Account Number Row -->
                      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem;">
                        <span style="color: var(--text-tertiary);">رقم الحساب:</span>
                        <div style="display: flex; align-items: center; gap: var(--space-xs);">
                          <code style="font-family: var(--font-mono); direction: ltr;">${maskedAccNum}</code>
                          <button class="btn btn-glass btn-icon btn-sm copy-btn" data-copy="${acc.accountNumber}" title="نسخ رقم الحساب">${Icons.copy}</button>
                        </div>
                      </div>

                      <!-- Swift Row if available -->
                      ${acc.swift ? `
                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem;">
                          <span style="color: var(--text-tertiary);">SWIFT / BIC:</span>
                          <code style="font-family: var(--font-mono); direction: ltr;">${acc.swift}</code>
                        </div>
                      ` : ''}
                    </div>

                    <!-- Linked Cards Section -->
                    <div style="margin-bottom: var(--space-md);">
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs);">
                        <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary);">البطاقات المرتبطة (${linkedCards.length})</span>
                        <button class="btn btn-subtle btn-sm add-card-btn" data-acc-id="${acc.id}" style="padding: 2px 6px; font-size: 0.7rem;">+ بطاقة</button>
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        ${linkedCards.map(c => `
                          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.8125rem;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                              <span>💳</span>
                              <span>${c.name}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                              <code style="font-family: var(--font-mono); font-weight: 700;">****${c.last4}</code>
                              <button class="btn btn-glass btn-icon btn-sm del-card-btn" data-card-id="${c.id}" style="width: 24px; height: 24px; color: var(--danger);" title="حذف البطاقة">${Icons.close}</button>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>

                  <!-- Footer Actions (Copy All Wire Info & Reconciliation) -->
                  <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-sm); gap: var(--space-xs); flex-wrap: wrap;">
                    <button class="btn btn-glass btn-sm copy-all-btn" data-acc-id="${acc.id}">
                      ${Icons.copy}
                      نسخ كل بيانات التحويل
                    </button>
                    <button class="btn btn-subtle btn-sm reconcile-btn" data-acc-id="${acc.id}">
                      تسوية الرصيد
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Mask Toggle
      container.querySelector('#acc-btn-toggle-mask')?.addEventListener('click', () => {
        hideSensitive = !hideSensitive;
        db.state.settings.hideSensitive = hideSensitive;
        db.save();
        renderContent();
      });

      // Add Account
      container.querySelector('#acc-btn-add')?.addEventListener('click', () => {
        window.app.openAddAccountModal();
      });

      // Copy Individual field
      container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const text = btn.getAttribute('data-copy');
          navigator.clipboard.writeText(text).then(() => {
            window.app.showToast('تم نسخ البيانات بنجاح! 📋');
          });
        });
      });

      // Copy All Wire Info
      container.querySelectorAll('.copy-all-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-acc-id');
          const acc = db.state.accounts.find(a => a.id === accId);
          const bank = db.state.banks.find(b => b.id === acc?.bankId);
          if (acc) {
            const wireText = `اسم المستفيد: ${acc.accountHolder || db.state.settings.userProfile.name}
اسم البنك: ${bank ? bank.name : 'بنك'}
رقم الحساب: ${acc.accountNumber}
الآيبان (IBAN): ${acc.iban}
السويفت كود (SWIFT): ${acc.swift || 'N/A'}
العملة: ${acc.currency || 'SAR'}`;

            navigator.clipboard.writeText(wireText).then(() => {
              window.app.showToast('تم نسخ كامل بيانات التحويل البنكي! ✨');
            });
          }
        });
      });

      // Add Card to Account
      container.querySelectorAll('.add-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-acc-id');
          window.app.openAddCardModal(accId);
        });
      });

      // Delete Card
      container.querySelectorAll('.del-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cardId = btn.getAttribute('data-card-id');
          if (confirm('هل أنت متأكد من حذف هذه البطاقة؟')) {
            db.deleteCard(cardId);
            renderContent();
          }
        });
      });

      // Reconciliation
      container.querySelectorAll('.reconcile-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-acc-id');
          window.app.openReconciliationModal(accId);
        });
      });

      container.querySelector('#acc-btn-reconcile-cash')?.addEventListener('click', () => {
        window.app.openReconciliationModal('cash');
      });
    }

    renderContent();
  }
}

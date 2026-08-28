/**
 * Cash Plus (كاش بلس) - Accounts, Banks & Cards Master Vault
 * خزينة الحسابات البنكية الموحدة والبطاقات والحسابات الفرعية
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class AccountsView {
  static render(container) {
    let hideSensitive = db.state.settings.hideSensitive ?? false;

    function renderContent() {
      const cashBalance = FinancialEngine.getCashBalance(db.state);
      const totalLiquid = (db.state.accounts || []).reduce((s, a) => s + FinancialEngine.getAccountBalance(a.id, db.state), 0) + cashBalance;

      // Group accounts by Bank
      const bankGroups = {};
      (db.state.accounts || []).forEach(acc => {
        const bankId = acc.bankId || 'bank-custom';
        if (!bankGroups[bankId]) {
          const bankRef = (db.state.banks || []).find(b => b.id === bankId) || {
            id: bankId,
            name: acc.customBankName || 'بنك مخصص',
            color: acc.color || '#4F6DF5',
            logo: '🏦'
          };
          bankGroups[bankId] = {
            info: bankRef,
            accounts: []
          };
        }
        bankGroups[bankId].accounts.push(acc);
      });

      container.innerHTML = `
        <div class="animate-fade-in">
          
          <!-- Top Page Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <span style="font-size: 0.8125rem; color: var(--text-tertiary);">خزينة البنوك والبطاقات والحسابات الفرعية</span>
              <h2 style="font-size: 1.5rem; font-weight: 800;">الحسابات والمحافظ البنكية</h2>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap;">
              <button class="btn btn-glass btn-sm" id="acc-btn-toggle-mask">
                ${hideSensitive ? Icons.eye : Icons.eyeOff}
                ${hideSensitive ? 'إظهار الأرقام الحساسة' : 'إخفاء الأرقام'}
              </button>
              <button class="btn btn-primary btn-sm" id="acc-btn-add-bank">
                ${Icons.plus}
                + إضافة بنك أو حساب جديد
              </button>
            </div>
          </div>

          <!-- Total Liquid Overview Card -->
          <div class="surface surface-glass" style="margin-bottom: var(--space-xl); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);">
            <div>
              <div style="font-size: 0.8125rem; color: var(--text-tertiary);">إجمالي السيولة والأرصدة في كافة البنوك والكاش</div>
              <div class="stat-value-huge" style="margin: 4px 0 0 0;">
                <span class="num">${FinancialEngine.formatMoney(totalLiquid).amount}</span>
                <span class="currency-symbol">ريال</span>
              </div>
            </div>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
              <div style="padding: var(--space-sm) var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center; min-width: 90px;">
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">البنوك المسجلة</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);" class="num">${Object.keys(bankGroups).length}</div>
              </div>
              <div style="padding: var(--space-sm) var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center; min-width: 90px;">
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">الحسابات الفرعية</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--success);" class="num">${(db.state.accounts || []).length}</div>
              </div>
              <div style="padding: var(--space-sm) var(--space-md); background: var(--bg-surface-secondary); border-radius: var(--radius-md); text-align: center; min-width: 90px;">
                <div style="font-size: 0.75rem; color: var(--text-tertiary);">البطاقات المرتبطة</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #8B5CF6;" class="num">${(db.state.cards || []).length}</div>
              </div>
            </div>
          </div>

          <!-- Physical Cash Account Banner -->
          <div class="surface" style="margin-bottom: var(--space-xl); border-right: 4px solid #10B981;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);">
              <div style="display: flex; align-items: center; gap: var(--space-md);">
                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                  💵
                </div>
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 800;">النقدية في اليد (الكاش)</h3>
                  <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">لتتبع عمليات السحب من الصراف والمصروفات النقدية المباشرة</p>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-lg);">
                <div style="text-align: left;">
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">الرصيد المتوفر</div>
                  <div class="num" style="font-size: 1.35rem; font-weight: 800; color: #10B981;">${cashBalance.toLocaleString('en-US')} ريال</div>
                </div>
                <button class="btn btn-subtle btn-sm" id="acc-btn-reconcile-cash">تسوية الكاش</button>
              </div>
            </div>
          </div>

          <!-- UNIFIED BANK GROUPS LIST -->
          <div style="display: flex; flex-direction: column; gap: var(--space-xl);">
            ${Object.keys(bankGroups).length === 0 ? `
              <div class="surface" style="text-align: center; padding: 3rem var(--space-md);">
                <div style="font-size: 3rem; margin-bottom: var(--space-xs);">🏦</div>
                <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px;">لا توجد حسابات أو بنوك مضافة</h3>
                <p style="font-size: 0.875rem; color: var(--text-tertiary); max-width: 440px; margin: 0 auto 1.5rem auto;">
                  أضف بنكك الأول (الراجحي، الأهلي، الإنماء، STC Pay...)، وستتمكن من إنشاء حسابات جارية وادخار وبطاقات ائتمانية ومسبقة الدفع تحته في كتلة واحدة.
                </p>
                <button class="btn btn-primary btn-sm" id="acc-btn-empty-add">+ إضافة أول بنك / حساب</button>
              </div>
            ` : Object.values(bankGroups).map(group => {
              const bank = group.info;
              const accounts = group.accounts;
              const bankTotal = accounts.reduce((sum, acc) => sum + FinancialEngine.getAccountBalance(acc.id, db.state), 0);

              return `
                <!-- Master Bank Block -->
                <div class="surface surface-glass" style="padding: 1.5rem; border-top: 4px solid ${bank.color || '#4F6DF5'}; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
                  
                  <!-- Master Bank Header -->
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md); border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: ${bank.color || '#4F6DF5'}22; border: 1px solid ${bank.color || '#4F6DF5'}44; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; color: ${bank.color || '#4F6DF5'};">
                        ${bank.logo ? bank.logo.split(' ')[0] : '🏛️'}
                      </div>
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0;">${bank.name}</h3>
                          <span class="badge" style="background: ${bank.color || '#4F6DF5'}18; color: ${bank.color || '#4F6DF5'}; font-size: 0.7rem; font-weight: 700;">${accounts.length} حسابات/بطاقات</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 2px;">إجمالي المبالغ في ${bank.name}</div>
                      </div>
                    </div>

                    <!-- Bank Total Balance & Actions -->
                    <div style="display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;">
                      <div style="text-align: left;">
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">مجموع أرصدة البنك</span>
                        <div style="font-size: 1.35rem; font-weight: 900; color: ${bank.color || 'var(--primary)'};">
                          <span class="num">${bankTotal.toLocaleString('en-US')}</span> <small style="font-size:0.75rem;">ريال</small>
                        </div>
                      </div>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-primary btn-sm btn-add-sub-acc" data-bank-id="${bank.id}" style="padding: 0.4rem 0.85rem; font-size: 0.8125rem;">
                          + إضافة حساب فرعي / بطاقة
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Sub-Accounts and Cards Grid under this Bank -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">
                    ${accounts.map(acc => {
                      const balance = FinancialEngine.getAccountBalance(acc.id, db.state);
                      const linkedCards = (db.state.cards || []).filter(c => c.accountId === acc.id);
                      const maskedIBAN = hideSensitive && acc.iban ? acc.iban.replace(/.(?=.{4})/g, '•') : (acc.iban || 'لا يوجد آيبان مسجل');
                      const maskedAccNum = hideSensitive && acc.accountNumber ? acc.accountNumber.replace(/.(?=.{4})/g, '•') : (acc.accountNumber || '');

                      // Type icons & labels
                      let typeLabel = 'حساب جاري';
                      let typeEmoji = '🏦';
                      let typeBadgeClass = 'badge-primary';

                      if (acc.accountType === 'savings') {
                        typeLabel = 'حساب ادخار / عوائد';
                        typeEmoji = '💰';
                        typeBadgeClass = 'badge-success';
                      } else if (acc.accountType === 'credit_card') {
                        typeLabel = 'بطاقة ائتمانية ذاتية';
                        typeEmoji = '💳';
                        typeBadgeClass = 'badge-warning';
                      } else if (acc.accountType === 'prepaid_card') {
                        typeLabel = 'بطاقة مسبقة الدفع (سفر/رقمية)';
                        typeEmoji = '⚡';
                        typeBadgeClass = 'badge-info';
                      } else if (acc.accountType === 'sub_account') {
                        typeLabel = 'حساب فرعي مخصص';
                        typeEmoji = '📑';
                        typeBadgeClass = 'badge-neutral';
                      } else if (acc.accountType === 'digital_wallet') {
                        typeLabel = 'محفظة رقمية';
                        typeEmoji = '📱';
                        typeBadgeClass = 'badge-primary';
                      }

                      return `
                        <div class="surface" style="background: var(--bg-surface-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between;">
                          <div>
                            
                            <!-- Sub-Account Title & Type -->
                            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-sm);">
                              <div>
                                <span class="badge ${typeBadgeClass}" style="margin-bottom: 4px; font-size: 0.7rem;">${typeEmoji} ${typeLabel}</span>
                                <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;">${acc.name}</h4>
                                ${acc.accountHolder ? `<span style="font-size: 0.7rem; color: var(--text-tertiary);">${acc.accountHolder}</span>` : ''}
                              </div>
                              <div style="text-align: left;">
                                <span style="font-size: 0.7rem; color: var(--text-tertiary);">الرصيد المتوفر</span>
                                <div style="font-size: 1.25rem; font-weight: 800; color: ${acc.accountType === 'credit_card' ? 'var(--warning-text)' : 'var(--text-primary)'};">
                                  <span class="num">${balance.toLocaleString('en-US')}</span> <small style="font-size:0.7rem;">ريال</small>
                                </div>
                                ${acc.creditLimit ? `<div style="font-size: 0.7rem; color: var(--text-tertiary);">سقف الائتمان: ${acc.creditLimit.toLocaleString('en-US')} ر.س</div>` : ''}
                              </div>
                            </div>

                            <!-- IBAN & Account Number Details Box -->
                            ${acc.iban || acc.accountNumber ? `
                              <div style="background: var(--bg-surface-tertiary); padding: 8px 12px; border-radius: var(--radius-sm); margin: var(--space-sm) 0; font-size: 0.75rem; display: flex; flex-direction: column; gap: 4px;">
                                ${acc.iban ? `
                                  <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: var(--text-tertiary);">الآيبان IBAN:</span>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                      <code style="font-family: var(--font-num); direction: ltr; font-size: 0.75rem;">${maskedIBAN}</code>
                                      <button class="btn btn-glass btn-icon btn-sm btn-copy-iban" data-iban="${acc.iban}" title="نسخ الآيبان" style="padding: 2px 5px; width: 22px; height: 22px;">📋</button>
                                    </div>
                                  </div>
                                ` : ''}
                                ${acc.accountNumber ? `
                                  <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: var(--text-tertiary);">رقم الحساب:</span>
                                    <span style="font-family: var(--font-num); direction: ltr; font-weight: 600;">${maskedAccNum}</span>
                                  </div>
                                ` : ''}
                              </div>
                            ` : ''}

                            <!-- Linked Cards Section -->
                            <div style="margin-top: var(--space-xs);">
                              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="font-size: 0.7rem; color: var(--text-tertiary); font-weight: 700;">البطاقات المرتبطة (${linkedCards.length}):</span>
                                <button class="btn-link btn-add-card-to-acc" data-acc-id="${acc.id}" style="font-size: 0.7rem; color: var(--primary); background: none; border: none; cursor: pointer; font-weight: 700;">+ ربط بطاقة</button>
                              </div>
                              
                              ${linkedCards.length === 0 ? `
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic;">لا توجد بطاقة مرتبطة (حساب بدون بطاقة)</span>
                              ` : `
                                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                  ${linkedCards.map(c => `
                                    <span class="badge" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); font-size: 0.7rem; display: inline-flex; align-items: center; gap: 4px;">
                                      <span>💳 ${c.type || 'مدى'}</span>
                                      <code style="font-family: var(--font-num); font-weight: 700;">****${c.last4}</code>
                                    </span>
                                  `).join('')}
                                </div>
                              `}
                            </div>

                          </div>

                          <!-- Sub-Account Quick Footer Actions -->
                          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-md); padding-top: var(--space-xs); border-top: 1px solid var(--border-subtle); gap: 6px;">
                            ${(acc.accountType === 'prepaid_card' || acc.accountType === 'credit_card') ? `
                              <button class="btn btn-glass btn-sm btn-recharge-card" data-acc-id="${acc.id}" style="flex: 1; padding: 0.35rem; font-size: 0.75rem; color: var(--primary-text); font-weight: 700;">
                                ⚡ ${acc.accountType === 'prepaid_card' ? 'شحن البطاقة' : 'سداد البطاقة'}
                              </button>
                            ` : `
                              <button class="btn btn-glass btn-sm btn-transfer-from-acc" data-acc-id="${acc.id}" style="flex: 1; padding: 0.35rem; font-size: 0.75rem;">
                                🔁 تحويل منه
                              </button>
                            `}
                            <button class="btn btn-glass btn-icon btn-sm btn-delete-acc" data-acc-id="${acc.id}" title="حذف الحساب" style="color: var(--danger-text); width: 28px; height: 28px;">
                              🗑️
                            </button>
                          </div>

                        </div>
                      `;
                    }).join('')}
                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>
      `;

      // ── Event Handlers ──────────────────────────────────────────────────
      
      // Toggle sensitive mask
      container.querySelector('#acc-btn-toggle-mask')?.addEventListener('click', () => {
        hideSensitive = !hideSensitive;
        db.state.settings.hideSensitive = hideSensitive;
        db.save();
        renderContent();
      });

      // Add Bank / Account Master Button
      const openAdd = (bankId = null) => window.app.openAddAccountModal(bankId);
      container.querySelector('#acc-btn-add-bank')?.addEventListener('click', () => openAdd());
      container.querySelector('#acc-btn-empty-add')?.addEventListener('click', () => openAdd());

      // Add sub-account to specific bank
      container.querySelectorAll('.btn-add-sub-acc').forEach(btn => {
        btn.addEventListener('click', () => {
          const bankId = btn.getAttribute('data-bank-id');
          openAdd(bankId);
        });
      });

      // Add card to specific account
      container.querySelectorAll('.btn-add-card-to-acc').forEach(btn => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-acc-id');
          window.app.openAddCardModal(accId);
        });
      });

      // Recharge prepaid/credit card
      container.querySelectorAll('.btn-recharge-card').forEach(btn => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-acc-id');
          window.app.openRechargeCardModal(accId);
        });
      });

      // Quick transfer from account
      container.querySelectorAll('.btn-transfer-from-acc').forEach(btn => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-acc-id');
          window.app.openTransactionModal({ type: 'transfer', fromAccountId: accId });
        });
      });

      // Copy IBAN button
      container.querySelectorAll('.btn-copy-iban').forEach(btn => {
        btn.addEventListener('click', () => {
          const iban = btn.getAttribute('data-iban');
          if (iban) {
            navigator.clipboard.writeText(iban).then(() => {
              window.app.showToast('تم نسخ الآيبان (IBAN) بنجاح 📋');
            });
          }
        });
      });

      // Reconcile cash
      container.querySelector('#acc-btn-reconcile-cash')?.addEventListener('click', () => {
        const currentCash = FinancialEngine.getCashBalance(db.state);
        const input = prompt('أدخل المبلغ الفعلي المتوفر معك حالياً في يدك (كاش):', currentCash);
        if (input !== null && !isNaN(Number(input))) {
          const newBalance = Number(input);
          const diff = newBalance - currentCash;
          if (diff !== 0) {
            db.addTransaction({
              type: diff > 0 ? 'income' : 'expense',
              amount: Math.abs(diff),
              merchant: 'تسوية رصيد الكاش اليدوي',
              accountId: 'cash',
              categoryId: 'cat-income-other',
              description: 'تسوية يدوية للرصيد النقدي',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            });
            window.app.showToast('تمت تسوية رصيد الكاش بنجاح! 💵');
          }
        }
      });

      // Delete account
      container.querySelectorAll('.btn-delete-acc').forEach(btn => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-acc-id');
          const acc = db.state.accounts.find(a => a.id === accId);
          if (confirm(`هل أنت متأكد من حذف الحساب "${acc?.name || ''}"؟ سيتم حذف البطاقات المرتبطة به.`)) {
            db.deleteAccount(accId);
            window.app.showToast('تم حذف الحساب');
          }
        });
      });
    }

    renderContent();
  }
}

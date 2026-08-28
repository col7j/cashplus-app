/**
 * MASAR - Transactions Ledger View (سجل العمليات والتدفقات المالية)
 */

import { db } from '../engine/db.js';
import { FinancialEngine } from '../engine/financialEngine.js';
import { Icons } from '../icons.js';

export class TransactionsView {
  static render(container) {
    let currentFilterType = 'all';
    let currentSearchTerm = '';
    let currentCategoryFilter = 'all';
    let currentAccountFilter = 'all';

    function renderList() {
      const txns = db.state.transactions.filter(t => {
        if (currentFilterType !== 'all' && t.type !== currentFilterType) return false;
        if (currentCategoryFilter !== 'all' && t.categoryId !== currentCategoryFilter) return false;
        if (currentAccountFilter !== 'all' && t.accountId !== currentAccountFilter && t.toAccountId !== currentAccountFilter) return false;
        if (currentSearchTerm) {
          const s = currentSearchTerm.toLowerCase();
          const matchMerchant = t.merchant && t.merchant.toLowerCase().includes(s);
          const matchDesc = t.description && t.description.toLowerCase().includes(s);
          const matchAmount = t.amount.toString().includes(s);
          if (!matchMerchant && !matchDesc && !matchAmount) return false;
        }
        return true;
      });

      const listContainer = container.querySelector('#txn-items-container');
      if (!listContainer) return;

      if (txns.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>لا توجد عمليات مطابقة</h3>
            <p>جرّب تغيير خيارات البحث أو التصفية، أو سجّل عملية جديدة.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = txns.map(txn => {
        const isExp = txn.type === 'expense';
        const isInc = txn.type === 'income';
        const isTrans = txn.type === 'transfer';
        const cat = db.state.categories.find(c => c.id === txn.categoryId);
        const acc = db.state.accounts.find(a => a.id === txn.accountId);
        const toAcc = txn.toAccountId ? db.state.accounts.find(a => a.id === txn.toAccountId) : null;
        const card = txn.cardId ? db.state.cards.find(c => c.id === txn.cardId) : null;

        const emoji = cat ? cat.emoji : (isInc ? '💵' : '🔁');
        const title = txn.merchant || txn.description || (isTrans ? 'تحويل بين الحسابات' : 'عملية مالية');

        return `
          <div class="transaction-item" data-txn-id="${txn.id}">
            <div class="txn-left-info">
              <div class="txn-icon-wrapper ${isExp ? 'txn-icon-expense' : isInc ? 'txn-icon-income' : 'txn-icon-transfer'}">
                ${emoji}
              </div>
              <div class="txn-details">
                <div style="display: flex; align-items: center; gap: var(--space-xs);">
                  <h4>${title}</h4>
                  ${txn.isForSomeoneElse ? `<span class="badge badge-warning">مخصص لشخص آخر</span>` : ''}
                  ${txn.fee > 0 ? `<span class="badge badge-neutral">رسوم ${txn.fee} ريال</span>` : ''}
                </div>
                <div class="txn-meta">
                  <span>${cat ? `${cat.name} ${txn.subCategory ? `(${txn.subCategory})` : ''}` : (isInc ? 'دخل' : 'تحويل')}</span>
                  <span>•</span>
                  <span>${acc ? acc.name : 'محفظة'}${toAcc ? ` ⬅️ ${toAcc.name}` : ''}</span>
                  ${card ? `<span>• بطاقة (${card.last4})</span>` : ''}
                  <span>•</span>
                  <span>${txn.date} ${txn.time || ''}</span>
                </div>
              </div>
            </div>
            <div class="txn-amount-box">
              <div class="txn-amount-text ${isExp ? 'txn-amount-expense' : isInc ? 'txn-amount-income' : 'txn-amount-transfer'}">
                <span class="num">${isExp ? '-' : isInc ? '+' : ''}${txn.amount.toLocaleString('en-US')}</span>
                <span class="currency-symbol">ريال</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Add click handlers for details
      listContainer.querySelectorAll('.transaction-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-txn-id');
          const txn = db.state.transactions.find(t => t.id === id);
          if (txn) window.app.openTransactionDetailsModal(txn);
        });
      });
    }

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Top Title & Action Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
          <div>
            <span style="font-size: 0.8125rem; color: var(--text-tertiary);">دفتر الأستاذ المالي الموحد</span>
            <h2 style="font-size: 1.5rem; font-weight: 700;">سجل العمليات</h2>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <button class="btn btn-glass btn-sm" id="txn-btn-paste-sms">
              ${Icons.messageSquare}
              لصق رسالة بنك
            </button>
            <button class="btn btn-primary btn-sm" id="txn-btn-add">
              ${Icons.plus}
              تسجيل عملية
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="surface" style="padding: var(--space-md); margin-bottom: var(--space-lg);">
          <div style="display: flex; flex-direction: column; gap: var(--space-md);">
            
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-md);">
              <!-- Search Box -->
              <div style="position: relative; flex: 1; min-width: 260px;">
                <input type="text" id="txn-search-input" class="form-input" placeholder="بحث بالتاجر، الوصف، أو المبلغ..." style="padding-right: 2.5rem;">
                <div style="position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-tertiary);">
                  ${Icons.search}
                </div>
              </div>

              <!-- Type Segmented Control -->
              <div class="segmented-control" id="txn-type-segments">
                <button class="segmented-btn active" data-type="all">الكل</button>
                <button class="segmented-btn" data-type="expense">المصاريف</button>
                <button class="segmented-btn" data-type="income">الواردات والدخل</button>
                <button class="segmented-btn" data-type="transfer">التحويلات</button>
              </div>
            </div>

            <!-- Secondary Filters (Category & Account) -->
            <div style="display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap;">
              <select id="txn-cat-filter" class="form-select" style="max-width: 220px; padding: 0.5rem 0.85rem; font-size: 0.8125rem;">
                <option value="all">جميع التصنيفات</option>
                ${db.state.categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('')}
              </select>

              <select id="txn-acc-filter" class="form-select" style="max-width: 220px; padding: 0.5rem 0.85rem; font-size: 0.8125rem;">
                <option value="all">جميع الحسابات والمحافظ</option>
                ${db.state.accounts.map(a => `<option value="${a.id}">🏦 ${a.name}</option>`).join('')}
              </select>
            </div>

          </div>
        </div>

        <!-- Transactions Ledger List -->
        <div class="transaction-list" id="txn-items-container">
          <!-- Populated by renderList() -->
        </div>
      </div>
    `;

    // Bind Search and Filter Events
    const searchInput = container.querySelector('#txn-search-input');
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value;
      renderList();
    });

    const typeButtons = container.querySelectorAll('#txn-type-segments .segmented-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilterType = btn.getAttribute('data-type');
        renderList();
      });
    });

    const catFilter = container.querySelector('#txn-cat-filter');
    catFilter.addEventListener('change', (e) => {
      currentCategoryFilter = e.target.value;
      renderList();
    });

    const accFilter = container.querySelector('#txn-acc-filter');
    accFilter.addEventListener('change', (e) => {
      currentAccountFilter = e.target.value;
      renderList();
    });

    container.querySelector('#txn-btn-paste-sms')?.addEventListener('click', () => {
      window.app.openSMSModal();
    });

    container.querySelector('#txn-btn-add')?.addEventListener('click', () => {
      window.app.openTransactionModal();
    });

    renderList();
  }
}

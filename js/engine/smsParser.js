/**
 * MASAR - Advanced Saudi & Arab Bank SMS Transaction Parser
 * Resolves Card -> Account -> Bank, checks balance discrepancies and duplicates.
 */

import { db } from './db.js';
import { FinancialEngine } from './financialEngine.js';

export class SMSParser {
  /**
   * Parse arbitrary bank SMS notification
   */
  static parse(rawText) {
    if (!rawText || typeof rawText !== 'string') return null;

    const text = rawText.trim();
    const result = {
      rawMessage: text,
      amount: null,
      currency: 'SAR',
      type: 'expense', // default
      merchant: '',
      cardLast4: null,
      paymentMethod: '',
      postBalance: null,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      suggestedCategoryId: null,
      suggestedSubCategory: null,
      resolvedAccountId: null,
      resolvedCardId: null,
      balanceDiscrepancy: null,
      possibleDuplicate: false
    };

    // 1. Determine Transaction Type
    if (text.includes('حوالة واردة') || text.includes('إيداع') || text.includes('راتب') || text.includes('تم استلام')) {
      result.type = 'income';
    } else if (text.includes('تحويل إلى') || text.includes('حوالة صادرة')) {
      result.type = 'transfer';
    } else {
      result.type = 'expense';
    }

    // 2. Extract Amount
    // Matches patterns like: بمبلغ: 120 SAR or بمبلغ 50.00 ر.س or مبلغ:85 SAR
    const amountRegex = /(?:مبلغ|بمبلغ|amount)\s*:?\s*([0-9]+(?:[,.][0-9]{1,2})?)\s*(?:SAR|ر\.س|ريال|USD)?/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    } else {
      // Fallback: look for any number followed by SAR or ر.س
      const fallbackMatch = text.match(/([0-9]+(?:[,.][0-9]{1,2})?)\s*(?:SAR|ر\.س|ريال)/i);
      if (fallbackMatch) {
        result.amount = parseFloat(fallbackMatch[1].replace(/,/g, ''));
      }
    }

    // 3. Extract Card Last 4 Digits
    // Matches: بطاقة:2825 or بطاقة 7142 or مدى:9912 or card:2825
    const cardRegex = /(?:بطاقة|بطاقتك|مدى|حساب|card)\s*:?\s*(\*{0,4})([0-9]{4})/i;
    const cardMatch = text.match(cardRegex);
    if (cardMatch) {
      result.cardLast4 = cardMatch[2];
    }

    // 4. Extract Merchant / Payee
    // Matches: لدى:MATHNA CA or لدى أسواق بنده or من:شركة تقنية
    const merchantRegex = /(?:لدى|من|إلى|at|to)\s*:?\s*([^0-9\n\r,]+?)(?=\s+(?:مبلغ|بمبلغ|رصيد|في|بتاريخ|فيزا|مدى|SAR|$))/i;
    const merchantMatch = text.match(merchantRegex);
    if (merchantMatch) {
      result.merchant = merchantMatch[1].trim().replace(/^[:\s-]+|[:\s-]+$/g, '');
    }

    // 5. Extract Resulting Account Balance if available
    // Matches: رصيد:11,790 SAR or الرصيد المتاح: 500.20
    const balanceRegex = /(?:رصيد|الرصيد|balance)\s*:?\s*([0-9]+(?:[,.][0-9]{1,2})?)\s*(?:SAR|ر\.س|ريال)?/i;
    const balanceMatch = text.match(balanceRegex);
    if (balanceMatch) {
      result.postBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    // 6. Extract Payment Method
    if (text.includes('ابل باي') || text.includes('Apple Pay')) {
      result.paymentMethod = 'Apple Pay';
    } else if (text.includes('نقاط البيع') || text.includes('POS')) {
      result.paymentMethod = 'نقاط البيع (POS)';
    } else if (text.includes('سداد') || text.includes('SADAD')) {
      result.paymentMethod = 'سداد فواتير';
    } else if (text.includes('مدى') || text.includes('mada')) {
      result.paymentMethod = 'بطاقة مدى';
    }

    // 7. Resolve Card -> Account -> Bank in Database
    if (result.cardLast4) {
      const foundCard = db.state.cards.find(c => c.last4 === result.cardLast4);
      if (foundCard) {
        result.resolvedCardId = foundCard.id;
        result.resolvedAccountId = foundCard.accountId;
      }
    }

    // If no card matched, fallback to the primary checking account
    if (!result.resolvedAccountId && db.state.accounts.length > 0) {
      result.resolvedAccountId = db.state.accounts[0].id;
    }

    // 8. Balance Discrepancy Check (Validation)
    if (result.postBalance !== null && result.resolvedAccountId) {
      const currentExpectedBalance = FinancialEngine.getAccountBalance(result.resolvedAccountId, db.state);
      const expectedAfterTxn = result.type === 'expense' 
        ? currentExpectedBalance - (result.amount || 0)
        : currentExpectedBalance + (result.amount || 0);

      const diff = Math.abs(expectedAfterTxn - result.postBalance);
      if (diff > 0.5) { // More than 50 halalas difference
        result.balanceDiscrepancy = {
          expected: expectedAfterTxn,
          bankReported: result.postBalance,
          diff: (result.postBalance - expectedAfterTxn).toFixed(2)
        };
      }
    }

    // 9. Merchant Memory & Auto-Categorization
    if (result.merchant) {
      const merchantClean = result.merchant.toLowerCase();
      // Check previous transactions for the same merchant
      const pastTxn = db.state.transactions.find(t => t.merchant && t.merchant.toLowerCase().includes(merchantClean));
      if (pastTxn && pastTxn.categoryId) {
        result.suggestedCategoryId = pastTxn.categoryId;
        result.suggestedSubCategory = pastTxn.subCategory;
      } else {
        // Keyword heuristics for Saudi merchants
        if (merchantClean.includes('cafe') || merchantClean.includes('coffee') || merchantClean.includes('قهوة') || merchantClean.includes('starbucks')) {
          result.suggestedCategoryId = 'cat-food';
          result.suggestedSubCategory = 'كافيهات';
        } else if (merchantClean.includes('بنده') || merchantClean.includes('panda') || merchantClean.includes('otaim') || merchantClean.includes('لولو') || merchantClean.includes('تموينات')) {
          result.suggestedCategoryId = 'cat-food';
          result.suggestedSubCategory = 'سوبرماركت ومؤونة';
        } else if (merchantClean.includes('مطعم') || merchantClean.includes('burger') || merchantClean.includes('shawarma') || merchantClean.includes('albaik') || merchantClean.includes('البيك')) {
          result.suggestedCategoryId = 'cat-food';
          result.suggestedSubCategory = 'مطاعم';
        } else if (merchantClean.includes('sasco') || merchantClean.includes('ساسكو') || merchantClean.includes('دريس') || merchantClean.includes('بنزين') || merchantClean.includes('وقود')) {
          result.suggestedCategoryId = 'cat-transport';
          result.suggestedSubCategory = 'بنزين ووقود';
        } else if (merchantClean.includes('stc') || merchantClean.includes('mobily') || merchantClean.includes('zain') || merchantClean.includes('كهرباء')) {
          result.suggestedCategoryId = 'cat-housing';
          result.suggestedSubCategory = 'الإنترنت والاتصالات';
        } else if (merchantClean.includes('amazon') || merchantClean.includes('noon') || merchantClean.includes('نون') || merchantClean.includes('أمازون') || merchantClean.includes('jarir') || merchantClean.includes('جرير')) {
          result.suggestedCategoryId = 'cat-shopping';
          result.suggestedSubCategory = 'مشتريات أونلاين';
        } else if (merchantClean.includes('صيدلية') || merchantClean.includes('nahdi') || merchantClean.includes('النهدي') || merchantClean.includes('دواء')) {
          result.suggestedCategoryId = 'cat-health';
          result.suggestedSubCategory = 'صيدلية وأدوية';
        }
      }
    }

    // 10. Duplicate Detection
    if (result.amount && result.merchant) {
      const dup = db.state.transactions.find(t => 
        t.amount === result.amount &&
        t.date === result.date &&
        t.merchant && t.merchant.toLowerCase() === result.merchant.toLowerCase()
      );
      if (dup) {
        result.possibleDuplicate = true;
      }
    }

    return result;
  }
}

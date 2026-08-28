/**
 * MASAR - Advanced Saudi & Arab Bank SMS Transaction Parser
 * Resolves Card -> Account -> Bank, checks balance discrepancies and duplicates.
 */

import { db } from './db.js';
import { FinancialEngine } from './financialEngine.js';

export class SMSParser {
  /**
   * Parse arbitrary bank SMS notification from any Saudi / Gulf Bank or digital wallet
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
    if (text.includes('حوالة واردة') || text.includes('إيداع') || text.includes('راتب') || text.includes('تم استلام') || text.includes('تم إيداع') || text.includes('received')) {
      result.type = 'income';
    } else if (text.includes('تحويل إلى') || text.includes('حوالة صادرة') || text.includes('حوالة إلى') || text.includes('transfer to')) {
      result.type = 'transfer';
    } else {
      result.type = 'expense';
    }

    // 2. Extract Amount (Robust Multi-pass)
    const amountRegex = /(?:مبلغ|المبلغ|بمبلغ|بقيمة|قيمة|amount)\s*:?\s*([0-9]+(?:[,.][0-9]{1,2})?)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    } else {
      // Fallback: look for numbers followed by currency
      const fallbackMatch = text.match(/([0-9]+(?:[,.][0-9]{1,2})?)\s*(?:SAR|ر\.س|ريال سعودي|ريال سعودى|ريال|USD|EUR)/i);
      if (fallbackMatch) {
        result.amount = parseFloat(fallbackMatch[1].replace(/,/g, ''));
      }
    }

    // 3. Extract Card Last 4 Digits
    // Supports formats: بطاقة:2825, بطاقة 0932*, بطاقة *0932, **0932, card:2825
    const cardRegex = /(?:بطاقة|بطاقتك|card|حساب)\s*:?\s*\*?(\d{4})\*?/i;
    const cardMatch = text.match(cardRegex);
    if (cardMatch) {
      result.cardLast4 = cardMatch[1];
    } else {
      const altCardMatch = text.match(/\*{2,4}(\d{4})/);
      if (altCardMatch) {
        result.cardLast4 = altCardMatch[1];
      }
    }

    // 4. Extract Resulting Account Balance
    // Matches: رصيد:11,790 SAR, رصيد5.84, الرصيد المتاح: 500.20
    const balanceRegex = /(?:رصيد|الرصيد|رصيدك|الرصيد المتاح|balance)\s*:?\s*([0-9]+(?:[,.][0-9]{1,2})?)/i;
    const balanceMatch = text.match(balanceRegex);
    if (balanceMatch) {
      result.postBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    // 5. Extract Merchant / Payee (Line-by-line + Regex Multi-pass)
    let merchant = '';
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      const lineMatch = line.match(/^(?:لدى|من|لصالح|عند|بواسطة|إلى|to|at|merchant)\s*:?\s*(.+)$/i);
      if (lineMatch) {
        const candidate = lineMatch[1].trim();
        // Ignore lines that are just numbers, dates, cards, or country names
        if (!candidate.match(/^(?:حساب|بطاقة|السعودية|المملكة|SAR|\d)/i)) {
          merchant = candidate;
          break;
        }
      }
    }

    if (!merchant) {
      const merchantRegex = /(?:لدى|من|لصالح|عند|at|to)\s*:?\s*([a-zA-Z\u0600-\u06FF0-9\s._-]+?)(?=\s*(?:\n|رصيد|مبلغ|في|بتاريخ|بطاقة|SAR|$))/i;
      const merchantMatch = text.match(merchantRegex);
      if (merchantMatch) {
        merchant = merchantMatch[1].trim();
      }
    }

    // Clean any trailing noise like "في السعودية", "داخل المملكة"
    if (merchant) {
      merchant = merchant
        .replace(/\s+(?:في|داخل)\s+(?:السعودية|المملكة|الرياض|جدة|الدمام).*$/i, '')
        .replace(/^[:\s-]+|[:\s-]+$/g, '')
        .trim();
      result.merchant = merchant;
    }

    // 6. Extract Date & Time
    const dtMatch = text.match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{2})\s*(\d{2}:\d{2})/);
    if (dtMatch) {
      let rawDate = dtMatch[1].replace(/\//g, '-');
      if (rawDate.length === 8) {
        // e.g. 26-08-24 -> 2026-08-24
        rawDate = '20' + rawDate;
      }
      result.date = rawDate;
      result.time = dtMatch[2];
    }

    // 7. Extract Payment Method
    if (text.includes('ابل باي') || text.includes('ApplePay') || text.includes('Apple Pay')) {
      result.paymentMethod = 'Apple Pay 📱';
    } else if (text.includes('نقاط البيع') || text.includes('POS')) {
      result.paymentMethod = 'نقاط البيع (POS) 💳';
    } else if (text.includes('سداد') || text.includes('SADAD')) {
      result.paymentMethod = 'سداد فواتير ⚡';
    } else if (text.includes('مدى') || text.includes('mada')) {
      result.paymentMethod = 'بطاقة مدى 💳';
    } else if (text.includes('فيزا') || text.includes('Visa')) {
      result.paymentMethod = 'بطاقة فيزا 💳';
    } else if (text.includes('ماستركارد') || text.includes('Mastercard')) {
      result.paymentMethod = 'ماستركارد 💳';
    }

    // 8. Resolve Card -> Account -> Bank in Database
    if (result.cardLast4) {
      const foundCard = (db.state.cards || []).find(c => c.last4 === result.cardLast4);
      if (foundCard) {
        result.resolvedCardId = foundCard.id;
        result.resolvedAccountId = foundCard.accountId;
      }
    }

    // Fallback account if not resolved
    if (!result.resolvedAccountId && (db.state.accounts || []).length > 0) {
      result.resolvedAccountId = db.state.accounts[0].id;
    }

    // 9. Balance Discrepancy Check (Validation)
    if (result.postBalance !== null && result.resolvedAccountId) {
      const currentExpectedBalance = FinancialEngine.getAccountBalance(result.resolvedAccountId, db.state);
      const expectedAfterTxn = result.type === 'expense' 
        ? currentExpectedBalance - (result.amount || 0)
        : currentExpectedBalance + (result.amount || 0);

      const diff = Math.abs(expectedAfterTxn - result.postBalance);
      if (diff > 0.5) {
        result.balanceDiscrepancy = {
          expected: expectedAfterTxn,
          bankReported: result.postBalance,
          diff: (result.postBalance - expectedAfterTxn).toFixed(2)
        };
      }
    }

    // 10. Merchant Memory & Auto-Categorization
    if (result.merchant) {
      const merchantClean = result.merchant.toLowerCase();
      
      // Check previous transactions
      const pastTxn = (db.state.transactions || []).find(t => t.merchant && t.merchant.toLowerCase().includes(merchantClean));
      if (pastTxn && pastTxn.categoryId) {
        result.suggestedCategoryId = pastTxn.categoryId;
        result.suggestedSubCategory = pastTxn.subCategory;
      } else {
        // Keyword heuristics for Saudi merchants & food & grocery
        if (merchantClean.includes('tamwinat') || merchantClean.includes('تموينات') || merchantClean.includes('بنده') || merchantClean.includes('panda') || merchantClean.includes('otaim') || merchantClean.includes('لولو') || merchantClean.includes('دانوب') || merchantClean.includes('danube') || merchantClean.includes('alhajrih')) {
          result.suggestedCategoryId = 'cat-food';
          result.suggestedSubCategory = 'سوبرماركت ومؤونة';
        } else if (merchantClean.includes('cafe') || merchantClean.includes('coffee') || merchantClean.includes('قهوة') || merchantClean.includes('starbucks') || merchantClean.includes('mathna')) {
          result.suggestedCategoryId = 'cat-food';
          result.suggestedSubCategory = 'كافيهات';
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

    // 11. Duplicate Detection
    if (result.amount && result.merchant) {
      const dup = (db.state.transactions || []).find(t => 
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

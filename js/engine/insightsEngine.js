/**
 * MASAR - Deterministic Rule-Based Financial Insights Engine
 * NO LLMs. NO External APIs. Strictly computed mathematical and policy insights.
 */

import { db } from './db.js';
import { FinancialEngine } from './financialEngine.js';

export class InsightsEngine {
  static generateInsights(month = '2026-08', state = db.state) {
    const insights = [];
    const summary = FinancialEngine.getMonthlySummary(month, state);
    const budgets = FinancialEngine.getBudgetsStatus(month, state);
    const ratios = FinancialEngine.getFinancialRatios(state);
    const availableMoney = FinancialEngine.getAvailableMoney(state);
    const upcoming7Days = FinancialEngine.getUpcomingObligations(7, state);
    const plannedPurchases = state.purchases.filter(p => p.status === 'planned' || p.status === 'ready');

    // 1. Budget Alerts
    budgets.forEach(b => {
      if (b.isOver) {
        insights.push({
          id: `budget-over-${b.category.id}`,
          type: 'danger',
          icon: '⚠️',
          title: `تجاوز ميزانية ${b.category.name}`,
          description: `تجاوزت سقف الميزانية المحدد بـ ${b.overAmount.toLocaleString('en-US')} ريال (إجمالي المصروف ${b.spent.toLocaleString('en-US')} ريال من أصل ${b.limit.toLocaleString('en-US')} ريال).`
        });
      } else if (b.limit > 0 && b.percentage >= 80) {
        insights.push({
          id: `budget-warn-${b.category.id}`,
          type: 'warning',
          icon: '⚡',
          title: `اقتراب من سقف ${b.category.name}`,
          description: `استهلكت ${b.percentage}% من الميزانية المحددة. المتبقي حتى نهاية الشهر هو ${b.remaining.toLocaleString('en-US')} ريال فقط.`
        });
      }
    });

    // 2. Upcoming Obligations Horizon
    if (upcoming7Days.length > 0) {
      const sum7 = upcoming7Days.reduce((s, ob) => s + Number(ob.amount), 0);
      insights.push({
        id: 'upcoming-obligations-7d',
        type: 'warning',
        icon: '📋',
        title: 'التزامات مالية قادمة هذا الأسبوع',
        description: `لديك ${upcoming7Days.length} التزامات مستحقة السداد خلال الأيام الـ 7 القادمة بإجمالي ${sum7.toLocaleString('en-US')} ريال.`
      });
    }

    // 3. Planned Purchases vs Liquidity Buffer
    if (plannedPurchases.length > 0) {
      const highPriorityTotal = plannedPurchases
        .filter(p => p.priority === 'high')
        .reduce((s, p) => s + Number(p.expectedPrice), 0);

      const allPlannedTotal = plannedPurchases.reduce((s, p) => s + Number(p.expectedPrice), 0);

      if (allPlannedTotal > availableMoney) {
        insights.push({
          id: 'purchases-exceed-liquidity',
          type: 'danger',
          icon: '🛍️',
          title: 'المشتريات المخططة تتجاوز السيولة المتاحة',
          description: `إجمالي قيمة المشتريات المخططة (${allPlannedTotal.toLocaleString('en-US')} ريال) تتجاوز السيولة المتاحة حالياً (${availableMoney.toLocaleString('en-US')} ريال) بفارق ${(allPlannedTotal - availableMoney).toLocaleString('en-US')} ريال.`
        });
      } else if (highPriorityTotal > 0) {
        insights.push({
          id: 'purchases-safe',
          type: 'success',
          icon: '🎯',
          title: 'السيولة المتاحة تغطي مشترياتك الأساسية',
          description: `المشتريات المخططة ذات الأولوية العالية (${highPriorityTotal.toLocaleString('en-US')} ريال) مغطاة بأمان ضمن السيولة المتاحة لديك.`
        });
      }
    }

    // 4. Financial Runway Indicator
    if (ratios.runwayMonths > 0) {
      if (ratios.runwayMonths >= 6) {
        insights.push({
          id: 'runway-healthy',
          type: 'success',
          icon: '🛡️',
          title: 'مستوى أمان مالي ممتاز (Runway)',
          description: `السيولة الحالية تكفي لتغطية مصاريفك الأساسية لمدة ${ratios.runwayMonths} أشهر حسب متوسط إنفاقك الشهري.`
        });
      } else if (ratios.runwayMonths <= 2) {
        insights.push({
          id: 'runway-low',
          type: 'warning',
          icon: '⏳',
          title: 'هامش أمان منخفض للطوارئ',
          description: `السيولة الحالية تكفي لتغطية ${ratios.runwayMonths} شهر فقط من مصاريفك. يُنصح بزيادة مخصصات صندوق الطوارئ.`
        });
      }
    }

    // 5. Savings Rate Assessment
    if (summary.income > 0 && Number(summary.savingsRate) >= 20) {
      insights.push({
        id: 'savings-rate-great',
        type: 'success',
        icon: '💰',
        title: 'معدل ادخار متقدم هذا الشهر',
        description: `نجحت في ادخار وتوجيه ${summary.savingsRate}% من دخلك هذا الشهر نحو الأهداف وصناديق الطوارئ، وهو ما يتوافق مع القواعد المالية الصحية.`
      });
    }

    return insights;
  }
}

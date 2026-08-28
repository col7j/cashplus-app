/**
 * Cash Plus (كاش بلس) — Landing / Welcome / Intro Page
 * الصفحة التعريفية وبوابة تسجيل الدخول وإنشاء الحساب
 */

import { cloudAuth } from '../engine/firebase.js';

export class LandingView {
  static render(container) {
    container.innerHTML = `
      <div class="landing-container animate-fade-in" style="min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 2rem 1.5rem; max-width: 1000px; margin: 0 auto;">

        <!-- Top Header & Brand -->
        <header style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="assets/logo-icon.svg" alt="كاش بلس" style="width: 44px; height: 44px; border-radius: 12px; box-shadow: 0 4px 16px rgba(75, 97, 250, 0.35);">
            <div>
              <h1 style="font-size: 1.4rem; font-weight: 800; margin: 0; line-height: 1.2;">كاش بلس</h1>
              <span style="font-size: 0.75rem; color: var(--primary-text); font-weight: 600;">فلوسك تستاهل أكثر</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-glass btn-sm" id="btn-landing-login" style="padding: 0.5rem 1.2rem; font-weight: 700;">
              تسجيل الدخول
            </button>
            <button class="btn btn-primary btn-sm" id="btn-landing-signup" style="padding: 0.5rem 1.2rem; font-weight: 700;">
              إنشاء حساب جديد
            </button>
          </div>
        </header>

        <!-- Hero Section -->
        <main style="text-align: center; padding: 2rem 0;">
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: var(--primary-surface); border: 1px solid var(--primary-border); border-radius: var(--radius-full); margin-bottom: 1.5rem;">
            <span style="font-size: 1.1rem;">✨</span>
            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--primary-text);">نظامك المالي السحابي الشخصي المتكامل</span>
          </div>

          <h2 style="font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 900; line-height: 1.2; letter-spacing: -0.03em; margin-bottom: 1.25rem; color: var(--text-primary);">
            تحكم كامل في مصاريفك، <br>
            <span style="background: linear-gradient(135deg, #4F6DF5 0%, #06B6D4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">وثروتك وزكاتك في مكان واحد.</span>
          </h2>

          <p style="font-size: clamp(0.95rem, 2vw, 1.15rem); color: var(--text-secondary); max-width: 620px; margin: 0 auto 2.5rem auto; line-height: 1.7;">
            منصة مالية عربية ذكية لمتابعة الحسابات البنكية، ضبط الميزانيات، استخراج العمليات من رسائل SMS، وحساب الزكاة تلقائياً مع المزامنة الفورية بين جميع أجهزتك.
          </p>

          <!-- Action Buttons Group -->
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 3.5rem;">
            <button class="btn btn-primary" id="btn-hero-signup" style="padding: 0.85rem 2.2rem; font-size: 1.05rem; font-weight: 800; box-shadow: 0 6px 20px rgba(75, 97, 250, 0.4);">
              🚀 ابدأ الآن مجاناً
            </button>
            <button class="btn btn-glass" id="btn-hero-google" style="padding: 0.85rem 1.8rem; font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              المتابعة بحساب Google
            </button>
          </div>

          <!-- Feature Grid: 4 Core Capabilities -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-md); text-align: right;">

            <div class="surface" style="padding: 1.5rem; border-top: 3px solid #3B82F6;">
              <div style="font-size: 2rem; margin-bottom: 10px;">🏦</div>
              <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">خزينة الحسابات والبطاقات</h3>
              <p style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5;">
                ربط حسابات البنوك السعودية، بطاقات مدى وفيزا، والمحافظ الرقمية في مكان آمن ومشفر.
              </p>
            </div>

            <div class="surface" style="padding: 1.5rem; border-top: 3px solid #10B981;">
              <div style="font-size: 2rem; margin-bottom: 10px;">🕌</div>
              <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">حاسبة زكاة المدخرات</h3>
              <p style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5;">
                تتبع اكتمال الحول السنوي واحتساب نسبة 2.5% الشرعية على أموالك المدخرة تلقائياً.
              </p>
            </div>

            <div class="surface" style="padding: 1.5rem; border-top: 3px solid #F59E0B;">
              <div style="font-size: 2rem; margin-bottom: 10px;">📩</div>
              <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">تحليل رسائل البنوك الذكي</h3>
              <p style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5;">
                انسخ رسالة البنك النصية، وسيقوم النظام باستخراج المبلغ، التاجر، والحساب بضغطة زر.
              </p>
            </div>

            <div class="surface" style="padding: 1.5rem; border-top: 3px solid #8B5CF6;">
              <div style="font-size: 2rem; margin-bottom: 10px;">☁️</div>
              <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">مزامنة سحابية فورية</h3>
              <p style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5;">
                بياناتك معك أينما كنت على هاتفك والكمبيوتر والآيباد بدون تأخير مع خصوصية تامة عند الخروج.
              </p>
            </div>

          </div>
        </main>

        <!-- Footer -->
        <footer style="text-align: center; padding-top: 2rem; border-top: 1px solid var(--border-subtle); color: var(--text-tertiary); font-size: 0.8125rem;">
          كاش بلس (Cash Plus) © 2026 • منصتك المالية الشخصية الموثوقة
        </footer>

      </div>
    `;

    // Event Handlers
    container.querySelector('#btn-landing-login')?.addEventListener('click', () => {
      window.app.openAuthModal('login');
    });

    container.querySelector('#btn-landing-signup')?.addEventListener('click', () => {
      window.app.openAuthModal('signup');
    });

    container.querySelector('#btn-hero-signup')?.addEventListener('click', () => {
      window.app.openAuthModal('signup');
    });

    container.querySelector('#btn-hero-google')?.addEventListener('click', async () => {
      try {
        await cloudAuth.signInWithGoogle();
      } catch (err) {
        window.app.showToast(err.message || 'فشل تسجيل الدخول بـ Google');
      }
    });
  }
}

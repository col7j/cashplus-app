/**
 * Cash Plus (كاش بلس) — Premium Rich Landing Page
 * صفحة الهبوط التعريفية الشاملة والمصممة لتوافق كامل مع شاشات الجوال والحاسوب
 */

import { cloudAuth } from '../engine/firebase.js';
import { Icons } from '../icons.js';

export class LandingView {
  static render(container) {
    container.innerHTML = `
      <div class="landing-page-root animate-fade-in" style="min-height: 100vh; color: var(--text-primary); overflow-x: hidden; background: radial-gradient(circle at 50% 10%, rgba(75, 97, 250, 0.12) 0%, transparent 60%);">

        <!-- Top Navigation Bar -->
        <header style="position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); background: rgba(10, 13, 21, 0.85); border-bottom: 1px solid var(--border-subtle); padding: 0.85rem 1.25rem;">
          <div style="max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            
            <!-- Brand -->
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="assets/logo-icon.svg" alt="كاش بلس" style="width: 38px; height: 38px; border-radius: 10px; box-shadow: 0 4px 16px rgba(75, 97, 250, 0.4);">
              <div>
                <h1 style="font-size: 1.25rem; font-weight: 800; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">كاش بلس</h1>
                <span style="font-size: 0.7rem; color: var(--primary-text); font-weight: 600;">فلوسك تستاهل أكثر</span>
              </div>
            </div>

            <!-- Header Quick Actions -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn btn-glass btn-sm" id="nav-btn-login" style="padding: 0.45rem 1rem; font-weight: 700; font-size: 0.85rem;">
                تسجيل الدخول
              </button>
              <button class="btn btn-primary btn-sm" id="nav-btn-signup" style="padding: 0.45rem 1.2rem; font-weight: 700; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(75, 97, 250, 0.35);">
                إنشاء حساب مجاني
              </button>
            </div>

          </div>
        </header>

        <!-- Main Wrapper -->
        <div style="max-width: 1140px; margin: 0 auto; padding: 2rem 1.25rem 6rem 1.25rem;">

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- 1. HERO SECTION                                                -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <section style="text-align: center; padding: 2.5rem 0 3.5rem 0;">
            
            <!-- Pill Tag -->
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(75, 97, 250, 0.12); border: 1px solid rgba(75, 97, 250, 0.3); border-radius: var(--radius-full); margin-bottom: 1.5rem;">
              <span style="font-size: 1rem;">✨</span>
              <span style="font-size: 0.8125rem; font-weight: 700; color: #818cf8;">نظام الإدارة المالية وحساب الزكاة السحابي</span>
            </div>

            <!-- Big Headline -->
            <h2 style="font-size: clamp(2rem, 5.5vw, 3.5rem); font-weight: 900; line-height: 1.18; letter-spacing: -0.03em; margin-bottom: 1.25rem; max-width: 860px; margin-left: auto; margin-right: auto;">
              تحكم كامل في مصاريفك، <br>
              <span style="background: linear-gradient(135deg, #4F6DF5 0%, #06B6D4 50%, #10B981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                وثروتك وزكاتك في مكان واحد.
              </span>
            </h2>

            <!-- Subtitle -->
            <p style="font-size: clamp(0.95rem, 2.2vw, 1.2rem); color: var(--text-secondary); max-width: 680px; margin: 0 auto 2.25rem auto; line-height: 1.7;">
              منصة مالية عربية متكاملة لربط الحسابات البنكية، تتبع الصرف والدخل، قراءة رسائل SMS البنكية فورياً، وحساب زكاة المدخرات تلقائياً مع المزامنة بين هاتفك ولابتوبك.
            </p>

            <!-- Hero CTAs -->
            <div style="display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 2.5rem;">
              <button class="btn btn-primary" id="hero-btn-signup" style="padding: 0.9rem 2.25rem; font-size: 1.05rem; font-weight: 800; border-radius: var(--radius-md); box-shadow: 0 6px 24px rgba(75, 97, 250, 0.45);">
                🚀 ابدأ مجاناً الآن
              </button>
              <button class="btn btn-glass" id="hero-btn-google" style="padding: 0.9rem 1.75rem; font-size: 0.95rem; font-weight: 700; border-radius: var(--radius-md); display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                المتابعة بحساب Google
              </button>
            </div>

            <!-- Trust / Privacy Indicator -->
            <div style="display: inline-flex; align-items: center; gap: 16px; font-size: 0.8125rem; color: var(--text-tertiary); flex-wrap: wrap; justify-content: center;">
              <span>🔒 تشفير سحابي Google Firebase</span>
              <span>•</span>
              <span>⚡ مزامنة فورية على كل أجهزتك</span>
              <span>•</span>
              <span>🚫 لا توجد إعلانات أو اشتراكات</span>
            </div>

            <!-- ── Interactive App Preview Card (Live Demo Simulation) ── -->
            <div style="margin-top: 3rem; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: right; position: relative; overflow: hidden;">
              
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.5rem;">🐧</span>
                  <div>
                    <h3 style="font-size: 1rem; font-weight: 700; margin: 0;">معاينة لوحة التحكم المباشرة</h3>
                    <span style="font-size: 0.75rem; color: var(--text-tertiary);">مزامنة حية مع قواعد بيانات Firestore</span>
                  </div>
                </div>
                <span class="badge badge-success">محدث لحظياً ✓</span>
              </div>

              <!-- Stat Preview Cards -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-md); margin-bottom: 1.5rem;">
                <div style="padding: 1rem; background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <span style="font-size: 0.75rem; color: var(--text-tertiary);">إجمالي الثروة والسيولة</span>
                  <div style="font-size: 1.35rem; font-weight: 800; color: #4F6DF5; margin-top: 4px;">45,820 <small style="font-size:0.75rem;">ريال</small></div>
                </div>
                <div style="padding: 1rem; background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <span style="font-size: 0.75rem; color: var(--text-tertiary);">الدخل الشهري الوارد</span>
                  <div style="font-size: 1.35rem; font-weight: 800; color: #10B981; margin-top: 4px;">+14,500 <small style="font-size:0.75rem;">ريال</small></div>
                </div>
                <div style="padding: 1rem; background: var(--bg-surface-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <span style="font-size: 0.75rem; color: var(--text-tertiary);">المصروفات الشهرية</span>
                  <div style="font-size: 1.35rem; font-weight: 800; color: #EF4444; margin-top: 4px;">-4,120 <small style="font-size:0.75rem;">ريال</small></div>
                </div>
                <div style="padding: 1rem; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.3);">
                  <span style="font-size: 0.75rem; color: #10B981; font-weight: 700;">🕌 زكاة المدخرات (2.5%)</span>
                  <div style="font-size: 1.35rem; font-weight: 800; color: #10B981; margin-top: 4px;">625.00 <small style="font-size:0.75rem;">ريال</small></div>
                </div>
              </div>

              <!-- Quick SMS Banner in Mockup -->
              <div style="padding: 0.85rem 1rem; background: rgba(75, 97, 250, 0.08); border: 1px dashed rgba(75, 97, 250, 0.35); border-radius: var(--radius-md); font-size: 0.8125rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>📩</span>
                  <span><strong>تحليل رسائل SMS البنكية:</strong> "شراء مدى بقيمة 120.00 ريال لدى سوبرماركت الدانوب..."</span>
                </div>
                <span class="badge badge-primary">تم التعرف والتصنيف تلقائياً ✓</span>
              </div>

            </div>

          </section>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- 2. CORE FEATURES GRID                                          -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <section style="padding: 3rem 0;">
            
            <div style="text-align: center; margin-bottom: 2.5rem;">
              <span style="font-size: 0.8125rem; font-weight: 700; color: var(--primary-text); text-transform: uppercase;">لماذا كاش بلس؟</span>
              <h3 style="font-size: clamp(1.5rem, 3.5vw, 2.25rem); font-weight: 800; margin-top: 6px;">كل ما تحتاجه للسيطرة على أموالك</h3>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-lg);">

              <!-- Feature 1: SMS Parser -->
              <div class="surface" style="padding: 1.75rem; border-top: 3px solid #3B82F6; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 2.25rem; margin-bottom: 12px;">📩</div>
                  <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px;">قراءة رسائل البنوك الذكية</h4>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                    انسخ الرسالة النصية الواردة من البنك (الراجحي، الأهلي، الإنماء، الرياض، البلاد، STC Pay...) بضغطة زر، وسيقوم النظام باستخراج المبلغ، التاجر، الحساب، والتصنيف تلقائياً دون كتابة يدوية.
                  </p>
                </div>
                <div style="font-size: 0.75rem; color: var(--primary-text); font-weight: 700;">دعم أكثر من 12 بنك سعودي ومحفظة 🇸🇦</div>
              </div>

              <!-- Feature 2: Zakat Calculator -->
              <div class="surface" style="padding: 1.75rem; border-top: 3px solid #10B981; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 2.25rem; margin-bottom: 12px;">🕌</div>
                  <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px;">حاسبة ومتابعة زكاة المدخرات</h4>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                    تتبع دقيق لاكتمال الحول (سنة كاملة) على صناديق الادخار وأموالك، واحتساب ربع العشر (2.5%) الشرعية تلقائياً مع تنبيهك عند وجوب إخراج الزكاة.
                  </p>
                </div>
                <div style="font-size: 0.75rem; color: #10B981; font-weight: 700;">احتساب شرعي دقيق بنسبة 2.5% ✨</div>
              </div>

              <!-- Feature 3: Expense & Income Separation -->
              <div class="surface" style="padding: 1.75rem; border-top: 3px solid #F59E0B; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 2.25rem; margin-bottom: 12px;">🏷️</div>
                  <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px;">فصل وتخصيص التصنيفات</h4>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                    فصل ذكي بين تصنيفات المصاريف وتصنيفات الدخل، مع إمكانية إنشاء تصنيفاتك الخاصة وتفريعاتها حسب أسلوب حياتك المالي.
                  </p>
                </div>
                <div style="font-size: 0.75rem; color: #F59E0B; font-weight: 700;">تصنيفات رئيسية وفرعية مخصصة 🎯</div>
              </div>

              <!-- Feature 4: Cloud Sync -->
              <div class="surface" style="padding: 1.75rem; border-top: 3px solid #8B5CF6; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 2.25rem; margin-bottom: 12px;">☁️</div>
                  <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px;">مزامنة سحابية حقيقية 100%</h4>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                    بياناتك مربوطة مباشرة بقواعد بيانات Google Cloud Firestore. سجّل دخولك من أي جهاز (جوال، لابتوب، آيباد) وستجد كافة حساباتك ومصاريفك محدثة في أجزاء من الثانية.
                  </p>
                </div>
                <div style="font-size: 0.75rem; color: #8B5CF6; font-weight: 700;">بيانات مشفرة ومحفوظة بحسابك 🔒</div>
              </div>

              <!-- Feature 5: Multi-Account Vault -->
              <div class="surface" style="padding: 1.75rem; border-top: 3px solid #EC4899; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 2.25rem; margin-bottom: 12px;">💳</div>
                  <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px;">خزينة الحسابات والبطاقات</h4>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                    تتبع كافة بطاقاتك البنكية، أرقام الآيبان IBAN، تاريخ انتهاء البطاقات، وحدود الائتمان، ومعرفة الرصيد الكلي المتاح في كل لحظة.
                  </p>
                </div>
                <div style="font-size: 0.75rem; color: #EC4899; font-weight: 700;">محفظة بطاقات وحسابات متكاملة 🏦</div>
              </div>

              <!-- Feature 6: Budget & Cash Flow Insights -->
              <div class="surface" style="padding: 1.75rem; border-top: 3px solid #06B6D4; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 2.25rem; margin-bottom: 12px;">📊</div>
                  <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 8px;">ميزانيات ذكية وتحليلات تدفق</h4>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                    حدد سقف إنفاقك الشهري لكل تصنيف، واستعرض مسار أموالك من أين تأتي وإلى أين تذهب مع نسب الادخار والتنبيه عند تجاوز السقف.
                  </p>
                </div>
                <div style="font-size: 0.75rem; color: #06B6D4; font-weight: 700;">تحليلات ومخططات بيانية تفاعلية 📈</div>
              </div>

            </div>

          </section>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- 3. HOW IT WORKS (3 SIMPLE STEPS)                               -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <section style="padding: 3rem 0; text-align: center;">
            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--primary-text); text-transform: uppercase;">البداية السريعة</span>
            <h3 style="font-size: clamp(1.5rem, 3.5vw, 2.25rem); font-weight: 800; margin: 6px 0 2.5rem 0;">كيف تبدأ مع كاش بلس في دقيقة واحدة؟</h3>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-lg); text-align: right;">
              
              <div class="surface" style="padding: 1.5rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: #4F6DF5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 1rem;">1</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">أنشئ حسابك وحدد شخصيتك</h4>
                <p style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5;">
                  سجّل بريدك واسمك الكريم، واختر أيقونتك المفضلة (ذكر 👨 / أنثى 👩 / بطريق 🐧).
                </p>
              </div>

              <div class="surface" style="padding: 1.5rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 1rem;">2</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">أضف حساباتك واقرأ رسائلك</h4>
                <p style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5;">
                  أضف بطاقاتك البنكية والصق رسائل مشترياتك النصية لتُسجل في أجزاء من الثانية.
                </p>
              </div>

              <div class="surface" style="padding: 1.5rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: #8B5CF6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 1rem;">3</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">راقب أموالك واعرف زكاتك</h4>
                <p style="font-size: 0.8125rem; color: var(--text-tertiary); line-height: 1.5;">
                  تتبع نمو مدخراتك وميزانيتك من هاتفك أو جهازك في أي مكان مع أمان تام.
                </p>
              </div>

            </div>
          </section>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- 4. BOTTOM CALL TO ACTION BANNER                                -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <section style="margin-top: 2rem; background: linear-gradient(135deg, rgba(75, 97, 250, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(75, 97, 250, 0.35); border-radius: var(--radius-lg); padding: 3rem 1.5rem; text-align: center;">
            <h3 style="font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 900; margin-bottom: 1rem;">
              جاهز لتنظيم أموالك وتنمية مدخراتك؟
            </h3>
            <p style="font-size: 1rem; color: var(--text-secondary); max-width: 540px; margin: 0 auto 2rem auto; line-height: 1.6;">
              انضم الآن مجاناً وابدأ تجربة مالية سحابية متطورة مصممة خصيصاً لاحتياجك.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="cta-btn-signup" style="padding: 0.9rem 2.5rem; font-size: 1.05rem; font-weight: 800; box-shadow: 0 6px 20px rgba(75, 97, 250, 0.45);">
                🚀 إنشاء حساب مجاني الآن
              </button>
              <button class="btn btn-glass" id="cta-btn-login" style="padding: 0.9rem 1.8rem; font-size: 0.95rem; font-weight: 700;">
                تسجيل الدخول
              </button>
            </div>
          </section>

          <!-- Footer -->
          <footer style="margin-top: 4rem; text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 2rem; color: var(--text-tertiary); font-size: 0.8125rem;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px;">
              <img src="assets/logo-icon.svg" style="width: 20px; height: 20px; border-radius: 4px;">
              <strong style="color: var(--text-secondary);">كاش بلس (Cash Plus)</strong>
            </div>
            <p style="margin: 0;">جميع الحقوق محفوظة © 2026 • نظام مالي سحابي مشفر وآمن</p>
          </footer>

        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- MOBILE STICKY BOTTOM BAR (Displays on Mobile Devices)          -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div id="landing-mobile-bar" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; padding: 0.75rem 1rem; background: rgba(10, 13, 21, 0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid var(--border-default); display: flex; gap: 8px; box-shadow: 0 -4px 20px rgba(0,0,0,0.5);">
          <button class="btn btn-primary" id="mobile-bar-signup" style="flex: 1.4; padding: 0.75rem; font-weight: 800; font-size: 0.95rem;">
            🚀 إنشاء حساب جديد
          </button>
          <button class="btn btn-glass" id="mobile-bar-login" style="flex: 1; padding: 0.75rem; font-weight: 700; font-size: 0.9rem;">
            تسجيل الدخول
          </button>
        </div>

      </div>
    `;

    // ── Wire Click Handlers ──────────────────────────────────────────────────
    const openSignup = () => window.app.openAuthModal('signup');
    const openLogin  = () => window.app.openAuthModal('login');

    container.querySelector('#nav-btn-login')?.addEventListener('click', openLogin);
    container.querySelector('#nav-btn-signup')?.addEventListener('click', openSignup);
    container.querySelector('#hero-btn-signup')?.addEventListener('click', openSignup);
    container.querySelector('#cta-btn-signup')?.addEventListener('click', openSignup);
    container.querySelector('#cta-btn-login')?.addEventListener('click', openLogin);
    container.querySelector('#mobile-bar-signup')?.addEventListener('click', openSignup);
    container.querySelector('#mobile-bar-login')?.addEventListener('click', openLogin);

    container.querySelector('#hero-btn-google')?.addEventListener('click', async () => {
      try {
        await cloudAuth.signInWithGoogle();
      } catch (err) {
        window.app.showToast(err.message || 'فشل تسجيل الدخول بـ Google');
      }
    });
  }
}

/**
 * Cash Plus (كاش بلس) — Premium White Glass Landing Page
 * صفحة الهبوط التعريفية الشاملة والمصممة بنمط الزجاج الأبيض الفاخر (White Frosted Glass)
 * وتوافق تام مع شاشات الجوال والحاسوب وثبات علوي عند التمرير (Sticky Top Header)
 */

import { cloudAuth } from '../engine/firebase.js';
import { Icons } from '../icons.js';

export class LandingView {
  static render(container) {
    container.innerHTML = `
      <div class="landing-page-root animate-fade-in" style="min-height: 100vh; color: var(--text-primary); overflow-x: hidden; background: radial-gradient(circle at 50% 8%, rgba(75, 97, 250, 0.12) 0%, transparent 60%);">

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- TOP STICKY WHITE FROSTED GLASS NAVBAR (ثابت وأقرب للأبيض)        -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <header id="landing-header" style="position: sticky; top: 0; z-index: 1000; width: 100%; backdrop-filter: blur(24px) saturate(190%); -webkit-backdrop-filter: blur(24px) saturate(190%); background: rgba(255, 255, 255, 0.94); border-bottom: 1px solid rgba(226, 232, 240, 0.85); box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.07); padding: 0.65rem 1.25rem; transition: all 0.2s ease;">
          <div style="max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            
            <!-- Brand & Logo -->
            <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
              <img src="assets/logo-icon.svg" alt="كاش بلس" style="width: 38px; height: 38px; border-radius: 10px; box-shadow: 0 4px 14px rgba(75, 97, 250, 0.35);">
              <div style="white-space: nowrap;">
                <h1 style="font-size: 1.2rem; font-weight: 800; margin: 0; line-height: 1.15; color: #0F172A; letter-spacing: -0.02em;">كاش بلس</h1>
                <span class="hide-on-mobile-sm" style="font-size: 0.68rem; color: #4F6DF5; font-weight: 700;">فلوسك تستاهل أكثر</span>
              </div>
            </div>

            <!-- Header Action Buttons -->
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <button class="btn btn-sm" id="nav-btn-login" style="padding: 0.5rem 1.1rem; font-weight: 700; font-size: 0.875rem; border-radius: var(--radius-full); background: #F1F5F9; color: #1E293B; border: 1px solid #E2E8F0; white-space: nowrap;">
                تسجيل الدخول
              </button>
              <button class="btn btn-primary btn-sm" id="nav-btn-signup" style="padding: 0.5rem 1.25rem; font-weight: 700; font-size: 0.875rem; border-radius: var(--radius-full); box-shadow: 0 4px 14px rgba(75, 97, 250, 0.4); white-space: nowrap;">
                إنشاء حساب مجاني
              </button>
            </div>

          </div>
        </header>

        <!-- Main Content Wrapper -->
        <div style="max-width: 1140px; margin: 0 auto; padding: 2rem 1.25rem 6rem 1.25rem;">

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- 1. HERO SECTION                                                -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <section style="text-align: center; padding: 1.5rem 0 3rem 0;">
            
            <!-- Pill Tag -->
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; background: rgba(75, 97, 250, 0.1); border: 1px solid rgba(75, 97, 250, 0.28); border-radius: var(--radius-full); margin-bottom: 1.75rem;">
              <span style="font-size: 1rem;">✨</span>
              <span style="font-size: 0.8125rem; font-weight: 700; color: #4F46E5;">نظام الإدارة المالية وحساب الزكاة السحابي</span>
            </div>

            <!-- Big Headline with Generous Line-Height & Letter Spacing -->
            <h2 style="font-size: clamp(2.1rem, 5.5vw, 3.5rem); font-weight: 900; line-height: 1.55; letter-spacing: -0.01em; margin-bottom: 1.75rem; max-width: 880px; margin-left: auto; margin-right: auto; color: var(--text-primary);">
              تحكم كامل في مصاريفك، <br>
              <span style="background: linear-gradient(135deg, #4F6DF5 0%, #06B6D4 50%, #10B981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block; padding-top: 4px;">
                وثروتك وزكاتك في مكان واحد.
              </span>
            </h2>

            <!-- Subtitle with Comfortable Line Height -->
            <p style="font-size: clamp(0.95rem, 2.2vw, 1.15rem); color: var(--text-secondary); max-width: 720px; margin: 0 auto 2.5rem auto; line-height: 1.85;">
              منصة مالية عربية متكاملة لربط الحسابات والبطاقات، قراءة رسائل SMS البنكية فورياً، وتتبع الصرف والدخل، مع حساب زكاة المدخرات تلقائياً ومزامنة فورية بين جميع أجهزتك.
            </p>

            <!-- Hero Action Buttons -->
            <div style="display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 2.25rem;">
              <button class="btn btn-primary" id="hero-btn-signup" style="padding: 0.95rem 2.5rem; font-size: 1.05rem; font-weight: 800; border-radius: var(--radius-full); box-shadow: 0 8px 24px rgba(75, 97, 250, 0.45); min-width: 200px;">
                🚀 ابدأ مجاناً الآن
              </button>
              <button class="btn" id="hero-btn-google" style="padding: 0.95rem 1.85rem; font-size: 0.95rem; font-weight: 700; border-radius: var(--radius-full); background: #FFFFFF; color: #0F172A; border: 1px solid #CBD5E1; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                المتابعة بحساب Google
              </button>
            </div>

            <!-- Trust / Privacy Badges -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 0.8125rem; color: var(--text-tertiary); flex-wrap: wrap; margin-bottom: 3.5rem;">
              <span>🔒 تشفير سحابي Google Firebase</span>
              <span>•</span>
              <span>⚡ مزامنة فورية على كل أجهزتك</span>
              <span>•</span>
              <span>🚫 بدون إعلانات وبشكل مجاني</span>
            </div>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- 2. HIGH-CONTRAST PREMIUM APP PREVIEW CARD (معاينة لوحة التحكم)  -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 24px; padding: clamp(1.2rem, 3vw, 2rem); box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0,0,0,0.03); text-align: right; position: relative; overflow: hidden; color: #0F172A;">
              
              <!-- Preview Header -->
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 1.25rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 42px; height: 42px; border-radius: 12px; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid #C7D2FE;">🐧</div>
                  <div>
                    <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0; color: #0F172A;">معاينة لوحة التحكم الحية</h3>
                    <span style="font-size: 0.75rem; color: #64748B;">مزامنة فورية مشفرة مع قواعد بيانات Firestore</span>
                  </div>
                </div>
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 9999px; color: #065F46; font-weight: 700; font-size: 0.75rem;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                  محدث سحابياً الآن
                </span>
              </div>

              <!-- Stat Preview Cards with Rich Contrast -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                
                <!-- Total Balance Card -->
                <div style="padding: 1.25rem; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-radius: 16px; border: 1px solid #C7D2FE;">
                  <span style="font-size: 0.75rem; color: #4338CA; font-weight: 700;">💎 إجمالي الثروة والسيولة</span>
                  <div style="font-size: 1.6rem; font-weight: 900; color: #1E1B4B; margin-top: 6px;">45,820 <small style="font-size:0.8rem; font-weight:700;">ريال</small></div>
                </div>

                <!-- Monthly Income Card -->
                <div style="padding: 1.25rem; background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 16px; border: 1px solid #A7F3D0;">
                  <span style="font-size: 0.75rem; color: #065F46; font-weight: 700;">🟢 الدخل الشهري الوارد</span>
                  <div style="font-size: 1.6rem; font-weight: 900; color: #064E3B; margin-top: 6px;">+14,500 <small style="font-size:0.8rem; font-weight:700;">ريال</small></div>
                </div>

                <!-- Monthly Expense Card -->
                <div style="padding: 1.25rem; background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%); border-radius: 16px; border: 1px solid #FECDD3;">
                  <span style="font-size: 0.75rem; color: #9F1239; font-weight: 700;">🔴 المصروفات الشهرية</span>
                  <div style="font-size: 1.6rem; font-weight: 900; color: #881337; margin-top: 6px;">-4,120 <small style="font-size:0.8rem; font-weight:700;">ريال</small></div>
                </div>

                <!-- Zakat Card -->
                <div style="padding: 1.25rem; background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-radius: 16px; border: 1px solid #86EFAC;">
                  <span style="font-size: 0.75rem; color: #166534; font-weight: 700;">🕌 زكاة المدخرات (2.5%)</span>
                  <div style="font-size: 1.6rem; font-weight: 900; color: #14532D; margin-top: 6px;">625.00 <small style="font-size:0.8rem; font-weight:700;">ريال</small></div>
                </div>

              </div>

              <!-- SMS Simulation Box -->
              <div style="padding: 1.1rem 1.25rem; background: #F8FAFC; border: 1.5px dashed #93C5FD; border-radius: 16px; font-size: 0.875rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; color: #1E293B;">
                <div style="display: flex; align-items: center; gap: 10px; text-align: right;">
                  <span style="font-size: 1.3rem;">📩</span>
                  <div>
                    <strong style="color: #1D4ED8;">تحليل رسائل SMS البنكية الذكية:</strong>
                    <div style="font-size: 0.8125rem; color: #475569; margin-top: 2px;">"شراء مدى بقيمة 120.00 ريال لدى سوبرماركت الدانوب من بطاقتك الائتمانية..."</div>
                  </div>
                </div>
                <span style="padding: 5px 12px; background: #DBEAFE; color: #1E40AF; font-size: 0.75rem; font-weight: 800; border-radius: 9999px; white-space: nowrap;">
                  تم التصنيف والخصم تلقائياً ✓
                </span>
              </div>

            </div>

          </section>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- 3. CORE FEATURES GRID                                          -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <section style="padding: 3rem 0;">
            
            <div style="text-align: center; margin-bottom: 2.5rem;">
              <span style="font-size: 0.8125rem; font-weight: 700; color: #4F6DF5; text-transform: uppercase;">لماذا كاش بلس؟</span>
              <h3 style="font-size: clamp(1.5rem, 3.5vw, 2.25rem); font-weight: 800; margin-top: 8px;">كل ما تحتاجه للسيطرة على أموالك</h3>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-lg);">

              <!-- Feature 1: SMS Parser -->
              <div class="surface" style="padding: 1.75rem; border-top: 4px solid #3B82F6; display: flex; flex-direction: column; justify-content: space-between;">
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
              <div class="surface" style="padding: 1.75rem; border-top: 4px solid #10B981; display: flex; flex-direction: column; justify-content: space-between;">
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
              <div class="surface" style="padding: 1.75rem; border-top: 4px solid #F59E0B; display: flex; flex-direction: column; justify-content: space-between;">
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
              <div class="surface" style="padding: 1.75rem; border-top: 4px solid #8B5CF6; display: flex; flex-direction: column; justify-content: space-between;">
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
              <div class="surface" style="padding: 1.75rem; border-top: 4px solid #EC4899; display: flex; flex-direction: column; justify-content: space-between;">
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
              <div class="surface" style="padding: 1.75rem; border-top: 4px solid #06B6D4; display: flex; flex-direction: column; justify-content: space-between;">
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
          <!-- 4. BOTTOM CALL TO ACTION BANNER                                -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <section style="margin-top: 2.5rem; background: linear-gradient(135deg, rgba(75, 97, 250, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%); border: 1px solid rgba(75, 97, 250, 0.3); border-radius: var(--radius-lg); padding: 3.5rem 1.75rem; text-align: center;">
            <h3 style="font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 900; margin-bottom: 1.25rem;">
              جاهز لتنظيم أموالك وتنمية مدخراتك؟
            </h3>
            <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 560px; margin: 0 auto 2.25rem auto; line-height: 1.7;">
              انضم الآن مجاناً وابدأ تجربة مالية سحابية متطورة مصممة خصيصاً لاحتياجك.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="cta-btn-signup" style="padding: 0.95rem 2.6rem; font-size: 1.05rem; font-weight: 800; border-radius: var(--radius-full); box-shadow: 0 8px 24px rgba(75, 97, 250, 0.45);">
                🚀 إنشاء حساب مجاني الآن
              </button>
              <button class="btn btn-glass" id="cta-btn-login" style="padding: 0.95rem 2rem; font-size: 0.95rem; font-weight: 700; border-radius: var(--radius-full);">
                تسجيل الدخول
              </button>
            </div>
          </section>

          <!-- Footer -->
          <footer style="margin-top: 4.5rem; text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 2rem; color: var(--text-tertiary); font-size: 0.8125rem;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
              <img src="assets/logo-icon.svg" style="width: 22px; height: 22px; border-radius: 6px;">
              <strong style="color: var(--text-secondary);">كاش بلس (Cash Plus)</strong>
            </div>
            <p style="margin: 0;">جميع الحقوق محفوظة © 2026 • نظام مالي سحابي مشفر وآمن</p>
          </footer>

        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- MOBILE STICKY BOTTOM BAR                                       -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div id="landing-mobile-bar" style="position: fixed; bottom: 12px; left: 16px; right: 16px; z-index: 100; padding: 0.6rem 0.85rem; background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(226, 232, 240, 0.85); border-radius: var(--radius-full); display: flex; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
          <button class="btn btn-primary" id="mobile-bar-signup" style="flex: 1.4; padding: 0.75rem; font-weight: 800; font-size: 0.95rem; border-radius: var(--radius-full);">
            🚀 إنشاء حساب جديد
          </button>
          <button class="btn" id="mobile-bar-login" style="flex: 1; padding: 0.75rem; font-weight: 700; font-size: 0.9rem; border-radius: var(--radius-full); background: #F1F5F9; color: #1E293B; border: 1px solid #E2E8F0;">
            تسجيل الدخول
          </button>
        </div>

      </div>
    `;

    // ── Click Handlers ──────────────────────────────────────────────────
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

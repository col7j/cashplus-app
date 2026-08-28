/**
 * Cash Plus (كاش بلس) — Settings View
 * الإعدادات العامة والحساب السحابي
 */

import { db }         from '../engine/db.js';
import { cloudAuth }  from '../engine/firebase.js';

export class SettingsView {
  static render(container) {

    const renderContent = () => {
      const theme    = db.state.settings?.theme    || 'system';
      const currency = db.state.settings?.currency || 'SAR';
      const startDay = db.state.settings?.startDayOfMonth || 1;
      const profile  = db.state.settings?.userProfile || {};
      const user     = cloudAuth.currentUser;
      const synced   = cloudAuth.syncStatus === 'synced';

      container.innerHTML = `
        <div class="animate-fade-in">

          <!-- Page Header -->
          <div style="margin-bottom: var(--space-xl);">
            <p style="font-size: 0.8rem; font-weight: 600; color: var(--primary-text); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;">التخصيص والحساب</p>
            <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em;">الإعدادات</h2>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);" class="settings-split">

            <!-- ══════════════════════════════════════════════ -->
            <!-- RIGHT COLUMN                                   -->
            <!-- ══════════════════════════════════════════════ -->
            <div style="display: flex; flex-direction: column; gap: var(--space-lg);">

              <!-- Cloud Account Card -->
              <div class="surface">
                <div style="margin-bottom: var(--space-md);">
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">الحساب السحابي والمزامنة عبر الأجهزة</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">☁️ المزامنة عبر Google Firebase</h3>
                </div>

                <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-md); line-height: 1.6;">
                  يتيح لك تسجيل الدخول السحابي الوصول لكافة مصاريفك وحساباتك من هاتفك والآيباد والكمبيوتر في نفس الوقت وبشكل متزامن فورياً.
                </p>

                ${user ? `
                  <!-- Logged In State -->
                  <div style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md);
                       background: var(--success-surface); border: 1px solid var(--success-border);
                       border-radius: var(--radius-md); margin-bottom: var(--space-md);">
                    ${user.photoURL
                      ? `<img src="${user.photoURL}" style="width:48px;height:48px;border-radius:50%;flex-shrink:0;">`
                      : `<div style="width:48px;height:48px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;">${(user.displayName||'?')[0]}</div>`
                    }
                    <div style="flex:1;min-width:0;">
                      <div style="font-size: 0.9375rem; font-weight: 700; white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.displayName || 'مستخدم'}</div>
                      <div style="font-size: 0.75rem; color: var(--text-tertiary);">${user.email || ''}</div>
                    </div>
                    <span class="badge badge-success">متصل ✓</span>
                  </div>
                  <button class="btn btn-subtle" id="btn-settings-logout" style="width:100%;">تسجيل الخروج</button>
                ` : `
                  <!-- Logged Out State -->
                  <div style="padding: var(--space-md); background: var(--bg-surface-secondary);
                       border-radius: var(--radius-md); border: 1px solid var(--border-subtle);
                       text-align: center; margin-bottom: var(--space-md);">
                    <div style="font-size: 2rem; margin-bottom: 8px;">☁️</div>
                    <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 4px;">وضع محلي (Offline)</div>
                    <p style="font-size: 0.8rem; color: var(--text-tertiary); margin-bottom: var(--space-md);">
                      سجّل حسابك لمزامنة بياناتك بين جميع أجهزتك تلقائياً.
                    </p>
                    <button class="btn btn-primary" id="btn-settings-login" style="width:100%;">
                      تسجيل الدخول / إنشاء حساب
                    </button>
                  </div>
                `}
              </div>

              <!-- Profile Settings -->
              <div class="surface">
                <div style="margin-bottom: var(--space-md);">
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">الملف الشخصي</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">معلوماتك الشخصية</h3>
                </div>

                <div class="form-group">
                  <label class="form-label">الاسم</label>
                  <input type="text" id="set-profile-name" class="form-input"
                    placeholder="اسمك" value="${profile.name || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">المهنة / الوصف</label>
                  <input type="text" id="set-profile-role" class="form-input"
                    placeholder="مثال: موظف، مستقل، رائد أعمال..." value="${profile.role || ''}">
                </div>
                <button class="btn btn-primary btn-sm" id="btn-save-profile">حفظ الملف الشخصي والمزامنة</button>
              </div>

              <!-- Categories Management Card -->
              <div class="surface">
                <div style="margin-bottom: var(--space-md);">
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">التصنيفات</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">إدارة وتخصيص التصنيفات</h3>
                </div>

                <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: var(--space-md); line-height: 1.5;">
                  أضف تصنيفات جديدة للدخل والمصاريف أو أضف أقساماً فرعية مخصصة حسب احتياجك.
                </p>
                <button class="btn btn-glass" id="btn-settings-manage-categories" style="width: 100%;">
                  🏷️ إدارة التصنيفات والأقسام الفرعية
                </button>
              </div>

              <!-- Data Management -->
              <div class="surface">
                <div style="margin-bottom: var(--space-md);">
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">إدارة البيانات</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">النسخ الاحتياطي والاستعادة</h3>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                  <button class="btn btn-glass" id="btn-export-data">
                    تصدير البيانات (JSON)
                  </button>
                  <label class="btn btn-glass" style="cursor:pointer; text-align:center;">
                    استيراد بيانات
                    <input type="file" id="import-file-input" accept=".json" style="display:none;">
                  </label>
                  <button class="btn btn-glass" id="btn-reset-data"
                    style="color: var(--danger-text); border-color: var(--danger-border);">
                    إعادة تهيئة البيانات (مسح الكل)
                  </button>
                </div>
              </div>

            </div>

            <!-- ══════════════════════════════════════════════ -->
            <!-- LEFT COLUMN                                    -->
            <!-- ══════════════════════════════════════════════ -->
            <div style="display: flex; flex-direction: column; gap: var(--space-lg);">

              <!-- Appearance Settings -->
              <div class="surface">
                <div style="margin-bottom: var(--space-md);">
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">المظهر</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">السمة والألوان</h3>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm);">
                  <button class="theme-option-btn ${theme === 'light' ? 'active' : ''}" data-theme="light">
                    <span style="font-size: 1.25rem;">☀️</span>
                    <span>فاتح</span>
                  </button>
                  <button class="theme-option-btn ${theme === 'dark' ? 'active' : ''}" data-theme="dark">
                    <span style="font-size: 1.25rem;">🌙</span>
                    <span>داكن</span>
                  </button>
                  <button class="theme-option-btn ${theme === 'system' ? 'active' : ''}" data-theme="system">
                    <span style="font-size: 1.25rem;">⚙️</span>
                    <span>تلقائي</span>
                  </button>
                </div>
              </div>

              <!-- Financial Settings -->
              <div class="surface">
                <div style="margin-bottom: var(--space-md);">
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">المالية</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">الإعدادات المالية</h3>
                </div>

                <div class="form-group">
                  <label class="form-label">العملة الافتراضية</label>
                  <select id="set-currency" class="form-input">
                    <option value="SAR" ${currency === 'SAR' ? 'selected' : ''}>ريال سعودي (SAR)</option>
                    <option value="AED" ${currency === 'AED' ? 'selected' : ''}>درهم إماراتي (AED)</option>
                    <option value="USD" ${currency === 'USD' ? 'selected' : ''}>دولار أمريكي (USD)</option>
                    <option value="EGP" ${currency === 'EGP' ? 'selected' : ''}>جنيه مصري (EGP)</option>
                    <option value="KWD" ${currency === 'KWD' ? 'selected' : ''}>دينار كويتي (KWD)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">يوم بداية الشهر المالي</label>
                  <select id="set-start-day" class="form-input">
                    ${[1,5,10,15,20,25,28].map(d => `
                      <option value="${d}" ${startDay === d ? 'selected' : ''}>اليوم ${d}</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-sm) 0; border-top: 1px solid var(--border-subtle); margin-top: var(--space-sm);">
                  <span style="font-size: 0.875rem; font-weight: 600;">إخفاء الأرقام الحساسة</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="set-hide-sensitive"
                      ${db.state.settings?.hideSensitive ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <button class="btn btn-primary btn-sm" id="btn-save-financial" style="margin-top: var(--space-md); width: 100%;">
                  حفظ الإعدادات المالية
                </button>
              </div>

              <!-- App Info -->
              <div class="surface">
                <div style="margin-bottom: var(--space-md);">
                  <p style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">معلومات</p>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">حول التطبيق</h3>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                    <span style="color: var(--text-tertiary);">اسم التطبيق</span>
                    <span style="font-weight: 600;">كاش بلس (Cash Plus)</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                    <span style="color: var(--text-tertiary);">الإصدار</span>
                    <span style="font-weight: 600;">2.0.0</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                    <span style="color: var(--text-tertiary);">قاعدة البيانات</span>
                    <span style="font-weight: 600;">Google Firestore</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                    <span style="color: var(--text-tertiary);">المشروع</span>
                    <span style="font-weight: 600; font-size: 0.75rem; color: var(--text-tertiary);">cash-plus-90e0c</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                    <span style="color: var(--text-tertiary);">حالة المزامنة</span>
                    <span class="badge ${synced ? 'badge-success' : 'badge-neutral'}">
                      ${synced ? '✓ متزامن' : user ? 'جارٍ...' : 'غير متصل'}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                    <span style="color: var(--text-tertiary);">السجلات المحلية</span>
                    <span style="font-weight: 600;">${db.state.transactions?.length || 0} عملية</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;

      // ── Event Listeners ──────────────────────────────────────────────────

      // Theme buttons
      container.querySelectorAll('.theme-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = btn.dataset.theme;
          db.state.settings.theme = t;
          db.save();
          window.app.applyTheme(t);
          renderContent(); // re-render to update active state
        });
      });

      // Save profile
      container.querySelector('#btn-save-profile')?.addEventListener('click', () => {
        const name = container.querySelector('#set-profile-name')?.value?.trim();
        const role = container.querySelector('#set-profile-role')?.value?.trim();
        db.state.settings.userProfile = { name, role };
        db.save();
        cloudAuth.triggerCloudSync();
        window.app.showToast('تم حفظ وتحديث الملف الشخصي سحابياً ✓');
      });

      // Manage Categories
      container.querySelector('#btn-settings-manage-categories')?.addEventListener('click', () => {
        window.app.openCategoryManagerModal();
      });

      // Save financial settings
      container.querySelector('#btn-save-financial')?.addEventListener('click', () => {
        db.state.settings.currency         = container.querySelector('#set-currency')?.value || 'SAR';
        db.state.settings.startDayOfMonth  = Number(container.querySelector('#set-start-day')?.value) || 1;
        db.state.settings.hideSensitive    = container.querySelector('#set-hide-sensitive')?.checked || false;
        db.save();
        window.app.showToast('تم حفظ الإعدادات المالية ✓');
      });

      // Login button
      container.querySelector('#btn-settings-login')?.addEventListener('click', () => {
        window.app.openAuthModal();
      });

      // Logout button
      container.querySelector('#btn-settings-logout')?.addEventListener('click', async () => {
        await cloudAuth.signOut();
        renderContent();
        window.app.showToast('تم تسجيل الخروج');
      });

      // Export JSON
      container.querySelector('#btn-export-data')?.addEventListener('click', () => {
        const json = db.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `cashplus-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.app.showToast('تم تصدير بياناتك ✓');
      });

      // Import JSON
      container.querySelector('#import-file-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const success = db.importJSON(ev.target.result);
          if (success) {
            window.app.showToast('تم استيراد البيانات بنجاح ✓');
            renderContent();
          } else {
            window.app.showToast('فشل الاستيراد — تأكد من صحة الملف');
          }
        };
        reader.readAsText(file);
      });

      // Reset Data
      container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
        if (confirm('⚠️ هل أنت متأكد؟ سيتم مسح جميع بياناتك المالية نهائياً!')) {
          db.resetToDefault();
          renderContent();
          window.app.showToast('تم مسح جميع البيانات وإعادة التهيئة');
        }
      });
    };

    renderContent();

    // Re-render when cloud auth changes
    cloudAuth.subscribe(() => renderContent());
  }
}

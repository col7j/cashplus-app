/**
 * Cash Plus (كاش بلس) — Official Saudi Banks & Digital Wallets Registry & Logos
 * كتالوج البنوك والمحافظ الرقمية السعودية المعتمدة مع الشعارات الرسمية المتجهة (SVG)
 */

export const SAUDI_BANKS_CATALOG = [
  {
    id: 'bank-rajhi',
    name: 'مصرف الراجحي',
    shortName: 'الراجحي',
    code: 'RJHI',
    color: '#002D62',
    bgColor: '#002D62',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#002D62"/>
      <!-- Al Rajhi Dual Geometric Diamond -->
      <path d="M50 16 L80 50 L50 84 L20 50 Z" fill="#0077CC" opacity="0.3"/>
      <path d="M50 24 L74 50 L50 76 L26 50 Z" fill="none" stroke="#FFFFFF" stroke-width="5"/>
      <path d="M50 34 L64 50 L50 66 L36 50 Z" fill="#40A9FF"/>
      <circle cx="50" cy="50" r="4" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-snb',
    name: 'البنك الأهلي السعودي (SNB)',
    shortName: 'الأهلي',
    code: 'NCBK',
    color: '#005A36',
    bgColor: '#005A36',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#005A36"/>
      <!-- SNB Emblem -->
      <path d="M22 50 L36 26 L64 26 L78 50 L64 74 L36 74 Z" fill="none" stroke="#22C55E" stroke-width="4"/>
      <circle cx="50" cy="50" r="14" fill="#22C55E"/>
      <path d="M43 50 L48 55 L58 45" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'bank-inma',
    name: 'مصرف الإنماء',
    shortName: 'الإنماء',
    code: 'INMA',
    color: '#886221',
    bgColor: '#886221',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#886221"/>
      <!-- Alinma Palm & Sun -->
      <circle cx="50" cy="50" r="26" fill="none" stroke="#EAB308" stroke-width="4"/>
      <path d="M50 28 L50 72 M34 40 C42 44 46 54 50 72 M66 40 C58 44 54 54 50 72" fill="none" stroke="#FDE047" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'bank-riyad',
    name: 'بنك الرياض',
    shortName: 'الرياض',
    code: 'RIBL',
    color: '#1C3D77',
    bgColor: '#1C3D77',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#1C3D77"/>
      <!-- Riyad Bank Modern Emblem -->
      <circle cx="50" cy="50" r="24" fill="#0284C7"/>
      <path d="M50 26 C63 26 74 37 74 50 C74 63 63 74 50 74 C37 74 26 63 26 50" fill="none" stroke="#FF7A00" stroke-width="5" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="8" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-sab',
    name: 'البنك الأول / ساب (SAB)',
    shortName: 'الأول / ساب',
    code: 'SABB',
    color: '#D81E05',
    bgColor: '#D81E05',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#18181B"/>
      <!-- SAB Hexagon & Red Diamond -->
      <polygon points="50,22 75,36 75,64 50,78 25,64 25,36" fill="none" stroke="#D81E05" stroke-width="4"/>
      <polygon points="50,32 65,50 50,68 35,50" fill="#D81E05"/>
      <polygon points="50,38 58,50 50,62 42,50" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-bsf',
    name: 'البنك السعودي الفرنسي (BSF)',
    shortName: 'الفرنسي',
    code: 'BSFR',
    color: '#002D6B',
    bgColor: '#002D6B',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#002D6B"/>
      <!-- BSF Diamond Shield -->
      <path d="M50 20 L78 36 L78 64 L50 80 L22 64 L22 36 Z" fill="none" stroke="#38BDF8" stroke-width="4"/>
      <path d="M35 50 L50 35 L65 50 L50 65 Z" fill="#38BDF8"/>
      <circle cx="50" cy="50" r="5" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-anb',
    name: 'البنك العربي الوطني (ANB)',
    shortName: 'العربي',
    code: 'ANBK',
    color: '#005A9C',
    bgColor: '#005A9C',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#005A9C"/>
      <!-- ANB Eagle Shield -->
      <path d="M26 30 L50 22 L74 30 L74 60 C74 72 50 78 50 78 C50 78 26 72 26 60 Z" fill="none" stroke="#F59E0B" stroke-width="4"/>
      <circle cx="50" cy="48" r="10" fill="#F59E0B"/>
      <path d="M42 62 L50 56 L58 62" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'bank-bilad',
    name: 'بنك البلاد',
    shortName: 'البلاد',
    code: 'ALBI',
    color: '#93182A',
    bgColor: '#93182A',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#93182A"/>
      <!-- Albilad Crescent & Horse -->
      <circle cx="50" cy="50" r="25" fill="none" stroke="#FBBF24" stroke-width="4"/>
      <path d="M38 58 C42 42 54 36 64 42 C56 46 54 54 58 60 C50 58 44 60 38 58 Z" fill="#FBBF24"/>
    </svg>`
  },
  {
    id: 'bank-jazira',
    name: 'بنك الجزيرة',
    shortName: 'الجزيرة',
    code: 'BJAZ',
    color: '#004F2D',
    bgColor: '#004F2D',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#004F2D"/>
      <!-- Bank AlJazira Island & Sun -->
      <path d="M25 66 C35 56 65 56 75 66" fill="none" stroke="#34D399" stroke-width="5" stroke-linecap="round"/>
      <circle cx="50" cy="44" r="14" fill="#34D399"/>
      <path d="M50 24 L50 30 M30 44 L36 44 M70 44 L64 44" stroke="#A7F3D0" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'bank-saib',
    name: 'البنك السعودي للاستثمار (SAIB)',
    shortName: 'الاستثمار',
    code: 'SAIB',
    color: '#004B8D',
    bgColor: '#004B8D',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#004B8D"/>
      <!-- SAIB Star -->
      <polygon points="50,22 57,40 76,40 61,52 67,70 50,59 33,70 39,52 24,40 43,40" fill="#38BDF8"/>
      <circle cx="50" cy="50" r="7" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-meem',
    name: 'بنك الخليج الدولي / ميم (meem)',
    shortName: 'ميم meem',
    code: 'GIBB',
    color: '#982574',
    bgColor: '#982574',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#982574"/>
      <!-- meem Arabic letter -->
      <circle cx="50" cy="44" r="16" fill="none" stroke="#F472B6" stroke-width="5"/>
      <path d="M50 60 L50 78" stroke="#F472B6" stroke-width="5" stroke-linecap="round"/>
      <circle cx="50" cy="44" r="6" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-d360',
    name: 'بنك D360 الرقمي',
    shortName: 'D360',
    code: 'D360',
    color: '#582CD6',
    bgColor: '#582CD6',
    textColor: '#FFFFFF',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#582CD6"/>
      <!-- D360 Circle & 360 degrees -->
      <circle cx="50" cy="50" r="26" fill="none" stroke="#A78BFA" stroke-width="5"/>
      <circle cx="50" cy="24" r="5" fill="#38BDF8"/>
      <text x="50" y="58" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">360</text>
    </svg>`
  },
  {
    id: 'bank-one',
    name: 'بنك ون الرقمي (One Bank / Vision)',
    shortName: 'ون بنك',
    code: 'ONEB',
    color: '#00C2FF',
    bgColor: '#00C2FF',
    textColor: '#000000',
    type: 'bank',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#0A0A0C"/>
      <!-- Number One in Cyber Blue -->
      <circle cx="50" cy="50" r="28" fill="none" stroke="#00C2FF" stroke-width="4"/>
      <path d="M42 36 L52 28 L52 72 M44 72 L60 72" fill="none" stroke="#00C2FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'bank-stcpay',
    name: 'STC Pay / بنك إس تي سي (STC Bank)',
    shortName: 'STC Pay',
    code: 'STCP',
    color: '#4F008C',
    bgColor: '#4F008C',
    textColor: '#FFFFFF',
    type: 'wallet',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#4F008C"/>
      <!-- STC Coral Waves -->
      <circle cx="50" cy="50" r="24" fill="#FF375F"/>
      <path d="M38 52 C38 45 44 40 50 40 C56 40 62 45 62 52 C62 58 56 63 50 63" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="4" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-urpay',
    name: 'محفظة Urpay (يورباي)',
    shortName: 'Urpay',
    code: 'URPY',
    color: '#1D4ED8',
    bgColor: '#1D4ED8',
    textColor: '#FFFFFF',
    type: 'wallet',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#1D4ED8"/>
      <!-- Urpay U Shape -->
      <path d="M34 32 L34 54 C34 63 41 70 50 70 C59 70 66 63 66 54 L66 32" fill="none" stroke="#60A5FA" stroke-width="7" stroke-linecap="round"/>
      <circle cx="50" cy="52" r="5" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-tiqmo',
    name: 'محفظة Tiqmo (تيقمو)',
    shortName: 'Tiqmo',
    code: 'TQMO',
    color: '#FF6B00',
    bgColor: '#FF6B00',
    textColor: '#FFFFFF',
    type: 'wallet',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#FF6B00"/>
      <!-- Tiqmo T Symbol -->
      <path d="M30 35 L70 35 M50 35 L50 72" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
      <circle cx="70" cy="35" r="4" fill="#FDE047"/>
    </svg>`
  },
  {
    id: 'bank-mobily',
    name: 'محفظة Mobily Pay (موبايلي باي)',
    shortName: 'Mobily Pay',
    code: 'MPAY',
    color: '#00A3E0',
    bgColor: '#00A3E0',
    textColor: '#FFFFFF',
    type: 'wallet',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#00A3E0"/>
      <!-- Mobily Swirl -->
      <circle cx="50" cy="50" r="25" fill="none" stroke="#FFFFFF" stroke-width="4.5"/>
      <circle cx="43" cy="44" r="8" fill="#38BDF8"/>
      <circle cx="57" cy="56" r="8" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'bank-tamara',
    name: 'محفظة تمارا (Tamara)',
    shortName: 'تمارا',
    code: 'TAMR',
    color: '#FF782D',
    bgColor: '#FF782D',
    textColor: '#FFFFFF',
    type: 'wallet',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#FF782D"/>
      <!-- Tamara T Arc -->
      <circle cx="50" cy="50" r="24" fill="#FDBA74"/>
      <path d="M32 40 L68 40 M50 40 L50 68" fill="none" stroke="#18181B" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'bank-tabby',
    name: 'محفظة تابي (Tabby)',
    shortName: 'تابي',
    code: 'TABY',
    color: '#3DF99B',
    bgColor: '#3DF99B',
    textColor: '#000000',
    type: 'wallet',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#18181B"/>
      <!-- Tabby Neon Green -->
      <rect x="25" y="25" width="50" height="50" rx="14" fill="#3DF99B"/>
      <text x="50" y="58" font-size="24" font-weight="900" fill="#000000" text-anchor="middle" font-family="sans-serif">T</text>
    </svg>`
  },
  {
    id: 'bank-dinar',
    name: 'محفظة دينار / تمويل جماعي',
    shortName: 'دينار',
    code: 'DINR',
    color: '#0D9488',
    bgColor: '#0D9488',
    textColor: '#FFFFFF',
    type: 'wallet',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#0D9488"/>
      <!-- Dinar Coin -->
      <circle cx="50" cy="50" r="25" fill="#14B8A6"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="#FFFFFF" stroke-width="3"/>
      <text x="50" y="57" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">د</text>
    </svg>`
  },
  {
    id: 'bank-cash',
    name: 'النقدية في اليد (الكاش)',
    shortName: 'كاش',
    code: 'CASH',
    color: '#10B981',
    bgColor: '#10B981',
    textColor: '#FFFFFF',
    type: 'cash',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#10B981"/>
      <!-- Cash Bill -->
      <rect x="22" y="32" width="56" height="36" rx="6" fill="#059669" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="50" cy="50" r="10" fill="#34D399"/>
      <text x="50" y="56" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">💵</text>
    </svg>`
  },
  {
    id: 'bank-custom',
    name: '+ بنك أو محفظة أخرى مخصصة',
    shortName: 'بنك مخصص',
    code: 'CUST',
    color: '#64748B',
    bgColor: '#64748B',
    textColor: '#FFFFFF',
    type: 'custom',
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#64748B"/>
      <!-- Universal Bank Pillars -->
      <path d="M24 38 L50 22 L76 38 Z" fill="#94A3B8"/>
      <rect x="28" y="42" width="8" height="28" fill="#CBD5E1"/>
      <rect x="46" y="42" width="8" height="28" fill="#CBD5E1"/>
      <rect x="64" y="42" width="8" height="28" fill="#CBD5E1"/>
      <rect x="22" y="72" width="56" height="6" rx="2" fill="#E2E8F0"/>
    </svg>`
  }
];

export class BankRegistry {
  /**
   * Get all registered banks & wallets
   */
  static getAll() {
    return SAUDI_BANKS_CATALOG;
  }

  /**
   * Find bank by ID or Code
   */
  static find(idOrCode) {
    if (!idOrCode) return SAUDI_BANKS_CATALOG[0];
    const clean = idOrCode.toLowerCase();
    return SAUDI_BANKS_CATALOG.find(b => 
      b.id.toLowerCase() === clean || 
      b.code.toLowerCase() === clean ||
      b.name.toLowerCase().includes(clean) ||
      b.shortName.toLowerCase().includes(clean)
    ) || {
      id: idOrCode,
      name: idOrCode,
      shortName: idOrCode,
      code: 'BANK',
      color: '#4F6DF5',
      logoSvg: SAUDI_BANKS_CATALOG[SAUDI_BANKS_CATALOG.length - 1].logoSvg
    };
  }

  /**
   * Get Logo element formatted (Supports custom user-uploaded image URL or default SVG)
   */
  static getLogoHtml(idOrCode, size = 44, customLogoUrl = null) {
    if (customLogoUrl) {
      return `<div style="width:${size}px;height:${size}px;min-width:${size}px;border-radius:12px;overflow:hidden;background:#FFFFFF;border:1px solid var(--border-default);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);"><img src="${customLogoUrl}" style="width:100%;height:100%;object-fit:contain;padding:2px;" alt="شعار"></div>`;
    }
    const bank = this.find(idOrCode);
    return `<div style="width:${size}px;height:${size}px;min-width:${size}px;border-radius:12px;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.12);">${bank.logoSvg}</div>`;
  }
}

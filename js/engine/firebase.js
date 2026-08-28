/**
 * Cash Plus (كاش بلس) — Firebase Real Integration
 * Google Firebase Auth + Firestore Cloud Sync
 * Project: cash-plus-90e0c
 */

// ─── Firebase SDK via CDN (No bundler needed, pure ES Module) ───────────────
import { initializeApp }             from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from './db.js';

// ─── Your Firebase Project Config ───────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDiPejxqokQbTb0HEV0kPvmSrAmqN7qIA8",
  authDomain:        "cash-plus-90e0c.firebaseapp.com",
  projectId:         "cash-plus-90e0c",
  storageBucket:     "cash-plus-90e0c.firebasestorage.app",
  messagingSenderId: "978854317280",
  appId:             "1:978854317280:web:2f8f9f842575a632295485",
  measurementId:     "G-2J229MQ93H"
};

// ─── Initialize Firebase ─────────────────────────────────────────────────────
const firebaseApp  = initializeApp(FIREBASE_CONFIG);
const auth         = getAuth(firebaseApp);
const firestore    = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account', hl: 'ar' });

// ─── Firestore Helpers (Dual Target for 100% Compatibility) ──────────────────
function userPrimaryDoc(uid) {
  return doc(firestore, 'users', uid);
}

function userSubDoc(uid) {
  return doc(firestore, 'users', uid, 'data', 'financialState');
}

async function pushToFirestore(uid, state) {
  if (!uid || !state) return;
  try {
    const cleanState = JSON.parse(JSON.stringify(state));
    delete cleanState._syncedAt;
    delete cleanState._version;

    const payload = {
      ...cleanState,
      _syncedAt: serverTimestamp(),
      _version: 3
    };

    // Save to both references for maximum compatibility with all Firestore rule configurations
    await setDoc(userPrimaryDoc(uid), payload, { merge: true });
    await setDoc(userSubDoc(uid), payload, { merge: true }).catch(() => {});
    return true;
  } catch (err) {
    console.error('[CashPlus] Firestore write error:', err);
    throw err;
  }
}

async function pullFromFirestore(uid) {
  if (!uid) return null;
  try {
    // 1. Try primary doc
    let snap = await getDoc(userPrimaryDoc(uid));
    if (!snap.exists() || !snap.data()?.accounts) {
      // 2. Try subcollection doc
      const subSnap = await getDoc(userSubDoc(uid)).catch(() => null);
      if (subSnap && subSnap.exists()) {
        snap = subSnap;
      }
    }

    if (snap && snap.exists()) {
      const data = snap.data();
      delete data._syncedAt;
      delete data._version;
      return data;
    }
  } catch (err) {
    console.error('[CashPlus] Firestore read error:', err);
  }
  return null;
}

// ─── Cloud Auth Manager ───────────────────────────────────────────────────────
class CloudAuthManager {
  constructor() {
    this.currentUser   = null;
    this.syncStatus    = 'offline'; // 'offline' | 'syncing' | 'synced' | 'error'
    this.listeners     = [];
    this._unsubSnap    = null;      // Firestore real-time listener unsubscribe
    this._syncThrottle = null;

    // Listen for Firebase Auth state changes
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        this._onUserSignedIn(firebaseUser);
      } else {
        this._onUserSignedOut();
      }
    });
  }

  // ── Internal Auth Callbacks ──────────────────────────────────────────────
  async _onUserSignedIn(firebaseUser) {
    this.currentUser = {
      uid:         firebaseUser.uid,
      email:       firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم',
      photoURL:    firebaseUser.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(firebaseUser.email)}`,
      provider:    firebaseUser.providerData[0]?.providerId || 'password',
    };

    this.syncStatus = 'syncing';
    this.notify();

    // Pull cloud data first (cloud wins over local on any device upon login)
    const cloudData = await pullFromFirestore(this.currentUser.uid);
    if (cloudData && (cloudData.accounts !== undefined || cloudData.transactions !== undefined || cloudData.settings !== undefined)) {
      // Load cloud data silently into memory and local storage
      db.saveQuiet(cloudData);
    } else {
      // First login / fresh account on cloud — push current local state to initialize cloud document
      await pushToFirestore(this.currentUser.uid, db.state).catch(() => {});
    }

    // Start real-time listener for this user's document across open devices/tabs
    this._startRealtimeSync();

    this.syncStatus = 'synced';
    this.notify();
  }

  _onUserSignedOut() {
    // 1. Cancel any pending outbound push immediately
    clearTimeout(this._syncThrottle);
    this._syncThrottle = null;

    // 2. Stop Firestore listener
    this._stopRealtimeSync();

    // 3. Clear user authentication
    this.currentUser = null;
    this.syncStatus  = 'offline';

    // 4. Strict Privacy: clear all financial data from browser memory and localStorage WITHOUT pushing to cloud
    db.resetToEmptyState(false);
    this.notify();
  }

  // ── Real-time Firestore Listener ─────────────────────────────────────────
  _startRealtimeSync() {
    this._stopRealtimeSync();
    if (!this.currentUser) return;

    try {
      this._unsubSnap = onSnapshot(
        userPrimaryDoc(this.currentUser.uid),
        { includeMetadataChanges: false },
        (snap) => {
          if (snap.exists() && !snap.metadata.hasPendingWrites) {
            const data = snap.data();
            delete data._syncedAt;
            delete data._version;
            // Update local DB quietly without re-triggering cloud push loop
            db.saveQuiet(data);
          }
        },
        (err) => {
          console.warn('[CashPlus] Firestore snapshot listener warning:', err);
        }
      );
    } catch (e) {
      console.warn('[CashPlus] Error setting up onSnapshot:', e);
    }
  }

  _stopRealtimeSync() {
    if (this._unsubSnap) {
      try { this._unsubSnap(); } catch {}
      this._unsubSnap = null;
    }
  }

  // ── Outbound Sync (Direct Push & Throttled) ──────────────────────────────
  async pushImmediate(state) {
    if (!this.currentUser) return;
    try {
      await pushToFirestore(this.currentUser.uid, state);
      this.syncStatus = 'synced';
      this.notify();
    } catch (err) {
      console.error('[CashPlus] Direct push error:', err);
      this.syncStatus = 'error';
      this.notify();
    }
  }

  triggerCloudSync() {
    if (!this.currentUser) return;
    this.syncStatus = 'syncing';
    this.notify();

    clearTimeout(this._syncThrottle);
    this._syncThrottle = setTimeout(async () => {
      if (!this.currentUser) return;
      try {
        await pushToFirestore(this.currentUser.uid, db.state);
        this.syncStatus = 'synced';
        this.notify();
      } catch (e) {
        this.syncStatus = 'error';
        this.notify();
      }
    }, 800);
  }

  // ── Public Auth Methods ──────────────────────────────────────────────────
  async signInWithGoogle() {
    this.syncStatus = 'syncing';
    this.notify();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      this.syncStatus = this.currentUser ? 'synced' : 'offline';
      this.notify();
      throw this._humanizeError(err);
    }
  }

  async signInWithEmail(email, password) {
    this.syncStatus = 'syncing';
    this.notify();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      this.syncStatus = this.currentUser ? 'synced' : 'offline';
      this.notify();
      throw this._humanizeError(err);
    }
  }

  async signUpWithEmail(email, password, displayName, gender = 'none') {
    this.syncStatus = 'syncing';
    this.notify();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      let photoURL = '';
      if (gender === 'male') {
        photoURL = `https://api.dicebear.com/7.x/notionists/svg?seed=Felix_${encodeURIComponent(displayName || email)}&backgroundColor=b6e3f4`;
      } else if (gender === 'female') {
        photoURL = `https://api.dicebear.com/7.x/notionists/svg?seed=Aneka_${encodeURIComponent(displayName || email)}&backgroundColor=ffdfbf`;
      } else {
        // Default Penguin avatar
        photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=Penguin_${encodeURIComponent(displayName || email)}&backgroundColor=c0aede`;
      }

      await updateProfile(cred.user, {
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL
      });

      // Update state userProfile immediately
      db.state.settings.userProfile = {
        name: displayName || email.split('@')[0],
        gender: gender,
        role: ''
      };
      await pushToFirestore(cred.user.uid, db.state);
    } catch (err) {
      this.syncStatus = this.currentUser ? 'synced' : 'offline';
      this.notify();
      throw this._humanizeError(err);
    }
  }

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('[CashPlus] Sign-out error:', err);
    }
  }

  // ── Error Messages in Arabic ─────────────────────────────────────────────
  _humanizeError(err) {
    const map = {
      'auth/user-not-found':         'البريد الإلكتروني غير مسجّل، يرجى إنشاء حساب.',
      'auth/wrong-password':         'كلمة المرور غير صحيحة، حاول مجدداً.',
      'auth/email-already-in-use':   'هذا البريد الإلكتروني مسجّل مسبقاً.',
      'auth/weak-password':          'كلمة المرور ضعيفة جداً، استخدم 6 خانات على الأقل.',
      'auth/invalid-email':          'تنسيق البريد الإلكتروني غير صحيح.',
      'auth/popup-closed-by-user':   'تم إغلاق نافذة تسجيل الدخول، حاول مجدداً.',
      'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت.',
      'auth/too-many-requests':      'محاولات كثيرة جداً، الرجاء الانتظار قليلاً.',
      'auth/invalid-credential':     'البيانات غير صحيحة، تحقق من البريد وكلمة المرور.',
      'permission-denied':           'قواعد بيانات Firestore تمنع الكتابة. يرجى تفعيل قواعد القراءة والكتابة في Firebase Console.',
    };
    const msg = map[err.code] || `خطأ: ${err.message}`;
    return new Error(msg);
  }

  // ── Subscriber Pattern ───────────────────────────────────────────────────
  subscribe(listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn({ user: this.currentUser, status: this.syncStatus }); } catch {}
    });
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────
export const cloudAuth = new CloudAuthManager();

// ─── Auto-push when local DB changes ─────────────────────────────────────────
db.subscribe(() => {
  if (cloudAuth.currentUser) {
    cloudAuth.pushImmediate(db.state);
  }
});

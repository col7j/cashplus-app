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

// ─── Firestore Helpers ───────────────────────────────────────────────────────
function userDocRef(uid) {
  return doc(firestore, 'users', uid, 'data', 'financialState');
}

async function pushToFirestore(uid, state) {
  try {
    await setDoc(userDocRef(uid), {
      ...state,
      _syncedAt: serverTimestamp(),
      _version: 2
    }, { merge: false });
  } catch (err) {
    console.error('[CashPlus] Firestore write error:', err);
  }
}

async function pullFromFirestore(uid) {
  try {
    const snap = await getDoc(userDocRef(uid));
    if (snap.exists()) {
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
    this.currentUser  = null;
    this.syncStatus   = 'offline'; // 'offline' | 'syncing' | 'synced' | 'error'
    this.listeners    = [];
    this._unsubSnap   = null;      // Firestore real-time listener unsubscribe
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

    // Pull cloud data first (cloud wins over local if cloud has data)
    const cloudData = await pullFromFirestore(this.currentUser.uid);
    if (cloudData && cloudData.transactions) {
      db.save(cloudData);
    } else {
      // First login — push local data to cloud
      await pushToFirestore(this.currentUser.uid, db.state);
    }

    // Start real-time listener for this user's document
    this._startRealtimeSync();

    this.syncStatus = 'synced';
    this.notify();
  }

  _onUserSignedOut() {
    this._stopRealtimeSync();
    this.currentUser = null;
    this.syncStatus  = 'offline';
    // Strict Privacy: clear all financial data from browser memory and localStorage
    db.resetToEmptyState();
    this.notify();
  }

  // ── Real-time Firestore Listener ─────────────────────────────────────────
  _startRealtimeSync() {
    this._stopRealtimeSync();
    if (!this.currentUser) return;

    this._unsubSnap = onSnapshot(
      userDocRef(this.currentUser.uid),
      { includeMetadataChanges: false },
      (snap) => {
        if (snap.exists() && !snap.metadata.hasPendingWrites) {
          const data = snap.data();
          delete data._syncedAt;
          delete data._version;
          // Update local DB silently (without triggering another push loop)
          db.saveQuiet(data);
        }
      },
      (err) => {
        console.warn('[CashPlus] Firestore snapshot error:', err);
        this.syncStatus = 'error';
        this.notify();
      }
    );
  }

  _stopRealtimeSync() {
    if (this._unsubSnap) {
      this._unsubSnap();
      this._unsubSnap = null;
    }
  }

  // ── Outbound Sync (Local → Cloud, throttled 1.5s) ────────────────────────
  triggerCloudSync() {
    if (!this.currentUser) return;

    this.syncStatus = 'syncing';
    this.notify();

    clearTimeout(this._syncThrottle);
    this._syncThrottle = setTimeout(async () => {
      await pushToFirestore(this.currentUser.uid, db.state);
      this.syncStatus = 'synced';
      this.notify();
    }, 1500);
  }

  // ── Public Auth Methods ──────────────────────────────────────────────────
  async signInWithGoogle() {
    this.syncStatus = 'syncing';
    this.notify();
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged handles the rest
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

  async signUpWithEmail(email, password, displayName) {
    this.syncStatus = 'syncing';
    this.notify();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
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
  cloudAuth.triggerCloudSync();
});

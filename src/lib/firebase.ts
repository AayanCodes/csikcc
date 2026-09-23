import { initializeApp, getApps } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigFromJson from '../../firebase-applet-config.json';

// Read Firebase configuration from VITE_* environment variables, with fallback to firebase-applet-config.json
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFromJson.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFromJson.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFromJson.projectId || 'rock-dahlia-c98sv',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFromJson.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFromJson.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFromJson.appId || '',
};

export const FIRESTORE_DATABASE_ID =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  firebaseConfigFromJson.firestoreDatabaseId ||
  'ai-studio-collegelivequizp-ae986150-8e51-485d-ab2e-a4a61e8f651d';

// Single Firebase app instance
export const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

// Export Firestore database initialized with long polling to prevent iframe / proxy disconnects
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: true,
      },
      FIRESTORE_DATABASE_ID
    );
  } catch {
    return getFirestore(app, FIRESTORE_DATABASE_ID);
  }
})();

// Auth instance
export const auth = getAuth(app);

// Firestore error helper as required by skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test as mandated by firebase skill
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client reported offline or connecting in background.');
    }
  }
}

// Database connectivity verification for admin health-check
export async function testFirestoreConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const testDocRef = doc(db, 'test', 'health_check_' + Date.now());
    await setDoc(testDocRef, { timestamp: Date.now(), status: 'connected' });
    const snap = await getDocFromServer(testDocRef);
    if (!snap.exists()) {
      throw new Error('Test record was not read back successfully.');
    }
    // Clean up temporary test record
    await deleteDoc(testDocRef);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Firestore connection check failed:', msg);
    return { success: false, error: msg };
  }
}

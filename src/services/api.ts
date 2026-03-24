import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Car, Booking, Settings, User } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const settingsService = {
  get: async (): Promise<Settings> => {
    const path = 'settings/global';
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Settings;
      }
      // Default settings if none exist
      const defaultSettings: Settings = {
        id: 'global',
        email: 'info@driveselect.com',
        phone: '+1234567890',
        whatsapp: '1234567890',
        address: '123 Luxury St, Dubai, UAE',
        addressAr: '123 شارع الفخامة، دبي، الإمارات',
        logo: '',
        favicon: '',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      throw error;
    }
  },
  update: async (settings: Partial<Settings>): Promise<Settings> => {
    const path = 'settings/global';
    try {
      const docRef = doc(db, path);
      const updateData = { ...settings, updatedAt: new Date().toISOString() };
      await updateDoc(docRef, updateData);
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as Settings;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },
};

export const carService = {
  getAll: async (): Promise<Car[]> => {
    const path = 'cars';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  },
  create: async (car: Partial<Car>): Promise<Car> => {
    const path = 'cars';
    try {
      const carData = { ...car, createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, path), carData);
      return { id: docRef.id, ...carData } as Car;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },
  update: async (id: string, car: Partial<Car>): Promise<Car> => {
    const path = `cars/${id}`;
    try {
      const docRef = doc(db, 'cars', id);
      await updateDoc(docRef, car);
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as Car;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    const path = `cars/${id}`;
    try {
      await deleteDoc(doc(db, 'cars', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },
};

export const cityService = {
  getAll: async (): Promise<string[]> => {
    const path = 'cities';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => doc.data().name);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  },
  create: async (name: string): Promise<string> => {
    const path = 'cities';
    try {
      await addDoc(collection(db, path), { name });
      return name;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },
  delete: async (name: string): Promise<void> => {
    const path = 'cities';
    try {
      const q = query(collection(db, path), where('name', '==', name));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, path, d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },
};

export const bookingService = {
  getAll: async (): Promise<Booking[]> => {
    const path = 'bookings';
    try {
      const querySnapshot = await getDocs(query(collection(db, path), orderBy('createdAt', 'desc')));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  },
  create: async (booking: Partial<Booking>): Promise<Booking> => {
    const path = 'bookings';
    try {
      const bookingData = { ...booking, createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, path), bookingData);
      return { id: docRef.id, ...bookingData } as Booking;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },
  updateStatus: async (id: string, status: string): Promise<Booking> => {
    const path = `bookings/${id}`;
    try {
      const docRef = doc(db, 'bookings', id);
      await updateDoc(docRef, { status });
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as Booking;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },
};

export const adminService = {
  login: async (credentials: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;
      
      // Check if user is admin in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        await signOut(auth);
        throw new Error('Unauthorized: Admin access required');
      }
      
      return { uid: user.uid, email: user.email, role: 'admin' };
    } catch (error) {
      throw error;
    }
  },
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user exists in Firestore, if not create them as admin if it's the default email
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const role = user.email === 'devhamada300@gmail.com' ? 'admin' : 'user';
        const userData: User = {
          uid: user.uid,
          email: user.email!,
          role: role as 'admin' | 'user'
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        
        if (role !== 'admin') {
          await signOut(auth);
          throw new Error('Unauthorized: Admin access required');
        }
        return userData;
      }

      if (userDoc.data().role !== 'admin') {
        await signOut(auth);
        throw new Error('Unauthorized: Admin access required');
      }

      return { uid: user.uid, email: user.email, role: 'admin' };
    } catch (error) {
      throw error;
    }
  },
  register: async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        role: 'admin' // In this app, registration creates an admin
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    await signOut(auth);
  },
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

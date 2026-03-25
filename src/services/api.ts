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
  signInWithPopup,
  getAuth,
  initializeAuth,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { db, auth } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';
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
        heroImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2000',
        ctaImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2000',
        experienceImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000',
        currency: 'USD',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
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
  getById: async (id: string): Promise<Car | null> => {
    const path = 'cars';
    try {
      const docSnap = await getDoc(doc(db, path, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Car;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
      return null;
    }
  },
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

export const userService = {
  getAll: async (): Promise<User[]> => {
    const path = 'users';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  },
  update: async (uid: string, data: Partial<User>): Promise<User> => {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, data);
      const updatedSnap = await getDoc(docRef);
      return { uid: updatedSnap.id, ...updatedSnap.data() } as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },
  delete: async (uid: string): Promise<void> => {
    const path = `users/${uid}`;
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },
  createStaff: async (data: any): Promise<User> => {
    // To create a user without logging out the current admin, we use a secondary Firebase app
    const secondaryAppName = `secondary-app-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
      const user = userCredential.user;
      
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        role: data.role || 'staff',
        permissions: data.permissions || []
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Clean up secondary app
      await secondaryAuth.signOut();
      // Note: Firebase JS SDK doesn't have a direct "deleteApp" in all versions, 
      // but signing out and letting it be garbage collected is usually fine for this context.
      
      return userData;
    } catch (error) {
      throw error;
    }
  },
};

export const adminService = {
  login: async (credentials: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;
      
      // Check if user is admin or staff in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || (userDoc.data().role !== 'admin' && userDoc.data().role !== 'staff')) {
        await signOut(auth);
        throw new Error('Unauthorized: Admin or Staff access required');
      }
      
      return { uid: user.uid, email: user.email, ...userDoc.data() } as User;
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
          role: role as 'admin' | 'user',
          permissions: role === 'admin' ? ['manage_fleet', 'manage_bookings', 'manage_cities', 'manage_settings', 'manage_staff'] : []
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        
        if (role !== 'admin') {
          await signOut(auth);
          throw new Error('Unauthorized: Admin access required');
        }
        return userData;
      }
 
      if (userDoc.data().role !== 'admin' && userDoc.data().role !== 'staff') {
        await signOut(auth);
        throw new Error('Unauthorized: Admin or Staff access required');
      }
 
      return { uid: user.uid, email: user.email, ...userDoc.data() } as User;
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    await signOut(auth);
  },
  getCurrentUser: () => {
    return auth.currentUser;
  },
  updateEmail: async (newEmail: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    try {
      await updateEmail(user, newEmail);
      // Update Firestore document as well
      await updateDoc(doc(db, 'users', user.uid), { email: newEmail });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('REAUTHENTICATION_REQUIRED');
      }
      throw error;
    }
  },
  updatePassword: async (newPassword: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    try {
      await updatePassword(user, newPassword);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('REAUTHENTICATION_REQUIRED');
      }
      throw error;
    }
  },
  reauthenticate: async (password: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');
    
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Listen to user document in Firestore
        const unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email!, ...docSnap.data() } as User);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching user doc:', error);
          setLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const isAdmin = user?.role === 'admin';

  const hasPermission = (permission: string) => {
    if (isAdmin) return true;
    if (user?.role === 'staff' && user.permissions) {
      return user.permissions.includes(permission);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

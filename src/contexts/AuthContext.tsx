import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../hooks/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Ensure app leaves private area even if not authenticated with Firebase
      setUser(null);
    }
  };

  const loginWithPhone = async (phone: string) => {
    const mockUser = {
      uid: `phone_${phone}`,
      displayName: 'Phone User',
      email: null,
      phoneNumber: phone,
    } as User;
    
    setUser(mockUser);
  };

  const value = {
    user,
    loading,
    logout,
    loginWithPhone,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
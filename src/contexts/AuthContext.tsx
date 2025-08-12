import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/auth";
import { tokenStorage, setUnauthorizedHandler } from "../services/http";
import type { Me } from "../types/api";

interface AuthContextType {
  user: Me | null;
  loading: boolean;
  logout: () => Promise<void>;
  requestPhoneCode: (phone: string) => Promise<{ sent: boolean; code: string }>;
  verifyPhoneCode: (
    phone: string,
    code: string,
    name?: string
  ) => Promise<void>;
  onboardingRequired: boolean;
  reloadMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          const me = await authService.me();
          setUser(me);
        }
      } catch {
        await tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    })();
    setUnauthorizedHandler(async () => {
      try {
        await tokenStorage.clear();
      } finally {
        setUser(null);
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setUser(null);
    }
  };

  const requestPhoneCode = (phone: string) =>
    authService.requestPhone({ phone });
  const verifyPhoneCode = async (
    phone: string,
    code: string,
    name?: string
  ) => {
    await authService.verifyPhone({ phone, code, name });
    const me = await authService.me();
    setUser(me);
  };

  const reloadMe = async () => {
    const me = await authService.me();
    setUser(me);
  };

  const onboardingRequired = !!user && (
    user.hasInterests === false ||
    user.needsOnboarding === true ||
    user.hasCompletedInterests === false ||
    user.hasCompletedQuiz === false ||
    user.radiusMiles == null ||
    user.currentLat == null ||
    user.currentLng == null
  );

  const value = {
    user,
    loading,
    logout,
    requestPhoneCode,
    verifyPhoneCode,
    onboardingRequired,
    reloadMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

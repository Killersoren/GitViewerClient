import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
};

type AuthInfo = {
  isLoggedIn: boolean;
  username?: string;
  userId?: string;
  role?: string;
};

type AuthContextType = {
  auth: AuthInfo;
  setAuth: (auth: AuthInfo) => void;
  setAuthFromToken: (token: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthInfo>({ isLoggedIn: false });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const setAuthFromToken = (accessToken: string) => {

    localStorage.setItem("accessToken", accessToken);

    const decoded = jwtDecode<JwtPayload>(accessToken);
    setAuth(
      {
      isLoggedIn: true,
      username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      userId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    });
  };

  useEffect(() => {
    api.post('/api/Auth/refresh-token')
      .then((res) => {
        const token = res.data.accessToken;
        setAuthFromToken(token);
      })
      .catch(() => {
        setAuth({ isLoggedIn: false });
      });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, setAuthFromToken, isProcessing, setIsProcessing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

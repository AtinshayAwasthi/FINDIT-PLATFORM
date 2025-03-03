
import React, { createContext, useContext, useEffect } from 'react';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authService = useAuthService();

  // Set up axios interceptor for token
  useEffect(() => {
    if (authService.token) {
      authService.checkAuth().catch(error => {
        console.error("Auth initialization failed:", error);
      });
    } else {
      // If no token, just update loading state
      authService.checkAuth().catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider value={authService}>
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

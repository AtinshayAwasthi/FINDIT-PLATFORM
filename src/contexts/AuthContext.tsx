
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authService = useAuthService();
  const [initialized, setInitialized] = useState(false);

  // Initialize authentication state when component mounts
  useEffect(() => {
    console.log('AuthProvider initializing');
    const initAuth = async () => {
      try {
        if (authService.token) {
          // If we have a token, validate it
          await authService.checkAuth();
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Error already handled in checkAuth
      } finally {
        setInitialized(true);
        console.log('Auth initialization complete');
      }
    };

    initAuth();
  }, []);

  // Show a loading state while we initialize auth
  if (!initialized && authService.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Loading authentication...</span>
      </div>
    );
  }

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

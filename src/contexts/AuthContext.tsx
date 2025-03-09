
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, phoneNumber: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phoneNumber: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  googleAuth: (name: string, email: string, googleId: string, phoneNumber: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface Window {
    onGoogleLibraryLoad: () => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!token;

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          await checkAuth();
        } catch (error) {
          console.error("Auth initialization failed:", error);
          handleAuthError();
        }
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthError = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Auth check failed:", error);
      handleAuthError();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, phoneNumber: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email, phoneNumber }); // Debug log

      const response = await api.post('/api/auth/login', { 
        email, 
        password,
        phoneNumber
      });

      console.log('Login response:', response.data); // Debug log

      const { token: authToken, user: userData } = response.data;
      
      if (!authToken || !userData) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      setToken(authToken);
      setUser(userData);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, phoneNumber: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        phoneNumber
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { message } = response.data;
      
      toast({
        title: "Account created!",
        description: message || "You have successfully signed up. Please verify your email.",
      });
      navigate('/login?registered=true');
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error.response?.data?.message || 
                     error.message || 
                     "Signup failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async (name: string, email: string, googleId: string, phoneNumber: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/google-auth', {
        name,
        email,
        googleId,
        phoneNumber
      });

      const { token: authToken, user: userData, message } = response.data;
      
      // If we have a token and user data, it means the user is already verified and can log in
      if (authToken && userData) {
        localStorage.setItem('token', authToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        setToken(authToken);
        setUser(userData);
        
        toast({
          title: "Welcome!",
          description: "You have successfully logged in with Google.",
        });
        
        navigate('/');
      } else {
        // If we don't have a token, it means the user needs to verify their email
        toast({
          title: "Google Sign-Up Successful",
          description: message || "Please verify your email before logging in.",
        });
        
        navigate('/login?registered=true');
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      const message = error.response?.data?.message || 
                     error.message || 
                     "Google authentication failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/resend-verification', { email });
      
      toast({
        title: "Email Sent",
        description: response.data.message || "Verification email has been resent to your email address.",
      });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      const message = error.response?.data?.message || 
                     error.message || 
                     "Failed to resend verification email. Please try again.";
      toast({
        variant: "destructive",
        title: "Email Not Sent",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      isLoading, 
      login, 
      signup, 
      logout,
      checkAuth,
      googleAuth,
      resendVerificationEmail
    }}>
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

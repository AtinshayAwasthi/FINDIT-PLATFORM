
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { User, AuthState } from '@/types/auth';

export const useAuthService = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true
  });
  const navigate = useNavigate();

  // Google Auth initialization
  useEffect(() => {
    // Load Google Sign-In API
    const loadGoogleAuth = async () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      window.onGoogleLibraryLoad = initializeGoogleSignIn;
    };
    
    loadGoogleAuth();
  }, []);
  
  const initializeGoogleSignIn = () => {
    // This will be called when the Google library is loaded
    console.log('Google Sign-In initialized');
  };

  const updateAuthState = (user: User | null, token: string | null, isLoading: boolean = false) => {
    const isAuthenticated = !!user && !!token && user.isEmailVerified;
    setState({ user, token, isAuthenticated, isLoading });
    
    // Update axios headers
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  const handleAuthError = () => {
    updateAuthState(null, null);
  };

  const checkAuth = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Only attempt to check auth if we have a token
      if (!state.token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }
      
      const response = await api.get('/api/auth/me');
      updateAuthState(response.data.user, state.token, false);
      return response.data.user;
    } catch (error) {
      console.error("Auth check failed:", error);
      handleAuthError();
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string, phoneNumber: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      console.log('Attempting login with:', { email, phoneNumber });

      const response = await api.post('/api/auth/login', { 
        email, 
        password,
        phoneNumber
      });

      console.log('Login response:', response.data);

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      // Get token and user from response
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Missing token or user in response');
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        toast({
          variant: "destructive",
          title: "Email Not Verified",
          description: "Please verify your email before logging in. Check your inbox for the verification link.",
        });
        
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }

      // Update auth state with user and token
      updateAuthState(user, token, false);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      navigate('/');
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const googleLogin = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // This would be integrated with Google OAuth
      // For now, we'll mock a successful Google login
      console.log('Google login attempted');
      
      const response = await api.post('/api/auth/google-login');
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Missing token or user in response');
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        toast({
          variant: "destructive",
          title: "Email Not Verified",
          description: "Please verify your email before logging in. Check your inbox for the verification link.",
        });
        
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }

      updateAuthState(user, token, false);
      
      toast({
        title: "Welcome!",
        description: "You have successfully logged in with Google.",
      });
      
      navigate('/');
      return user;
    } catch (error: any) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || "Google login failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signup = async (name: string, email: string, password: string, phoneNumber: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
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
      
      // Don't update auth state yet since email needs verification
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before logging in.",
      });
      navigate('/login');
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
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const verifyEmail = async (token: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/api/auth/verify-email', { token });
      
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified. You can now log in.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Email verification error:', error);
      const message = error.response?.data?.message || 
                    error.message || 
                    "Email verification failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: message,
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resendVerification = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await api.post('/api/auth/resend-verification', { email });
      
      toast({
        title: "Verification email sent!",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      const message = error.response?.data?.message || 
                    error.message || 
                    "Failed to resend verification email. Please try again.";
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: message,
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    updateAuthState(null, null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate('/');
  };

  return {
    ...state,
    login,
    googleLogin,
    signup,
    logout,
    checkAuth,
    verifyEmail,
    resendVerification
  };
};

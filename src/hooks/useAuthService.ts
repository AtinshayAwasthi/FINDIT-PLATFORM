
import { useState } from 'react';
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

  const updateAuthState = (user: User | null, token: string | null, isLoading: boolean = false) => {
    const isAuthenticated = !!user && !!token;
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

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      console.log('Attempting login with:', { email }); // Debug log

      const response = await api.post('/api/auth/login', { 
        email, 
        password 
      });

      console.log('Login response:', response.data); // Debug log

      // Extract token and user directly from response.data
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Update auth state with the user and token from response
      updateAuthState(user, token, false);
      
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
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const { token, user } = response.data;
      
      updateAuthState(user, token, false);
      
      toast({
        title: "Account created!",
        description: "You have successfully signed up.",
      });
      navigate('/');
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
    signup,
    logout,
    checkAuth
  };
};


export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, phoneNumber: string) => Promise<User | null>;
  googleLogin: () => Promise<User | null>;
  signup: (name: string, email: string, password: string, phoneNumber: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<User | null>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<void>;
}

// Add the Google callback type to Window
declare global {
  interface Window {
    onGoogleLibraryLoad?: () => void;
    google?: any;
  }
}

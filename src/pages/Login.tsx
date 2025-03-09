
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, ArrowRight, PhoneIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isLoading, googleAuth, resendVerificationEmail } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [showRegisteredAlert, setShowRegisteredAlert] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      phoneNumber: '',
    },
  });

  // Check for URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const verified = searchParams.get('verified');
    const registered = searchParams.get('registered');
    
    if (verified === 'true') {
      setShowVerificationAlert(true);
    }
    
    if (registered === 'true') {
      setShowRegisteredAlert(true);
    }
  }, [location]);

  // Initialize Google Sign-In
  useEffect(() => {
    // Load the Google API script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });
        setIsGoogleReady(true);
      }
    };

    // Define the callback function for when Google Sign-In completes
    window.onGoogleLibraryLoad = initializeGoogleSignIn;

    loadGoogleScript();

    // Cleanup function
    return () => {
      // Remove Google script if it exists
      const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (googleScript) {
        document.body.removeChild(googleScript);
      }
    };
  }, []);

  // Render Google Sign-In button when ready
  useEffect(() => {
    if (isGoogleReady && window.google) {
      const googleButtonContainer = document.getElementById('google-signin-button');
      if (googleButtonContainer) {
        window.google.accounts.id.renderButton(googleButtonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '280',
        });
      }
    }
  }, [isGoogleReady]);

  const handleGoogleSignIn = async (response: any) => {
    try {
      const { credential } = response;
      
      // Decode the JWT token from Google
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      // Get information from the Google token
      const { name, email, sub: googleId } = payload;
      
      // Open a modal to collect phone number
      const phoneNumber = prompt('Please enter your phone number:');
      
      if (!phoneNumber) {
        return; // User cancelled
      }
      
      // Call the googleAuth function with user info and phone number
      await googleAuth(name, email, googleId, phoneNumber);
      
    } catch (error) {
      console.error('Google Sign-In error:', error);
      form.setError('root', { 
        message: 'Google sign-in failed. Please try again or use email login.'
      });
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password, values.phoneNumber);
    } catch (error: any) {
      // Check if this is an email verification error
      if (error.response?.data?.message?.includes('not verified')) {
        // Show resend verification option
        const shouldResend = confirm('Your email is not verified. Would you like to resend the verification email?');
        if (shouldResend) {
          handleResendVerification(values.email);
        }
      }
      console.error('Login error', error);
    }
  };

  const handleResendVerification = async (email: string) => {
    setResendingEmail(true);
    try {
      await resendVerificationEmail(email);
    } catch (error) {
      console.error('Resend verification error', error);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-bold mb-3">Welcome Back</h1>
            <p className="text-foreground/70">
              Sign in to your FindIt account to manage your items
            </p>
          </motion.div>
          
          {showVerificationAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Email Verified!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your email has been successfully verified. You can now log in.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {showRegisteredAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertCircleIcon className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Check Your Email</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Please check your email to verify your account before logging in.
                  <Button 
                    variant="link" 
                    className="text-blue-600 p-0 h-auto font-normal"
                    onClick={() => handleResendVerification(form.getValues().email)}
                    disabled={resendingEmail || !form.getValues().email}
                  >
                    {resendingEmail ? "Sending..." : "Resend verification email"}
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm"
          >
            {/* Google Sign-In Button */}
            <div className="mb-6 flex flex-col items-center">
              <div id="google-signin-button" className="w-full flex justify-center mb-4"></div>
              
              <div className="w-full flex items-center mt-2 mb-4">
                <div className="flex-grow h-px bg-border"></div>
                <span className="px-4 text-xs text-muted-foreground">OR</span>
                <div className="flex-grow h-px bg-border"></div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="tel" 
                            placeholder="+1 (555) 123-4567" 
                            {...field} 
                          />
                          <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 h-5 w-5" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="text-center text-sm text-foreground/70">
                  <p>
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      Sign up 
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="py-8 px-6 md:px-10 bg-secondary border-t border-border text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} FindIt. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;

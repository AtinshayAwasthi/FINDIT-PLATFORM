
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, ArrowRight, PhoneIcon } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

// Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const { signup, isLoading, googleAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const location = useLocation();
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

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
          text: 'signup_with',
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
      const phoneNumber = prompt('Please enter your phone number to complete Google sign-up:');
      
      if (!phoneNumber) {
        return; // User cancelled
      }
      
      // Call the googleAuth function with user info and phone number
      await googleAuth(name, email, googleId, phoneNumber);
      
    } catch (error) {
      console.error('Google Sign-In error:', error);
      form.setError('root', { 
        message: 'Google sign-in failed. Please try again or use email signup.'
      });
    }
  };

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await signup(values.name, values.email, values.password, values.phoneNumber);
    } catch (error) {
      // Error is handled in the AuthContext
      console.error('Signup error', error);
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
            <h1 className="text-3xl font-bold mb-3">Create an Account</h1>
            <p className="text-foreground/70">
              Join FindIt to report lost or found items and help others
            </p>
          </motion.div>
          
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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
                
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-4">
                    By signing up, you agree to our Terms of Service and Privacy Policy. 
                    You will receive a verification email to complete your registration.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                
                <div className="text-center text-sm text-foreground/70">
                  <p>
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      Sign in
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

export default Signup;

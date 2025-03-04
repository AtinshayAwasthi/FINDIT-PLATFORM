
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const token = searchParams.get('token');
  
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }
      
      try {
        const result = await verifyEmail(token);
        setIsSuccess(result);
      } catch (error) {
        setIsSuccess(false);
        console.error('Verification error:', error);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verify();
  }, [token, verifyEmail]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-xl p-8 shadow-sm text-center"
          >
            {isVerifying ? (
              <div className="py-10">
                <MailCheck className="h-16 w-16 mx-auto text-primary animate-pulse" />
                <h2 className="text-2xl font-bold mt-6">Verifying Your Email</h2>
                <p className="mt-2 text-foreground/70">
                  Please wait while we verify your email address...
                </p>
              </div>
            ) : isSuccess ? (
              <div className="py-10">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <h2 className="text-2xl font-bold mt-6">Email Verified!</h2>
                <p className="mt-2 text-foreground/70">
                  Your email has been successfully verified. You can now log in to your account.
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="mt-6"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="py-10">
                <XCircle className="h-16 w-16 mx-auto text-destructive" />
                <h2 className="text-2xl font-bold mt-6">Verification Failed</h2>
                <p className="mt-2 text-foreground/70">
                  {!token 
                    ? "No verification token was provided." 
                    : "We couldn't verify your email address. The link may be expired or invalid."}
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="mt-6"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default EmailVerification;


import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Lost Items', path: '/items?type=lost' },
    { name: 'Found Items', path: '/items?type=found' },
    { name: 'Report Item', path: '/report' },
  ];
  
  return (
    <>
      <nav 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-6 md:px-10 transition-all duration-300',
          isScrolled ? 'py-4 bg-white/80 backdrop-blur-md shadow-sm dark:bg-black/20' : 'py-6'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-medium flex items-center gap-2"
          >
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-primary text-3xl font-bold"
            >
              🔍
            </motion.div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">FindIt</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'relative text-foreground/80 hover:text-foreground transition-colors py-2',
                  location.pathname === link.path && 'text-primary font-medium'
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors py-2"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/90 text-white rounded-md hover:bg-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 bg-background border-b border-border z-40 py-4 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-4">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'py-2 px-4 rounded-md transition-colors',
                    location.pathname === link.path 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground/80 hover:bg-secondary'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="py-2 px-4 flex items-center gap-2 rounded-md text-foreground/80 hover:bg-secondary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2 px-4 flex items-center gap-2 bg-destructive/90 text-white rounded-md hover:bg-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;

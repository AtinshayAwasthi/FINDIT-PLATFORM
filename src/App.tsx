
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Items from '@/pages/Items';
import Report from '@/pages/Report';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import EmailVerification from '@/pages/EmailVerification';
import './App.css';

function App() {
  // Adding a console log to help debug render issues
  console.log('App component rendering');
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/items" element={
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

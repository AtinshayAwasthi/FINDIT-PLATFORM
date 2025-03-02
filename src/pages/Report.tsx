
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ReportForm from '@/components/ReportForm';

const Report = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'lost';
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              {type === 'lost' 
                ? 'Fill out the form below with as much detail as possible to help others identify your lost item.'
                : 'Thank you for taking the time to report a found item. Please provide as much information as possible.'}
            </p>
          </motion.div>
          
          <ReportForm />
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="py-8 px-6 md:px-10 bg-secondary border-t border-border text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} RetrieverHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Report;

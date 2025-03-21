
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsVisible(true);
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] },
    },
  };

  return (
    <div ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-10 pb-20 pt-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl"></div>
      </div>
      
      {/* Hero content */}
      <motion.div
        className="max-w-5xl mx-auto text-center relative z-10"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm"
        >
          Reuniting people with their lost possessions
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
        >
          Lost something?
          <span className="block md:inline"> We'll help you </span>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FindIt ...
          </span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-foreground/80"
        >
          FindIt connects people who have lost items with those who have found them.
          Our intuitive platform makes the process simple and efficient.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/report"
            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
          >
            Report an Item
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to="/items?type=lost"
            className="px-8 py-4 bg-secondary hover:bg-secondary/70 text-foreground rounded-lg font-medium transition-all"
          >
            Browse Lost Items
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Floating objects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
        >
          🔑
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 left-1/5 w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl"
          animate={{ y: [0, -15, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
        >
          📱
        </motion.div>
        
        <motion.div 
          className="absolute top-1/3 left-1/4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl"
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
        >
          👜
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;


import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Flag, LocateFixed, Check } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ItemCard, { ItemCardProps } from '@/components/ItemCard';

const Index = () => {
  // Sample data for demonstration
  const featuredItems: ItemCardProps[] = [
    {
      id: '1',
      title: 'iPhone 14 Pro - Space Black',
      description: 'Lost in Central Park near the boathouse. Has a distinctive blue case with star patterns.',
      type: 'lost',
      location: 'Central Park, New York',
      date: 'April 12, 2023',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop',
    },
    {
      id: '2',
      title: 'Gold Ring with Diamond',
      description: 'Found at Lincoln Center after the evening performance. Small diamond in the center.',
      type: 'found',
      location: 'Lincoln Center, New York',
      date: 'April 15, 2023',
      category: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop',
    },
    {
      id: '3',
      title: 'Brown Leather Wallet',
      description: 'Lost at Times Square subway station. Contains ID cards and some cash.',
      type: 'lost',
      location: 'Times Square, New York',
      date: 'April 10, 2023',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop',
    },
  ];
  
  const features = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: 'Easy Search',
      description: 'Quickly search through thousands of items to find what you\'re looking for.',
    },
    {
      icon: <LocateFixed className="h-10 w-10 text-primary" />,
      title: 'Location Based',
      description: 'Filter items by location to focus on a specific area where your item was lost.',
    },
    {
      icon: <Flag className="h-10 w-10 text-primary" />,
      title: 'Simple Reporting',
      description: 'Report lost or found items in minutes with our intuitive form.',
    },
    {
      icon: <Check className="h-10 w-10 text-primary" />,
      title: 'Verification System',
      description: 'Our verification process ensures that items are returned to their rightful owners.',
    },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Items Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recently Reported Items
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Browse through the most recently reported lost and found items in your area.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/items"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium group"
            >
              View All Items
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 md:px-10 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Our platform makes it simple to report lost items and connect with people who have found them.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-5 p-4 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="glass dark:glass-dark rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Lost or Found Something?
              </h2>
              <p className="text-lg mb-10 max-w-3xl mx-auto">
                Whether you've lost something valuable or found something that belongs to someone else,
                our platform can help connect you with the right person.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/report?type=lost"
                  className="px-8 py-4 bg-destructive hover:bg-destructive/90 text-white rounded-lg font-medium transition-all"
                >
                  Report Lost Item
                </Link>
                <Link
                  to="/report?type=found"
                  className="px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-all"
                >
                  Report Found Item
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 md:px-10 bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="text-xl font-medium flex items-center gap-2">
                <span className="text-primary text-2xl font-bold">⟲</span>
                <span>RetrieverHub</span>
              </Link>
              <p className="mt-2 text-sm text-foreground/60">
                Helping people find their lost belongings
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/items?type=lost" className="text-foreground/70 hover:text-foreground transition-colors">
                Lost Items
              </Link>
              <Link to="/items?type=found" className="text-foreground/70 hover:text-foreground transition-colors">
                Found Items
              </Link>
              <Link to="/report" className="text-foreground/70 hover:text-foreground transition-colors">
                Report Item
              </Link>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-border text-center text-sm text-foreground/60">
            <p>&copy; {new Date().getFullYear()} RetrieverHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

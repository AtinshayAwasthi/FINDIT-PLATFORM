
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ItemCard, { ItemCardProps } from '@/components/ItemCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const Items = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState(typeParam);
  const [items, setItems] = useState<ItemCardProps[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample data
  const sampleItems: ItemCardProps[] = [
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
    {
      id: '4',
      title: 'MacBook Pro 16-inch',
      description: 'Lost at Starbucks on 5th Avenue. Has stickers on the cover.',
      type: 'lost',
      location: '5th Avenue, New York',
      date: 'April 8, 2023',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
    },
    {
      id: '5',
      title: 'Gray Backpack',
      description: 'Found on the subway. Contains some books and a water bottle.',
      type: 'found',
      location: 'Subway Line 1, New York',
      date: 'April 14, 2023',
      category: 'Bags',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
    },
    {
      id: '6',
      title: 'Car Keys with Toyota Remote',
      description: 'Found in Bryant Park. Has a small dinosaur keychain attached.',
      type: 'found',
      location: 'Bryant Park, New York',
      date: 'April 13, 2023',
      category: 'Keys',
      image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop',
    },
    {
      id: '7',
      title: 'Prescription Glasses',
      description: 'Lost at the public library. Black frame with gold details.',
      type: 'lost',
      location: 'New York Public Library',
      date: 'April 11, 2023',
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop',
    },
    {
      id: '8',
      title: 'Blue Umbrella',
      description: 'Found at the entrance of the Empire State Building.',
      type: 'found',
      location: 'Empire State Building, New York',
      date: 'April 9, 2023',
      category: 'Other',
      image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop',
    },
    {
      id: '9',
      title: 'AirPods Pro with Case',
      description: 'Lost at the gym. Case has a small scratch on the back.',
      type: 'lost',
      location: 'Equinox Gym, New York',
      date: 'April 7, 2023',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&auto=format&fit=crop',
    },
  ];
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate API fetch
    setIsLoading(true);
    setTimeout(() => {
      setItems(sampleItems);
      setIsLoading(false);
    }, 800);
  }, []);
  
  useEffect(() => {
    setType(typeParam);
  }, [typeParam]);
  
  useEffect(() => {
    filterItems();
  }, [type, category, searchTerm, items]);
  
  const filterItems = () => {
    let filtered = [...items];
    
    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(item => item.type === type);
    }
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(filtered);
  };
  
  const handleTypeChange = (value: string) => {
    setType(value);
    setSearchParams(params => {
      if (value === 'all') {
        params.delete('type');
      } else {
        params.set('type', value);
      }
      return params;
    });
  };
  
  const categories = [
    'All Categories', 'Electronics', 'Jewelry', 'Clothing', 'Documents', 
    'Accessories', 'Bags', 'Keys', 'Pets', 'Other'
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {type === 'lost' 
                ? 'Lost Items' 
                : type === 'found' 
                  ? 'Found Items' 
                  : 'All Items'}
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              {type === 'lost' 
                ? 'Browse through reported lost items. If you found any of these, please contact the owner.'
                : type === 'found' 
                  ? 'Browse through reported found items. If you lost any of these, please contact the finder.'
                  : 'Browse through all reported lost and found items.'}
            </p>
          </motion.div>
          
          {/* Filters */}
          <div className="mb-10 p-6 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <SlidersHorizontal className="w-5 h-5" />
              <h2 className="text-lg font-medium">Filter Items</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50 w-4 h-4" />
                  <Input
                    placeholder="Search items..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Type Filter */}
              <div>
                <Select
                  value={type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="lost">Lost Items</SelectItem>
                    <SelectItem value="found">Found Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category Filter */}
              <div>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Items Grid */}
          {isLoading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-foreground/70">Loading items...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-secondary/30 rounded-xl border border-border">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium mb-2">No items found</h3>
              <p className="text-foreground/70 mb-6 text-center max-w-md">
                We couldn't find any items matching your search criteria. Try adjusting your filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCategory('all');
                  setType('all');
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
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

export default Items;

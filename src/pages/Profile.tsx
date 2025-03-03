
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, LogOut, Edit, Package, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import ItemCard, { ItemCardProps } from '@/components/ItemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('lost');
  const [items, setItems] = useState<ItemCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/items/user/${activeTab}`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching user items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserItems();
    }
  }, [user, activeTab]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-12"
          >
            <div className="bg-gradient-to-r from-primary to-accent h-32 sm:h-48"></div>
            
            <div className="p-6 md:p-8 -mt-16 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <div className="bg-background p-2 rounded-full border-4 border-background shadow-lg">
                  <div className="bg-primary/10 rounded-full h-24 w-24 flex items-center justify-center text-primary">
                    <User className="h-12 w-12" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>
                  <p className="text-foreground/70 flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 sm:flex-none" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Your Items</h2>
              <p className="text-foreground/70">
                Manage your reported lost and found items
              </p>
            </div>
            
            <Tabs defaultValue="lost" onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="lost">Lost Items</TabsTrigger>
                <TabsTrigger value="found">Found Items</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lost" className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-border rounded-xl overflow-hidden">
                        <Skeleton className="h-56 w-full" />
                        <div className="p-5 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex flex-col gap-2 pt-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                      <ItemCard key={item.id} {...item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-secondary/30 rounded-xl border border-border">
                    <Package className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No lost items reported</h3>
                    <p className="text-foreground/60 max-w-md mx-auto mb-6">
                      You haven't reported any lost items yet. If you've lost something, report it to increase your chances of finding it.
                    </p>
                    <Button asChild>
                      <a href="/report?type=lost">Report Lost Item</a>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="found" className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-border rounded-xl overflow-hidden">
                        <Skeleton className="h-56 w-full" />
                        <div className="p-5 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex flex-col gap-2 pt-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                      <ItemCard key={item.id} {...item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-secondary/30 rounded-xl border border-border">
                    <Package className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No found items reported</h3>
                    <p className="text-foreground/60 max-w-md mx-auto mb-6">
                      You haven't reported any found items yet. If you've found something, report it to help someone find their lost item.
                    </p>
                    <Button asChild>
                      <a href="/report?type=found">Report Found Item</a>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 px-6 md:px-10 bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/" className="text-xl font-medium flex items-center gap-2">
                <span className="text-primary text-2xl font-bold">🔍</span>
                <span>FindIt</span>
              </a>
              <p className="mt-2 text-sm text-foreground/60">
                Helping people find their lost belongings
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <a href="/" className="text-foreground/70 hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/items?type=lost" className="text-foreground/70 hover:text-foreground transition-colors">
                Lost Items
              </a>
              <a href="/items?type=found" className="text-foreground/70 hover:text-foreground transition-colors">
                Found Items
              </a>
              <a href="/report" className="text-foreground/70 hover:text-foreground transition-colors">
                Report Item
              </a>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-border text-center text-sm text-foreground/60">
            <p>&copy; {new Date().getFullYear()} FindIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ItemCardProps } from './ItemCard';
import { Phone, Mail, Upload, AlertTriangle, MapPin, Clock, Tag, User } from 'lucide-react';
import { api } from '@/lib/api';

const requestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  proof: z.string().min(10, { message: "Please provide detailed proof of ownership" }),
});

const reportSchema = z.object({
  reason: z.string().min(10, { message: "Please provide a detailed reason" }),
  email: z.string().email({ message: "Please enter a valid email" }),
});

interface ItemDetailsDialogProps {
  item: ItemCardProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ItemDetailsDialog = ({ item, open, onOpenChange }: ItemDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('details');

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      name: '',
      email: '',
      proof: '',
    },
  });

  const reportForm = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: '',
      email: '',
    },
  });

  const handleRequestSubmit = async (data: z.infer<typeof requestSchema>) => {
    if (!item) return;
    
    try {
      await api.post(`/api/items/${item.id}/request`, {
        ...data,
        itemId: item.id
      });
      
      toast.success("Request submitted successfully", {
        description: "We'll review your claim and contact you soon.",
      });
      requestForm.reset();
      setActiveTab('details');
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error("Failed to submit request", {
        description: "Please try again later.",
      });
    }
  };

  const handleReportSubmit = async (data: z.infer<typeof reportSchema>) => {
    if (!item) return;
    
    try {
      await api.post(`/api/items/${item.id}/report`, {
        ...data,
        itemId: item.id
      });
      
      toast.success("Report submitted successfully", {
        description: "Thank you for helping keep our platform accurate.",
      });
      reportForm.reset();
      setActiveTab('details');
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error("Failed to submit report", {
        description: "Please try again later.",
      });
    }
  };

  const handleContactUser = async (method: 'phone' | 'email') => {
    if (!item) return;
    
    try {
      const response = await api.get(`/api/items/${item.id}/contact`, {
        params: { method }
      });
      
      // Display contact info or initiate contact
      if (method === 'phone' && response.data.phone) {
        window.location.href = `tel:${response.data.phone}`;
      } else if (method === 'email' && response.data.email) {
        window.location.href = `mailto:${response.data.email}?subject=Regarding your ${item.type} item: ${item.title}`;
      }
    } catch (error) {
      console.error('Failed to get contact information:', error);
      toast.error("Failed to retrieve contact information", {
        description: "Please try again later.",
      });
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
          <DialogDescription>
            {item.type === 'lost' ? 'Lost item report' : 'Found item report'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="request">Request Item</TabsTrigger>
            <TabsTrigger value="report">Report Issue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="aspect-square w-full max-h-[300px] overflow-hidden rounded-md bg-muted">
              <img 
                src={item.image || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop'} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-muted-foreground">{item.category}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{item.location}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">{item.date}</p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleContactUser('phone')}
              >
                <Phone className="h-4 w-4" />
                Contact via Phone
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleContactUser('email')}
              >
                <Mail className="h-4 w-4" />
                Contact via Email
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="request">
            <Form {...requestForm}>
              <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-4">
                <div className="space-y-1 mb-4">
                  <h3 className="text-lg font-medium">Request This Item</h3>
                  <p className="text-sm text-muted-foreground">
                    Please provide information to prove your ownership of this item.
                  </p>
                </div>
                
                <FormField
                  control={requestForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={requestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={requestForm.control}
                  name="proof"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proof of Ownership</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the item in detail, when and where you lost it, any unique identifiers, etc." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="report">
            <Form {...reportForm}>
              <form onSubmit={reportForm.handleSubmit(handleReportSubmit)} className="space-y-4">
                <div className="space-y-1 mb-4">
                  <h3 className="text-lg font-medium">Report Incorrect Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Help us maintain accuracy by reporting any issues with this listing.
                  </p>
                </div>
                
                <FormField
                  control={reportForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Report</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please explain what information is incorrect or why this listing should be reviewed" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={reportForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Email (optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="We may contact you for more details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Submit Report
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;

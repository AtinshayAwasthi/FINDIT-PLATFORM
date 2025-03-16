import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MapPin, Upload, UploadCloud, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description cannot exceed 1000 characters'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  category: z.string().min(2, 'Please select a category'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'Please enter a valid date'),
});

const ReportForm = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'lost';
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast({
        title: "Authentication Required",
        description: "Please log in to report an item.",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG and WebP formats are supported",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const clearImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('location', values.location);
      formData.append('category', values.category);
      formData.append('date', values.date);
      formData.append('type', type);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      
      // Send the request
      const response = await api.post('/api/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Get image URL from response
      const imageUrlFromResponse = response.data.imageUrl || null;
      setImageUrl(imageUrlFromResponse);
      
      // Show success message
      toast({
        title: "Item Reported Successfully",
        description: `Your ${type} item has been reported successfully.`,
      });
      
      // Redirect to items page
      navigate(`/items?type=${type}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error Reporting Item",
        description: "There was an error reporting your item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categories = [
    'Electronics', 'Jewelry', 'Clothing', 'Accessories', 
    'Documents', 'Keys', 'Wallet/Purse', 'Bag/Backpack',
    'Pet', 'Book', 'Toy', 'Music Instrument', 'Other'
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder={`A brief description of the ${type} item`} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide details about the item, such as color, brand, distinguishing features, etc." 
                    className="min-h-32 resize-y"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <select
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      {...field}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === 'lost' ? 'When did you lose it?' : 'When did you find it?'}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {type === 'lost' ? 'Where did you lose it?' : 'Where did you find it?'}
                  <span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
                    <Input 
                      className="pl-10"
                      placeholder="Enter the location" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>Upload Image</FormLabel>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {previewImage ? (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="mx-auto max-h-48 rounded-md object-contain"
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <UploadCloud className="mx-auto h-12 w-12 text-foreground/40 mb-2" />
                  <p className="text-sm text-foreground/70 mb-2">
                    Drag and drop an image, or click to browse
                  </p>
                  <p className="text-xs text-foreground/50">
                    JPG, PNG or WebP, max 5MB
                  </p>
                </div>
              )}
              <Input
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {!previewImage && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Browse
                </Button>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              `Report ${type === 'lost' ? 'Lost' : 'Found'} Item`
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};

export default ReportForm;

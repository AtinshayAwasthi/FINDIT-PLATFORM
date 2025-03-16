
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Tag, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  date: string;
  category: string;
  image?: string;
}

const ItemCard = ({ 
  id, 
  title, 
  description, 
  type, 
  location, 
  date, 
  category, 
  image
}: ItemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Default image if none provided or error loading the provided image
  const defaultImage = `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop`;
  
  // Determine image source with fallback to default
  const imageSource = imageError || !image ? defaultImage : image;
  
  return (
    <motion.div 
      className={cn(
        "flex flex-col overflow-hidden rounded-xl transition-all duration-300 h-full", 
        "border border-border bg-card shadow-sm hover:shadow-md",
        isHovered ? "scale-[1.02]" : "scale-100"
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img 
          src={imageSource} 
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered ? "scale-110" : "scale-100"
          )}
          loading="lazy"
          onError={() => setImageError(true)}
        />
        <div 
          className={cn(
            "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
            type === 'lost' 
              ? "bg-destructive/90 text-white" 
              : "bg-accent/90 text-white"
          )}
        >
          {type === 'lost' ? 'Lost' : 'Found'}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{title}</h3>
        
        <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Tag className="w-4 h-4 flex-shrink-0" />
            <span>{category}</span>
          </div>
        </div>
      </div>
      
      <div className={cn(
        "p-4 border-t border-border bg-secondary/50",
        "flex justify-end"
      )}>
        <motion.button
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
        >
          View Details
          <ExternalLink className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ItemCard;

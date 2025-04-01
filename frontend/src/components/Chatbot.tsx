
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! I\'m FindIt assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // This simulates a response. In a real app, you'd call your API here
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(message),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple response logic - would be replaced by a real API call in production
  const getBotResponse = (msg: string): string => {
    const normalizedMessage = msg.toLowerCase();
    
    if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi')) {
      return `Hello${user ? ` ${user.name}` : ''}! How can I help you today?`;
    }
    
    if (normalizedMessage.includes('lost')) {
      return 'To report a lost item, go to the "Report Item" page and select "Lost Item". Provide as many details as possible to help others identify your item.';
    }
    
    if (normalizedMessage.includes('found')) {
      return 'If you found an item, please go to the "Report Item" page and select "Found Item". Your submission will help the owner locate their lost possession.';
    }
    
    if (normalizedMessage.includes('login') || normalizedMessage.includes('sign')) {
      return 'You can login or create an account by clicking the "Login" button in the navigation bar. If you don\'t have an account yet, you\'ll find a link to sign up on the login page.';
    }
    
    if (normalizedMessage.includes('contact') || normalizedMessage.includes('help')) {
      return 'For additional help or to contact us, please visit the "About" section or send an email to support@findit.com.';
    }
    
    return "I'm not sure how to help with that specific query. You can ask me about reporting lost or found items, account management, or how to use the FindIt platform.";
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg p-0 bg-primary hover:bg-primary/90"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[70vh] bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          >
            {/* Chat header */}
            <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-medium">FindIt Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Messages container */}
            <div className="p-4 max-h-[calc(70vh-140px)] overflow-y-auto">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] p-3 rounded-lg',
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-secondary text-secondary-foreground rounded-tl-none'
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-[10px] opacity-70 block text-right mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground rounded-lg rounded-tl-none max-w-[80%] p-3">
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Chat input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;

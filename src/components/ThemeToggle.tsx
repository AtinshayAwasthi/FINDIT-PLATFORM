
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="rounded-full w-10 h-10"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-foreground/80" />
      ) : (
        <Sun className="h-5 w-5 text-foreground/80" />
      )}
    </Button>
  );
};

export default ThemeToggle;

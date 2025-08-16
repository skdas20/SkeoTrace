import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '../store/auth';

export const Nav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDashboard = () => {
    switch (user?.role) {
      case 'PRODUCER':
        return '/producer';
      case 'RETAILER':
        return '/retailer';
      case 'CONSUMER':
        return '/consumer';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  // Don't show nav on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={getRoleDashboard()} className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">SkeoTrace</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {user.name} ({user.role})
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

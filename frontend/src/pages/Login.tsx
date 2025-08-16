import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email });
      const response = await api.login(email, password);
      console.log('Login successful:', response);
      
      login(response.token, response.user);
      
      // Navigate based on role
      const targetRoute = (() => {
        switch (response.user.role) {
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
      })();
      
      console.log('Navigating to:', targetRoute);
      navigate(targetRoute);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="font-bold text-2xl">SkeoTrace</span>
              </div>
            </div>
            <p className="text-gray-600">Farm to fork traceability</p>
          </div>        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p className="font-medium">Demo Credentials:</p>
              <div className="space-y-1">
                <p>Producer: prod@trace.local / Prod@123</p>
                <p>Retailer: shop@trace.local / Retail@123</p>
                <p>Consumer: cons@trace.local / Cons@123</p>
                <p>Admin: admin@trace.local / Admin@123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

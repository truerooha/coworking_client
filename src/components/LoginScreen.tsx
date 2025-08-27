// по-моему уже не используется

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';
import type { User } from '../App';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

// Mock users for demo - in real app this would be backend authentication
const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@company.com',
    isAdmin: false
  },
  {
    id: 'admin1',
    name: 'Sarah',
    surname: 'Admin',
    email: 'admin@company.com',
    isAdmin: true
  }
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock authentication - in real app this would be proper authentication
      const user = mockUsers.find(u => u.email === email);
      
      if (user && (password === 'password' || password === 'admin123')) {
        onLogin(user);
        toast.success(`Welcome, ${user.name}!`);
      } else {
        toast.error('Invalid credentials. Try password or admin123');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-4a1 1 0 011-1h4a1 1 0 011 1v4M7 7h.01M7 11h.01M11 7h.01M11 11h.01M15 7h.01M15 11h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Room Booking</h1>
          <p className="text-gray-600">Sign in to your workspace</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-xl font-semibold text-center">Welcome back</h2>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to access the booking system
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Demo credentials:</p>
              <div className="text-xs space-y-1">
                <p><strong>User:</strong> john.doe@company.com / password</p>
                <p><strong>Admin:</strong> admin@company.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
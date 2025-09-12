import React, { useState } from 'react';
import { useUser } from '../lib/stores/useUser';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { login, register, isLoading, error, clearError } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    let success = false;
    if (isLogin) {
      success = await login(username, password);
    } else {
      if (!displayName.trim()) {
        return;
      }
      success = await register(username, password, displayName);
    }
    
    if (success) {
      onClose();
      setUsername('');
      setPassword('');
      setDisplayName('');
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setUsername('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-gray-200 shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-4 duration-300">
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-lg -z-10"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            {isLogin ? '🎮 Login to Play' : '🚀 Create Account'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            {isLogin ? 'Login to save your high scores and compete!' : 'Create an account to track your progress'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={isLoading}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700 font-medium">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
                disabled={isLoading}
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}
          
          <div className="flex flex-col space-y-3 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg transform transition hover:scale-105"
            >
              {isLoading ? '⏳ Loading...' : (isLogin ? '🎮 Login & Play' : '🚀 Create Account')}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={switchMode}
              disabled={isLoading}
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
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
  const [displayName, setDisplayName] = useState('');
  const { login, isLoading, error, clearError } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!displayName.trim()) {
      return;
    }
    
    const success = await login(displayName);
    
    if (success) {
      onClose();
      setDisplayName('');
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-gray-200 shadow-2xl backdrop-blur-sm animate-in slide-in-from-top-4 duration-300">
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-lg -z-10"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            🎮 Enter Your Name
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            Enter your name to save your high scores and compete!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-gray-700 font-medium">Your Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name (e.g., Alex)"
              required
              disabled={isLoading}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          
          <div className="flex flex-col space-y-3 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading || !displayName.trim()} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg transform transition hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? '⏳ Loading...' : '🎮 Start Playing!'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
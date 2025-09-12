import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  score: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    displayName: string;
  };
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/leaderboard?limit=10');
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to load leaderboard');
        return;
      }
      
      setLeaderboard(data.leaderboard);
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold">{position}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </DialogTitle>
          <DialogDescription>
            Top players and their highest scores
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading leaderboard...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchLeaderboard} variant="outline" className="mt-2">
                Try Again
              </Button>
            </div>
          )}
          
          {!isLoading && !error && leaderboard.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No scores yet. Be the first to play!</p>
            </div>
          )}
          
          {!isLoading && !error && leaderboard.map((entry, index) => (
            <Card key={entry.id} className={`${index < 3 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {getRankIcon(index + 1)}
                  <div>
                    <p className="font-semibold">{entry.user.displayName}</p>
                    <p className="text-sm text-gray-600">@{entry.user.username}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant={index < 3 ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {entry.score}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
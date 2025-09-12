import React, { useState } from 'react';
import { useAudio } from '../lib/stores/useAudio';
import { useUser } from '../lib/stores/useUser';
import { AuthModal } from './AuthModal';
import { Leaderboard } from './Leaderboard';

interface GameUIProps {
  gameState: 'ready' | 'playing' | 'gameOver';
  score: number;
  highScore: number;
  onRestart: () => void;
  onStart: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  gameState,
  score,
  highScore,
  onRestart,
  onStart
}) => {
  const { toggleMute, isMuted } = useAudio();
  const { user, logout } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <>
      {/* Score Display */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '56px',
          fontWeight: '900',
          color: '#fff',
          textShadow: '0 0 20px rgba(255,255,255,0.5), 2px 2px 8px rgba(0,0,0,0.8)',
          fontFamily: 'Inter, sans-serif',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '10px 20px',
          border: '1px solid rgba(255,255,255,0.2)',
          animation: score > 0 ? 'scorePopIn 0.3s ease' : 'none'
        }}>
          {score}
        </div>
      )}

      {/* Ready Screen */}
      {gameState === 'ready' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(30,30,30,0.9))',
          backdropFilter: 'blur(20px)',
          color: '#fff',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          fontFamily: 'Inter, sans-serif',
          animation: 'slideInUp 0.5s ease-out'
        }}>
          <h1 style={{ 
            fontSize: '42px', 
            marginBottom: '25px',
            background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(255,215,0,0.5)',
            fontWeight: '900'
          }}>
            🐦 Flappy Bird
          </h1>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '10px' 
          }}>
            Press SPACEBAR or Click to Jump
          </p>
          <p style={{ 
            fontSize: '14px', 
            marginBottom: '20px',
            opacity: 0.8
          }}>
            Avoid the pipes and try to get a high score!
          </p>
          <button
            onClick={onStart}
            style={{
              fontSize: '20px',
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '15px',
              boxShadow: '0 8px 20px rgba(76,175,80,0.3)',
              transition: 'all 0.3s ease',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(76,175,80,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(76,175,80,0.3)';
            }}
          >
            🚀 Start Game
          </button>
          {highScore > 0 && (
            <p style={{ 
              fontSize: '14px', 
              marginTop: '10px',
              color: '#FFD700'
            }}>
              High Score: {highScore}
            </p>
          )}
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  fontSize: '16px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
                  transition: 'all 0.3s ease',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(33,150,243,0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(33,150,243,0.3)';
                }}
              >
                🎮 Login to Save Scores
              </button>
            ) : (
              <>
                <p style={{ fontSize: '14px', marginBottom: '10px', color: '#90EE90' }}>
                  Welcome, {user.displayName}!
                </p>
                <button
                  onClick={logout}
                  style={{
                    fontSize: '14px',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    marginLeft: '10px'
                  }}
                >
                  Logout
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                fontSize: '16px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 12px rgba(156,39,176,0.3)',
                transition: 'all 0.3s ease',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(156,39,176,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(156,39,176,0.3)';
              }}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(139,0,0,0.9), rgba(80,0,0,0.95))',
          backdropFilter: 'blur(20px)',
          color: '#fff',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid rgba(255,107,107,0.3)',
          boxShadow: '0 20px 40px rgba(139,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          fontFamily: 'Inter, sans-serif',
          animation: 'gameOverSlide 0.6s ease-out'
        }}>
          <h2 style={{ 
            fontSize: '38px', 
            marginBottom: '25px',
            background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(255,107,107,0.5)',
            fontWeight: '900'
          }}>
            💥 Game Over!
          </h2>
          <p style={{ 
            fontSize: '24px', 
            marginBottom: '10px',
            color: '#FFD700'
          }}>
            Score: {score}
          </p>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '20px',
            color: '#FFD700'
          }}>
            High Score: {highScore}
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onRestart}
              style={{
                fontSize: '20px',
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #FF6B6B, #ff5252)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 8px 20px rgba(255,107,107,0.3)',
                transition: 'all 0.3s ease',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(255,107,107,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,107,107,0.3)';
              }}
            >
              🔄 Play Again
            </button>
            
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                fontSize: '18px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 6px 15px rgba(156,39,176,0.3)',
                transition: 'all 0.3s ease',
                fontWeight: '600'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(156,39,176,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(156,39,176,0.3)';
              }}
            >
              🏆 View Leaderboard
            </button>
          </div>
          
          {!user && (
            <p style={{ 
              fontSize: '14px', 
              marginTop: '15px',
              color: '#90EE90',
              opacity: 0.9
            }}>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#90EE90',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Login to save your scores
              </button>
            </p>
          )}
        </div>
      )}

      {/* Sound Toggle Button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isMuted ? '#666' : '#4CAF50',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = isMuted ? '#777' : '#45a049'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = isMuted ? '#666' : '#4CAF50'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          SPACEBAR or Click to Jump
        </div>
      )}

      {/* User info during game */}
      {gameState === 'playing' && user && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '14px',
          color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontFamily: 'Inter, sans-serif',
          background: 'rgba(0,0,0,0.3)',
          padding: '8px 12px',
          borderRadius: '8px',
          backdropFilter: 'blur(5px)'
        }}>
          👤 {user.displayName}
        </div>
      )}

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      <Leaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
    </>
  );
};

export default GameUI;

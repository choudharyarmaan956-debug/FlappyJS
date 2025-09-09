import React from 'react';
import { useAudio } from '../lib/stores/useAudio';

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
    </>
  );
};

export default GameUI;

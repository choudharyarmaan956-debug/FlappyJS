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
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'Inter, sans-serif'
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
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '30px',
          borderRadius: '15px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '20px',
            color: '#FFD700'
          }}>
            Flappy Bird
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
              fontSize: '18px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '10px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          >
            Start Game
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
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: '#fff',
          padding: '30px',
          borderRadius: '15px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px',
            color: '#FF6B6B'
          }}>
            Game Over!
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
              fontSize: '18px',
              padding: '12px 24px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ff5252'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B6B'}
          >
            Play Again
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

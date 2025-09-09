import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAudio } from '../lib/stores/useAudio';
import GameUI from './GameUI';

interface Bird {
  x: number;
  y: number;
  velocity: number;
  width: number;
  height: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  passed: boolean;
  id: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BIRD_WIDTH = 30;
const BIRD_HEIGHT = 25;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 120; // frames

const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const frameCountRef = useRef(0);
  const nextPipeIdRef = useRef(0);
  
  const [bird, setBird] = useState<Bird>({
    x: 100,
    y: CANVAS_HEIGHT / 2,
    velocity: 0,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT
  });
  
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver'>('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappyBirdHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const { playHit, playSuccess, isMuted } = useAudio();

  // Initialize audio
  useEffect(() => {
    // Audio will be initialized by the useAudio store
    console.log('FlappyBird component mounted, audio muted:', isMuted);
  }, [isMuted]);

  const resetGame = useCallback(() => {
    setBird({
      x: 100,
      y: CANVAS_HEIGHT / 2,
      velocity: 0,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT
    });
    setPipes([]);
    setScore(0);
    frameCountRef.current = 0;
    nextPipeIdRef.current = 0;
    setGameState('ready');
  }, []);

  const startGame = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('playing');
    }
  }, [gameState]);

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      setBird(prev => ({
        ...prev,
        velocity: JUMP_STRENGTH
      }));
    } else if (gameState === 'ready') {
      startGame();
      setBird(prev => ({
        ...prev,
        velocity: JUMP_STRENGTH
      }));
    }
  }, [gameState, startGame]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      jump();
    }
  }, [jump]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const checkCollision = (bird: Bird, pipes: Pipe[]): boolean => {
    // Check ground and ceiling collision
    if (bird.y <= 0 || bird.y + bird.height >= CANVAS_HEIGHT - 50) {
      return true;
    }

    // Check pipe collision
    for (const pipe of pipes) {
      if (
        bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
      ) {
        return true;
      }
    }

    return false;
  };

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setBird(prev => {
      const newBird = {
        ...prev,
        velocity: prev.velocity + GRAVITY,
        y: prev.y + prev.velocity + GRAVITY
      };

      return newBird;
    });

    setPipes(prev => {
      let newPipes = [...prev];
      
      // Move pipes
      newPipes = newPipes.map(pipe => ({
        ...pipe,
        x: pipe.x - PIPE_SPEED
      }));

      // Remove off-screen pipes
      newPipes = newPipes.filter(pipe => pipe.x + pipe.width > -100);

      // Add new pipes
      if (frameCountRef.current % PIPE_SPAWN_RATE === 0) {
        const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
        const newPipe: Pipe = {
          x: CANVAS_WIDTH,
          topHeight,
          bottomY: topHeight + PIPE_GAP,
          width: PIPE_WIDTH,
          passed: false,
          id: nextPipeIdRef.current++
        };
        newPipes.push(newPipe);
      }

      return newPipes;
    });

    frameCountRef.current++;
  }, [gameState]);

  const checkScore = useCallback(() => {
    setPipes(prev => {
      const newPipes = [...prev];
      let scoreIncrement = 0;

      newPipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
          pipe.passed = true;
          scoreIncrement++;
        }
      });

      if (scoreIncrement > 0) {
        setScore(prevScore => prevScore + scoreIncrement);
        playSuccess();
      }

      return newPipes;
    });
  }, [bird.x, playSuccess]);

  const gameLoop = useCallback(() => {
    updateGame();
    checkScore();

    // Check collision
    if (gameState === 'playing' && checkCollision(bird, pipes)) {
      setGameState('gameOver');
      playHit();
      
      // Update high score
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('flappyBirdHighScore', score.toString());
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, checkScore, gameState, bird, pipes, score, highScore, playHit]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with sky blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);

    // Draw pipes
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, CANVAS_HEIGHT - pipe.bottomY - 50);
      
      // Pipe caps
      ctx.fillStyle = '#32CD32';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipe.width + 10, 20);
      ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 20);
      ctx.fillStyle = '#228B22';
    });

    // Draw bird
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Bird beak
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(bird.x + bird.width, bird.y + bird.height / 2 - 2, 8, 4);
    
    // Bird eye
    ctx.fillStyle = '#000';
    ctx.fillRect(bird.x + bird.width - 8, bird.y + 5, 4, 4);

    requestAnimationFrame(draw);
  }, [bird, pipes]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100%', 
      height: '100%',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #333',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
        onClick={jump}
      />
      
      <GameUI
        gameState={gameState}
        score={score}
        highScore={highScore}
        onRestart={resetGame}
        onStart={startGame}
      />
    </div>
  );
};

export default FlappyBird;

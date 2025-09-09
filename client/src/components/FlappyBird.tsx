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

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BIRD_WIDTH = 30;
const BIRD_HEIGHT = 25;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const TERMINAL_VELOCITY = 12;
const AIR_RESISTANCE = 0.98;
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
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [timeOfDay, setTimeOfDay] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  
  // Performance optimization: cache gradients
  const gradientCacheRef = useRef<{
    sky?: CanvasGradient;
    pipe?: CanvasGradient;
    cap?: CanvasGradient;
    ground?: CanvasGradient;
    bird?: CanvasGradient;
    lastSkyProgress?: number;
  }>({});
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

  // Initialize clouds
  useEffect(() => {
    const initialClouds: Cloud[] = [];
    for (let i = 0; i < 8; i++) {
      initialClouds.push({
        x: Math.random() * (CANVAS_WIDTH + 200) - 100,
        y: Math.random() * (CANVAS_HEIGHT * 0.4) + 20,
        width: Math.random() * 80 + 60,
        height: Math.random() * 40 + 30,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.4 + 0.3
      });
    }
    setClouds(initialClouds);
  }, []);

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
    setParticles([]);
    frameCountRef.current = 0;
    nextPipeIdRef.current = 0;
    setGameState('ready');
    setBirdRotation(0);
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

    // Update time of day for dynamic sky (reduced frequency)
    if (frameCountRef.current % 3 === 0) {
      setTimeOfDay(prev => (prev + 0.003) % (Math.PI * 2));
    }

    setBird(prev => {
      // Apply gravity to velocity
      let newVelocity = prev.velocity + GRAVITY;
      
      // Apply air resistance for more realistic physics
      if (newVelocity > 0) {
        newVelocity *= AIR_RESISTANCE;
      }
      
      // Limit terminal velocity for realistic falling
      newVelocity = Math.min(newVelocity, TERMINAL_VELOCITY);
      
      const newBird = {
        ...prev,
        velocity: newVelocity,
        y: prev.y + newVelocity
      };

      // Calculate bird rotation based on velocity (less frequent updates)
      if (frameCountRef.current % 2 === 0) {
        const rotation = Math.max(-45, Math.min(45, newVelocity * 2.5));
        setBirdRotation(rotation);
      }

      return newBird;
    });

    // Update clouds (reduced frequency)
    if (frameCountRef.current % 2 === 0) {
      setClouds(prev => prev.map(cloud => ({
        ...cloud,
        x: cloud.x - cloud.speed,
        // Reset cloud position when it goes off screen
        ...(cloud.x + cloud.width < -100 ? {
          x: CANVAS_WIDTH + Math.random() * 200,
          y: Math.random() * (CANVAS_HEIGHT * 0.4) + 20
        } : {})
      })));
    }

    // Update particles (reduced frequency and optimized)
    if (frameCountRef.current % 2 === 0) {
      setParticles(prev => {
        const updated = [];
        for (let i = 0; i < prev.length; i++) {
          const particle = prev[i];
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 2; // reduce life faster
          particle.vy += 0.1;
          if (particle.life > 0) {
            updated.push(particle);
          }
        }
        return updated;
      });
    }

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
        // Add celebration particles (reduced count for performance)
        const newParticles: Particle[] = [];
        for (let i = 0; i < 6; i++) {
          newParticles.push({
            x: bird.x + bird.width / 2,
            y: bird.y + bird.height / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 20,
            maxLife: 20,
            size: Math.random() * 3 + 2,
            color: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 4)]
          });
        }
        setParticles(prev => [...prev, ...newParticles]);
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
      
      // Add crash particles (reduced count for performance)
      const crashParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        crashParticles.push({
          x: bird.x + bird.width / 2,
          y: bird.y + bird.height / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 2,
          life: 40,
          maxLife: 40,
          size: Math.random() * 4 + 1,
          color: ['#FF6B6B', '#FF8E53', '#FFD93D'][Math.floor(Math.random() * 3)]
        });
      }
      setParticles(prev => [...prev, ...crashParticles]);
      
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

    const skyProgress = (Math.sin(timeOfDay) + 1) / 2;
    
    // Cache gradients for better performance
    if (!gradientCacheRef.current.sky || gradientCacheRef.current.lastSkyProgress !== skyProgress) {
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      const skyTop = `hsl(${200 + skyProgress * 30}, ${60 + skyProgress * 20}%, ${70 + skyProgress * 20}%)`;
      const skyBottom = `hsl(${180 + skyProgress * 40}, ${50 + skyProgress * 30}%, ${80 + skyProgress * 15}%)`;
      gradient.addColorStop(0, skyTop);
      gradient.addColorStop(1, skyBottom);
      gradientCacheRef.current.sky = gradient;
      gradientCacheRef.current.lastSkyProgress = skyProgress;
    }
    
    ctx.fillStyle = gradientCacheRef.current.sky!;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw clouds with parallax effect (simplified for performance)
    clouds.forEach(cloud => {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = `hsl(0, 0%, ${85 + skyProgress * 10}%)`;
      
      // Simplified cloud shape (ellipse instead of multiple circles)
      ctx.beginPath();
      ctx.ellipse(cloud.x + cloud.width / 2, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Enhanced pipes with 3D effect (cached gradients)
    if (!gradientCacheRef.current.pipe) {
      const pipeGradient = ctx.createLinearGradient(0, 0, PIPE_WIDTH, 0);
      pipeGradient.addColorStop(0, '#2E8B57');
      pipeGradient.addColorStop(0.3, '#3CB371');
      pipeGradient.addColorStop(0.7, '#228B22');
      pipeGradient.addColorStop(1, '#1F5F3F');
      gradientCacheRef.current.pipe = pipeGradient;
      
      const capGradient = ctx.createLinearGradient(0, 0, PIPE_WIDTH + 10, 0);
      capGradient.addColorStop(0, '#4A4A4A');
      capGradient.addColorStop(0.2, '#7A7A7A');
      capGradient.addColorStop(0.5, '#9A9A9A');
      capGradient.addColorStop(0.8, '#7A7A7A');
      capGradient.addColorStop(1, '#4A4A4A');
      gradientCacheRef.current.cap = capGradient;
    }
    
    pipes.forEach(pipe => {
      ctx.save();
      ctx.translate(pipe.x, 0);
      
      ctx.fillStyle = gradientCacheRef.current.pipe!;
      // Top pipe
      ctx.fillRect(0, 0, pipe.width, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(0, pipe.bottomY, pipe.width, CANVAS_HEIGHT - pipe.bottomY - 50);
      
      ctx.fillStyle = gradientCacheRef.current.cap!;
      ctx.fillRect(-5, pipe.topHeight - 20, pipe.width + 10, 20);
      ctx.fillRect(-5, pipe.bottomY, pipe.width + 10, 20);
      
      // Pipe highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(2, 0, 3, pipe.topHeight);
      ctx.fillRect(2, pipe.bottomY, 3, CANVAS_HEIGHT - pipe.bottomY - 50);
      
      // Pipe shadows
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(pipe.width - 3, 0, 3, pipe.topHeight);
      ctx.fillRect(pipe.width - 3, pipe.bottomY, 3, CANVAS_HEIGHT - pipe.bottomY - 50);
      
      ctx.restore();
    });

    // Draw enhanced ground with texture (cached gradient)
    if (!gradientCacheRef.current.ground) {
      const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 50, 0, CANVAS_HEIGHT);
      groundGradient.addColorStop(0, '#8FBC8F');
      groundGradient.addColorStop(0.3, '#6B8E23');
      groundGradient.addColorStop(1, '#556B2F');
      gradientCacheRef.current.ground = groundGradient;
    }
    ctx.fillStyle = gradientCacheRef.current.ground;
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
    
    // Ground grass texture (reduced detail for performance)
    ctx.fillStyle = '#90EE90';
    for (let x = 0; x < CANVAS_WIDTH; x += 16) {
      const grassHeight = Math.sin(x * 0.1) * 3 + 5;
      ctx.fillRect(x, CANVAS_HEIGHT - 50, 4, -grassHeight);
    }

    // Draw enhanced bird with rotation and details
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate((birdRotation * Math.PI) / 180);
    
    // Bird body gradient (cached)
    if (!gradientCacheRef.current.bird) {
      const birdGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.width / 2);
      birdGradient.addColorStop(0, '#FFE55C');
      birdGradient.addColorStop(0.7, '#FFD700');
      birdGradient.addColorStop(1, '#FFA500');
      gradientCacheRef.current.bird = birdGradient;
    }
    ctx.fillStyle = gradientCacheRef.current.bird;
    
    // Bird body (ellipse)
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing animation (reduced frequency)
    const wingOffset = Math.sin(frameCountRef.current * 0.2) * 2;
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.ellipse(-bird.width / 4, wingOffset, bird.width / 3, bird.height / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 8, -2);
    ctx.lineTo(bird.width / 2 + 8, 2);
    ctx.closePath();
    ctx.fill();
    
    // Bird eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(bird.width / 4 + 1, -bird.height / 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(bird.width / 4 + 1.5, -bird.height / 6 - 0.5, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Draw particles (optimized)
    if (particles.length > 0) {
      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }, [bird, pipes, clouds, particles, timeOfDay, birdRotation]);

  // Separate animation loop from game loop
  const animationLoopRef = useRef<number>();
  
  const animationLoop = useCallback(() => {
    draw();
    animationLoopRef.current = requestAnimationFrame(animationLoop);
  }, [draw]);
  
  useEffect(() => {
    animationLoopRef.current = requestAnimationFrame(animationLoop);
    return () => {
      if (animationLoopRef.current) {
        cancelAnimationFrame(animationLoopRef.current);
      }
    };
  }, [animationLoop]);

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
          border: '3px solid #2C3E50',
          borderRadius: '15px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(135,206,235,0.3)',
          background: 'linear-gradient(145deg, #34495e, #2c3e50)',
          filter: gameState === 'gameOver' ? 'brightness(0.7) blur(1px)' : 'none',
          transition: 'all 0.3s ease'
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

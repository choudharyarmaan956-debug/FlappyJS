# Overview

This is a Flappy Bird game built with React and TypeScript, featuring a modern tech stack with Express.js backend, PostgreSQL database, and shadcn/ui components. The game includes audio support, game state management, and a responsive UI with score tracking. The project follows a full-stack architecture with shared schemas between frontend and backend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main application
- **Vite** as the build tool and development server
- **Tailwind CSS** with shadcn/ui component library for styling
- **Zustand** for state management (game state and audio state)
- **TanStack Query** for server state management
- **Canvas-based game rendering** for the Flappy Bird gameplay
- **Three.js integration** with React Three Fiber for potential 3D graphics

## Backend Architecture
- **Express.js** server with TypeScript
- **ESM modules** configuration throughout the project
- **In-memory storage** implementation with interface for future database integration
- **RESTful API** structure ready for implementation
- **Session management** setup with connect-pg-simple
- **Middleware** for logging, JSON parsing, and error handling

## Data Storage Solutions
- **Drizzle ORM** configured for PostgreSQL with Neon Database
- **Database migrations** managed through Drizzle Kit
- **Shared schema** definitions between frontend and backend
- **Memory storage fallback** for development without database dependency
- **User management** schema with username/password authentication ready

## Game State Management
- **Zustand stores** for game phase management (ready/playing/ended)
- **Audio state management** with mute/unmute functionality
- **Local storage** integration for high score persistence
- **Game loop** implementation with RAF (requestAnimationFrame)
- **Collision detection** and physics simulation

## Development Experience
- **Hot Module Replacement** with Vite in development
- **TypeScript strict mode** enabled
- **Path aliases** configured for clean imports
- **PostCSS** with autoprefixer for CSS processing
- **GLSL shader support** for advanced graphics
- **Runtime error overlay** for development debugging

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless** - Serverless PostgreSQL driver for Neon Database
- **drizzle-orm** - TypeScript ORM for database operations
- **express** - Node.js web framework for API server
- **react** and **react-dom** - Frontend UI library
- **vite** - Modern build tool and development server

## UI and Styling
- **@radix-ui** - Comprehensive set of accessible UI primitives
- **tailwindcss** - Utility-first CSS framework
- **@fontsource/inter** - Inter font family
- **lucide-react** - Icon library
- **class-variance-authority** - Utility for variant-based styling

## Game and Graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Helper library for React Three Fiber
- **@react-three/postprocessing** - Post-processing effects for Three.js
- **vite-plugin-glsl** - GLSL shader support in Vite

## State Management and Data Fetching
- **zustand** - Lightweight state management
- **@tanstack/react-query** - Server state management and caching
- **react-hook-form** - Form state management (configured but not actively used)

## Development Tools
- **typescript** - Static type checking
- **@replit/vite-plugin-runtime-error-modal** - Enhanced error reporting for Replit
- **esbuild** - Fast JavaScript bundler for production builds
- **tsx** - TypeScript execution engine for development

## Database and Session Management
- **connect-pg-simple** - PostgreSQL session store for Express
- **drizzle-kit** - Database migration and introspection tool
- **drizzle-zod** - Zod schema integration for Drizzle ORM
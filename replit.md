# Zombie Survival 3D Game

## Overview

This is a 3D zombie survival game built with React Three Fiber, Express.js, and PostgreSQL. The game features immersive 3D environments where players fight against waves of zombies using various weapons, with a progression system including experience, levels, and skill upgrades.

## System Architecture

### Frontend Architecture
- **React Three Fiber**: Core 3D rendering engine using Three.js
- **React**: Component-based UI framework
- **TypeScript**: Type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Zustand**: State management for game logic
- **Radix UI**: Accessible UI components
- **Vite**: Build tool and development server

### Backend Architecture
- **Express.js**: RESTful API server
- **TypeScript**: Type-safe server-side development
- **Drizzle ORM**: Database operations and migrations
- **PostgreSQL**: Primary database (via Neon)
- **Memory Storage**: Fallback storage implementation

### Build System
- **Vite**: Frontend bundling and development
- **ESBuild**: Server-side bundling
- **TypeScript**: Compilation and type checking

## Key Components

### Game Engine
- **Game Loop**: Main game logic handling zombies, bullets, and player interactions
- **Player System**: First-person controls with keyboard/mouse input
- **Weapon System**: Multiple weapon types with realistic ballistics
- **Zombie AI**: Enemy spawning, pathfinding, and behavior
- **Collision Detection**: AABB-based collision system
- **Audio System**: Background music and sound effects

### UI Components
- **Main Menu**: Game entry point with settings
- **Game HUD**: Real-time stats display (health, ammo, score)
- **Skill System**: Player progression and upgrades
- **Component Library**: Reusable UI components from Radix UI

### 3D Graphics
- **Environment**: Procedural terrain with buildings and obstacles
- **Lighting**: Realistic shadows and lighting effects
- **Materials**: Textured surfaces for immersion
- **Post-processing**: Visual effects and enhancements

## Data Flow

1. **Game State Management**: Zustand stores handle game state, player data, weapons, and zombies
2. **Rendering Loop**: React Three Fiber manages 3D scene updates at 60fps
3. **Input Handling**: Keyboard/mouse events drive player movement and actions
4. **Physics**: Collision detection and bullet trajectory calculations
5. **Audio**: Context-aware sound effects and background music
6. **Persistence**: Player progress and settings stored locally

## External Dependencies

### Core Libraries
- **@react-three/fiber**: 3D rendering in React
- **@react-three/drei**: Utility components for Three.js
- **@react-three/postprocessing**: Visual effects
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Database ORM
- **zustand**: State management
- **@radix-ui/***: UI component primitives

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: CSS framework
- **drizzle-kit**: Database migrations

## Deployment Strategy

### Development
- Vite development server for hot reloading
- TypeScript compilation with strict mode
- ESLint and Prettier for code quality
- Source maps for debugging

### Production
- Vite builds optimized frontend bundle
- ESBuild creates server bundle
- Static assets served from `/dist/public`
- Express serves API routes at `/api/*`

### Database
- Drizzle migrations for schema changes
- PostgreSQL via Neon for production
- Memory storage fallback for development
- Connection pooling for performance

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 02, 2025. Initial setup
- July 02, 2025. Enhanced game with multiple weapons, improved controls, and weapon switching functionality
- July 03, 2025. Fixed runtime error issues by creating CleanGame component with proper error handling and type safety
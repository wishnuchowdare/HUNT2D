import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "playing" | "paused" | "game_over";

interface GameStateStore {
  gameState: GameState;
  wave: number;
  score: number;
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  returnToMenu: () => void;
  startNextWave: () => void;
  addScore: (points: number) => void;
}

export const useGameState = create<GameStateStore>()(
  subscribeWithSelector((set, get) => ({
    gameState: "menu",
    wave: 1,
    score: 0,
    
    startGame: () => {
      set({ 
        gameState: "playing",
        wave: 1,
        score: 0
      });
    },
    
    pauseGame: () => {
      const { gameState } = get();
      if (gameState === "playing") {
        set({ gameState: "paused" });
      }
    },
    
    resumeGame: () => {
      const { gameState } = get();
      if (gameState === "paused") {
        set({ gameState: "playing" });
      }
    },
    
    gameOver: () => {
      set({ gameState: "game_over" });
    },
    
    returnToMenu: () => {
      set({ 
        gameState: "menu",
        wave: 1,
        score: 0
      });
    },
    
    startNextWave: () => {
      set((state) => ({ 
        wave: state.wave + 1,
        score: state.score + state.wave * 500 // Bonus for completing wave
      }));
    },
    
    addScore: (points: number) => {
      set((state) => ({ score: state.score + points }));
    }
  }))
);

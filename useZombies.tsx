import { create } from "zustand";

export interface Zombie {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  isDead: boolean;
}

interface ZombiesStore {
  zombies: Zombie[];
  
  // Actions
  spawnZombie: (zombie: Zombie) => void;
  updateZombie: (id: string, updates: Partial<Zombie>) => void;
  removeZombie: (id: string) => void;
  clearZombies: () => void;
}

export const useZombies = create<ZombiesStore>((set, get) => ({
  zombies: [],
  
  spawnZombie: (zombie) => {
    set((state) => ({
      zombies: [...state.zombies, zombie]
    }));
  },
  
  updateZombie: (id, updates) => {
    set((state) => ({
      zombies: state.zombies.map(zombie =>
        zombie.id === id ? { ...zombie, ...updates } : zombie
      )
    }));
  },
  
  removeZombie: (id) => {
    set((state) => ({
      zombies: state.zombies.filter(zombie => zombie.id !== id)
    }));
  },
  
  clearZombies: () => {
    set({ zombies: [] });
  }
}));

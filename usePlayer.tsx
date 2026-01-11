import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PlayerSkills {
  health: number;
  damage: number;
  speed: number;
  reload: number;
}

interface PlayerStore {
  // Basic stats
  position: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  
  // Progression
  level: number;
  experience: number;
  experienceToNext: number;
  skillPoints: number;
  skills: PlayerSkills;
  
  // Actions
  updatePosition: (position: [number, number, number]) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  gainExperience: (xp: number) => void;
  upgradeSkill: (skill: keyof PlayerSkills) => void;
  resetPlayer: () => void;
}

const initialSkills: PlayerSkills = {
  health: 0,
  damage: 0,
  speed: 0,
  reload: 0
};

export const usePlayer = create<PlayerStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial stats
    position: [0, 1.7, 0],
    health: 100,
    maxHealth: 100,
    speed: 8,
    
    // Progression
    level: 1,
    experience: 0,
    experienceToNext: 100,
    skillPoints: 3, // Start with some skill points
    skills: { ...initialSkills },
    
    updatePosition: (position) => {
      set({ position });
    },
    
    takeDamage: (damage) => {
      set((state) => {
        const newHealth = Math.max(0, state.health - damage);
        return { health: newHealth };
      });
    },
    
    heal: (amount) => {
      set((state) => {
        const newHealth = Math.min(state.maxHealth, state.health + amount);
        return { health: newHealth };
      });
    },
    
    gainExperience: (xp) => {
      set((state) => {
        let newExperience = state.experience + xp;
        let newLevel = state.level;
        let newSkillPoints = state.skillPoints;
        let newExperienceToNext = state.experienceToNext;
        
        // Check for level up
        while (newExperience >= newExperienceToNext) {
          newExperience -= newExperienceToNext;
          newLevel++;
          newSkillPoints++;
          newExperienceToNext = newLevel * 100; // Scaling XP requirement
        }
        
        return {
          experience: newExperience,
          level: newLevel,
          skillPoints: newSkillPoints,
          experienceToNext: newExperienceToNext
        };
      });
    },
    
    upgradeSkill: (skill) => {
      const { skillPoints, skills } = get();
      if (skillPoints > 0) {
        set((state) => {
          const newSkills = { ...state.skills };
          newSkills[skill]++;
          
          // Apply skill effects
          let updates: Partial<PlayerStore> = {
            skillPoints: state.skillPoints - 1,
            skills: newSkills
          };
          
          if (skill === 'health') {
            updates.maxHealth = 100 + newSkills.health * 25;
            updates.health = Math.min(state.health + 25, updates.maxHealth);
          } else if (skill === 'speed') {
            updates.speed = 8 + newSkills.speed * 1.2;
          }
          
          return updates;
        });
      }
    },
    
    resetPlayer: () => {
      set({
        position: [0, 1.7, 0],
        health: 100,
        maxHealth: 100,
        speed: 8,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        skillPoints: 3,
        skills: { ...initialSkills }
      });
    }
  }))
);

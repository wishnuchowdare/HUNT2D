import * as THREE from "three";

// Utility functions for game mechanics

export const calculateDistance = (
  pos1: [number, number, number], 
  pos2: [number, number, number]
): number => {
  const vec1 = new THREE.Vector3().fromArray(pos1);
  const vec2 = new THREE.Vector3().fromArray(pos2);
  return vec1.distanceTo(vec2);
};

export const normalizeDirection = (
  from: [number, number, number], 
  to: [number, number, number]
): [number, number, number] => {
  const direction = new THREE.Vector3()
    .fromArray(to)
    .sub(new THREE.Vector3().fromArray(from))
    .normalize();
  
  return [direction.x, direction.y, direction.z];
};

export const clampPosition = (
  position: [number, number, number],
  bounds: { min: [number, number, number], max: [number, number, number] }
): [number, number, number] => {
  return [
    Math.max(bounds.min[0], Math.min(bounds.max[0], position[0])),
    Math.max(bounds.min[1], Math.min(bounds.max[1], position[1])),
    Math.max(bounds.min[2], Math.min(bounds.max[2], position[2]))
  ];
};

export const generateSpawnPosition = (
  centerPosition: [number, number, number],
  minDistance: number = 15,
  maxDistance: number = 25
): [number, number, number] => {
  const angle = Math.random() * Math.PI * 2;
  const distance = minDistance + Math.random() * (maxDistance - minDistance);
  
  return [
    centerPosition[0] + Math.cos(angle) * distance,
    centerPosition[1],
    centerPosition[2] + Math.sin(angle) * distance
  ];
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const lerpVector3 = (
  start: [number, number, number],
  end: [number, number, number],
  factor: number
): [number, number, number] => {
  return [
    lerp(start[0], end[0], factor),
    lerp(start[1], end[1], factor),
    lerp(start[2], end[2], factor)
  ];
};

// Damage calculation with critical hit chance
export const calculateDamage = (
  baseDamage: number,
  damageMultiplier: number = 1,
  critChance: number = 0.1
): number => {
  const isCrit = Math.random() < critChance;
  const damage = baseDamage * damageMultiplier;
  return isCrit ? damage * 2 : damage;
};

// Experience points calculation
export const calculateXPReward = (
  zombieLevel: number,
  playerLevel: number,
  baseXP: number = 25
): number => {
  const levelDifference = zombieLevel - playerLevel;
  const multiplier = Math.max(0.5, 1 + levelDifference * 0.1);
  return Math.floor(baseXP * multiplier);
};

// Wave difficulty scaling
export const getWaveConfig = (wave: number) => {
  return {
    zombieCount: 25 + (wave - 1) * 5,
    zombieHealth: 100 + wave * 10,
    zombieSpeed: 0.5 + wave * 0.1,
    zombieDamage: 10 + wave * 2,
    spawnDelay: Math.max(200, 500 - wave * 20), // Faster spawning in later waves
    bossWave: wave % 5 === 0 // Every 5th wave is a boss wave
  };
};

// Sound management
export const playSound = (
  soundUrl: string,
  volume: number = 1,
  loop: boolean = false
): HTMLAudioElement => {
  const audio = new Audio(soundUrl);
  audio.volume = volume;
  audio.loop = loop;
  audio.play().catch(error => {
    console.log("Audio play prevented:", error);
  });
  return audio;
};

// Random utility functions
export const randomBetween = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Collision detection helpers
export const isPointInBox = (
  point: [number, number, number],
  boxCenter: [number, number, number],
  boxSize: [number, number, number]
): boolean => {
  const [px, py, pz] = point;
  const [bx, by, bz] = boxCenter;
  const [bw, bh, bd] = boxSize;
  
  return (
    px >= bx - bw/2 && px <= bx + bw/2 &&
    py >= by - bh/2 && py <= by + bh/2 &&
    pz >= bz - bd/2 && pz <= bz + bd/2
  );
};

export const boxIntersects = (
  box1Center: [number, number, number],
  box1Size: [number, number, number],
  box2Center: [number, number, number],
  box2Size: [number, number, number]
): boolean => {
  const [x1, y1, z1] = box1Center;
  const [w1, h1, d1] = box1Size;
  const [x2, y2, z2] = box2Center;
  const [w2, h2, d2] = box2Size;
  
  return (
    Math.abs(x1 - x2) < (w1 + w2) / 2 &&
    Math.abs(y1 - y2) < (h1 + h2) / 2 &&
    Math.abs(z1 - z2) < (d1 + d2) / 2
  );
};

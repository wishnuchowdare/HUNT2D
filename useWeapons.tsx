import { create } from "zustand";
import * as THREE from "three";

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number; // shots per second
  ammo: number;
  maxAmmo: number;
  reloadTime: number; // seconds
  type: 'pistol' | 'rifle' | 'shotgun';
}

export interface Bullet {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  speed: number;
  damage: number;
  range: number;
  distanceTraveled: number;
}

interface WeaponsStore {
  currentWeapon: Weapon;
  bullets: Bullet[];
  lastShotTime: number;
  isReloading: boolean;
  
  // Actions
  shoot: (position: [number, number, number], direction: [number, number, number]) => void;
  reload: () => void;
  canShoot: () => boolean;
  updateBullets: (delta: number, zombies: any[], onHitZombie: (zombieId: string) => void) => void;
  switchWeapon: (weapon: Weapon) => void;
}

const defaultWeapon: Weapon = {
  id: 'pistol',
  name: 'Pistol',
  damage: 25,
  fireRate: 3,
  ammo: 12,
  maxAmmo: 12,
  reloadTime: 2,
  type: 'pistol'
};

// Additional weapons for variety
export const weapons: Record<string, Weapon> = {
  pistol: defaultWeapon,
  rifle: {
    id: 'rifle',
    name: 'Assault Rifle',
    damage: 35,
    fireRate: 6,
    ammo: 30,
    maxAmmo: 30,
    reloadTime: 3,
    type: 'rifle'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    damage: 60,
    fireRate: 1.5,
    ammo: 8,
    maxAmmo: 8,
    reloadTime: 4,
    type: 'shotgun'
  }
};

export const useWeapons = create<WeaponsStore>((set, get) => ({
  currentWeapon: { ...defaultWeapon },
  bullets: [],
  lastShotTime: 0,
  isReloading: false,
  
  shoot: (position, direction) => {
    const { currentWeapon, canShoot: canShootFn } = get();
    const now = Date.now();
    
    if (canShootFn() && currentWeapon.ammo > 0) {
      // Create bullet
      const bullet: Bullet = {
        id: `bullet-${now}-${Math.random()}`,
        position: [...position],
        direction: [...direction],
        speed: 50,
        damage: currentWeapon.damage,
        range: 100,
        distanceTraveled: 0
      };
      
      console.log("Shooting bullet:", bullet);
      
      set((state) => ({
        bullets: [...state.bullets, bullet],
        currentWeapon: {
          ...state.currentWeapon,
          ammo: state.currentWeapon.ammo - 1
        },
        lastShotTime: now
      }));
    }
  },
  
  reload: () => {
    const { currentWeapon, isReloading } = get();
    if (!isReloading && currentWeapon.ammo < currentWeapon.maxAmmo) {
      set({ isReloading: true });
      
      setTimeout(() => {
        set((state) => ({
          currentWeapon: {
            ...state.currentWeapon,
            ammo: state.currentWeapon.maxAmmo
          },
          isReloading: false
        }));
      }, currentWeapon.reloadTime * 1000);
    }
  },
  
  canShoot: () => {
    const { currentWeapon, lastShotTime, isReloading } = get();
    const now = Date.now();
    const timeSinceLastShot = now - lastShotTime;
    const shotInterval = 1000 / currentWeapon.fireRate;
    
    return !isReloading && 
           currentWeapon.ammo > 0 && 
           timeSinceLastShot >= shotInterval;
  },
  
  updateBullets: (delta, zombies, onHitZombie) => {
    set((state) => {
      const updatedBullets = state.bullets
        .map(bullet => {
          // Update bullet position
          const direction = new THREE.Vector3().fromArray(bullet.direction);
          const movement = direction.multiplyScalar(bullet.speed * delta);
          const newPosition = new THREE.Vector3()
            .fromArray(bullet.position)
            .add(movement);
          
          const newDistanceTraveled = bullet.distanceTraveled + bullet.speed * delta;
          
          return {
            ...bullet,
            position: [newPosition.x, newPosition.y, newPosition.z] as [number, number, number],
            distanceTraveled: newDistanceTraveled
          };
        })
        .filter(bullet => {
          // Remove bullets that have traveled too far
          if (bullet.distanceTraveled > bullet.range) {
            return false;
          }
          
          // Check collision with zombies
          const bulletPos = new THREE.Vector3().fromArray(bullet.position);
          for (const zombie of zombies) {
            if (!zombie.isDead) {
              const zombiePos = new THREE.Vector3().fromArray(zombie.position);
              const distance = bulletPos.distanceTo(zombiePos);
              
              if (distance < 1) { // Hit radius
                onHitZombie(zombie.id);
                return false; // Remove bullet
              }
            }
          }
          
          return true;
        });
      
      return { bullets: updatedBullets };
    });
  },
  
  switchWeapon: (weapon) => {
    set({ currentWeapon: { ...weapon } });
  }
}));

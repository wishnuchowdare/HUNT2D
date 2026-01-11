import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface WeaponProps {
  weapon: {
    id: string;
    name: string;
    damage: number;
    fireRate: number;
    ammo: number;
    maxAmmo: number;
    reloadTime: number;
    type: 'pistol' | 'rifle' | 'shotgun';
  };
}

export default function Weapon({ weapon }: WeaponProps) {
  const weaponRef = useRef<THREE.Group>(null);
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Weapon sway animation
  useFrame((state) => {
    if (weaponRef.current) {
      const time = state.clock.elapsedTime;
      weaponRef.current.rotation.x = Math.sin(time * 2) * 0.02;
      weaponRef.current.rotation.y = Math.cos(time * 1.5) * 0.01;
    }
  });

  // Different weapon models based on type
  const getWeaponGeometry = () => {
    switch (weapon.type) {
      case 'pistol':
        return (
          <group>
            {/* Barrel */}
            <mesh position={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshLambertMaterial color="#333" />
            </mesh>
            {/* Handle */}
            <mesh position={[0, -0.15, 0.1]}>
              <boxGeometry args={[0.05, 0.25, 0.15]} />
              <meshLambertMaterial color="#654321" map={woodTexture} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.12, 0.25]} />
              <meshLambertMaterial color="#333" />
            </mesh>
          </group>
        );
      case 'rifle':
        return (
          <group>
            {/* Barrel */}
            <mesh position={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
              <meshLambertMaterial color="#333" />
            </mesh>
            {/* Stock */}
            <mesh position={[0, -0.1, 0.3]}>
              <boxGeometry args={[0.08, 0.15, 0.4]} />
              <meshLambertMaterial color="#654321" map={woodTexture} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.1, 0.15, 0.4]} />
              <meshLambertMaterial color="#333" />
            </mesh>
          </group>
        );
      case 'shotgun':
        return (
          <group>
            {/* Barrel */}
            <mesh position={[0, 0, -0.5]}>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
              <meshLambertMaterial color="#333" />
            </mesh>
            {/* Stock */}
            <mesh position={[0, -0.1, 0.25]}>
              <boxGeometry args={[0.1, 0.18, 0.35]} />
              <meshLambertMaterial color="#654321" map={woodTexture} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.12, 0.18, 0.3]} />
              <meshLambertMaterial color="#333" />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group 
      ref={weaponRef} 
      position={[0.3, -0.3, -0.5]} 
      rotation={[0, 0, 0]}
    >
      {getWeaponGeometry()}
    </group>
  );
}

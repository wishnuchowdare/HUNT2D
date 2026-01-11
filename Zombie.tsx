import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface ZombieProps {
  zombie: {
    id: string;
    position: [number, number, number];
    health: number;
    maxHealth: number;
    speed: number;
    damage: number;
    isDead: boolean;
  };
}

export default function Zombie({ zombie }: ZombieProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const grassTexture = useTexture("/textures/grass.png");
  
  // Animate zombie (simple bobbing motion)
  useFrame((state) => {
    if (meshRef.current && !zombie.isDead) {
      meshRef.current.position.y = zombie.position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  if (zombie.isDead) {
    // Dead zombie lies on ground
    return (
      <group position={zombie.position}>
        <mesh ref={meshRef} position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.6, 1.8, 0.3]} />
          <meshLambertMaterial color="#2d4a2d" map={grassTexture} />
        </mesh>
        {/* Blood splatter effect */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1, 8]} />
          <meshBasicMaterial color="#8B0000" transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={zombie.position}>
      {/* Zombie body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.8, 0.3]} />
        <meshLambertMaterial color="#4a4a2d" map={grassTexture} />
      </mesh>
      
      {/* Zombie head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshLambertMaterial color="#3d3d1f" />
      </mesh>
      
      {/* Health bar */}
      <group position={[0, 2.2, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        {/* Health fill */}
        <mesh position={[-(1 - (zombie.health / zombie.maxHealth)) / 2, 0, 0.01]}>
          <planeGeometry args={[zombie.health / zombie.maxHealth, 0.08]} />
          <meshBasicMaterial color={zombie.health / zombie.maxHealth > 0.5 ? "#4CAF50" : "#F44336"} />
        </mesh>
      </group>
      
      {/* Simple eyes */}
      <mesh position={[-0.1, 1.3, 0.2]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0.1, 1.3, 0.2]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
}

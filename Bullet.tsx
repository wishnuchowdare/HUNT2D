import { useRef } from "react";
import * as THREE from "three";

interface BulletProps {
  bullet: {
    id: string;
    position: [number, number, number];
    direction: [number, number, number];
    speed: number;
    damage: number;
    range: number;
    distanceTraveled: number;
  };
}

export default function Bullet({ bullet }: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={bullet.position}>
      <sphereGeometry args={[0.05]} />
      <meshLambertMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
    </mesh>
  );
}

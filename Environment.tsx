import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export default function Environment() {
  const grassTexture = useTexture("/textures/grass.png");
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const woodTexture = useTexture("/textures/wood.jpg");
  const skyTexture = useTexture("/textures/sky.png");

  // Pre-calculate building positions to avoid Math.random in render
  const buildingPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 25 + Math.random() * 10;
      positions.push({
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        height: 8 + Math.random() * 12,
        width: 4 + Math.random() * 4,
        depth: 4 + Math.random() * 4,
      });
    }
    return positions;
  }, []);

  // Configure texture tiling
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(5, 5);

  return (
    <group>
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial map={grassTexture} />
        <primitive object={new THREE.Mesh().rotateX(-Math.PI / 2)} />
      </mesh>

      {/* Central road/plaza */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial map={asphaltTexture} />
        <primitive object={new THREE.Mesh().rotateX(-Math.PI / 2)} />
      </mesh>

      {/* Buildings around the perimeter */}
      {buildingPositions.map((building, index) => (
        <group key={index} position={[building.x, 0, building.z]}>
          {/* Main building */}
          <mesh position={[0, building.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshLambertMaterial color="#666" />
          </mesh>
          
          {/* Building details */}
          <mesh position={[0, building.height + 0.5, 0]} castShadow>
            <boxGeometry args={[building.width + 0.2, 1, building.depth + 0.2]} />
            <meshLambertMaterial color="#444" />
          </mesh>
          
          {/* Windows */}
          {Array.from({ length: Math.floor(building.height / 3) }, (_, floor) => (
            <group key={floor}>
              <mesh position={[building.width / 2 + 0.01, (floor + 1) * 3, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshLambertMaterial color="#87CEEB" transparent opacity={0.7} />
              </mesh>
              <mesh position={[-building.width / 2 - 0.01, (floor + 1) * 3, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshLambertMaterial color="#87CEEB" transparent opacity={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Scattered objects for cover */}
      <mesh position={[5, 0.5, 5]} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 1]} />
        <meshLambertMaterial map={woodTexture} />
      </mesh>
      
      <mesh position={[-8, 0.5, 3]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 2]} />
        <meshLambertMaterial map={woodTexture} />
      </mesh>
      
      <mesh position={[3, 0.5, -7]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshLambertMaterial map={woodTexture} />
      </mesh>

      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[200, 32, 16]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

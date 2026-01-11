import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

export default function SimpleGame() {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const zombieRef = useRef<THREE.Mesh>(null);
  const [playerPos, setPlayerPos] = useState([0, 1.7, 0]);

  // Mouse look controls
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement) {
        const sensitivity = 0.002;
        camera.rotation.y -= event.movementX * sensitivity;
        camera.rotation.x -= event.movementY * sensitivity;
        
        // Clamp vertical rotation
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
      }
    };

    const handleClick = () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [camera]);

  useFrame((state, delta) => {
    const keys = getKeys();
    
    // Simple player movement
    const speed = 5;
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    if (keys.forward) direction.add(forward);
    if (keys.backward) direction.sub(forward);
    if (keys.rightward) direction.add(right);
    if (keys.leftward) direction.sub(right);
    
    direction.normalize();
    direction.multiplyScalar(speed * delta);
    
    const newPosition = new THREE.Vector3().fromArray(playerPos).add(direction);
    camera.position.copy(newPosition);
    setPlayerPos([newPosition.x, newPosition.y, newPosition.z]);

    // Simple zombie movement toward player
    if (zombieRef.current) {
      const zombiePos = zombieRef.current.position;
      const playerPosition = new THREE.Vector3().fromArray(playerPos);
      
      const dir = playerPosition.clone().sub(zombiePos).normalize();
      zombiePos.add(dir.multiplyScalar(delta * 1));
      
      // Check if zombie reached player
      const distance = playerPosition.distanceTo(zombiePos);
      if (distance < 2) {
        console.log("Zombie got you!");
      }
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#4a5d4a" />
      </mesh>

      {/* Simple zombie */}
      <mesh ref={zombieRef} position={[10, 0.9, 10]} castShadow>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <meshLambertMaterial color="#4a4a2d" />
      </mesh>

      {/* Zombie head */}
      <mesh position={[10, 2.1, 10]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshLambertMaterial color="#3d3d1f" />
      </mesh>

      {/* Red eyes */}
      <mesh position={[9.9, 2.2, 10.15]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[10.1, 2.2, 10.15]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
}
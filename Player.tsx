import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useWeapons } from "../lib/stores/useWeapons";
import Weapon from "./Weapon";

export default function Player() {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const playerRef = useRef<THREE.Group>(null);
  const { position, updatePosition, speed, health } = usePlayer();
  const { currentWeapon, shoot, canShoot, reload } = useWeapons();
  
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
    const moveSpeed = keys.run ? speed * 1.5 : speed;
    
    // Movement
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    if (keys.forward) direction.add(forward);
    if (keys.backward) direction.sub(forward);
    if (keys.rightward) direction.add(right);
    if (keys.leftward) direction.sub(right);
    
    direction.normalize();
    direction.multiplyScalar(moveSpeed * delta);
    
    const newPosition = new THREE.Vector3()
      .fromArray(position)
      .add(direction);
    
    // Simple boundary constraints
    newPosition.x = Math.max(-45, Math.min(45, newPosition.x));
    newPosition.z = Math.max(-45, Math.min(45, newPosition.z));
    newPosition.y = 1.7; // Keep at eye level
    
    updatePosition([newPosition.x, newPosition.y, newPosition.z]);
    
    // Update camera position
    camera.position.copy(newPosition);
    
    // Shooting
    if (keys.shoot && canShoot()) {
      const bulletDirection = forward.clone().normalize();
      shoot(newPosition.toArray() as [number, number, number], bulletDirection.toArray() as [number, number, number]);
    }
    
    // Reloading
    if (keys.reload) {
      reload();
    }
    
    // Weapon switching - disabled for now to avoid errors
    
    // Log controls for debugging
    if (keys.forward || keys.backward || keys.leftward || keys.rightward) {
      console.log("Player moving:", { keys, position: newPosition.toArray() });
    }
  });

  return (
    <group ref={playerRef} position={position}>
      {/* Player weapon */}
      <Weapon weapon={currentWeapon} />
      
      {/* Player body (invisible in first person, but useful for debugging) */}
      <mesh position={[0, -0.5, 0]} visible={false}>
        <boxGeometry args={[0.6, 1.8, 0.3]} />
        <meshBasicMaterial color="blue" />
      </mesh>
    </group>
  );
}

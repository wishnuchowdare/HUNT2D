import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import Player from "./Player";
import Environment from "./Environment";
import Zombie from "./Zombie";
import Bullet from "./Bullet";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";
import { useZombies } from "../lib/stores/useZombies";
import { useWeapons } from "../lib/stores/useWeapons";

export default function Game() {
  const groupRef = useRef<THREE.Group>(null);
  const { wave, startNextWave, addScore } = useGameState();
  const { health, position } = usePlayer();
  const { zombies, spawnZombie, updateZombie, removeZombie } = useZombies();
  const { bullets, updateBullets } = useWeapons();


  // Spawn zombies for current wave
  useEffect(() => {
    const zombieCount = 25 + (wave - 1) * 5; // Increase zombies per wave
    
    for (let i = 0; i < zombieCount; i++) {
      setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 10;
        const spawnPosition = [
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        ] as [number, number, number];
        
        spawnZombie({
          id: `zombie-${wave}-${i}`,
          position: spawnPosition,
          health: 100 + wave * 10,
          maxHealth: 100 + wave * 10,
          speed: 0.5 + wave * 0.1,
          damage: 10 + wave * 2,
          isDead: false
        });
      }, i * 500); // Stagger spawning
    }
  }, [wave, spawnZombie]);

  // Game loop
  useFrame((state, delta) => {
    // Update zombies
    zombies.forEach(zombie => {
      if (!zombie.isDead) {
        // Move zombie towards player
        const direction = new THREE.Vector3()
          .fromArray(position)
          .sub(new THREE.Vector3().fromArray(zombie.position))
          .normalize();
        
        const newPosition = new THREE.Vector3()
          .fromArray(zombie.position)
          .add(direction.multiplyScalar(zombie.speed * delta));
        
        updateZombie(zombie.id, {
          position: [newPosition.x, newPosition.y, newPosition.z]
        });

        // Check if zombie reached player (simple distance check)
        const distanceToPlayer = new THREE.Vector3()
          .fromArray(position)
          .distanceTo(new THREE.Vector3().fromArray(zombie.position));
        
        if (distanceToPlayer < 1.5) {
          // Zombie attacks player
          console.log("Player hit by zombie!");
          // Implement actual damage later
        }
      }
    });

    // Update bullets and check collisions
    updateBullets(delta, zombies, (zombieId) => {
      // Zombie hit by bullet
      const zombie = zombies.find(z => z.id === zombieId);
      if (zombie && !zombie.isDead) {
        const newHealth = zombie.health - 25; // Bullet damage
        if (newHealth <= 0) {
          updateZombie(zombieId, { isDead: true, health: 0 });
          addScore(100); // Points for kill
          console.log("Zombie killed!");
        } else {
          updateZombie(zombieId, { health: newHealth });
          console.log("Zombie hit!");
        }
      }
    });

    // Check if wave is complete
    const aliveZombies = zombies.filter(z => !z.isDead);
    if (aliveZombies.length === 0 && zombies.length > 0) {
      setTimeout(() => {
        startNextWave();
      }, 2000);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Game objects */}
      <Player />
      <Environment />
      
      {/* Render zombies */}
      {zombies.map(zombie => (
        <Zombie key={zombie.id} zombie={zombie} />
      ))}
      
      {/* Render bullets */}
      {bullets.map(bullet => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
    </group>
  );
}

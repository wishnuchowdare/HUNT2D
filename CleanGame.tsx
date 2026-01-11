import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { audioManager } from "../lib/audioManager";

export default function CleanGame() {
  console.log("CleanGame component initializing...");
  
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  const zombieRef = useRef<THREE.Mesh>(null);
  const zombieHeadRef = useRef<THREE.Mesh>(null);
  const zombieEye1Ref = useRef<THREE.Mesh>(null);
  const zombieEye2Ref = useRef<THREE.Mesh>(null);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 1.7, 0]);
  const [isMoving, setIsMoving] = useState(false);
  const [lastFootstepTime, setLastFootstepTime] = useState(0);
  const [zombieLastSound, setZombieLastSound] = useState(0);
  const [gameStarted, setGameStarted] = useState(true);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [bullets, setBullets] = useState<Array<{id: string, position: [number, number, number], direction: [number, number, number], speed: number}>>([]);
  const [ammo, setAmmo] = useState(30);
  const [isReloading, setIsReloading] = useState(false);
  const [lastShotTime, setLastShotTime] = useState(0);
  const [gameWave, setGameWave] = useState(1);
  const [zombies, setZombies] = useState<Array<{id: string, position: [number, number, number], health: number, speed: number}>>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  
  console.log("CleanGame state initialized:", { gameStarted, zombies: zombies.length, ammo, gameWave });

  // Initialize zombies
  useEffect(() => {
    const initializeZombies = () => {
      const newZombies = [];
      const zombieCount = Math.min(10 + (gameWave - 1) * 5, 50); // Start with 10, increase by 5 per wave, max 50
      
      for (let i = 0; i < zombieCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 60;
        newZombies.push({
          id: `zombie_${i}`,
          position: [x, 0.9, z] as [number, number, number],
          health: 100 + gameWave * 10,
          speed: 0.5 + gameWave * 0.1
        });
      }
      setZombies(newZombies);
    };
    
    initializeZombies();
  }, [gameWave]);

  // Initialize audio system
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioManager.initialize();
        if (!gameStarted) {
          setGameStarted(true);
        }
      } catch (error) {
        console.warn("Audio initialization failed:", error);
        setGameStarted(true); // Continue without audio
      }
    };

    const handleClick = () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
        initAudio();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [gameStarted]);

  // Mouse look controls
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement) {
        const sensitivity = 0.002;
        camera.rotation.y -= event.movementX * sensitivity;
        camera.rotation.x -= event.movementY * sensitivity;
        
        // Clamp vertical rotation
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        
        // Force camera to stay at ground level - no flying allowed
        camera.position.y = 1.7;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'm' || event.key === 'M') {
        audioManager.toggleMute();
      }
      if (event.key === 'r' || event.key === 'R') {
        if (gameOver && showRestart) {
          // Restart game with enhanced difficulty
          setGameOver(false);
          setShowRestart(false);
          setPlayerLevel(prevLevel => prevLevel + 1);
          setPlayerXP(0);
          setSurvivalTime(0);
          setAmmo(30);
          setIsReloading(false);
          setBullets([]);
          setGameWave(prev => prev + 1);
          audioManager.playSkillEffect('levelup');
          console.log(`HUNTZ 2D RESTARTED! Wave ${gameWave + 1} - RED ZOMBIE HORDE INCOMING!`);
        } else if (!isReloading && ammo < 30) {
          setIsReloading(true);
          audioManager.playSound('success'); // Reload sound
          setTimeout(() => {
            setAmmo(30);
            setIsReloading(false);
          }, 2000);
        }
      }
    };

    const handleMouseClick = (event: MouseEvent) => {
      if (document.pointerLockElement && !isReloading && ammo > 0) {
        const currentTime = Date.now();
        if (currentTime - lastShotTime > 100) { // Fire rate limit
          shoot();
          setLastShotTime(currentTime);
        }
      }
    };

    const shoot = () => {
      if (ammo > 0) {
        setAmmo(prev => prev - 1);
        
        // Create bullet
        const bulletId = Math.random().toString(36);
        const bulletDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const bulletPosition: [number, number, number] = [
          camera.position.x,
          camera.position.y - 0.2,
          camera.position.z
        ];
        
        setBullets(prev => [...prev, {
          id: bulletId,
          position: bulletPosition,
          direction: [bulletDirection.x, bulletDirection.y, bulletDirection.z],
          speed: 50
        }]);

        // Enhanced bullet firing sound
        audioManager.playSound('hit'); // Gun shot sound
        console.log(`HUNTZ 2D: BANG! Red zombie hunting - ${ammo - 1} rounds left`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleMouseClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleMouseClick);
    };
  }, [camera]);

  useFrame((state, delta) => {
    try {
      const keys = getKeys();
      
      // Update survival time and XP
      setSurvivalTime(prev => prev + delta);
      if (Math.floor(survivalTime) % 10 === 0 && Math.floor(survivalTime) > 0) {
        setPlayerXP(prev => {
          const newXP = prev + 10;
          if (newXP >= playerLevel * 100) {
            setPlayerLevel(prevLevel => {
              const newLevel = prevLevel + 1;
              audioManager.playSkillEffect('levelup');
              audioManager.playSound('success');
              return newLevel;
            });
            return 0;
          }
          return newXP;
        });
      }
      
      // Simple player movement
      const speed = 5 + (playerLevel - 1) * 0.5; // Speed increases with level
      const direction = new THREE.Vector3();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      
      if (keys.forward) direction.add(forward);
      if (keys.backward) direction.sub(forward);
      if (keys.rightward) direction.add(right);
      if (keys.leftward) direction.sub(right);
      
      if (direction.length() > 0) {
        direction.normalize();
        direction.multiplyScalar(speed * delta);
        
        const newPosition = new THREE.Vector3(...playerPos).add(direction);
        
        // Simple collision detection - keep player within football field bounds
        newPosition.x = Math.max(-55, Math.min(55, newPosition.x));
        newPosition.z = Math.max(-35, Math.min(35, newPosition.z));
        newPosition.y = 1.7; // Force ground level - no flying allowed
        
        camera.position.copy(newPosition);
        setPlayerPos([newPosition.x, 1.7, newPosition.z]);
        
        // Play footstep sounds
        const currentTime = Date.now();
        if (currentTime - lastFootstepTime > 400) { // Every 400ms for grass
          audioManager.playFootstep('grass');
          setLastFootstepTime(currentTime);
        }
        
        setIsMoving(true);
      } else {
        setIsMoving(false);
      }

      // Wave progression system
      if (survivalTime > 60 && zombies.length === 0) { // 1 minute survival + all zombies killed
        setGameWave(prev => prev + 1);
        setPlayerLevel(prev => prev + 1);
        audioManager.playSkillEffect('levelup');
        setSurvivalTime(0); // Reset timer for new wave
      }

      // Play zombie sounds occasionally
      const currentTime = Date.now();
      if (currentTime - zombieLastSound > 3000 && zombies.length > 0) { // Every 3 seconds
        const soundType = Math.random() > 0.5 ? 'growl' : 'moan';
        audioManager.playZombieVoice(soundType);
        setZombieLastSound(currentTime);
      }

      // Update zombies
      setZombies(prevZombies => {
        return prevZombies.map(zombie => {
          const playerPosition = new THREE.Vector3(...playerPos);
          const currentZombiePos = new THREE.Vector3(...zombie.position);
          
          const dir = playerPosition.clone().sub(currentZombiePos);
          if (dir.length() > 0) {
            dir.normalize();
            const newZombiePos = currentZombiePos.add(dir.multiplyScalar(delta * zombie.speed));
            
            // Keep zombie within football field bounds
            newZombiePos.x = Math.max(-55, Math.min(55, newZombiePos.x));
            newZombiePos.z = Math.max(-35, Math.min(35, newZombiePos.z));
            
            // Check if zombie reached player
            const distance = playerPosition.distanceTo(newZombiePos);
            if (distance < 2) {
              console.log("RED ZOMBIE ATTACK! GAME OVER!");
              audioManager.playZombieVoice('attack');
              audioManager.playSound('hit');
              setGameOver(true);
              setShowRestart(true);
            }
            
            return {
              ...zombie,
              position: [newZombiePos.x, newZombiePos.y, newZombiePos.z] as [number, number, number]
            };
          }
          return zombie;
        });
      });

      // Update bullets
      setBullets(prevBullets => {
        return prevBullets.filter(bullet => {
          const bulletPos = new THREE.Vector3(...bullet.position);
          const bulletDir = new THREE.Vector3(...bullet.direction);
          
          // Move bullet
          bulletPos.add(bulletDir.multiplyScalar(bullet.speed * delta));
          bullet.position = [bulletPos.x, bulletPos.y, bulletPos.z];
          
          // Check collision with zombies
          let hitZombie = false;
          setZombies(prevZombies => {
            return prevZombies.filter(zombie => {
              const zombiePosition = new THREE.Vector3(...zombie.position);
              const distance = bulletPos.distanceTo(zombiePosition);
              
              if (distance < 1) {
                // Hit zombie - remove it and bullet
                audioManager.playSound('hit'); // Enhanced bullet hit sound
                audioManager.playSkillEffect('upgrade');
                setPlayerXP(prev => prev + 50);
                hitZombie = true;
                
                // Play zombie death sound
                audioManager.playZombieVoice('moan');
                
                return false; // Remove zombie
              }
              return true;
            });
          });
          
          if (hitZombie) return false; // Remove bullet
          
          // Remove bullet if it goes too far
          const startPos = new THREE.Vector3(...playerPos);
          return bulletPos.distanceTo(startPos) < 100;
        });
      });

      // Restart button functionality
      if (gameOver && showRestart) {
        // Show restart message with improved stats
        console.log(`Game Over! Wave ${gameWave} reached. Press R to restart with enhanced difficulty!`);
      }
    } catch (error) {
      console.error("Game loop error:", error);
    }
  });

  return (
    <group>
      {/* Stadium lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 20, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-20, 20, -10]} intensity={0.8} />
      <pointLight position={[0, 15, 0]} intensity={0.6} distance={50} />
      
      {/* Football field grass */}
      <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 80]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>

      {/* Field markings - Center circle */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9, 9.2, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Center line */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 80]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Goal posts - Home side */}
      <mesh position={[-55, 2.4, 0]} castShadow>
        <boxGeometry args={[0.2, 4.8, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-55, 2.4, -7.3]} castShadow>
        <boxGeometry args={[0.2, 4.8, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-55, 2.4, 7.3]} castShadow>
        <boxGeometry args={[0.2, 4.8, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-55, 4.8, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 14.8]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>

      {/* Goal posts - Away side */}
      <mesh position={[55, 2.4, 0]} castShadow>
        <boxGeometry args={[0.2, 4.8, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[55, 2.4, -7.3]} castShadow>
        <boxGeometry args={[0.2, 4.8, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[55, 2.4, 7.3]} castShadow>
        <boxGeometry args={[0.2, 4.8, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[55, 4.8, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 14.8]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>

      {/* Stadium floodlights */}
      <mesh position={[-40, 12, -30]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[40, 12, 30]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[-40, 12, 30]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[40, 12, -30]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>

      {/* Stadium stands/seating */}
      <mesh position={[0, 8, -45]} castShadow>
        <boxGeometry args={[100, 16, 5]} />
        <meshLambertMaterial color="#808080" />
      </mesh>
      <mesh position={[0, 8, 45]} castShadow>
        <boxGeometry args={[100, 16, 5]} />
        <meshLambertMaterial color="#808080" />
      </mesh>
      <mesh position={[-65, 8, 0]} castShadow>
        <boxGeometry args={[5, 16, 80]} />
        <meshLambertMaterial color="#808080" />
      </mesh>
      <mesh position={[65, 8, 0]} castShadow>
        <boxGeometry args={[5, 16, 80]} />
        <meshLambertMaterial color="#808080" />
      </mesh>

      {/* Corner flags */}
      <mesh position={[-55, 1, -35]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshLambertMaterial color="#FFFF00" />
      </mesh>
      <mesh position={[55, 1, -35]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshLambertMaterial color="#FFFF00" />
      </mesh>
      <mesh position={[-55, 1, 35]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshLambertMaterial color="#FFFF00" />
      </mesh>
      <mesh position={[55, 1, 35]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshLambertMaterial color="#FFFF00" />
      </mesh>

      {/* Render bullets */}
      {bullets.map(bullet => (
        <mesh key={bullet.id} position={bullet.position}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ))}

      {/* Render all zombies from the zombies array */}
      {zombies.map((zombie, index) => {
        const redColorVariations = [
          { body: "#8B0000", head: "#A52A2A", limbs: "#660000" },
          { body: "#DC143C", head: "#B22222", limbs: "#8B0000" },
          { body: "#FF0000", head: "#CD5C5C", limbs: "#8B0000" },
          { body: "#FF4500", head: "#FF6347", limbs: "#DC143C" },
          { body: "#B22222", head: "#FF0000", limbs: "#660000" }
        ];
        const colors = redColorVariations[index % redColorVariations.length];
        
        return (
          <group key={zombie.id}>
            {/* Zombie body */}
            <mesh position={zombie.position} castShadow>
              <boxGeometry args={[0.5, 1.8, 0.3]} />
              <meshLambertMaterial color={colors.body} />
            </mesh>

            {/* Zombie head */}
            <mesh position={[zombie.position[0], zombie.position[1] + 1.2, zombie.position[2]]} castShadow>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshLambertMaterial color={colors.head} />
            </mesh>

            {/* Red eyes */}
            <mesh position={[zombie.position[0] - 0.1, zombie.position[1] + 1.3, zombie.position[2] + 0.2]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[zombie.position[0] + 0.1, zombie.position[1] + 1.3, zombie.position[2] + 0.2]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            
            {/* Zombie arms */}
            <mesh position={[zombie.position[0] - 0.4, zombie.position[1] + 0.3, zombie.position[2]]} castShadow>
              <boxGeometry args={[0.2, 1.2, 0.2]} />
              <meshLambertMaterial color={colors.body} />
            </mesh>
            <mesh position={[zombie.position[0] + 0.4, zombie.position[1] + 0.3, zombie.position[2]]} castShadow>
              <boxGeometry args={[0.2, 1.2, 0.2]} />
              <meshLambertMaterial color={colors.body} />
            </mesh>
            
            {/* Zombie legs */}
            <mesh position={[zombie.position[0] - 0.15, zombie.position[1] - 0.9, zombie.position[2]]} castShadow>
              <boxGeometry args={[0.15, 1.8, 0.2]} />
              <meshLambertMaterial color={colors.limbs} />
            </mesh>
            <mesh position={[zombie.position[0] + 0.15, zombie.position[1] - 0.9, zombie.position[2]]} castShadow>
              <boxGeometry args={[0.15, 1.8, 0.2]} />
              <meshLambertMaterial color={colors.limbs} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
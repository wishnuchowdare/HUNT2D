import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense } from "react";
import "@fontsource/inter";
import CleanGame from "./components/CleanGame";
import MainMenu from "./components/MainMenu";
import GameUI from "./components/GameUI";
import ErrorBoundary from "./components/ErrorBoundary";
import { useGameState } from "./lib/stores/useGameState";

// Define control keys for the game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "shoot", keys: ["Space", "Mouse0"] },
  { name: "reload", keys: ["KeyR"] },
  { name: "run", keys: ["ShiftLeft"] },
  { name: "weapon1", keys: ["Digit1"] },
  { name: "weapon2", keys: ["Digit2"] },
  { name: "weapon3", keys: ["Digit3"] },
];

function App() {
  const { gameState } = useGameState();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <KeyboardControls map={controls}>
        {gameState === 'menu' && <MainMenu />}
        
        {gameState === 'playing' && (
          <>
            <ErrorBoundary>
              <Canvas
                shadows
                camera={{
                  position: [0, 1.7, 0], // Eye level height
                  fov: 75,
                  near: 0.1,
                  far: 1000
                }}
                gl={{
                  antialias: true,
                  powerPreference: "high-performance"
                }}
                style={{ background: '#4169E1' }} // Stadium sky background
                onClick={() => {
                  if (!document.pointerLockElement) {
                    document.body.requestPointerLock();
                  }
                }}
              >
                <Suspense fallback={<div style={{color: 'white', textAlign: 'center', padding: '20px'}}>Loading game...</div>}>
                  <CleanGame />
                </Suspense>
              </Canvas>
            </ErrorBoundary>
            {/* Simple UI overlay */}
            <div style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '14px',
              zIndex: 1000
            }}>
              <div>🔫 HUNTZ 2D</div>
              <div>WASD - Move around field</div>
              <div>Mouse - Look around</div>
              <div>Click - Shoot zombies</div>
              <div>R - Reload / Restart</div>
              <div>M - Mute/Unmute audio</div>
              <div>🎯 Red crosshair = target</div>
              <div>💀 KILL TO PLAY</div>
              <div>Survive 1min + kill all = next wave</div>
              <div>Click to start!</div>
            </div>
            
            {/* Player Stats */}
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '14px',
              zIndex: 1000,
              minWidth: '150px'
            }}>
              <div>🎯 Level: 1</div>
              <div>⚡ XP: 0/100</div>
              <div>⏱️ Time: 0s</div>
              <div>🔫 Ammo: 30/30</div>
              <div>🔴 Red Zombies: 10+ spawning</div>
              <div>🌊 Wave: 1</div>
            </div>
            
            {/* Game Title - KILL TO PLAY */}
            <div style={{
              position: 'fixed',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#FF0000',
              fontSize: '36px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              zIndex: 1000,
              pointerEvents: 'none'
            }}>
              💀 KILL TO PLAY 💀
            </div>

            {/* Red Gun Targeting Crosshair */}
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 1000
            }}>
              {/* Crosshair - Red targeting reticle */}
              <div style={{
                width: '30px',
                height: '30px',
                border: '2px solid #ff0000',
                borderRadius: '50%',
                position: 'relative',
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.8)',
                background: 'rgba(255, 0, 0, 0.1)'
              }}>
                {/* Center dot */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '4px',
                  height: '4px',
                  backgroundColor: '#ff0000',
                  borderRadius: '50%',
                  boxShadow: '0 0 4px rgba(255, 0, 0, 1)'
                }} />
                {/* Cross lines */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '-2px',
                  transform: 'translateY(-50%)',
                  width: '8px',
                  height: '2px',
                  backgroundColor: '#ff0000',
                  boxShadow: '0 0 2px rgba(255, 0, 0, 0.8)'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-2px',
                  transform: 'translateY(-50%)',
                  width: '8px',
                  height: '2px',
                  backgroundColor: '#ff0000',
                  boxShadow: '0 0 2px rgba(255, 0, 0, 0.8)'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: '8px',
                  backgroundColor: '#ff0000',
                  boxShadow: '0 0 2px rgba(255, 0, 0, 0.8)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: '8px',
                  backgroundColor: '#ff0000',
                  boxShadow: '0 0 2px rgba(255, 0, 0, 0.8)'
                }} />
              </div>
            </div>
          </>
        )}
      </KeyboardControls>
    </div>
  );
}

export default App;

import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";
import { useWeapons } from "../lib/stores/useWeapons";
import { useZombies } from "../lib/stores/useZombies";
import { useAudio } from "../lib/stores/useAudio";
import SkillSystem from "./SkillSystem";

export default function GameUI() {
  const { wave, score, gameState, pauseGame, resumeGame } = useGameState();
  const { health, maxHealth, level, experience, experienceToNext } = usePlayer();
  const { currentWeapon } = useWeapons();
  const { zombies } = useZombies();
  const { isMuted, toggleMute } = useAudio();
  
  const aliveZombies = zombies.filter(z => !z.isDead).length;
  const healthPercentage = (health / maxHealth) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Top HUD */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        pointerEvents: 'auto'
      }}>
        <div style={{ background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
          <div>Wave: {wave}</div>
          <div>Score: {score.toLocaleString()}</div>
          <div>Zombies: {aliveZombies}</div>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
          <div>Level: {level}</div>
          <div>XP: {experience}/{experienceToNext}</div>
        </div>
      </div>

      {/* Health Bar */}
      <div style={{
        position: 'absolute',
        bottom: '120px',
        left: '20px',
        width: '300px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white'
      }}>
        <div style={{ marginBottom: '5px', fontSize: '14px' }}>Health</div>
        <div style={{
          width: '100%',
          height: '20px',
          background: '#333',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${healthPercentage}%`,
            height: '100%',
            background: healthPercentage > 50 ? '#4CAF50' : healthPercentage > 25 ? '#FF9800' : '#F44336',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '2px' }}>
          {health}/{maxHealth}
        </div>
      </div>

      {/* Weapon Info */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '5px',
        color: 'white',
        textAlign: 'center',
        minWidth: '200px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
          {currentWeapon.name}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {currentWeapon.ammo}/{currentWeapon.maxAmmo}
        </div>
        <div style={{ fontSize: '12px' }}>
          Damage: {currentWeapon.damage}
        </div>
      </div>

      {/* Controls Help */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white',
        fontSize: '12px'
      }}>
        <div>WASD - Move</div>
        <div>Mouse - Look</div>
        <div>Space - Shoot</div>
        <div>R - Reload</div>
        <div>Shift - Run</div>
        <div>1/2/3 - Switch Weapons</div>
      </div>

      {/* Audio Control */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          border: 'none',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Crosshair */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '2px',
          height: '10px',
          background: 'white',
          boxShadow: '0 0 2px black'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '10px',
          height: '2px',
          background: 'white',
          boxShadow: '0 0 2px black'
        }} />
      </div>

      {/* Skill System */}
      <SkillSystem />

      {/* Wave Complete Message */}
      {aliveZombies === 0 && zombies.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          <div>WAVE {wave} COMPLETE!</div>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>
            Preparing next wave...
          </div>
        </div>
      )}
    </div>
  );
}

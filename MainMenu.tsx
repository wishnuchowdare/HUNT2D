import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

export default function MainMenu() {
  const { startGame } = useGameState();
  const { toggleMute, isMuted } = useAudio();

  const handleStartGame = () => {
    startGame();
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      {/* Title */}
      <div style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textAlign: 'center',
        textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
        backgroundClip: 'text',
        color: 'transparent'
      }}>
        🔫 HUNTZ 2D
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: '1.2rem',
        marginBottom: '3rem',
        textAlign: 'center',
        opacity: 0.8
      }}>
        💀 KILL TO PLAY - Hunt red zombies in intense 2D combat
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartGame}
        style={{
          fontSize: '1.5rem',
          padding: '15px 40px',
          background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
          border: 'none',
          borderRadius: '10px',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
          transition: 'all 0.3s ease',
          marginBottom: '2rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
        }}
      >
        🎯 START HUNTING
      </button>

      {/* Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: 'bold' }}>
          Controls
        </div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
          <div>WASD - Move around field</div>
          <div>Mouse - Look around</div>
          <div>Click - Shoot red zombies</div>
          <div>R - Reload / Restart</div>
          <div>M - Mute/Unmute audio</div>
          <div>🎯 Red crosshair = target</div>
          <div>Click to lock mouse cursor</div>
        </div>
      </div>

      {/* Audio Toggle */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
      </button>

      {/* Features */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        fontSize: '0.8rem',
        opacity: 0.6
      }}>
        <div>🌊 Wave-based red zombie survival</div>
        <div>🔫 50+ zombies per wave</div>
        <div>⚽ Football stadium battlefield</div>
        <div>🎯 Precision shooting mechanics</div>
      </div>
    </div>
  );
}

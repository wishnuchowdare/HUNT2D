import { useState } from "react";
import { usePlayer } from "../lib/stores/usePlayer";

export default function SkillSystem() {
  const [showSkills, setShowSkills] = useState(false);
  const { skillPoints, upgradeSkill, skills } = usePlayer();

  if (!showSkills) {
    return (
      <button
        onClick={() => setShowSkills(true)}
        style={{
          position: 'absolute',
          top: '100px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          border: '2px solid #4CAF50',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer',
          pointerEvents: 'auto',
          fontSize: '14px'
        }}
      >
        Skills ({skillPoints})
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '30px',
      borderRadius: '10px',
      minWidth: '400px',
      pointerEvents: 'auto',
      border: '2px solid #4CAF50'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Skill Tree</h2>
        <button
          onClick={() => setShowSkills(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '20px', fontSize: '16px' }}>
        Available Skill Points: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{skillPoints}</span>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Health Skill */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '5px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Health Boost</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Level {skills.health} - Increases max health by 25
            </div>
          </div>
          <button
            onClick={() => upgradeSkill('health')}
            disabled={skillPoints === 0}
            style={{
              background: skillPoints > 0 ? '#4CAF50' : '#666',
              border: 'none',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: skillPoints > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Upgrade
          </button>
        </div>

        {/* Damage Skill */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '5px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Damage Boost</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Level {skills.damage} - Increases weapon damage by 10%
            </div>
          </div>
          <button
            onClick={() => upgradeSkill('damage')}
            disabled={skillPoints === 0}
            style={{
              background: skillPoints > 0 ? '#4CAF50' : '#666',
              border: 'none',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: skillPoints > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Upgrade
          </button>
        </div>

        {/* Speed Skill */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '5px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Movement Speed</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Level {skills.speed} - Increases movement speed by 15%
            </div>
          </div>
          <button
            onClick={() => upgradeSkill('speed')}
            disabled={skillPoints === 0}
            style={{
              background: skillPoints > 0 ? '#4CAF50' : '#666',
              border: 'none',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: skillPoints > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Upgrade
          </button>
        </div>

        {/* Reload Skill */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '5px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Fast Reload</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Level {skills.reload} - Reduces reload time by 20%
            </div>
          </div>
          <button
            onClick={() => upgradeSkill('reload')}
            disabled={skillPoints === 0}
            style={{
              background: skillPoints > 0 ? '#4CAF50' : '#666',
              border: 'none',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: skillPoints > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

// Audio Manager for comprehensive game audio
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isInitialized: boolean = false;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Preload all sounds
      await this.preloadSounds();
      
      this.isInitialized = true;
      console.log("Audio system initialized successfully");
    } catch (error) {
      console.warn("Audio initialization failed:", error);
      this.isInitialized = false;
    }
  }

  private async preloadSounds(): Promise<void> {
    const soundFiles = [
      { name: 'background', src: '/sounds/background.mp3', loop: true, volume: 0.3 },
      { name: 'hit', src: '/sounds/hit.mp3', loop: false, volume: 0.8 },
      { name: 'success', src: '/sounds/success.mp3', loop: false, volume: 0.6 },
      // Add more sounds as needed
    ];

    const loadPromises = soundFiles.map(({ name, src, loop, volume }) => {
      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = volume * this.masterVolume;
        audio.preload = 'auto';
        
        audio.addEventListener('canplaythrough', () => {
          this.sounds.set(name, audio);
          resolve();
        });
        
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load sound: ${name}`, e);
          resolve(); // Don't reject, just warn
        });
      });
    });

    await Promise.all(loadPromises);
  }

  playSound(name: string, volume: number = 1.0): void {
    if (!this.isInitialized || this.isMuted) return;

    try {
      const sound = this.sounds.get(name);
      if (sound) {
        sound.volume = volume * this.masterVolume;
        sound.currentTime = 0;
        sound.play().catch(e => console.warn(`Failed to play sound: ${name}`, e));
      }
    } catch (error) {
      console.warn(`Error playing sound: ${name}`, error);
    }
  }

  playFootstep(surface: 'wood' | 'concrete' | 'grass' = 'wood'): void {
    // Generate footstep sound based on surface
    if (!this.isInitialized || this.isMuted) return;

    try {
      if (this.audioContext) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Different frequencies for different surfaces
        const frequencies = {
          wood: 200 + Math.random() * 100,
          concrete: 150 + Math.random() * 80,
          grass: 100 + Math.random() * 50
        };
        
        oscillator.frequency.setValueAtTime(frequencies[surface], this.audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
      }
    } catch (error) {
      console.warn("Error playing footstep sound:", error);
    }
  }

  playZombieVoice(type: 'growl' | 'moan' | 'attack' = 'growl'): void {
    if (!this.isInitialized || this.isMuted) return;

    try {
      if (this.audioContext) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        const voiceConfig = {
          growl: { freq: 80 + Math.random() * 40, duration: 0.5 },
          moan: { freq: 120 + Math.random() * 60, duration: 0.8 },
          attack: { freq: 200 + Math.random() * 100, duration: 0.3 }
        };
        
        const config = voiceConfig[type];
        oscillator.frequency.setValueAtTime(config.freq, this.audioContext.currentTime);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + config.duration);
      }
    } catch (error) {
      console.warn("Error playing zombie voice:", error);
    }
  }

  playSkillEffect(skillType: 'levelup' | 'upgrade' | 'powerup'): void {
    if (!this.isInitialized || this.isMuted) return;

    try {
      if (this.audioContext) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        const effectConfig = {
          levelup: { freq: 440, duration: 0.5, type: 'sine' as OscillatorType },
          upgrade: { freq: 880, duration: 0.3, type: 'square' as OscillatorType },
          powerup: { freq: 660, duration: 0.4, type: 'triangle' as OscillatorType }
        };
        
        const config = effectConfig[skillType];
        oscillator.frequency.setValueAtTime(config.freq, this.audioContext.currentTime);
        oscillator.type = config.type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + config.duration);
      }
    } catch (error) {
      console.warn("Error playing skill effect:", error);
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.sounds.forEach(sound => sound.pause());
    }
    console.log(`Sound ${this.isMuted ? 'muted' : 'unmuted'}`);
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = sound.volume * this.masterVolume;
    });
  }

  dispose(): void {
    this.sounds.forEach(sound => {
      sound.pause();
      sound.src = '';
    });
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
/**
 * AudioSystem.js
 * 
 * Manages BGM and SFX playback.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 27 — Audio Style: Cartoon, Funny, Lighthearted, Punchy
 *   Section 31 — Systems: AudioSystem
 *   Section 34 — Audio Assets
 */

export class AudioSystem {
  /**
   * @param {Phaser.Scene} scene - The active scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentBGM = null;
    this.isMuted = false;
  }

  /**
   * Play background music.
   * @param {string} key - Audio asset key
   * @param {boolean} loop - Whether to loop (default true)
   */
  playBGM(key, loop = true) {
    if (this.currentBGM && this.currentBGM.key === key && this.currentBGM.isPlaying) {
      return; // Already playing
    }
    
    this.stopBGM();

    if (this.scene.cache.audio.exists(key)) {
      this.currentBGM = this.scene.sound.add(key, { loop });
      this.currentBGM.play();
    } else {
      console.warn(`AudioSystem: BGM key '${key}' not found in cache.`);
    }
  }

  /**
   * Stop current background music.
   */
  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.stop();
      this.currentBGM.destroy();
      this.currentBGM = null;
    }
  }

  /**
   * Play a sound effect.
   * @param {string} key - Audio asset key
   */
  playSFX(key) {
    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key);
    } else {
      console.warn(`AudioSystem: SFX key '${key}' not found in cache.`);
    }
  }

  /**
   * Toggle mute state.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.scene.sound.mute = this.isMuted;
    return this.isMuted;
  }

  /**
   * Set volume.
   * @param {number} volume - 0 to 1
   */
  setVolume(volume) {
    this.scene.sound.volume = Phaser.Math.Clamp(volume, 0, 1);
  }

  destroy() {
    this.stopBGM();
  }
}


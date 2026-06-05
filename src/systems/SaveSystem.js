/**
 * SaveSystem.js
 * 
 * Manages player save data with Firebase as the primary storage.
 * Synchronous in-memory caching is used to feed the Phaser game loop.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 14 — Save System
 *   Section 31 — Systems: SaveSystem
 *   Section 36 — Agent Rules: Never create multiple save systems, all player data must use SaveSystem
 */

export class SaveSystem {
  /**
   * @param {FirebaseService} firebaseService - The Firebase service instance
   */
  constructor(firebaseService) {
    this.firebaseService = firebaseService;
    this.SAVE_KEY = 'yellow_duck_active_username';
    
    // In-memory cache for fast synchronous access during gameplay (Section 36)
    this.currentData = null;
  }

  /**
   * Check if an active username is saved on this device.
   * @returns {boolean}
   */
  hasSave() {
    return !!localStorage.getItem(this.SAVE_KEY) || this.currentData !== null;
  }

  /**
   * Get the active player's username.
   * @returns {string|null}
   */
  getUsername() {
    if (this.currentData) {
      return this.currentData.username;
    }
    return localStorage.getItem(this.SAVE_KEY);
  }

  /**
   * Load saved player data from Firebase (Primary Storage).
   * Caches the loaded data in memory for synchronous access during gameplay.
   * @param {string} username
   * @returns {Promise<object|null>} The loaded data or null if not found
   */
  async loadSave(username) {
    if (!username) return null;
    
    try {
      const data = await this.firebaseService.getUser(username);
      if (data) {
        this.currentData = data;
        // Remember username on this device
        localStorage.setItem(this.SAVE_KEY, data.username);
        return data;
      }
      return null;
    } catch (error) {
      console.error(`Error loading save for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Create a new save file on Firebase (Primary Storage).
   * @param {string} username
   * @returns {Promise<object>} The newly created save data
   */
  async createNewSave(username) {
    const initialData = {
      username: username,
      currentLevel: 1,
      score: 0,
      lives: 5,
      deaths: 0,
      playTime: 0,
      bestTimes: {},
      achievements: []
    };

    try {
      const createdUser = await this.firebaseService.createUser(initialData);
      this.currentData = createdUser;
      localStorage.setItem(this.SAVE_KEY, createdUser.username);
      return this.currentData;
    } catch (error) {
      console.error(`Error creating new save for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Auto Save current in-memory cache to Firebase.
   * Triggers: Level Complete, Pause, Exit, Game Over (Section 14).
   * @returns {Promise<void>}
   */
  async autoSave() {
    if (!this.currentData) return;

    try {
      const username = this.currentData.username;
      
      // Update primary user stats document in users collection
      await this.firebaseService.updateUser(username, this.currentData);

      // Sync leaderboard entry if there is score progress
      await this.firebaseService.updateLeaderboard({
        username: this.currentData.username,
        score: this.currentData.score,
        deaths: this.currentData.deaths,
        completedLevels: this.currentData.currentLevel - 1, // number of fully completed levels
        bestTime: this._getBestOverallTime(),
        uid: this.currentData.uid
      });
    } catch (error) {
      console.error('Auto save failed:', error);
    }
  }

  /**
   * Update active gameplay progress in the in-memory cache and trigger auto-save.
   * @param {object} progress
   * @param {number} [progress.currentLevel]
   * @param {number} [progress.score]
   * @param {number} [progress.lives]
   * @param {number} [progress.deaths]
   * @param {number} [progress.playTime]
   */
  updateProgress(progress) {
    if (!this.currentData) return;

    // Apply incremental progress update
    if (progress.currentLevel !== undefined) this.currentData.currentLevel = progress.currentLevel;
    if (progress.score !== undefined) this.currentData.score = progress.score;
    if (progress.lives !== undefined) this.currentData.lives = progress.lives;
    if (progress.deaths !== undefined) this.currentData.deaths = progress.deaths;
    if (progress.playTime !== undefined) this.currentData.playTime = progress.playTime;

    // Trigger asynchronous auto save to Firebase
    this.autoSave();
  }

  /**
   * Add and save an unlocked achievement.
   * @param {string} achievementId
   * @returns {Promise<boolean>} True if newly unlocked, false if already unlocked
   */
  async saveAchievement(achievementId) {
    if (!this.currentData) return false;

    if (!this.currentData.achievements) {
      this.currentData.achievements = [];
    }

    if (this.currentData.achievements.includes(achievementId)) {
      return false; // Already unlocked
    }

    this.currentData.achievements.push(achievementId);
    
    try {
      // Sync user profile
      await this.autoSave();
      
      // Sync explicitly to achievements collection (Section 16)
      await this.firebaseService.syncAchievements(
        this.currentData.username,
        this.currentData.achievements,
        this.currentData.uid
      );
      
      return true;
    } catch (error) {
      console.error(`Error saving achievement ${achievementId}:`, error);
      return false;
    }
  }

  /**
   * Save best time for a specific level.
   * @param {number} level
   * @param {number} timeInSeconds
   * @returns {Promise<boolean>} True if it is a new record
   */
  async saveBestTime(level, timeInSeconds) {
    if (!this.currentData) return false;

    if (!this.currentData.bestTimes) {
      this.currentData.bestTimes = {};
    }

    const currentBest = this.currentData.bestTimes[level];

    // If no previous best, or the new time is faster
    if (currentBest === undefined || timeInSeconds < currentBest) {
      this.currentData.bestTimes[level] = timeInSeconds;
      await this.autoSave();
      return true; // New record
    }

    return false;
  }

  /**
   * Get best time for a level from cache.
   * @param {number} level
   * @returns {number|null}
   */
  getBestTime(level) {
    if (!this.currentData || !this.currentData.bestTimes) return null;
    return this.currentData.bestTimes[level] !== undefined ? this.currentData.bestTimes[level] : null;
  }

  /**
   * Helper to calculate the sum of best completion times across all levels.
   * @private
   * @returns {number}
   */
  _getBestOverallTime() {
    if (!this.currentData || !this.currentData.bestTimes) return 0;
    
    let totalTime = 0;
    for (const lvl in this.currentData.bestTimes) {
      totalTime += this.currentData.bestTimes[lvl];
    }
    return totalTime;
  }

  /**
   * Clear active save cache.
   */
  clear() {
    this.currentData = null;
    localStorage.removeItem(this.SAVE_KEY);
  }
}


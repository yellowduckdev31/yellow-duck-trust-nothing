/**
 * FirebaseService.js
 * 
 * Centralized Firebase/Firestore interface.
 * All online data must use this service (Section 36).
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 16 — Firebase Database: Collections (users, leaderboard, statistics, achievements)
 *   Section 17 — Firebase Rules
 *   Section 31 — Systems: FirebaseService
 *   Section 36 — Agent Rules: All online data must use FirebaseService
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isInitialized = false;
  }

  async initialize(config) {
    if (this.isInitialized) return;

    try {
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      
      console.log('[Diagnostics] auth start: Starting anonymous authentication');
      const userCredential = await signInAnonymously(this.auth);
      console.log('[Diagnostics] auth success: Anonymous authentication complete');
      console.log(`[Diagnostics] assigned UID: ${userCredential.user.uid}`);

      this.isInitialized = true;
      console.log('Firebase initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  /**
   * Check if Firebase is initialized.
   * @private
   */
  _checkInit() {
    if (!this.isInitialized) {
      throw new Error('FirebaseService is not initialized. Call initialize() first.');
    }
  }

  // --- Users Collection (Section 16) ---

  /**
   * Check if username exists in the users collection.
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  async usernameExists(username) {
    this._checkInit();
    if (!username) return false;
    
    // Convert to lowercase to ensure case-insensitive uniqueness check
    const normalizedUsername = username.toLowerCase().trim();
    const userDocRef = doc(this.db, 'users', normalizedUsername);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists();
  }

  /**
   * Create a new user record.
   * Authenticates the user anonymously and saves their data under their normalized username.
   * @param {object} userData - { username, currentLevel, score, lives, deaths, playTime, bestTimes, achievements }
   * @returns {Promise<object>} The created user data along with auth UID
   */
  async createUser(userData) {
    this._checkInit();

    const username = userData.username.trim();
    const normalizedUsername = username.toLowerCase();

    // Double check unique username before attempting write
    const exists = await this.usernameExists(normalizedUsername);
    if (exists) {
      throw new Error('This username already exists. Choose another username.');
    }

    try {
      // 1. Get the current authenticated user UID (already authenticated during initialize)
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User is not authenticated. Cannot create user record.');
      }
      const uid = currentUser.uid;

      // 2. Prepare payload matching Users Structure (Section 16)
      const payload = {
        uid: uid,
        username: username, // Preserve original casing for display
        currentLevel: userData.currentLevel || 1,
        score: userData.score || 0,
        lives: userData.lives || 5,
        deaths: userData.deaths || 0,
        playTime: userData.playTime || 0,
        bestTimes: userData.bestTimes || {},
        achievements: userData.achievements || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 3. Save to users collection document keyed by normalized username
      await setDoc(doc(this.db, 'users', normalizedUsername), payload);

      return { uid, ...payload };
    } catch (error) {
      console.error('Error creating user in Firestore:', error);
      throw error;
    }
  }

  /**
   * Get user data by username.
   * @param {string} username
   * @returns {Promise<object|null>}
   */
  async getUser(username) {
    this._checkInit();
    if (!username) return null;

    const normalizedUsername = username.toLowerCase().trim();
    try {
      const userDocSnap = await getDoc(doc(this.db, 'users', normalizedUsername));
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user data for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Update user data in the users collection.
   * User may only edit own data (enforced by Security Rules checking uid).
   * @param {string} username - Original username
   * @param {object} data - Fields to update (e.g. score, deaths, playTime, achievements, bestTimes)
   */
  async updateUser(username, data) {
    this._checkInit();
    if (!username) throw new Error('Username is required for update.');

    const normalizedUsername = username.toLowerCase().trim();

    // Remove immutable fields to respect Section 17 rules
    const safeData = { ...data };
    delete safeData.username;
    delete safeData.uid;
    delete safeData.createdAt;
    
    safeData.updatedAt = serverTimestamp();

    try {
      const docRef = doc(this.db, 'users', normalizedUsername);
      await updateDoc(docRef, safeData);
    } catch (error) {
      console.error(`Error updating user data for ${username}:`, error);
      throw error;
    }
  }

  // --- Leaderboard Collection (Section 16) ---

  /**
   * Update leaderboard entry for a user.
   * @param {object} entry - { username, score, deaths, completedLevels, bestTime, uid }
   */
  async updateLeaderboard(entry) {
    this._checkInit();
    if (!entry.username) throw new Error('Username is required for leaderboard entry.');

    const normalizedUsername = entry.username.toLowerCase().trim();
    const payload = {
      username: entry.username, // Display name
      score: entry.score || 0,
      deaths: entry.deaths || 0,
      completedLevels: entry.completedLevels || 0,
      bestTime: entry.bestTime || 0,
      uid: entry.uid, // Required for Firestore security check
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = doc(this.db, 'leaderboard', normalizedUsername);
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.error(`Error updating leaderboard for ${entry.username}:`, error);
      throw error;
    }
  }

  /**
   * Get top leaderboard entries.
   * @param {number} limitNum
   * @returns {Promise<Array>} List of leaderboard entries
   */
  async getLeaderboard(limitNum = 10) {
    this._checkInit();
    try {
      const leaderboardRef = collection(this.db, 'leaderboard');
      const q = query(
        leaderboardRef,
        orderBy('score', 'desc'),
        limit(limitNum)
      );

      const querySnapshot = await getDocs(q);
      const entries = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data());
      });
      return entries;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // --- Statistics Collection (Section 16) ---

  /**
   * Update global statistics.
   * @param {string} docId - e.g. 'global'
   * @param {object} stats
   */
  async updateStatistics(docId, stats) {
    this._checkInit();
    try {
      const docRef = doc(this.db, 'statistics', docId);
      await setDoc(docRef, {
        ...stats,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error(`Error updating statistics doc ${docId}:`, error);
      throw error;
    }
  }

  // --- Achievements Collection (Section 16) ---

  /**
   * Sync achievements list to achievements collection.
   * @param {string} username
   * @param {Array<string>} achievements - Array of unlocked achievement IDs
   * @param {string} uid - Auth UID of user
   */
  async syncAchievements(username, achievements, uid) {
    this._checkInit();
    if (!username) throw new Error('Username is required to sync achievements.');

    const normalizedUsername = username.toLowerCase().trim();
    try {
      const docRef = doc(this.db, 'achievements', normalizedUsername);
      await setDoc(docRef, {
        username: username,
        achievements: achievements,
        uid: uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error(`Error syncing achievements for ${username}:`, error);
      throw error;
    }
  }
}


/**
 * LeaderboardSystem.js
 * 
 * Manages leaderboard data sync with Firebase.
 * Single leaderboard system — never duplicate (Section 36).
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 10 — Score System: Ranking based on Score, never resets
 *   Section 16 — Firebase Database: leaderboard collection
 *   Section 17 — Firebase Rules
 *   Section 31 — Systems: LeaderboardSystem
 *   Section 36 — Agent Rules: Never create multiple leaderboard systems
 */

export class LeaderboardSystem {
  /**
   * @param {object} firebaseService - Initialized instance of FirebaseService
   */
  constructor(firebaseService) {
    if (!firebaseService) {
      throw new Error('LeaderboardSystem requires an initialized FirebaseService.');
    }
    this.firebaseService = firebaseService;
  }

  /**
   * Submit or update player's leaderboard entry.
   * Leaderboard structure (Section 16):
   *   username, score, deaths, completedLevels, bestTime, uid, updatedAt
   * 
   * @param {object} entry - Object containing score and stats
   */
  async submitScore(entry) {
    try {
      await this.firebaseService.updateLeaderboard(entry);
      console.log(`Leaderboard updated for ${entry.username}`);
    } catch (error) {
      console.error('Failed to submit score to leaderboard:', error);
      throw error;
    }
  }

  /**
   * Fetch top 100 global scores.
   * @returns {Promise<Array>}
   */
  async getTopScores(limit = 100) {
    try {
      // Fetches ordered by 'score' desc as implemented in FirebaseService
      const scores = await this.firebaseService.getLeaderboard(limit);
      return scores;
    } catch (error) {
      console.error('Failed to fetch top scores:', error);
      return [];
    }
  }

  /**
   * Get player's rank.
   * Note: This is an expensive operation in Firestore without aggregation queries.
   * For the top 100, we fetch the leaderboard and find the index.
   * 
   * @param {string} username
   * @returns {Promise<number|null>}
   */
  async getPlayerRank(username) {
    if (!username) return null;
    const normalizedUsername = username.toLowerCase().trim();

    try {
      // To get global rank efficiently, we pull the top 100 and see if they are in it.
      // If not, we return null or a generic ">100" response depending on UI needs.
      const topScores = await this.getTopScores(100);
      
      const index = topScores.findIndex(entry => 
        entry.username && entry.username.toLowerCase().trim() === normalizedUsername
      );

      if (index !== -1) {
        return index + 1; // 1-based ranking
      }

      // If they aren't in the top 100, we check if they exist at all
      const userDoc = await this.firebaseService.getUser(username);
      if (userDoc) {
        return ">100"; // Exists, but not top 100
      }

      return null;
    } catch (error) {
      console.error('Failed to determine player rank:', error);
      return null;
    }
  }
}


/**
 * ScoreSystem.js
 * 
 * Manages score calculation.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 10 — Score System
 *   Section 31 — Systems: ScoreSystem
 */

export class ScoreSystem {
  constructor() {
    this.currentScore = 0;
  }

  /**
   * Calculate level score (Section 10).
   * Formula: Base Score * Time Bonus * Life Bonus - Death Penalty
   * 
   * @param {object} params
   * @param {number} params.baseScore
   * @param {number} params.timeBonus
   * @param {number} params.lifeBonus
   * @param {number} params.deathPenalty
   * @returns {number}
   */
  calculateScore({ baseScore = 1000, timeBonus = 1, lifeBonus = 1, deathPenalty = 0 }) {
    const score = Math.max(0, (baseScore * timeBonus * lifeBonus) - deathPenalty);
    return Math.floor(score);
  }

  /**
   * Add score to running total.
   * @param {number} points
   */
  addScore(points) {
    this.currentScore += points;
  }

  /**
   * Get current total score.
   * @returns {number}
   */
  getScore() {
    return this.currentScore;
  }

  reset() {
    this.currentScore = 0;
  }
}


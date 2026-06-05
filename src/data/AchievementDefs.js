/**
 * AchievementDefs.js
 * 
 * Achievement definitions.
 * Minimum 25 achievements required (Section 18).
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 18 — Achievements
 */

export const ACHIEVEMENTS = {
  // Death milestones
  FIRST_DEATH:            { id: 'FIRST_DEATH',            name: 'First Blood',             description: 'Die for the first time.' },
  DIE_10:                 { id: 'DIE_10',                 name: 'Getting Started',          description: 'Die 10 times.' },
  DIE_50:                 { id: 'DIE_50',                 name: 'Persistent',               description: 'Die 50 times.' },
  DIE_100:                { id: 'DIE_100',                name: 'Professional Failure',     description: 'Die 100 times.' },

  // Completion
  COMPLETE_LEVEL_NO_DEATH:{ id: 'COMPLETE_LEVEL_NO_DEATH',name: 'Flawless',                 description: 'Complete any level without dying.' },
  COMPLETE_ALL_LEVELS:    { id: 'COMPLETE_ALL_LEVELS',    name: 'Duck of Destiny',          description: 'Complete all 10 levels.' },

  // Exploration
  FIND_SECRET_AREA:       { id: 'FIND_SECRET_AREA',       name: 'Secret Explorer',          description: 'Discover a secret area.' },

  // Mastery
  MASTER_DUCK:            { id: 'MASTER_DUCK',            name: 'Master Duck',              description: 'Achieve mastery.' },
  TRUST_NOTHING:          { id: 'TRUST_NOTHING',          name: 'Trust Nothing',            description: 'Complete the secret level.' },

  // TODO: Add remaining achievements to reach minimum 25
};

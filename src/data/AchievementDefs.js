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

  // Level Progression
  COMPLETE_LVL1:          { id: 'COMPLETE_LVL1',          name: 'First Step',               description: 'Complete Level 1 (Tutorial).' },
  COMPLETE_LVL5:          { id: 'COMPLETE_LVL5',          name: 'Halfway There',            description: 'Complete Level 5.' },
  COMPLETE_LVL10:         { id: 'COMPLETE_LVL10',         name: 'Devil Conqueror',          description: 'Complete Level 10 (Final Stage).' },

  // Deaths & Failure scenarios
  DIE_150:                { id: 'DIE_150',                name: 'Undead Duck',              description: 'Die 150 times.' },
  DIE_TO_FAKE_EXIT:       { id: 'DIE_TO_FAKE_EXIT',       name: 'Foolish Hopes',            description: 'Get killed by a fake exit door.' },
  DIE_TO_FAKE_FLOOR:      { id: 'DIE_TO_FAKE_FLOOR',      name: 'Step Into The Abyss',      description: 'Fall through a fake floor trap.' },
  TRAPPED_DUCK:           { id: 'TRAPPED_DUCK',           name: 'Persistent Failure',       description: 'Die 5 times in a single level run.' },

  // Speedrun Milestones
  SPEEDRUN_LVL1:          { id: 'SPEEDRUN_LVL1',          name: 'Speedy Duck',              description: 'Complete Level 1 in under 15 seconds.' },
  SPEEDRUN_ALL:           { id: 'SPEEDRUN_ALL',           name: 'Super Sonic Duck',         description: 'Complete all levels in under 15 minutes total.' },

  // Specific Level Secrets (Section 22)
  SECRET_AREA_3:          { id: 'SECRET_AREA_3',          name: 'Hidden Chamber III',       description: 'Discover the secret area in Level 3.' },
  SECRET_AREA_6:          { id: 'SECRET_AREA_6',          name: 'Hidden Chamber VI',        description: 'Discover the secret area in Level 6.' },
  SECRET_AREA_8:          { id: 'SECRET_AREA_8',          name: 'Hidden Chamber VIII',      description: 'Discover the secret area in Level 8.' },
  SECRET_AREA_10:         { id: 'SECRET_AREA_10',         name: 'Hidden Chamber X',         description: 'Discover the secret area in Level 10.' },

  // Challenge Milestones
  NO_CHECKPOINTS_LVL7:    { id: 'NO_CHECKPOINTS_LVL7',    name: 'Hardcore Runner',          description: 'Complete Level 7 without using checkpoints.' },
  MAX_SCORE:              { id: 'MAX_SCORE',              name: 'High Roller',              description: 'Accumulate a score of over 10,000 points.' },
  FAST_LEARNER:           { id: 'FAST_LEARNER',           name: 'Fast Learner',             description: 'Respawn within 0.8 seconds 10 times.' }
};

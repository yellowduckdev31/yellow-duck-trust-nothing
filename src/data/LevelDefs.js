/**
 * LevelDefs.js
 * 
 * Level metadata definitions.
 * 
 * References: PROJECT_CONTEXT.md
 *   Section 19 — Level Structure
 *   Section 20 — Checkpoint Rules
 *   Section 22 — Secret Areas
 */

import { CHECKPOINT_RULES, SECRET_AREA_LEVELS } from '../core/config.js';

export const LEVEL_DEFS = [
  { level: 1,  name: 'First Steps',       theme: 'Tutorial',          checkpoints: CHECKPOINT_RULES.getCheckpointCount(1),  hasSecret: SECRET_AREA_LEVELS.includes(1)  },
  { level: 2,  name: 'Sharp Welcome',      theme: 'Static Spikes',     checkpoints: CHECKPOINT_RULES.getCheckpointCount(2),  hasSecret: SECRET_AREA_LEVELS.includes(2)  },
  { level: 3,  name: 'Broken Trust',       theme: 'Fake Floor',        checkpoints: CHECKPOINT_RULES.getCheckpointCount(3),  hasSecret: SECRET_AREA_LEVELS.includes(3)  },
  { level: 4,  name: 'Hidden Danger',      theme: 'Hidden Spike',      checkpoints: CHECKPOINT_RULES.getCheckpointCount(4),  hasSecret: SECRET_AREA_LEVELS.includes(4)  },
  { level: 5,  name: 'Moving Target',      theme: 'Moving Platform',   checkpoints: CHECKPOINT_RULES.getCheckpointCount(5),  hasSecret: SECRET_AREA_LEVELS.includes(5)  },
  { level: 6,  name: 'False Hope',         theme: 'Fake Exit',         checkpoints: CHECKPOINT_RULES.getCheckpointCount(6),  hasSecret: SECRET_AREA_LEVELS.includes(6)  },
  { level: 7,  name: 'Chaos Theory',       theme: 'Trap Combination',  checkpoints: CHECKPOINT_RULES.getCheckpointCount(7),  hasSecret: SECRET_AREA_LEVELS.includes(7)  },
  { level: 8,  name: 'Backwards Day',      theme: 'Reverse Logic',     checkpoints: CHECKPOINT_RULES.getCheckpointCount(8),  hasSecret: SECRET_AREA_LEVELS.includes(8)  },
  { level: 9,  name: 'Overload',           theme: 'Multi Trap',        checkpoints: CHECKPOINT_RULES.getCheckpointCount(9),  hasSecret: SECRET_AREA_LEVELS.includes(9)  },
  { level: 10, name: 'The Devil\'s Stage', theme: 'Final Devil Stage', checkpoints: CHECKPOINT_RULES.getCheckpointCount(10), hasSecret: SECRET_AREA_LEVELS.includes(10) },
  { level: 11, name: 'Nightmare Duck',     theme: 'Nightmare Duck',    checkpoints: CHECKPOINT_RULES.getCheckpointCount(11), hasSecret: false, isSecret: true },
];

# Walkthrough: Firebase MCP Server Fix & Game Integration Setup

This walkthrough documents the steps taken to fix the Firebase MCP server start issue, audit and configure the game's Firebase integration, and verify everything end-to-end.

## Phase 1: Firebase MCP Server Fix (Resolved)

1. **Audited MCP Configuration**:
   - Inspected `C:\Users\user\.gemini\config\mcp_config.json`.
   - Verified that the `firebase-mcp-server` configuration is:
     ```json
     "firebase-mcp-server": {
       "command": "npx",
       "args": [
         "-y",
         "firebase-tools@latest",
         "mcp"
       ]
     }
     ```
     This configuration is valid and correct for starting the server.

2. **Identified the Root Cause**:
   - The `npx` execution cache under `C:\Users\user\AppData\Local\npm-cache\_npx\ba4f1959e38407b5` had a corrupted/incomplete installation of the `async` package (a dependency of `portfinder`, which is required by `firebase-tools`).
   - Specifically, files in the `async` module were cut off alphabetically, and `package.json` was missing.

3. **Cleared the Corrupted Cache**:
   - Stopped competing node processes (such as PID `9912` spawned by the IDE) that were holding locks on the cache folders.
   - Cleared the entire NPM cache (`npm cache clean --force`).
   - Deleted the physical cache directory `C:\Users\user\AppData\Local\npm-cache` to force a clean slate.

4. **Triggered Clean Installation**:
   - Started the server command. The IDE's background launcher automatically re-spawned a new process (PID `10016`) to download `firebase-tools@latest`.
   - Monitored the extraction and verified that all 109 script files and `package.json` inside the `async` dependency folder extracted completely and correctly.

---

## Phase 2: Firebase Project Configuration and Integration

1. **Firebase Project Creation**:
   - Created a new Firebase project: **Yellow Duck** (`yellow-duck-trust-9f82d`).
   - Registered a Firebase Web App named **Yellow Duck Web** to generate client config credentials.

2. **Cloud Firestore Setup**:
   - Enabled the `firestore.googleapis.com` API programmatically.
   - Created the default Firestore database in the `nam5` multi-region location.
   - Deployed the security rules defined in `firebase/firestore.rules` to secure client access.
   - Initialized the required collections (`users`, `leaderboard`, `statistics`, `achievements`) and wrote a default `global` document under `statistics`.

3. **Authentication Setup**:
   - Enabled the Google Identity Toolkit API (`identitytoolkit.googleapis.com`) on the project.
   - Configured the Anonymous authentication provider to support anonymous sign-in flow.

4. **Client & Scene Integration**:
   - Updated `firebase/firebase-config.js` with the real credentials for `yellow-duck-trust-9f82d`.
   - Modified `src/scenes/BootScene.js` to import `firebaseConfig` and dynamically initialize the `FirebaseService` connection instead of hardcoding dummy values.

---

## Phase 3: Verification

We created and executed a detailed integration test script [test_firebase.cjs](file:///d:/Ai/Antigravity/Github/yellow-duck-trust-nothing/scratch/test_firebase.cjs) to verify the setup.

- **Outcome**: The test ran successfully in **under 10 seconds** and exited cleanly.
- **Results**:
  - Anonymous authentication successfully retrieved a unique UID.
  - Successfully registered a test username (`player_22908`), created its Firestore document, and retrieved the saved fields.
  - Successfully updated user document scores and deaths.
  - Successfully updated leaderboard and achievements documents.
  - Verified that security rules correctly blocked unauthorized writes to other users' documents.

---

## Phase 4: GitHub Pages Deployment Verification

We prepared and verified the project configurations for GitHub Pages deployment.

1. **Build Configuration (`vite.config.js`)**:
   - Confirmed the base path is correctly set to `/yellow-duck-trust-nothing/`.
   - Confirmed the production build output directory is set to `dist`.

2. **Asset Path Resolution (`src/scenes/BootScene.js`)**:
   - Confirmed that Phaser is configured to set its base URL from Vite's `import.meta.env.BASE_URL`:
     ```javascript
     if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
       this.load.setBaseURL(import.meta.env.BASE_URL);
     }
     ```
   - Confirmed all assets and level JSONs are loaded using relative paths (`assets/...`, `levels/...`), resolving correctly to `/yellow-duck-trust-nothing/assets/...`.

3. **Build Success**:
   - Ran `npm run build` which successfully outputted the production bundle to the `dist/` directory.
   - Verified that `dist/index.html` resolved script source paths correctly:
     `<script type="module" crossorigin src="/yellow-duck-trust-nothing/assets/index-DrZWbS-F.js"></script>`.

4. **GitHub Actions Workflow (`.github/workflows/deploy.yml`)**:
   - Verified that a GitHub Actions deployment workflow is present and correctly configured to build using Node 20, export the `dist` directory, and deploy to GitHub Pages.

5. **Visual Verification**:
   - Ran Vite's preview server and verified that the game UI and canvas loaded correctly under the `/yellow-duck-trust-nothing/` subfolder.

Below are the screenshots captured during browser verification:

![Initial Page Load](C:\Users\user\.gemini\antigravity-ide\brain\db49b7e6-312e-4f32-8020-a286d5586ccd\initial_page_load_1780975146738.png)
![Game Canvas State](C:\Users\user\.gemini\antigravity-ide\brain\db49b7e6-312e-4f32-8020-a286d5586ccd\game_canvas_state_1780975162263.png)
![Post Click Canvas State](C:\Users\user\.gemini\antigravity-ide\brain\db49b7e6-312e-4f32-8020-a286d5586ccd\post_click_state_1780975190140.png)

---

## Phase 5: Architecture Refactoring & Gameplay Runtime Stability

We refactored the Phaser game architecture to resolve runtime crashes, secure the input system, and enforce world border constraints:

1. **Asset Loading Cleanliness (`BootScene.js`)**:
   - Removed all pre-load placeholder texture generation to prevent duplicate key collisions.
   - Implemented `generateMissingFallbacks()` to inspect loaded assets and create fallback textures only for items that failed to load at runtime.
   - Implemented `createAnimationSafe()` helper to create animations safely by verifying texture existence and checking frame count before generation.

2. **Animation & Respawn Crash Protection (`PlayerSystem.js`)**:
   - Implemented `playAnimationSafe()` to confirm an animation key exists before playing. Falls back to `'idle'` or stops animations if it is missing, preventing any Phaser crashes.
   - Replaced direct `.anims.play()` calls with `this.playAnimationSafe()`.
   - Updated `respawn()` to use `sprite.body.reset(x, y)` to cleanly reset velocity, acceleration, gravity, and position.

3. **World Border Clamp & Left Wall Collider (`PlayerSystem.js` & `GameScene.js`)**:
   - Implemented a vertical boundary constraint at the starting coordinate (`startX`). Clamps `sprite.x` and stops leftward acceleration/velocity.
   - Registered a static vertical boundary physics wall at `startX - 29` in `GameScene.js` to block player movement beyond the starting zone.

4. **Input Safety (`InputSystem.js` & `GameScene.js`)**:
   - Added a native browser `blur` event listener to reset input states on focus loss.
   - Reset input states immediately inside `onPause` and `onPlayerDeath` transitions to prevent key sticking.

5. **Full Runtime Gameplay Verification**:
   - Verified that the player can move right with keyboard and mobile controls.
   - Verified that backward movement past `startX` is blocked.
   - Verified that dying and respawning resets the player cleanly without crashing.
   - Verified that animations and the game loop run continuously.

---

## Phase 6: Deep Gameplay Runtime Stress Test

We ran an automated, intensive stress test in the browser to confirm loop stability and performance over extended periods:

- **FPS Stability**: Average FPS recorded was `59.61` (close to target 60 FPS), with a minimum of `53.55` occurring momentarily during rapid transitions.
- **Repeated Deaths & Respawns**: Successfully executed `12 / 12` deaths and respawns. The game loop recovered immediately every time with zero TypeErrors or freezes.
- **Input Spamming**: Processed `100` rapid key inputs (`A`, `D`, `W`) in under 5 seconds with zero sticking or input desync.
- **Boundary Collisions**: Tested clamping `50` times against the starting X boundary (`startX`). Counted `0` boundary violations or clips.
- **Memory & Loop Consistency**: Checked initial and final memory usage. JS Heap grew by only `2.38 MB` over the 4+ minute run. Total frames processed: `13,201` frames. Uncaught errors: `0`.
- **Achievements & Loop**: The bot waddled around continuously for 3 minutes, successfully unlocking the `First Steps` and `Determination` achievements without any degradation in frame rates or physics updates.

---

## Phase 7: Runtime Diagnostics Instrumentation Layer

We implemented a real-time runtime diagnostics instrumentation layer to capture performance metrics, gameplay events, and errors in a structured console format.

1. **Structured Log Categories**:
   - `[METRIC]`: Captures game loop metrics every second, outputting FPS, frame delta, frame number, and JS Heap size (e.g., `[METRIC] [2026-06-09T04:24:23.000Z] FPS: 60 | Loop Delta: 16.67ms | Frame: 456 (+60) | Heap Memory: 32 MB`).
   - `[EVENT]`: Logs logical state changes, startup events, and transitions (e.g., player movement state changed, death triggered, respawn triggered, animation play triggers) with additional context data.
   - `[ERROR]`: Intercepts and logs critical issues such as uncaught window script errors, unhandled promise rejections, and Phaser-specific load errors (missing textures, insufficient frames).

2. **File Updates**:
   - **[NEW]** [Diagnostics.js](file:///d:/Ai/Antigravity/Github/yellow-duck-trust-nothing/src/utils/Diagnostics.js): Centralized logging methods, interval loop, window/promise event listeners, and formatted output logic.
   - **[MODIFY]** [game.js](file:///d:/Ai/Antigravity/Github/yellow-duck-trust-nothing/src/core/game.js): Imports and initializes diagnostics at the very start of execution.
   - **[MODIFY]** [PlayerSystem.js](file:///d:/Ai/Antigravity/Github/yellow-duck-trust-nothing/src/systems/PlayerSystem.js): Triggers state transitions for movement states (`idle`, `walk_left`, `walk_right`, `jump`, `fall`) with velocity/position data, de-duped to prevent console flooding. Logs death, respawn, and animation play attempts.
   - **[MODIFY]** [BootScene.js](file:///d:/Ai/Antigravity/Github/yellow-duck-trust-nothing/src/scenes/BootScene.js): Logs missing textures and animation generation failures using `[ERROR]`.

3. **Validation & Verification**:
   - Built the application successfully using `npm run build`.
   - Verified that logging formatting is exact and respects `[METRIC]`, `[EVENT]`, and `[ERROR]` prefixes.
   - Verified that movement state changes are correctly de-duped and print only on transition.





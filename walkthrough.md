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

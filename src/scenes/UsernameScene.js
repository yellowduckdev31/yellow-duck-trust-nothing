/**
 * UsernameScene.js
 * 
 * Username creation screen.
 * Responsible for:
 *   - Displaying username input field
 *   - Validating username (3-16 chars, alphanumeric, unique)
 *   - Checking uniqueness against Firebase
 *   - Creating user record in Firestore
 *   - Transitioning to MainMenuScene
 * 
 * References: PROJECT_CONTEXT.md
 */

import { SCENES, GAME_CONFIG, COLORS_HEX } from '../core/config.js';
import { UIHelper } from '../ui/UIHelper.js';

export class UsernameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.USERNAME });
    this.currentInput = '';
  }

  create() {
    const { width, height } = this.scale;
    
    this.saveSystem = this.registry.get('saveSystem');
    this.firebaseService = this.registry.get('firebaseService');

    // 1. Check if user already exists locally
    if (this.saveSystem && this.saveSystem.data.username) {
      console.log(`Auto-login as ${this.saveSystem.data.username}`);
      this.scene.start(SCENES.MAIN_MENU);
      return;
    }

    // Dark Background Panel
    UIHelper.createPanel(this, width / 2, height / 2, 500, 300);

    // Title
    UIHelper.createText(this, width / 2, height / 2 - 100, 'CREATE USERNAME', 32, COLORS_HEX.YELLOW);

    // Helper Text
    UIHelper.createText(this, width / 2, height / 2 - 50, '3-16 chars, letters & numbers only', 16, COLORS_HEX.WHITE);

    // Input Field (Simulated click to prompt)
    const inputBg = this.add.rectangle(width / 2, height / 2, 300, 40, 0x000000).setStrokeStyle(2, 0xFFFFFF);
    inputBg.setInteractive({ useHandCursor: true });
    
    this.inputText = UIHelper.createText(this, width / 2, height / 2, 'Click to Enter Name...', 20, '#AAAAAA');
    
    inputBg.on('pointerdown', () => {
      const name = window.prompt("Enter your Username (3-16 chars, Alphanumeric):", this.currentInput);
      if (name !== null) {
        this.currentInput = name.trim();
        this.inputText.setText(this.currentInput || 'Click to Enter Name...');
        this.inputText.setColor(this.currentInput ? '#FFFFFF' : '#AAAAAA');
      }
    });
    
    // Status message
    this.statusText = UIHelper.createText(this, width / 2, height / 2 + 50, '', 16, COLORS_HEX.SPIKE_RED);

    // Submit Button
    this.submitBtn = UIHelper.createButton(this, width / 2, height / 2 + 100, 'SUBMIT', () => {
      this.onSubmit();
    }, 200, 40);
  }

  async onSubmit() {
    console.log('[Diagnostics] onSubmit triggered. Current input:', this.currentInput);

    if (!this.currentInput) {
      console.log('[Diagnostics] Validation failed: Username is empty.');
      this.statusText.setText('Username cannot be empty.');
      return;
    }

    // 1. Local Validation
    const regex = /^[a-zA-Z0-9]+$/;
    const isLengthValid = this.currentInput.length >= GAME_CONFIG.USERNAME.MIN_LENGTH && this.currentInput.length <= GAME_CONFIG.USERNAME.MAX_LENGTH;
    const isAlphanumeric = regex.test(this.currentInput);

    console.log('[Diagnostics] Username validation details:', {
      username: this.currentInput,
      length: this.currentInput.length,
      minLength: GAME_CONFIG.USERNAME.MIN_LENGTH,
      maxLength: GAME_CONFIG.USERNAME.MAX_LENGTH,
      isLengthValid,
      isAlphanumeric
    });

    if (!isLengthValid) {
      this.statusText.setText(`Must be ${GAME_CONFIG.USERNAME.MIN_LENGTH}-${GAME_CONFIG.USERNAME.MAX_LENGTH} characters.`);
      return;
    }
    if (!isAlphanumeric) {
      this.statusText.setText('Letters and numbers only.');
      return;
    }

    // Diagnostics: Authentication state
    const auth = this.firebaseService ? this.firebaseService.auth : null;
    const db = this.firebaseService ? this.firebaseService.db : null;
    console.log('[Diagnostics] Firebase Auth / DB existence check:', {
      firebaseServiceExists: !!this.firebaseService,
      isInitialized: this.firebaseService?.isInitialized,
      authExists: !!auth,
      dbExists: !!db
    });

    if (auth) {
      console.log('[Diagnostics] Firebase Auth currentUser details:', auth.currentUser ? {
        uid: auth.currentUser.uid,
        isAnonymous: auth.currentUser.isAnonymous,
        email: auth.currentUser.email
      } : 'No current user (not authenticated)');
    }

    this.statusText.setText('Validating with Server...');
    this.statusText.setColor(COLORS_HEX.WHITE);
    
    try {
      // 2. Check Uniqueness
      console.log('[Diagnostics] Sending Firestore request: checking usernameExists for:', this.currentInput);
      const exists = await this.firebaseService.usernameExists(this.currentInput);
      console.log('[Diagnostics] Firestore response: usernameExists =', exists);

      if (exists) {
        console.log('[Diagnostics] Validation failed: Username is already taken.');
        this.statusText.setText('Username taken! Try another.');
        this.statusText.setColor(COLORS_HEX.SPIKE_RED);
        return;
      }

      this.statusText.setText('Creating Account...');

      // 3. Create User in Firebase
      const userData = {
        username: this.currentInput,
        currentLevel: 1,
        score: 0,
        lives: GAME_CONFIG.STARTING_LIVES,
        deaths: 0,
        playTime: 0,
        bestTimes: {},
        achievements: []
      };

      console.log('[Diagnostics] Sending Firestore request: createUser with payload:', JSON.stringify(userData));
      const newUser = await this.firebaseService.createUser(userData);
      console.log('[Diagnostics] Firestore response: createUser succeeded. Result user data:', JSON.stringify(newUser));
      
      // 4. Save locally
      if (this.saveSystem) {
        console.log('[Diagnostics] Saving user data locally in SaveSystem.');
        this.saveSystem.data = newUser;
        this.saveSystem.save(); // Persist
      } else {
        console.warn('[Diagnostics] SaveSystem is not available on registry.');
      }

      console.log('[Diagnostics] Successfully signed in and created user. Transitioning to main menu...');
      // Transition to main menu
      this.scene.start(SCENES.MAIN_MENU);

    } catch (error) {
      console.error('[Diagnostics] Exception caught during username submission process:', error);
      if (error) {
        console.error('[Diagnostics] Error details:', {
          name: error.name,
          code: error.code, // Firebase standard error code
          message: error.message,
          stack: error.stack
        });
        
        // Log all properties of the error object
        try {
          const keys = Object.getOwnPropertyNames(error);
          const errObj = {};
          keys.forEach(k => { errObj[k] = error[k]; });
          console.error('[Diagnostics] Fully inspected error properties:', JSON.stringify(errObj, null, 2));
        } catch (e) {
          console.error('[Diagnostics] Failed to serialize error object properties:', e);
        }
      }

      this.statusText.setText('Network error. Try again.');
      this.statusText.setColor(COLORS_HEX.SPIKE_RED);
    }
  }
}



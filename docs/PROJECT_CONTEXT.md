# PROJECT_CONTEXT.md

# YELLOW DUCK: TRUST NOTHING

## MASTER PROJECT CONTEXT

## SINGLE SOURCE OF TRUTH

Version: 1.0

This document is the authoritative source for all AI agents, developers, artists, level designers, and code generators.

Any generated code, assets, systems, levels, UI, audio, documentation, or architecture must follow this document.

If any future instruction conflicts with this document, this document takes priority unless explicitly overridden by the project owner.

---

# SECTION 01 — PROJECT OVERVIEW

Project Name:
Yellow Duck: Trust Nothing

Genre:
2D Troll Platformer

Platform:
HTML5 Web Game

Deployment:
GitHub Pages
Itch.io

Engine:
Phaser 3

Language:
JavaScript

Backend:
Firebase

Database:
Firestore

Target Devices:

Desktop Browser

Mobile Browser

Tablet Browser

---

# SECTION 02 — HIGH CONCEPT

Yellow Duck: Trust Nothing adalah game platformer 2D yang berfokus pada jebakan tak terduga, kematian berulang, pembelajaran melalui kegagalan, dan humor.

Pemain mengendalikan Yellow Duck, seekor bebek humanoid berjas hitam yang harus mencapai pintu keluar pada setiap level.

Setiap level dirancang untuk mengejutkan pemain namun tetap adil setelah mekanik jebakan dipahami.

Core Experience:

Surprise

Humor

Quick Retry

Player Learning

---

# SECTION 03 — DESIGN PILLARS

PILLAR 1

Surprise

Player should never predict every trap.

---

PILLAR 2

Quick Retry

Respawn must happen quickly.

Target:

0.8 seconds maximum.

---

PILLAR 3

Humor

Deaths should feel funny rather than frustrating.

---

PILLAR 4

Fair Learning

Every trap must be avoidable once discovered.

Never create impossible traps.

---

# SECTION 04 — TARGET PLAYER

Casual Players

Platformer Fans

Level Devil Fans

Mobile Players

Desktop Players

---

# SECTION 05 — GAME FLOW

Boot

↓

Username Creation

↓

Main Menu

↓

Level Select

↓

Gameplay

↓

Level Complete

↓

Next Level

↓

Victory Screen

↓

Secret Level Unlock

---

# SECTION 06 — PLAYER CHARACTER

Name:
Yellow Duck

Species:
Anthropomorphic Duck

Visual Identity:

Large Yellow Duck Head

Orange Beak

White Eyes

Black Suit

Human Body

Black Shoes

Confident Expression

Personality:

Confident

Curious

Slightly Arrogant

Frequently Fails

Never Angry

---

# SECTION 07 — CONTROLS

Desktop

Move Left

A / Left Arrow

Move Right

D / Right Arrow

Jump

W / Space / Up Arrow

Pause

ESC

Mouse

UI Interaction

---

Mobile

Virtual Left Button

Virtual Right Button

Virtual Jump Button

Pause Button

Buttons must be:

Responsive

Fixed Position

Semi Transparent

---

# SECTION 08 — PLAYER STATS

Lives

Current Level

Current Score

Total Deaths

Play Time

Best Time

Achievements

---

# SECTION 09 — LIVES SYSTEM

Starting Lives:

5

Lose Life:

Spike

Trap

Fall

Hazard

When Lives Reach Zero:

Game Over

Options:

Retry

Main Menu

Continue

---

# SECTION 10 — SCORE SYSTEM

Formula:

Base Score

* Time Bonus

* Life Bonus

- Death Penalty

Ranking is based on Score.

Leaderboard never resets.

---

# SECTION 11 — DEATH SYSTEM

Death Types

Spike Death

Fall Death

Trap Death

Fake Exit Death

Death Sequence

Freeze Frame

0.1 sec

↓

Screen Shake

↓

Particle Effect

↓

Funny Death Message

↓

Fade

↓

Respawn

Target Duration

0.8 seconds

---

# SECTION 12 — FUNNY DEATH MESSAGES

Minimum:

100 unique messages

Style:

Short

Dry Humor

Sarcastic

Maximum:

2 Lines

Examples:

The floor lied.

Trust issues unlocked.

Professional duck mistake.

Gravity says hello.

Nice plan.

You trusted that?

---

# SECTION 13 — BEST TIME SYSTEM

Track best completion time per level.

Display:

BEST TIME

00:24

If new record:

NEW RECORD

---

# SECTION 14 — SAVE SYSTEM

Auto Save

Saved Data

Username

Current Level

Score

Lives

Deaths

Play Time

Achievements

Best Times

Save Triggers

Level Complete

Pause

Exit

Game Over

---

# SECTION 15 — ACCOUNT SYSTEM

Player enters username before playing.

Rules:

Minimum 3 characters

Maximum 16 characters

Letters and numbers only

Unique username required.

If username already exists:

This username already exists.

Choose another username.

Username cannot be changed after creation.

---

# SECTION 16 — FIREBASE DATABASE

Collections

users

leaderboard

statistics

achievements

---

Users Structure

username

currentLevel

score

lives

deaths

playTime

bestTimes

achievements

createdAt

updatedAt

---

Leaderboard Structure

username

score

deaths

completedLevels

bestTime

updatedAt

---

# SECTION 17 — FIREBASE RULES

User may only edit own data.

User may not overwrite another player.

Username is immutable.

Leaderboard updates only from authenticated owner.

No anonymous leaderboard entries.

---

# SECTION 18 — ACHIEVEMENTS

Minimum:

25 achievements

Examples:

FIRST_DEATH

DIE_10

DIE_50

DIE_100

COMPLETE_LEVEL_NO_DEATH

COMPLETE_ALL_LEVELS

FIND_SECRET_AREA

MASTER_DUCK

TRUST_NOTHING

---

# SECTION 19 — LEVEL STRUCTURE

Total Levels

10

Secret Level

1

Total

11

---

Level 1

Tutorial

---

Level 2

Static Spikes

---

Level 3

Fake Floor

---

Level 4

Hidden Spike

---

Level 5

Moving Platform

---

Level 6

Fake Exit

---

Level 7

Trap Combination

---

Level 8

Reverse Logic

---

Level 9

Multi Trap

---

Level 10

Final Devil Stage

---

Secret Level 11

Nightmare Duck

---

# SECTION 20 — CHECKPOINT RULES

Level 1-3

No Checkpoint

Level 4-6

1 Checkpoint

Level 7-10

2 Checkpoints

Secret Level

No Checkpoint

---

# SECTION 21 — LEVEL DESIGN RULES

Every trap must teach something.

Every death must feel fair.

Never create unavoidable traps.

Never require pixel-perfect jumps.

Always leave reaction time.

Never completely hide the goal.

Target Completion Time:

1-3 minutes per level

Target Death Count:

100-150 total deaths for average player.

---

# SECTION 22 — SECRET AREAS

Secret Areas Required:

Level 3

Level 6

Level 8

Level 10

Rewards

Achievement

Bonus Score

Hidden Statistics

---

# SECTION 23 — VISUAL STYLE

Style

Pixel Art

Perspective

2D Side View

Grid

16x16

Character Size

48x64 px

Environment

16x16 Tiles

UI

Pixel Art

---

# SECTION 24 — COLOR PALETTE

Yellow

#FFD43B

Dark Yellow

#E5B800

Orange

#F28C28

Black Suit

#1A1A1A

White

#FFFFFF

Spike Red

#C62828

---

# SECTION 25 — ENVIRONMENT STYLE

Theme

Dark Mysterious World

Background

Near Black

Platforms

Gray

Walls

Dark Gray

Hazards

Bright Red

Goal Door

Golden Yellow

---

# SECTION 26 — UI STYLE

Theme

Minimal Pixel Art

No Modern Flat Design

No Rounded Corners

Dark Panels

White Text

Light Gray Borders

Pressed Button Scale

95%

---

# SECTION 27 — AUDIO STYLE

Cartoon

Funny

Lighthearted

Punchy

No Gore

No Horror

No Realistic Pain Sounds

---

# SECTION 28 — CAMERA

Follow Player

Smooth Follow

Lerp

0.15

Zoom

1

Screen Shake Supported

---

# SECTION 29 — PHYSICS

Engine

Arcade Physics

Gravity

1000

Move Speed

220

Jump Force

-450

---

# SECTION 30 — SCENE FLOW

BootScene

↓

UsernameScene

↓

MainMenuScene

↓

LevelSelectScene

↓

GameScene

↓

LevelCompleteOverlay

↓

Next Level

↓

VictoryScene

↓

LeaderboardScene

---

# SECTION 31 — SYSTEMS

PlayerSystem

InputSystem

TrapSystem

SaveSystem

LeaderboardSystem

AchievementSystem

AudioSystem

CameraSystem

DeathSystem

ScoreSystem

FirebaseService

---

# SECTION 32 — LEVEL JSON SCHEMA

{
"level": 1,
"name": "First Steps",

"spawn": {
"x": 100,
"y": 500
},

"goal": {
"x": 1800,
"y": 500
},

"platforms": [],

"traps": [],

"checkpoints": []
}

All levels must follow this schema.

Never hardcode levels.

---

# SECTION 33 — ASSET NAMING CONVENTION

Character

YD_[Action].png

Examples

YD_Idle.png

YD_Walk.png

YD_Jump.png

---

Trap

TRAP_[Name].png

---

UI

UI_[Name].png

---

Levels

level_##.json

---

# SECTION 34 — ASSET MANIFEST

Character Assets

YD_Idle.png

YD_Walk.png

YD_Jump.png

YD_Fall.png

YD_Death.png

YD_Portrait.png

YD_Menu.png

---

Trap Assets

TRAP_StaticSpike.png

TRAP_MovingSpike.png

TRAP_HiddenSpike.png

TRAP_FakeFloor.png

TRAP_FallingPlatform.png

TRAP_MovingPlatform.png

TRAP_FakeExit.png

---

Environment Assets

GroundTile.png

WallTile.png

GoalDoor.png

CheckpointFlag.png

Background_01.png

Background_02.png

Background_03.png

---

UI Assets

UI_HeartFull.png

UI_HeartEmpty.png

UI_Pause.png

UI_Play.png

UI_Continue.png

UI_Restart.png

UI_Settings.png

UI_Leaderboard.png

UI_Achievement.png

UI_GameOverPanel.png

UI_LevelCompletePanel.png

UI_UsernamePanel.png

UI_SecretArea.png

---

Audio Assets

BGM_Menu.mp3

BGM_Gameplay.mp3

BGM_FinalLevel.mp3

SFX_Jump.wav

SFX_Death.wav

SFX_Fall.wav

SFX_Button.wav

SFX_Achievement.wav

SFX_LevelComplete.wav

---

# SECTION 35 — PROJECT STRUCTURE

src/

core/

scenes/

systems/

entities/

ui/

services/

data/

utils/

assets/

levels/

firebase/

public/

docs/

---

# SECTION 36 — AGENT RULES

Never change gameplay without approval.

Never redesign Yellow Duck.

Do not add RPG systems.

Do not add weapons.

Do not add inventory.

Do not add crafting.

Do not add multiplayer.

Keep code modular.

Prefer composition over inheritance.

Never duplicate systems.

Never create multiple save systems.

Never create multiple leaderboard systems.

Every level must load from JSON.

All assets must follow this document.

All online data must use FirebaseService.

All player data must use SaveSystem.

---

# SECTION 37 — PERFORMANCE TARGETS

Desktop

60 FPS

Mobile

60 FPS

Minimum

30 FPS

Loading Time

Under 3 Seconds

---

# SECTION 38 — ORIENTATION

Preferred

Landscape

If portrait detected:

Show Rotate Device Message

Gameplay is designed for landscape.

---

# SECTION 39 — DEPLOYMENT

Primary

GitHub Pages

Secondary

Itch.io

Optional

Firebase Hosting

---

# SECTION 40 — AI DEVELOPMENT PRIORITY

Priority Order

1. Gameplay
2. Readability
3. Stability
4. Performance
5. Visual Effects

When in doubt:

Gameplay wins.

End of Document.

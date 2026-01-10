# Changes to Node Modules Files (gitignored)

This section summarizes all changes made to files in `apps/node_modules/@code-dot-org/maze/src/` that are gitignored but contain important modifications to make animations work correctly with method 2 animation disable.

## File Modified

`apps/node_modules/@code-dot-org/maze/src/animationsController.js`

---

## animationsController.js

### 1. Disabled Turn Animations (`scheduleTurn` method)

**Location:** Line ~452-460

**Changes:**
- **OLD:** Used `tiles.directionToFrame(endDirection)` which multiplies direction by 4, causing incorrect frame selection for 4-column sprite sheets
- **NEW:** Directly uses direction (0=N, 1=E, 2=S, 3=W) as frame number
- Removed all `clip_rect` manipulation and animation loops
- Instantly updates pegman display without animation

**Code:**
```javascript
scheduleTurn(endDirection, pegmanId) {
  // DISABLED: Turn animations completely - just update direction without clip_rect manipulation
  // Use direction directly as frame (0=N, 1=E, 2=S, 3=W) for 4-column sprite sheets
  var x = this.maze.getPegmanX(pegmanId);
  var y = this.maze.getPegmanY(pegmanId);
  // Use direction directly as column index (0, 1, 2, 3) instead of directionToFrame
  var frame = tiles.constrainDirection4(endDirection);
  this.displayPegman(x, y, frame, pegmanId);
}
```

### 2. Disabled Turn Animations (`simpleTurn` method)

**Location:** Line ~469-490

**Changes:**
- **OLD:** Had animation loop with multiple frames and timeouts
- **NEW:** Instant update without any animation frames
- Uses direction (0-3) directly as frame number
- Commented out original animation code

**Code:**
```javascript
simpleTurn(endDirection, pegmanId) {
  // DISABLED: Turn animations for bird/scrat - instant update (0 seconds)
  // Use direction directly as frame (0=N, 1=E, 2=S, 3=W) for 4-column sprite sheets
  var frame = tiles.constrainDirection4(endDirection);
  this.displayPegman(
    this.maze.getPegmanX(pegmanId),
    this.maze.getPegmanY(pegmanId),
    frame,
    pegmanId);
  // COMMENTED OUT: Original animation code with frames and timeouts
}
```

### 3. Global Animation Disabling (Idle Animation)

**Location:** Line ~32-56

**Changes:**
- Force `numFrames = 1` to prevent animation loop
- Commented out `setInterval` that was cycling through idle animation frames

**Code:**
```javascript
// GLOBAL ANIMATION DISABLE: Force numFrames to 1 to prevent animation loop
var numFrames = 1; // this.maze.skin.idlePegmanRow;

// GLOBAL ANIMATION DISABLE: Commented out setInterval to prevent animation loop
// setInterval(() => { ... }, timePerFrame);
```

### 4. Global Animation Disabling (Move Animation)

**Location:** Line ~336-355, 374-414

**Changes:**
- Force `numFrames = 1` in `scheduleSheetedMovement_`
- Force `numFrames = 1` in `scheduleMove`
- Added multiple `setTimeout` calls to aggressively ensure `pegmanIcon` stays visible after movement

**Code:**
```javascript
// In scheduleSheetedMovement_:
numFrames = 1; // GLOBAL ANIMATION DISABLE: Force numFrames to 1

// In scheduleMove:
numFrames = 1; // GLOBAL ANIMATION DISABLE: Force numFrames to 1

// After movement, multiple timeouts to ensure pegmanIcon visibility:
timeoutList.setTimeout(() => {
  pegmanIcon.setAttribute('visibility', 'visible');
  pegmanIcon.setAttribute('opacity', '1');
}, 50);
// ... additional timeouts at 100ms, 200ms, 500ms, 1000ms
```

### 5. Global Animation Disabling (Celebrate Animation)

**Location:** Line ~700-757

**Changes:**
- Force `numFrames = 1` for celebrate animation
- Added code to show pegman icon after celebration completes
- Multiple timeouts to ensure pegman icon stays visible

**Code:**
```javascript
// GLOBAL ANIMATION DISABLE: Force numFrames to 1
const numFrames = 1; // this.maze.skin.celebratePegmanRow;

// After celebrate animation:
timeoutList.setTimeout(() => {
  // Hide celebrate and idle icons
  // Show pegman icon with multiple visibility checks
  [50, 100, 200, 500, 1000].forEach(delay => {
    timeoutList.setTimeout(() => {
      pegmanIcon.setAttribute('visibility', 'visible');
      pegmanIcon.setAttribute('opacity', '1');
    }, delay);
  });
}, timePerFrame * numFrames);
```

### 6. Global Animation Disabling (Hitting Wall Animation)

**Location:** Line ~532-582

**Changes:**
- Force `numFrames = 1` for wall hit animation

**Code:**
```javascript
// GLOBAL ANIMATION DISABLE: Force numFrames to 1
var numFrames = 1; // this.maze.skin.hittingWallAnimationFrameNumber || 0;
```

### 7. Single-Column Sprite Support

**Location:** Line ~234-249, 260-273, 311-325

**Changes:**
- Added logic to handle single-column sprites differently from multi-column sprite sheets
- Single-column sprites don't need clip paths
- Single-column sprites are centered, not offset by direction

**Code:**
```javascript
if (options.numColPegman === 1) {
  // Single column: use actual sprite dimensions
  imgWidth = this.maze.PEGMAN_WIDTH;
  imgHeight = this.maze.PEGMAN_HEIGHT;
} else {
  // Multi-column sprite sheet: calculate from columns/rows
  imgWidth = this.maze.PEGMAN_WIDTH * (options.numColPegman || 4);
  imgHeight = this.maze.PEGMAN_HEIGHT * (options.numRowPegman || 1);
}

// Only apply clip path for multi-column sprites
if (options.numColPegman !== 1) {
  img.setAttribute('clip-path', 'url(#' + pegmanClipId + ')');
}
```

### 8. Fix Scrat Initial Display in Reset

**Location:** Line ~121-196

**Changes:**
- Ensured `pegmanIcon` is visible for scrat even if `idlePegmanAnimation` is set
- Added explicit visibility and opacity settings

**Code:**
```javascript
// Reset pegman's visibility if there is only one pegman
const pegmanIcon = this.getPegmanIcon();
if (!this.maze.subtype.allowMultiplePegmen()) {
  pegmanIcon.setAttribute('opacity', 1);
}

if (this.maze.skin.idlePegmanAnimation) {
  pegmanIcon.setAttribute('visibility', 'hidden');
  var idlePegmanIcon = document.getElementById(
    utils.getPegmanElementId(pegmanElements.IDLE)
  );
  idlePegmanIcon.setAttribute('visibility', 'visible');
} else if (!this.maze.subtype.allowMultiplePegmen()) {
  pegmanIcon.setAttribute('visibility', 'visible');
}
```

---

## Summary of Key Changes

1. **Turn Animations Disabled:** All turn animations now instantly update without visual animation loops
2. **Frame Mapping Fixed:** Changed from `tiles.directionToFrame(direction)` (which multiplies by 4) to using direction directly (0-3) for 4-column sprite sheets
3. **Animation Frames Forced to 1:** All sprite sheet animations now show only the first frame
4. **Pegman Visibility:** Added aggressive timeouts to ensure pegman icon stays visible at end of level
5. **Single-Column Sprite Support:** Added logic to properly handle single-column sprites vs multi-column sprite sheets

---

## How to Apply These Changes

Since these files are in `node_modules` and gitignored:

1. Look for the separately provided file `animationsController_NEW.js`
2. Or, after installing/updating dependencies, manually apply the changes documented above


# Code.org Animation Disable Findings

This section summarizes the investigation and implementation work done to disable character animations in the Code.org Maze and Studio engines. It explains how animations work internally, evaluates two approaches, and documents the final recommended solution.

---

## Overview

Code.org characters are animated using sprite sheets and engine-level animation logic. The goal of this work was to disable animations globally so that characters always render as static images, regardless of sprite-sheet complexity or animation state.

Two approaches were explored:

1. Static sprite-sheet duplication (asset-level workaround)
2. Engine-level animation disable (logic-level solution)

After experimentation, engine-level changes were determined to be the most robust and maintainable solution.

---

## How Animations Work in Code.org

### Relevant Files

- apps/src/studio/studioAnimation.js
- apps/src/studio/studioSpriteSheet.js

### Sprite Sheet Model

Code.org characters are animated using sprite sheets, which are PNG images laid out in a strict rectangular grid of frames.

Typical properties:

- Columns represent facing direction  
  - Up, Right, Down, Left
- Rows represent animation frames
- Example sprite sheet:
  - move_avatar.png
  - 4 columns (directions)
  - N rows (frames per direction)

### Rendering Process

The animation engine:

1. Positions the sprite sheet so only one cell is visible
2. Uses a clip-path to hide the rest of the image
3. Advances the visible cell over time using a frame counter

Because this logic assumes a precise grid layout, any attempt to disable animation must either:
- Conform exactly to this system, or
- Override it entirely

---

## Method 1 — Static Sprite-Sheet Duplication

Goal: Disable animation without modifying engine code.

### Approach

A script was created to:

- Take a single static image
- Duplicate it across every frame position in a sprite sheet
- Produce a final PNG that the engine believes is animated, but visually remains static

The engine continues to animate, but every frame looks identical.

### Required Sprite Metadata

This method depends on exact knowledge of:

- Frame width and height
- Padding between frames
- Grid size (rows × columns)
- Final PNG dimensions

Even 1–2 pixels of error resulted in:
- Frame bleeding
- Jittering
- Misaligned rendering

Because Code.org sprite sheets vary widely in size and layout, this approach proved fragile.

---

## Grid Duplication Script (test.py)

Location: /mnt/data/test.py

### Example Configuration

    input_path = "psets/ps6/input.png"
    output_path = "output.png"

    repeat_x = 196  # number of columns
    repeat_y = 1    # number of rows

    final_width = 13720   # desired final PNG width
    final_height = 51     # desired final PNG height

    resize_factor = 51 / orig_h  # input desired sprite height

### Script Behavior

The script:

- Resizes the input sprite
- Tiles it across a specified grid
- Computes padding to match the engine’s expected layout
- Outputs a final PNG intended to align with the animation system

While technically effective in controlled cases, this solution does not scale across the Code.org asset ecosystem.

---

## Method 2 — Engine-Level Animation Disable (Preferred)

Goal: Disable animation directly in the engine, eliminating reliance on sprite-sheet metadata.

This approach modifies animation logic so the engine behaves as if every animation has exactly one frame.

### Files Modified

- apps/src/maze/skins.js
- apps/src/studio/StudioAnimation.js
- apps/src/studio/studioSpriteSheet.js

---

## Maze Engine Changes

### apps/src/maze/skins.js

Maze animations were forced to always reference the first frame only by constraining frame indices and counters:

- idlePegmanCol = 1
- idlePegmanRow = 1
- hittingWallAnimationFrameNumber = 1
- Other animation-related frame values similarly clamped

Effect:

- Maze never advances through multiple frames
- Each animation state (idle, moving, collision, etc.) always renders the same frame
- Characters appear completely static

Note: Maze uses 1-based indexing, which is why values are set to 1 instead of 0.

---

## Studio Engine Changes

### apps/src/studio/StudioAnimation.js

The animation API was modified so all animations:

- Report a frame count of 1
- Always render frame index 0

Conceptual pseudocode:

    getAnimationFrameCount() {
      return 1;
    }

    redrawCenteredAt(center, tickCount) {
      return 0;
    }

---

### apps/src/studio/studioSpriteSheet.js

Per-animation-type frame counts were also disabled:

    getAnimationFrameCount(animationType) {
      return 1;
    }

This ensures that all Studio animations, regardless of type or sprite sheet, are treated as single-frame animations.

---

## Why Method 2 Works Better

Advantages:

- No sprite metadata required
- Sprite-agnostic
- Robust to asset changes
- Simpler mental model

Core principle:

- Frame count = 1
- Frame index = 0 (Studio) or 1 (Maze)

Sprite sheets may still contain many frames, but the renderer is never allowed to advance beyond the first one.

---

## Comparison of Approaches

### Method 1 — Static Sprite-Sheet Duplication

Pros:
- No engine code changes
- Purely asset-based

Cons:
- Extremely fragile
- Requires exact sprite metadata
- Breaks easily with new or modified assets

---

### Method 2 — Engine-Level Animation Disable

Pros:
- Robust and maintainable
- Works for all characters and skins
- Independent of sprite-sheet layout
- Centralized, minimal code changes

Cons:
- Requires modifying core engine files

---

## Conclusion

While static sprite duplication can disable animations in limited cases, it is not reliable at scale. Engine-level changes provide a clean, global, and asset-agnostic solution.

Final recommendation:

Disable animations at the engine level by clamping animation frame count and frame index. This approach is simpler, more robust, and future-proof against sprite asset changes.

# System Architecture / IP-Bound Sprite Replacement
# Part I: Collision Detection Architecture
Upon establishing a working environment, an analysis of the collision detection logic within `studio.js` revealed that the system relies on two primary modules to handle static environment interactions and dynamic object interactions.

### 1. Wall Collision Prediction (`walls.js`)
This module functions as a predictive system, determining whether a sprite or item will collide with a static boundary before movement occurs.

+ **Primary Interface:** `willCollidableTouchWall(collidable, proposedPosition)`
    + **Function:** Evaluates whether moving to a `proposedPosition` will result in a collision.
    + **Delegation:** This function does not perform the geometric calculation itself. Instead, it delegates to `willRectTouchWall()`, which is implemented polymorphically based on the wall system in use.

+ **Implementation Strategies:**
    + **`TileWalls`:** Utilizes grid-based logic for collision checks.
    + **`CollisionMaskWalls`:** Utilizes bitmap mask checks for pixel-perfect collision.
    + **Architecture:** The base `Walls` class defines the interface, while subclasses implement the specific detection algorithms.

### 2. Object-State Tracking (`collidable.js`)
This module manages the lifecycle of collisions between two dynamic objects (sprites), tracking three distinct states: initiation, continuation, and cessation.

+ **Key Lifecycle Methods:**
    + `startCollision(a, b)`: Triggered a single time when two objects first intersect.
    + `endCollision(a, b)`: Resets the collision state, allowing future collision events to trigger `startCollision` again.

### 3. Integration within the Game Loop (`studio.js`)
The game loop orchestrates these systems in the following sequence per frame:

1. **Pre-Movement Check:** The engine invokes `willCollidableTouchWall()`.
    + *Condition:* If the return value is `true`, movement is restricted.
2. **Post-Movement Check:** The engine evaluates overlapping objects.
    + *Action:* If an overlap is detected, `startCollision()` is invoked to trigger relevant game events.

# Part II: Angry Birds
### 1. Angry Birds Sprite Asset Updates

- **Goal**: Avoid copyright from Angry Birds, provide global access to children in India
- **Folder Locations**: `apps/static/skins/birds/` and `build/package/media/skins/birds/` (MUST DO BOTH)
- **Changes**:
  - Replaced Angry Birds sprites with generic bird sprites from Code.org Skins drive by manually deleting and adding both into both the `apps/static/skins/birds/` folder and the `build/package/media/skins/birds/` folder 
    - IMPORTANT: must update BOTH `build` folder and `static` folder because build is for active sprites while static is just for version control
    - `build` folder is in .gitignore so may have to manually copy over changes from `static` because may not update automatically with branch switches or pulls
  - Used generic Code.org chick skin, chicken skin, greenery, and 8-bit grass background
    - Reused chick skin in `avatar.png` for all of the same still images
    - Created new `move_avatar.png` sprite sheet (7×9 grid, 600×1800px) with new chick sprites to imitate the original Angry Birds sprites sheet but still buggy for some reason (perhaps the metadata is faulty)
    - Greenery in `tiles.png` and `tiles-broken.png` had to be placed in the same format as the original `tiles.png` for Angry Birds to appear correctly
  - Sprites changes reflected in all Programming with Angry Birds maze levels
  - Old frame files (ie. `frame1.png`) for sprite sheet creation progress preserved but could be utilized or cleaned up in future steps as seen fit 
- **Documentation**: See `SPRITE_REPLACEMENT_PLAN.md` for more implementation details
- **Backup Files**: Original Angry Birds sprites preserved with `_old.png` and `_backup.png` suffixes for future developer use and easy reference

### 2. GIF Replacements for Angry Birds Animations

- **File Location**: `apps/src/maze/skins.js` birds CONFIGS section
- **Background**:
  - `apps/src/maze/skins.js`
    - Goal: visual theme configuration 
    - Defines skins for the maze levels (incl. bee, farmer, pvz, birds)
    - Configures animations, sprites, sounds, and other visual properties
    - Calls on the sprite assets from `apps/static/skins/birds/` and `build/package/media/skins/birds/` 
  - Some of the animation (ie. `movePegmanAnimation`) variables had GIF inputs to play 
  - Code.org generic sprite assets did not have generic GIFs suitable to update the Angry Birds level with
- **Changes**:
  - Reconfigured default Angry Birds GIFs with still generic Code.org PNGs
    - ie. `idlePegmanAnimation`: `idle_avatar.gif` → `avatar.png`
  - Created sprite sheet like `move_avatar.png` for some animations


# Part III: Environment Compatibility 

## Introduction: Architecture Incompatibility Analysis (Windows ARM)
A significant portion of the initial setup involved an investigation into the compatibility of the Code.org repository with Windows ARM hardware (Qualcomm Snapdragon processors). The following analysis details why the development environment is functionally incompatible with this architecture.

### System Specifications
+ **Host:** Windows 11 (ARM64)
+ **Hardware:** Qualcomm Snapdragon
+ **Virtualization:** WSL (Ubuntu for ARM64)

### Investigation Steps & Findings

1. **WSL and Package Repositories:**
   Running `wsl --install -d Ubuntu` on an ARM host deploys the ARM64 Linux kernel and repositories. Consequently, `apt install` commands retrieve ARM-specific binaries rather than the required x86 versions.

2. **Dependency Chain Failures:**
   The repository relies heavily on dependencies that require native C extensions and precompiled binaries specific to the **x86_64** architecture.
   + **Ruby Gems:** Native extensions (e.g., `ffi`, `mysql2`) failed to compile due to missing headers or unsupported architecture errors (`unsupported architecture: arm64-linux`).
   + **Node Packages:** `node-gyp` failed to build multiple packages. `prebuild-install` could not locate binaries for the `linux-arm64` platform.
   + **Toolchain:** Essential tools including `MiniRacer`, `chromedriver`, and `chromedriver-helper` lack valid ARM builds in the required versions.

### Conclusion on Infrastructure
To successfully build and run the environment, an x86-based infrastructure is mandatory (Native macOS, Linux, or x86 Virtualization). The project cannot be compiled on Windows ARM.


---

## Environment Configuration Challenges
During the setup of the development environment on x86 architecture, several configuration conflicts were identified regarding Ruby versioning, the asset pipeline, and memory allocation.

### 1. Ruby Version Architecture Conflicts
+ **Issue:** A discrepancy occurred where the Ruby library version (3.4.7) did not match the executable version (3.2.3).
+ **Root Cause:** The system contained conflicting Ruby installations managed concurrently by Ubuntu Snap, Ubuntu APT, and rbenv. The codebase strictly requires Ruby 3.1.0 via rbenv.
+ **Resolution:**
    1. Complete removal of system-level Ruby installations (Snap and APT).
    2. Reinstallation of `ruby-build`.
    3. Exclusive installation of Ruby 3.1.0 via rbenv to ensure environment isolation.

### 2. Asset Pipeline Failures (`code-studio.css`)
+ **Issue:** The Rails application reported `code-studio.css` as missing, persisting through `rake build` and `yarn build` execution.
+ **Analysis:** This was identified as a downstream effect of the previous Ruby mismatches and silent Webpack failures.
+ **Status:** **This issue was not resolved.** Despite fixing core dependencies, the asset pipeline failed to generate the required CSS file.

### 3. Webpack Memory Allocation
+ **Issue:** Webpack processes terminated silently after 1–2 minutes without explicit error logs.
+ **Root Cause:** The Node.js process exceeded the available memory within the Virtual Machine (approx. 2GB), leading to heap corruption and corrupted `.cache` files in `node_modules`.
+ **Resolution:**
    + Increased the Node memory limit: `export NODE_OPTIONS="--max_old_space_size=4096"`
    + Allocated additional RAM to the VM.
    
# Part IV: BB-8 and Elsa Sprite Analysis
### Complete Documentation for hoc2015x (SVG/Studio) and Elsa (Canvas/Turtle) Levels

---

## Overview: Two Rendering Systems

This document covers sprite analysis for two distinct game engines used in Code.org levels, each with different rendering technologies and inspection methods.

### BB-8 Levels (hoc2015x skin - Studio Engine)
- **Technology**: SVG (Scalable Vector Graphics)
- **Engine**: Studio - grid-based movement system
- **Sprites**: Individual DOM elements (`<image>` tags)
- **Inspection**: ✅ Right-click inspection works
- **Directory**: `apps/build/package/media/skins/hoc2015x/`

### Elsa Levels (elsa skin - Turtle/Artist Engine)
- **Technology**: HTML5 Canvas
- **Engine**: Turtle/Artist - drawing-based system
- **Sprites**: Pixels painted on single `<canvas>` bitmap
- **Inspection**: ❌ Cannot right-click individual sprites
- **Directory**: `apps/build/package/media/skins/elsa/`

### What is Canvas? (Elsa Levels)

The `<canvas>` element is an HTML5 feature that provides a blank rectangular area (bitmap) where JavaScript can draw graphics pixel-by-pixel using the Canvas 2D API. Unlike SVG:
- **No DOM elements per sprite** - sprites are just pixels painted on the canvas
- **Programmatic drawing** - JavaScript calls `context.drawImage()` to paint each frame
- **One surface for everything** - background, character, trails, decorations all on same canvas
- **Better performance** - ideal for games and animations with many moving parts
- **No HTML inspection** - can't right-click sprites because they're not HTML elements

---

## Key Functions to Know About

### Functions Affecting BOTH BB-8 and Elsa Levels

#### **Global Animation Disable**
**Implemented by:** Juliana Li (team member)

**Affected Files:**
- BB-8: `walk_bb-8.png`, `avatar_bb-8.png`
- Elsa: `avatar.png`

**BB-8 Implementation:**
- **Location**:
  - `apps/src/studio/StudioSpriteSheet.js:120-127`
  - `apps/src/studio/StudioAnimation.js:159-168`
- **Functions**: `getAnimationFrameCount()` and `getFrame()`
- **Effect**: Both functions hardcoded to always return 1 frame and frame index 0
- **Impact**:
  - `walk_bb-8.png`: Walking animation frozen at first frame - BB-8 appears static while moving
  - `avatar_bb-8.png`: Idle animation frozen at first frame (though sprite is hidden anyway)
- **Original Behavior** (now disabled): Would cycle through 19 frames for walking animation

**Elsa Implementation:**
- **Location**: `apps/src/turtle/skins.js:46`
- **Configuration**:
  ```javascript
  // GLOBAL ANIMATION DISABLE: Force numFrames to 1
  numFrames: 1,
  ```
- **Effect**: Freezes animation at single frame per rotation angle
- **Impact**:
  - `avatar.png`: Each of the 18 headings has only 1 frame (no walk cycle animation)
  - Character appears static while moving (no walking/flying animation)

**Why**: Deliberate modification with explicit "GLOBAL ANIMATION DISABLE" comments for both engines

---

### Functions Specific to BB-8 Levels (SVG/Studio Engine)

#### **1. Avatar Visibility Control**
**Affected Files:**
- `avatar_bb-8.png`

**Details:**
- **Location**:
  - `apps/src/studio/Sprite.js:441-444` (display logic)
  - `apps/src/studio/Sprite.js:313-315` (element creation)
- **Function**: `sprite.display()` - conditionally shows/hides sprites
- **Effect**: Sets SVG attribute `visibility="hidden"` when `sprite.visible === false`
- **Impact**:
  - `avatar_bb-8.png`: Loaded in DOM but completely hidden - never displayed in levels
- **Why**: Avatar sprite is designed for idle/standing animations, but BB-8 in these levels only uses the walking sprite (`walk_bb-8.png`)
- **DOM State**: Element exists with ID like `studioanimation_7` but remains invisible

---

#### **2. Tile Randomization (Deterministic Pseudo-Random)**
**Affected Files:**
- `tiles_background1.png`

**Details:**
- **Location**: `apps/src/studio/studio.js:3898-3908`
- **Function**: `Studio.drawWallTile()`
- **Effect**: When `wallVal === SquareType.WALL` (value: 4), randomly selects tile coordinates from top-left 2×2 section
- **Impact**:
  - `tiles_background1.png`: Each wall tile in the grid randomly picks from 4 possible patterns (positions 0-1 in both row and column)
- **Random Pool**:
  - Possible selections: `(row: 0, col: 1)`, `(row: 1, col: 0)`, `(row: 1, col: 1)`
  - Position `(0, 0)` explicitly avoided (see line 3907)
- **Deterministic Behavior**: Uses JavaScript's `Math.random()` which:
  - Uses same pseudo-random seed on each page load
  - Produces identical tile selection pattern every time
  - Same tiles appear in same positions after refresh
- **Observation**: All wall tiles in leftmost column show identical 4-monkey pattern due to deterministic seed

---

#### **3. SVG Clip-Path Technique**
**Affected Files:**
- `walk_bb-8.png`
- `avatar_bb-8.png`
- `tiles_background1.png`

**Details:**
- **Location**:
  - Character Sprites: `apps/src/studio/StudioAnimation.js:96-131` (createElement)
  - Character Sprites: `apps/src/studio/StudioAnimation.js:229-237` (redrawCenteredAt)
  - Background Tiles: `apps/src/studio/studio.js:3943-3973` (drawWallTile)
- **Function**: Creates SVG `<clipPath>` element that acts as a rectangular "window"
- **Effect**: Displays only one frame/tile from entire sprite sheet at a time
- **Impact**:
  - `walk_bb-8.png`: Shows single 100×100px BB-8 frame from 800×1900px sprite sheet (152 total frames)
  - `avatar_bb-8.png`: Shows single 100×100px frame from 2900×100px sprite sheet (21 total frames)
  - `tiles_background1.png`: Shows single 100×100px tile from 800×800px tile sheet (64 total tiles)
- **How It Works**:
  1. Load entire sprite sheet image (e.g., 800×1900px for walk_bb-8.png)
  2. Create SVG `<clipPath>` with `<rect>` sized to one frame (100×100px)
  3. Position `<clipPath>` at desired screen location (e.g., grid position)
  4. Apply negative x/y offsets to image element to shift desired frame into clip window
  5. Only the portion of the image within the clip-path rectangle is visible
- **Example**: To show column 2, row 5 of walk_bb-8.png at grid position (200, 300):
  - Clip-path rect: `x="200" y="300" width="100" height="100"`
  - Image position: `x="200 - 2×100" y="300 - 5×100"` = `x="0" y="-200"`
  - Result: Frame at position (2, 5) appears at screen position (200, 300)

---

#### **4. Tile Drawing (One-Time Rendering)**
**Affected Files:**
- `tiles_background1.png`

**Details:**
- **Location**: `apps/src/studio/studio.js:4007-4069`
- **Function**: `Studio.drawMapTiles()`
- **Effect**: Draws all background tiles once at level initialization, then caches
- **Impact**:
  - `tiles_background1.png`: Rendered once when level loads, reused for entire play session
- **Caching Mechanism**: Sets `Studio.tilesDrawn = true` after first render
- **Subsequent Calls**: Function returns early (line 4009-4011) if tiles already drawn
- **Why**: Performance optimization - avoids expensive re-rendering of background tiles
- **Loop Structure**:
  ```javascript
  for (row = 0; row < Studio.ROWS; row++) {
    for (col = 0; col < Studio.COLS; col++) {
      if (wallVal) Studio.drawWallTile(...);
    }
  }
  ```
- **Result**: Each wall position in 8×8 grid gets one tile element, rendered once

---

#### **5. Sprite Sheet Frame Calculation**
**Affected Files:**
- `walk_bb-8.png`
- `avatar_bb-8.png`

**Details:**
- **Location**: `apps/src/studio/StudioSpriteSheet.js:138-181`
- **Function**: `getFrame(animationType, animationIndex, frameIndex)`
- **Effect**: Calculates x,y pixel coordinates for specific frame within sprite sheet grid
- **Impact**:
  - `walk_bb-8.png`: Would determine which BB-8 pose to show based on direction and animation frame
  - `avatar_bb-8.png`: Would determine which idle frame to display
- **Current Status**: **DISABLED** - always returns coordinates `(x: 0, y: 0)` regardless of input
- **Original Logic** (lines 143-169, now commented out):
  - For packed sheets: Calculate absolute frame index, then compute row/column
  - For standard sheets: Use animationType and animationIndex to select column, frameIndex for row
  - Support for horizontal vs vertical sprite sheet layouts
- **Disabled Behavior** (lines 140-141):
  ```javascript
  var x = 0;
  var y = 0;
  // All original calculation code commented out
  ```
- **Return Value**: Always returns frame at top-left corner (0, 0) of sprite sheet

---

### Functions Specific to Elsa Levels (Canvas/Turtle Engine)

#### **1. Directional Rotation System** (Avatar Selection)
**Affected Files:**
- `avatar.png`

**Details:**
- **Location**: `apps/src/turtle/skins.js:41-48`
- **Configuration**:
  ```javascript
  elsa: {
    avatarSettings: {
      width: 73,
      height: 100,
      numHeadings: 18,  // 18 different rotation angles
      numFrames: 1,     // Only 1 animation frame per direction
    }
  }
  ```
- **Function**: Selects sprite frame based on character's current heading/rotation
- **Impact**:
  - `avatar.png`: Contains 18 different pterodactyl poses arranged in a grid
  - Each pose represents a 20° rotation increment (360° ÷ 18 = 20° per heading)
  - **Only ONE frame displayed at a time** based on character's facing direction
- **How It Works**:
  1. Character rotates to new heading (e.g., 60° from North)
  2. System calculates: `heading = 60° ÷ 20° = heading index 3`
  3. Canvas draws frame #3 from `avatar.png` sprite sheet
  4. Result: Character appears rotated in correct direction
- **Not Randomization**: Frame selection is **deterministic** based on rotation angle, not random
- **Sprite Sheet Grid**: 18 frames total (arranged in columns/rows within avatar.png)

---

#### **2. Canvas Drawing System**
**Affected Files:**
- All sprite files (avatar.png, elsaline.png, decoration_animation.png, background.jpg)

**Details:**
- **Location**: `apps/src/turtle/artist.js`
- **Core Functions**:
  - `CanvasRenderingContext2D.drawImage()` - Paints sprite pixels onto canvas
  - Animation loop continuously redraws canvas at ~60 FPS
- **Impact**:
  - **All sprites**: Rendered as pixels on single `<canvas>` element
  - **No DOM elements**: Cannot inspect individual sprites in HTML tree
  - **Frame-by-frame drawing**: Each animation frame redraws entire scene
- **Rendering Order**:
  1. Clear canvas (or draw over previous frame)
  2. Draw `background.jpg`
  3. Draw `elsaline.png` pattern along character's path
  4. Draw current frame from `avatar.png` (based on heading)
  5. Draw current frame from `decoration_animation.png` around avatar
- **Performance**: Faster than SVG for complex animations with many elements

---

#### **3. Line Pattern Tiling System**
**Affected Files:**
- `elsaline.png`

**Details:**
- **Location**: `apps/src/turtle/skins.js:55-61`
- **Configuration**:
  ```javascript
  linePatterns: {
    elsaLine: skin.assetUrl('elsaline.png'),
    elsaLine_2x: skin.assetUrl('elsaline_2x.png'),
  }
  ```
- **Function**: Repeats/tiles pattern along drawn paths
- **Impact**:
  - `elsaline.png`: Small pattern (800×35px) repeated continuously along character's trail
  - Creates visual texture for lines drawn by "move forward" commands
- **How It Works**:
  1. Character moves, leaving a trail
  2. Canvas repeatedly draws `elsaline.png` along the path
  3. Pattern tiles seamlessly to fill entire line length
- **Visible As**: White geometric pattern following character's movement path

---

#### **4. Decoration Animation Sprite Sheet**
**Affected Files:**
- `decoration_animation.png`

**Details:**
- **Location**: `apps/src/turtle/artist.js` (decorationAnimationImage)
- **Configuration**: Referenced in `apps/src/skins.js:24-25`
- **Sprite Sheet Structure**: 1615×85px (approximately 19 frames at 85px width each)
- **Function**: Animated effects that follow the avatar
- **Impact**:
  - `decoration_animation.png`: Cycles through ~19 frames of particle effects
  - Drawn around avatar position each frame
  - Creates "magical" visual enhancement (snowflakes, sparkles, etc.)
- **Current Observation**: Replacement shows only tiny orange dot, indicating mostly transparent/empty sprite sheet
- **Original Purpose**: Would display snowflakes or ice crystal effects around Elsa character

---

## Sprite Discovery Methods

### Method 1: Direct DOM Inspection (BB-8 Only - SVG)

**Applicable To:** BB-8 levels (hoc2015x skin)

**Why It Works:** SVG rendering creates individual DOM elements for each sprite that can be inspected

**Steps:**
1. Run BB-8 level on localhost
2. Right-click on any sprite (BB-8 character, background tile, goal)
3. Select "Inspect Element" from context menu
4. DevTools highlights the `<image>` element with `xlink:href` attribute
5. View full source URL: `http://localhost-studio.code.org:3000/blockly/media/skins/hoc2015x/[imagename].png`

**What You See:**
```html
<image id="studioanimation_36"
       xlink:href="/blockly/media/skins/hoc2015x/walk_bb-8.png"
       width="800"
       height="1900"
       clip-path="url(#studioanimation_clippath_36)">
</image>
```

**Result:** Direct identification of sprite file names and paths

---

**Key Discovery: Build Directory Confirmation (Deletion Test)**

After identifying potential source directories (`apps/static/skins/` vs `apps/build/package/media/skins/`), the following test confirmed the active directory:

**Test Procedure:**
1. Deleted an image file from `apps/build/package/media/skins/hoc2015x/`
2. Refreshed localhost browser
3. **Result**: Sprite disappeared from running game

**Conclusion:** All rendered sprites originate from the **build pathway** (`apps/build/package/media/skins/`), not the static pathway. The localhost server reads all image assets from the build directory at runtime.

**To Replace Sprites:** Modify image files in:
- BB-8: `apps/build/package/media/skins/hoc2015x/`
- Elsa: `apps/build/package/media/skins/elsa/`

---

### Method 2: Sources Panel (Elsa - Canvas)

**Applicable To:** Elsa levels (elsa skin)

**Why Needed:** Canvas rendering prevents direct sprite inspection via right-click

**Steps:**
1. Open Chrome DevTools (`Cmd+Opt+I`)
2. Navigate to **Sources** tab
3. Expand directory tree: `localhost-studio.code.org:3000` → `blockly` → `media` → `skins` → `elsa`
4. View all files in the directory with visual previews

**Result:**
Successfully identified 4 out of 5 image files:
- ✅ `avatar.png` (visible in Sources)
- ✅ `elsaline.png` (visible in Sources)
- ✅ `decoration_animation.png` (visible in Sources)
- ✅ `blank.png` (visible in Sources)
- ❌ `background.jpg` (NOT visible - likely cached before DevTools opened)

**Limitation:** Background image was missing from Sources view, requiring Method 3

---

### Method 3: Network Tab (Elsa - Canvas)

**Applicable To:** Elsa levels (elsa skin) - **Most reliable method for Canvas-based sprites**

**Why It Works:** Network tab captures all HTTP requests in real-time, regardless of caching or timing

**Steps:**
1. Keep Chrome DevTools open
2. Switch to **Network** tab
3. Click "Img" filter button to show only images
4. **Refresh the page** (`Cmd+R`)
5. Observe all images loading in real-time with file sizes

**Result:**
Successfully identified ALL 5 image files including the missing background:
- ✅ `avatar.png` (168 KB)
- ✅ `elsaline.png` (324 B)
- ✅ `decoration_animation.png` (1.6 KB)
- ✅ `blank.png` (14 KB)
- ✅ `background.jpg` (38 KB) ← Found via Network tab!

**Advantages:**
- Shows every asset the browser downloads
- Displays file sizes
- Works regardless of caching
- Can click on files to see previews and headers
- Most comprehensive method for Canvas-based levels

---

## Image Assets

### BB-8 Levels (hoc2015x skin)

**Directory:** `apps/build/package/media/skins/hoc2015x/`

#### Background & Environment

##### 1. **`background_background1.jpg`**
- **Purpose**: Main background image for all levels
- **Display**: Always visible, fills entire 400×400px play area
- **Rendering**: Static image, not part of sprite sheet system
- **Layer**: Bottom layer, behind all other elements

##### 2. **`tiles_background1.png`**
- **Purpose**: Background tile sprite sheet containing decorative monkey patterns
- **Dimensions**: 800×800px (8×8 grid of 100×100px tiles)
- **Content**: Multiple 4-monkey pattern variations
- **Selection**: Deterministic random from top-left 2×2 section (4 possible tiles)
- **Display**: Multiple instances on grid (e.g., top-left corner, top-right corner)
- **Grid Occupation**: Each tile occupies one square of the 8×8 game grid
- **Technique**: Uses SVG clip-path to show one 100×100px tile at a time
- **Affected By**:
  - Tile Randomization
  - SVG Clip-Path Technique
  - Tile Drawing (One-Time Rendering)

##### 3. **`cloud_light.png`**
- **Purpose**: Decorative cloud element
- **Animation**: Moves slowly from top-left to bottom-right
- **Behavior**: Same direction and speed in every level
- **Layer**: Foreground layer (above game grid)

##### 4. **`cloud_light2.png`**
- **Purpose**: Secondary decorative cloud element
- **Animation**: Moves slowly from bottom-right to top-left
- **Behavior**: Same direction and speed in every level
- **Layer**: Foreground layer (above game grid)

---

#### Character Sprites

##### 5. **`walk_bb-8.png`**
- **Purpose**: Main BB-8 character sprite used during movement
- **Dimensions**: 800×1900px
- **Layout**: Vertical grid (8 columns × 19 rows)
- **Content**:
  - 8 columns = 8 directional animations (N, NE, E, SE, S, SW, W, NW)
  - 19 rows = 19 animation frames per direction
  - Total: 152 unique BB-8 poses
- **Frame Size**: 100×100px (before 2× scaling)
- **Display Size**: 200×200px on screen (drawScale: 2)
- **Current Behavior**: Frozen at first frame (0, 0) due to GLOBAL ANIMATION DISABLE by Juliana Li
- **Visibility**: Active and visible when BB-8 is moving
- **Technique**: Uses SVG clip-path to display single frame at a time
- **Column Mapping** (Direction):
  - Col 0: South-East
  - Col 1: East
  - Col 2: North-East
  - Col 3: North
  - Col 4: North-West
  - Col 5: West
  - Col 6: South-West
  - Col 7: South
- **Row Mapping**: Animation frames 0-18 (19 total frames per direction)
- **Affected By**:
  - Global Animation Disable (Juliana Li)
  - SVG Clip-Path Technique
  - Sprite Sheet Frame Calculation

##### 6. **`avatar_bb-8.png`**
- **Purpose**: BB-8 idle/standing sprite (not used in these levels)
- **Dimensions**: 2900×100px
- **Layout**: Horizontal strip (29 columns × 1 row)
- **Content**: 21 frames for idle animation, 8 frames for directional turns
- **Frame Size**: 100×100px (before 2× scaling)
- **Current Behavior**:
  - Loaded in DOM with element ID (e.g., `studioanimation_7`)
  - Set to `visibility="hidden"` - completely invisible
  - Frozen at first frame (if it were visible)
- **Why Hidden**: These levels only use walking sprite; idle sprite not needed
- **Frame Breakdown**:
  - Frames 0-20: Idle animation sequence
  - Frames 21-28: Directional turns (8 directions)
- **Status**: Not displayed in hoc2015x levels
- **Affected By**:
  - Global Animation Disable (Juliana Li)
  - Avatar Visibility Control
  - SVG Clip-Path Technique
  - Sprite Sheet Frame Calculation

---

#### Goals

##### 7. **`goal.png`**
- **Purpose**: Goal/scrap metal markers that BB-8 must collect
- **Instances**: Reused 3 times per level at different grid positions
- **Behavior**: Each goal fades out when BB-8 touches it
- **Win Condition**: BB-8 must collect all goals to complete level
- **Animation**: Fade effect on collection (opacity transition)

---

#### Instructions

##### 8. **`blank.png`**
- **Purpose**: Blank/transparent image for instruction panels
- **Use Case**: Override avatar display in scripts without character face permissions
- **Location**: Appears in instruction modal, not on game grid
- **Reference**: `apps/src/studio/starwars/skins.js:766`

---

### Elsa Levels (elsa skin)

**Directory:** `apps/build/package/media/skins/elsa/`

#### Character & Animation

##### 1. **`avatar.png`**
- **Purpose**: Main character sprite sheet containing all rotation angles
- **Dimensions**: Variable width × 100px height per frame
- **File Size**: 168 KB
- **Layout**: Grid of 18 pterodactyl sprites (one per rotation angle)
- **Frame Size**: 73×100px per individual sprite
- **Content**: 18 unique poses representing 20° rotation increments (0°, 20°, 40°, ..., 340°)
- **Display**: Only ONE frame visible at any time, selected by character's heading
- **Rotation System**: 360° ÷ 18 = 20° per heading
- **Heading Mapping**:
  - 0: 0° (North - up)
  - 1: 20° (NNE)
  - 2: 40° (NE)
  - 3: 60° (ENE)
  - 4: 80° (E-right)
  - 5: 100° (ESE)
  - 6: 120° (SE)
  - 7: 140° (SSE)
  - 8: 160° (S-down)
  - 9: 180° (SSW)
  - 10: 200° (SW)
  - 11: 220° (WSW)
  - 12: 240° (W-left)
  - 13: 260° (WNW)
  - 14: 280° (NW)
  - 15: 300° (NNW)
  - 16: 320° (N)
  - 17: 340° (NNE)
- **Current Behavior**: Frozen at single frame per angle (no walk cycle animation) due to GLOBAL ANIMATION DISABLE by Juliana Li
- **Affected By**:
  - Directional Rotation System
  - Global Animation Disable (Juliana Li)
  - Canvas Drawing System

##### 2. **`decoration_animation.png`**
- **Purpose**: Animated particle effects that follow avatar
- **Dimensions**: 1615×85px
- **File Size**: 1.6 KB (custom version - mostly transparent)
- **Layout**: Horizontal sprite sheet (~19 frames)
- **Frame Size**: ~85×85px per frame
- **Estimated Frames**: ~19 (1615px ÷ 85px ≈ 19 frames)
- **Content**:
  - **Original (Elsa)**: Snowflakes, ice crystals, magical sparkles
  - **Current (Custom)**: Tiny orange dot with mostly transparent pixels
- **Animation**: Cycles through frames to create particle effect around character
- **Display**: Drawn around avatar position each frame, following character movement
- **Visible As**: Small animated decorations near character (currently just orange dot)
- **Original Purpose**: Add "magical" visual flair (snowflakes trailing Elsa)
- **Loop**: Cycles continuously while character moves
- **Affected By**:
  - Decoration Animation Sprite Sheet
  - Canvas Drawing System

---

#### Drawing Trails

##### 3. **`elsaline.png`**
- **Purpose**: Pattern texture for lines drawn by character
- **Dimensions**: 800×35px
- **File Size**: 324 B
- **Type**: 1-bit grayscale pattern
- **Layout**: Single horizontal strip (repeating pattern)
- **Content**: Geometric line pattern (white design on transparent)
- **Tiling**: Repeated/tiled along entire path as character moves
- **Display**: Shows up when using "move forward" or drawing commands
- **Visible As**: White geometric pattern trail following character's path
- **Seamless**: Designed to tile without visible seams
- **High-Res Version**: `elsaline_2x.png` (835 B) for retina displays
- **Menu Icon**: `elsaline-menuicon.png` shown in "Set Pattern" block
- **Affected By**:
  - Line Pattern Tiling System
  - Canvas Drawing System

---

#### Environment

##### 4. **`background.jpg`**
- **Purpose**: Static background scenery for level
- **Dimensions**: 383×383px
- **File Size**: 38 KB (standard resolution)
- **Content**: Green trees, hills, nature scenery
- **Display**: Always visible, fills entire play area
- **Rendering**: Drawn first (bottom layer) so other elements appear on top
- **Layer Order**: Background → Line trails → Avatar → Decorations
- **High-Res Version**: `background_2x.jpg` (82 KB) for retina displays
- **Discovery Method**: Found via Network tab (not visible in Sources panel)
- **Affected By**:
  - Canvas Drawing System

---

#### UI & Utility

##### 5. **`blank.png`**
- **Purpose**: Blank/transparent placeholder image
- **Dimensions**: Variable (small)
- **File Size**: 14 KB
- **Content**: Transparent or solid color fill
- **Use Case**: Override for instruction panel avatars in scripts without character face permissions
- **Location**: Appears in instruction modals, not on game canvas
- **Reference**: `apps/src/turtle/skins.js:64` and `apps/src/skins.js`
- **Why Needed**: Some levels can't display character faces due to licensing restrictions
- **Affected By**: UI rendering (separate from canvas gameplay area)

---

#### Additional Audio Assets (Not Visual)

The following audio files exist in the same directory but are not sprites:
- `start.mp3` / `start.ogg` - Level start sound
- `win.mp3` / `win.ogg` - Victory sound
- `failure.mp3` / `failure.ogg` - Failure sound

These are **not displayed visually** and were not part of the sprite inspection.

---

## Source Code Files Examined

### BB-8 Levels (SVG/Studio Engine)

#### Core Sprite Rendering System
- **`apps/src/studio/StudioSpriteSheet.js`**
  - Sprite sheet metadata management
  - Frame coordinate calculation (disabled by Juliana Li)
  - Grid layout handling (horizontal vs vertical)

- **`apps/src/studio/StudioAnimation.js`**
  - SVG animation element creation
  - Clip-path rendering technique
  - Frame-by-frame display logic
  - Animation disable implementation (Juliana Li)

- **`apps/src/studio/Sprite.js`**
  - Sprite visibility control
  - Display state management
  - Animation vs legacy animation switching

#### Skin Configuration
- **`apps/src/studio/skins.js`**
  - General skin loader
  - Skin-specific configurations: loadGumball, loadIceAge, loadInfinity, loadStudio

- **`apps/src/studio/starwars/skins.js`**
  - Star Wars skin configurations
  - `loadStarWarsGrid` function for hoc2015x skin (lines 743-945)
  - BB-8 sprite configuration (lines 854-878)

#### Game Engine & Logic
- **`apps/src/studio/studio.js`**
  - Main game loop and rendering
  - Tile drawing system (`drawMapTiles`, `drawWallTile`)
  - Sprite display management

- **`apps/src/studio/constants.js`**
  - SquareType enum (WALL, OPEN, SPRITESTART, etc.)
  - WallType enum (NORMAL_SIZE, DOUBLE_SIZE, JUMBO_SIZE)
  - Bitfield masks for tile coordinates

- **`apps/src/studio/levels.js`**
  - Level configuration data
  - Map arrays defining grid layout
  - Win conditions and game rules

#### Asset Directory
- **`apps/build/package/media/skins/hoc2015x/`**
  - Runtime source for all image files
  - Confirmed active directory via deletion testing
  - All 8 image assets listed above

---

### Elsa Levels (Canvas/Turtle Engine)

#### Canvas Rendering Engine
- **`apps/src/turtle/artist.js`**
  - Canvas drawing implementation
  - Decoration animation handling
  - Main game loop and rendering

#### Skin Configuration
- **`apps/src/turtle/skins.js`**
  - Elsa skin configuration (lines 39-65)
  - Avatar settings (numHeadings: 18, numFrames: 1)
  - Line pattern definitions
  - Animation disable comment (Juliana Li)

- **`apps/src/skins.js`**
  - Base skin loader (shared between BB-8 and Elsa)
  - Common asset definitions
  - decorationAnimation reference (lines 24-25)

#### Related Files
- **`apps/src/turtle/api.js`** - Turtle movement API
- **`apps/src/turtle/blocks.js`** - Block definitions for Elsa levels
- **`apps/src/turtle/toolbox.xml.ejs`** - Block toolbox configuration

#### Asset Directory
- **`apps/build/package/media/skins/elsa/`**
  - Runtime source for all image files
  - Confirmed active directory via deletion testing and Network tab inspection
  - All 5 image assets listed above

---

## Comparison: BB-8 (SVG) vs Elsa (Canvas)

| Aspect | BB-8 (SVG/Studio) | Elsa (Canvas/Turtle) |
|--------|-------------------|----------------------|
| **Engine** | Studio (grid-based) | Turtle/Artist (drawing-based) |
| **Rendering** | SVG elements | HTML5 Canvas bitmap |
| **Inspection** | ✅ Right-click works | ❌ Shows only `<canvas>` |
| **Sprite Discovery** | Method 1: DOM inspector | Methods 2 & 3: Sources/Network tabs |
| **Animation System** | SVG clip-path + offset | Canvas drawImage() |
| **Rotation** | 8 directions (fixed grid) | 18 angles (smooth rotation) |
| **Background** | Tiled sprites (randomized) | Single background image |
| **Trails** | Not applicable (grid movement) | Line patterns (turtle drawing) |
| **Performance** | Slower (many DOM elements) | Faster (single canvas) |
| **Debugging** | Easier (visible DOM) | Harder (programmatic drawing) |
| **Animation Disable** | StudioSpriteSheet.js, StudioAnimation.js | turtle/skins.js (numFrames: 1) |
| **Asset Count** | 8 image files | 5 image files |

---

## Key Takeaways

### BB-8 Levels
1. **SVG enables direct inspection**: Right-click sprites to see DOM elements and source URLs
2. **Build directory confirmed**: Deletion test proved `apps/build/package/media/skins/hoc2015x/` is active
3. **Clip-path technique**: Shows one frame at a time from large sprite sheets
4. **Deterministic randomization**: Tiles use pseudo-random selection with consistent results
5. **Animation disabled**: Juliana Li froze all animations at frame 0
6. **8 total assets**: Background, tiles, clouds, walk sprite, avatar (hidden), goal, blank

### Elsa Levels
1. **Canvas blocks traditional inspection**: Cannot right-click sprites like BB-8 levels
2. **Network tab is essential**: Most reliable way to see all loaded assets for Canvas
3. **Sources panel helps**: Shows most files but may miss cached assets like background
4. **Build directory confirmed**: Same deletion test method proved `apps/build/package/media/skins/elsa/` is active
5. **Rotation not randomization**: Avatar frame selection is deterministic based on heading (18 angles × 20°)
6. **Single canvas surface**: All sprites painted onto one `<canvas>` element
7. **Animation disabled**: Juliana Li set numFrames: 1 (no walk cycle)
8. **5 core assets**: avatar, decoration_animation, elsaline, background, blank

### Shared Insights
1. **Build pathway is universal**: Both BB-8 and Elsa sprites originate from `apps/build/package/media/skins/`
2. **Global animation disable**: Juliana Li disabled animations in both engines with different implementations
3. **Sprite sheets everywhere**: Both systems use multi-frame sprite sheets but show one frame at a time
4. **Deletion test works**: Removing files from build directory immediately breaks sprites (confirms active path)
5. **Official documentation ready**: This merged document provides comprehensive reference for Code.org team

# Part V: General Windows VM Setup

## Recommended VM settings

Many mysterious failures are just the VM running out of resources. Recommended VM specs:

* RAM: 8GB minimum
* CPU: 4-6 Cores
* Disk (Storage): 60-80GB

## VM/Codebase Setup

1. Install VirtualBox.
2. Download an Ubuntu ISO (22.04 LTS).
3. Create a VM using the specifications above.
4. Follow the VM setup instructions under the "Ubuntu 20.04" header here:  
   https://github.com/gubars/t4sg-f25-code-dot-org/blob/staging/SETUP.md#ubuntu-2004
5. Follow the general setup instructions under the "Overview" heading here:  
   https://github.com/gubars/t4sg-f25-code-dot-org/blob/staging/SETUP.md

## Common Issues/Solutions

### 1\. AWS Missing Credentials Errors

The 'locals.yml' file requires an empty string in the'properties\_encryption\_key' setting. However, setup defaults to the following:

```yaml
properties\\\\\\\_encryption\\\\\\\_key: “”
```

This default uses smart quotes which aren't interpreted as an empty string. To fix, replace the smart quotes with normal quotes:

```yaml
properties\\\\\\\_encryption\\\\\\\_key: ""
```

Additionally, since we are not accessing AWS endpoints, we should disable the messages relating to those:

```bash
export AWS\\\\\\\_EC2\\\\\\\_METADATA\\\\\\\_DISABLED=true
```

To make this a permanent change:

```bash
echo 'export AWS\\\\\\\_EC2\\\\\\\_METADATA\\\\\\\_DISABLED=true' >> ~/.bashrc
```

If you still see AWS credential errors, it likely means some config is still trying to access AWS (missing override).

### 2\. `bundle exec rake install` (uv and Python + Rust)

This command will often fail with error message `rake aborted! 'uv sync --dev' returned 1`

The underlying issue here is that uv uses Python 3.14 by default, but some Python packages in the bundle don't support Python 3.14

To fix, install Python 3.12 and force uv to use it (project only requires Python 3.11 or higher):

```bash
sudo apt install -y python3.12 python3.12-venv python3.12-dev
python3.12 --version
export UV\\\\\\\_PYTHON=python3.12
uv sync --dev
```

To make this permanent:

```bash
echo 'export UV\\\\\\\_PYTHON=python3.12' >> ~/.bashrc
```

Note that uv will often request that you install Rust. This only occurs when the Python version is not supported and is fixed by the above.

### 3\. `bundle exec rake install` (MySQL Timeouts)

Due to resource constraints on the VM, MySQL requests often exceed the default timeout threshold. Example errors:

* `Mysql2::Error::ConnectionError: Lost connection to MySQL server during query`
* `ActiveRecord::AdapterTimeout: Mysql2::Error::TimeoutError: Timeout waiting for a response ... (waited 120 seconds)`

To fix, run large tasks in smaller pieces. Most commonly, running `dashboard:setup\\\\\\\_db` in the dashboard directory solved all issues:

```bash
cd dashboard
bundle exec rake dashboard:setup\\\\\\\_db
```

If issues still persist, allocating more VM resources (RAM/CPU) can improve the speed of MySQL requests.

### 4\. `bundle exec rake build` stuck on Yarn

The build tends to get stuck when installing Yarn since Yarn prompts the user for confirmation during the installation (the rake pipeline is non-interactive and doesn't support user confirmation).

To fix, install Yarn manually inside the `apps` directory:

```bash
cd apps
yarn install --verbose
```

During this install, simply answer any prompts from Yarn until complete. Then, exit the `apps` directory and rerun `bundle exec rake install`

### 5\. ENOSPC (no space left on device)

Any command involving installation can run into a `ENOSPC: no space left on device, write` error. This occurs when the disk runs out of space.

To fix, add space to the VM disk (using VirtualBox GUI) and expand the disk within the VM using `gparted`

To confirm the resizing was successful:

```bash
df -h
```

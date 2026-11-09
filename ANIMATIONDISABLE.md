# Midpoint Findings — Code.org Animation Disable

---

## 1. How Animations Work

**Relevant files:**
- `/apps/src/studio/studioAnimation.js`
- `/apps/src/studio/studioSpriteSheet.js`

Code.org characters are animated using **sprite sheets** — PNGs arranged in a rectangular grid of frames.

Key details:
- Example: `move_avatar.png`
  - **4 columns** = directions (up, right, down, left)
  - **N rows** = animation frames per direction
- The engine:
  - Positions the sprite sheet so only one cell is visible
  - Uses a **clip-path** to hide the rest
  - Cycles through frames over time

Because the engine expects a strict sheet layout, any animation-disable method must either **conform to** or **override** this system.

---

## 2. Method 1 — Static Sprite-Sheet Duplication

**Goal:** Disable animations *without modifying engine logic*.

### Approach
We created a script that **duplicates one static image** into all cells of a sprite sheet.  
The engine “animates,” but all frames look identical.

### Required metadata
- Frame width/height  
- Padding  
- Grid size  
- Final PNG dimensions  

Even **1–2 pixels off** causes frame bleeding or jittering.

Because Code.org sprite sheets vary heavily, Method 1 was not reliable long-term.

---

## 3. Documentation of My Grid-Duplication Script (`test.py`)

Located at `/mnt/data/test.py`.

Example configuration:

    input_path = "psets/ps6/input.png"
    output_path = "output.png"

    repeat_x = 196  # number of columns
    repeat_y = 1    # number of rows

    final_width = 13720  # desired final PNG width
    final_height = 51    # desired final PNG height

    resize_factor = 51 / orig_h  # input desired sprite height

The script:
- Resizes the input sprite  
- Tiles it across the grid  
- Computes padding so the final PNG aligns with engine expectations  

---

## 4. Method 2 — Engine-Level Animation Disable (Preferred)

**Goal:** Completely disable animations *inside the Code.org engine*, removing the need for sprite-sheet metadata.*

This method is based on observations from engine behavior and changes to:

- `apps/src/maze/skins.js`
- `apps/src/studio/StudioAnimation.js`
- `apps/src/studio/studioSpriteSheet.js`

### Why Method 2 Was Needed
Method 1 required:
- Precise sprite dimensions  
- Exact horizontal/vertical padding  
- Accurate grid sizes (often thousands of sprites wide)

Sprite sheets differ dramatically, sometimes containing thousands of frames, and these values are hard to find in the codebase. Being even a few pixels off broke rendering or caused visible animation glitches.

To avoid relying on sprite metadata, Method 2 disables animation **at the logic level**, making the engine treat every animation as if it only has one frame.

---

### A. Maze-Engine Changes (`apps/src/maze/skins.js`)

We forced all Maze animations to reference the **first frame only** by setting key frame indices to 1:

- `idlePegmanCol = 1`
- `idlePegmanRow = 1`
- `hittingWallAnimationFrameNumber = 1`
- Other animation-related frame indices and counters similarly constrained to 1

**Effect:**  
Maze never advances through multiple frames. For each animation state (idle, moving, hitting a wall, etc.), the engine always uses the same single frame, so the character appears static.

---

### B. Studio Animation Engine Changes

#### `apps/src/studio/StudioAnimation.js`

We changed the animation API so that all Studio animations report **only one frame** and always render frame 0:

- `getAnimationFrameCount()` now always returns `1`  
- `redrawCenteredAt(center, tickCount)` now always returns frame index `0`

In pseudocode-style:

    // Always report one frame for every animation
    getAnimationFrameCount() {
      return 1;
    }

    // Always use frame 0 when redrawing
    redrawCenteredAt(center, tickCount) {
      return 0;  // frame index always 0
    }

#### `apps/src/studio/studioSpriteSheet.js`

We also disabled per-animation-type frame counts:

- `getAnimationFrameCount(animationType)` now always returns `1`

For example:

    // Animation types also report only one frame
    getAnimationFrameCount(animationType) {
      return 1;
    }

Together, these changes ensure that any Studio animation—regardless of sprite sheet, animation type, or tick count—never progresses beyond the first frame.

---

### Why Method 2 Works Better

- **No sprite metadata required**  
  - We no longer need to know frame sizes, padding, or grid dimensions.
- **Sprite-agnostic**  
  - Works for all characters and skins, even if their sprite sheets are huge or irregular.
- **Robust to asset changes**  
  - Updating or swapping out sprite sheets will not reintroduce animation, because the engine itself limits frame count and index.
- **Simpler mental model**  
  - “The engine only ever thinks there is one frame” is easier to reason about than “all sprite sheets must be perfectly tiled.”

**Key idea:**  
Method 2 globally forces:

- **Frame count** = `1`  
- **Frame index** = `0` (or `1` in Maze’s 1-based indexing)

So even though sprite sheets may still contain many frames, the renderer is never allowed to leave the first one.

---

## 5. Conclusion

- **Method 1 — Static Sprite-Sheet Duplication**
  - Pros: Does not modify engine logic; purely an asset-level change.
  - Cons: Fragile; depends on exact sprite-sheet metadata (dimensions, padding, grid), which varies widely and is hard to maintain.

- **Method 2 — Engine-Level Animation Disable**
  - Pros: Robust and asset-agnostic; works for all sprites by clamping frame count and frame index in the core animation code (Maze + Studio).
  - Cons: Requires changes to core engine files, but those changes are small and centralized.

**Final takeaway:**  
Method 2 is the recommended long-term solution because it disables animation globally, without depending on brittle sprite-sheet assumptions.

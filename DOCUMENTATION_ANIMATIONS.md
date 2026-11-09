# Code.org Animation Disable Findings

This document summarizes the investigation and implementation work done to disable character animations in the Code.org Maze and Studio engines. It explains how animations work internally, evaluates two approaches, and documents the final recommended solution.

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

# Angry Bird Sprite Replacement Plan

## Current State
- **713 maze levels** use the "birds" skin
- Main sprite files located in: `apps/static/skins/birds/`
- Key files to replace:
  - `avatar.png` (3150 x 200 pixels) - Main sprite sheet with multiple frames
  - `static_avatar.png` - Static version of the bird
  - `small_static_avatar.png` - Small static version  
  - `move_avatar.png` - Moving animation sprite
  - `idle_avatar.gif` - Idle animation
  - `failure_avatar.png` - Failure state
  - `win_avatar.png` - Success state

## Target Image
- Source: [Flaticon Bird Icon](https://www.flaticon.com/free-icon/bird_5980620)
- Need to create multiple versions for different states

## Files That Reference Bird Sprites
- `apps/style/code-studio/levelbuilder.scss` - CSS references to bird sprites
- All maze levels with `"skin": "birds"` property

## Implementation Steps
1. ✅ Download the new bird image from Flaticon
2. ⏳ Create sprite sheet version (avatar.png) with multiple animation frames
3. ✅ Create static versions for different states (using birdNeutral.png as placeholder)
4. ⏳ Test the changes in maze levels
5. ✅ Update documentation

## Changes Made So Far
- Replaced `static_avatar.png` with generic bird from poetry assets
- Replaced `small_static_avatar.png` with generic bird from poetry assets
- Created implementation plan document

## Next Steps
- Replace main `avatar.png` sprite sheet with new Flaticon bird image
- Replace animation sprites (`move_avatar.png`, `idle_avatar.gif`)
- Test in 713 affected maze levels

## Testing Areas
- Maze levels with "Programming with Angry Birds" lessons
- Level builder preview
- All 713 levels using birds skin

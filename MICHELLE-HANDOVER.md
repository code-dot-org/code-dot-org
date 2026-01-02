## Michelle's Handover Documentation (F25)

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

### 3. Final Merge for Midpoint Demo

- **Merging Details**:
  - Merged `K zfinal` branch by kylezheng12
  - `K zfinal` branch had merged in `Kyle Deliv7` with `Disable animations globally for all skins and app` branch by lijuliana
  - Final version has
    - Updated sprite assets for Elsa, Star Wars, Ice Age, and more levels in `apps/static/skins/`
    - Global animation disabling in `apps/src/maze/skins.js`
  - For more information: See exact info from those branches' commits and their documentation (Kyle Zheng and Juliana Li in F25)
## Michelle's Handover Documentation (F25)

### 1. Angry Birds Sprite Asset Updates

- **Folder Location**: `apps/static/skins/birds/` and `build/package/media/skins/birds` (MUST DO BOTH)
- **Changes**:
  - Replaced Angry Birds sprites with generic bird sprites from Code.org Skins drive by manually deleting and adding both into both the `apps/static/skins/birds/` folder and the `build/package/media/skins/birds` folder
  - Used generic Code.org chick/chicken skin, greenery, and 8-bit grass background to avoid copyright from Angry Birds but provide accessibility to children in India 
  - Reused the image for `avatar.png` for all of the same still images
  - Created new `move_avatar.png` sprite sheet (7×9 grid, 600×1800px) with new chick sprites to imitate the original Angry Birds sprites sheet but still buggy for some reason (perhaps the metadata is faulty)
  - Sprites changes reflected in all Programming with Angry Birds maze levels
- **Documentation**: See `SPRITE_REPLACEMENT_PLAN.md` for more implementation details
- **Backup Files**: Original Angry Birds sprites preserved with `_old.png` and `_backup.png` suffixes for future developer use and easy reference

### 2. GIF Disable

- **File Location**: `apps/src/maze/skins.js`
- **Background**:
  - `apps/src/maze/skins.js` - visual theme configuration 
  - Defines skins for the maze levels (incl. bee, farmer, pvz, birds)
  - Configures animations, sprites, sounds, and other visual properties
- **Changes**:
  - Reconfigured default GIFs with still PNGs because no uncopyrighted sprite GIFs for levels
  - ie. idlePegmanAnimation: ‘idle_avatar.gif’ → ‘avatar.png’

### 3. Final Merge for Midpoint Demo

- **Merging Details**:
  - Merged `K zfinal` branch by kylezheng12
  - `K zfinal` branch had merged in `Kyle Deliv7` with `Disable animations globally for all skins and app` branch by lijuliana
  - Final version has updated sprite assets for Elsa, Star Wars, Ice Age, and more levels (see exact info from those branches' commits)
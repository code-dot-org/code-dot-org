#!/usr/bin/env python3
"""
Script to create a 7x9 sprite sheet of chicks from move_avatar.png,
matching the dimensions and layout of move_avatar_old.png
"""

from PIL import Image
import os

def main():
    old_path = 'apps/static/skins/birds/move_avatar_old.png'
    new_path = 'apps/static/skins/birds/move_avatar.png'
    output_path = 'apps/static/skins/birds/move_avatar.png'
    backup_path = 'apps/static/skins/birds/move_avatar_backup.png'
    
    # Backup the current move_avatar.png if it exists
    if os.path.exists(new_path):
        print(f"Backing up current {new_path} to {backup_path}")
        import shutil
        shutil.copy2(new_path, backup_path)
    
    # Load the old sprite sheet to get dimensions
    print(f"Loading old sprite sheet: {old_path}")
    old_img = Image.open(old_path)
    old_width, old_height = old_img.size
    print(f"Old sheet dimensions: {old_width}x{old_height}")
    
    # Calculate sprite dimensions (7 columns × 9 rows)
    cols = 7
    rows = 9
    sprite_width = old_width // cols
    sprite_height = old_height // rows
    print(f"Sprite dimensions: {sprite_width}x{sprite_height} (for {cols}x{rows} grid)")
    
    # Load the new move_avatar.png (chick sprite)
    print(f"Loading chick sprite: {new_path}")
    new_img = Image.open(new_path)
    new_width, new_height = new_img.size
    print(f"Chick sprite dimensions: {new_width}x{new_height}")
    
    # Convert to RGBA if needed
    if new_img.mode != 'RGBA':
        new_img = new_img.convert('RGBA')
    
    # If the new image is larger than a single sprite, extract the first sprite
    # Otherwise, use the whole image as the sprite
    if new_width > sprite_width or new_height > sprite_height:
        # Extract the first sprite from the top-left
        chick_sprite = new_img.crop((0, 0, min(sprite_width, new_width), min(sprite_height, new_height)))
        print(f"Extracted chick sprite: {chick_sprite.size[0]}x{chick_sprite.size[1]}")
    else:
        chick_sprite = new_img
    
    # Resize chick sprite to match the sprite dimensions
    if chick_sprite.size != (sprite_width, sprite_height):
        print(f"Resizing chick sprite from {chick_sprite.size} to {sprite_width}x{sprite_height}")
        chick_sprite = chick_sprite.resize((sprite_width, sprite_height), Image.Resampling.LANCZOS)
    
    # Create new sprite sheet with 7×9 grid
    print(f"Creating new sprite sheet: {cols} columns × {rows} rows")
    new_sheet = Image.new('RGBA', (old_width, old_height), (0, 0, 0, 0))
    
    # Fill the grid with chick sprites
    for row in range(rows):
        for col in range(cols):
            x = col * sprite_width
            y = row * sprite_height
            new_sheet.paste(chick_sprite, (x, y), chick_sprite)
    
    # Save the result
    print(f"Saving to: {output_path}")
    new_sheet.save(output_path, 'PNG')
    print(f"Done! Created {cols}×{rows} sprite sheet: {old_width}x{old_height} pixels")

if __name__ == '__main__':
    main()


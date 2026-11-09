#!/usr/bin/env python3
"""
Script to create a horizontal sprite sheet by duplicating an image with rotations and a flip.
Creates a 4-column sprite sheet: +90°, 0°, -90°, and horizontally flipped.
"""

from PIL import Image
import sys
import os

def create_rotated_sprite_sheet(input_path, output_path=None):
    """
    Create a horizontal sprite sheet with 4 columns:
    - Column 0: Rotated +90° (counter-clockwise)
    - Column 1: Original (0°)
    - Column 2: Rotated -90° (clockwise)
    - Column 3: Flipped horizontally
    """
    # Load the original image
    original = Image.open(input_path)
    width, height = original.size
    
    # Create a new image that's 4 times wider
    sprite_sheet_width = width * 4
    sprite_sheet_height = height
    sprite_sheet = Image.new('RGBA', (sprite_sheet_width, sprite_sheet_height), (0, 0, 0, 0))
    
    # Column 0: +90° (counter-clockwise)
    rotated_pos_90 = original.rotate(90, expand=True)
    sprite_sheet.paste(rotated_pos_90, (0, 0))

    # Column 1: 0° (original)
    sprite_sheet.paste(original, (width, 0))

    # Column 2: -90° (clockwise)
    rotated_neg_90 = original.rotate(-90, expand=True)
    sprite_sheet.paste(rotated_neg_90, (width * 2, 0))

    # Column 3: Flipped horizontally
    flipped = original.transpose(Image.FLIP_LEFT_RIGHT)
    sprite_sheet.paste(flipped, (width * 3, 0))
    
    # Save the sprite sheet
    if output_path is None:
        base_name = os.path.splitext(input_path)[0]
        output_path = f"{base_name}_sprite_sheet.png"
    
    sprite_sheet.save(output_path)
    print(f"Created sprite sheet: {output_path}")
    print(f"Dimensions: {sprite_sheet_width}x{sprite_sheet_height}")
    print(f"Each column: {width}x{height}")
    
    return output_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python rotate_sprite_sheet.py <input_image> [output_image]")
        print("\nExample:")
        print("  python rotate_sprite_sheet.py bee.png bee_sprite_sheet.png")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        sys.exit(1)
    
    create_rotated_sprite_sheet(input_path, output_path)


from PIL import Image

# === Configuration ===
input_path = "psets/ps6/input.png"
output_path = "output.png"

repeat_x = 196         # how many images across // USER INPUT
repeat_y = 1          # how many images down // USER INPUT

final_width = 13720    # total desired width  (px) // USER INPUT, CALCULATES PADDING
final_height = 51    # total desired height (px) // USER INPUT, CALCULATES PADDING

# === Load and resize ===
original = Image.open(input_path)
orig_w, orig_h = original.size
resize_factor = 51 / orig_h    # scale original image (1.0 = no resize) // USER INPUT
original = original.resize((int(orig_w * resize_factor), int(orig_h * resize_factor)))
width, height = original.size

# === Compute gaps to perfectly fit within final dimensions ===
# (number of gaps = repeats - 1)
horizontal_gaps = max(0, repeat_x - 1)
vertical_gaps = max(0, repeat_y - 1)

# total space taken by images alone
images_total_w = width * repeat_x
images_total_h = height * repeat_y

# remaining space to fill with even gaps
remaining_w = max(0, final_width - images_total_w)
remaining_h = max(0, final_height - images_total_h)

# calculate even gaps
horizontal_gap = remaining_w // horizontal_gaps if horizontal_gaps > 0 else 0
vertical_gap = remaining_h // vertical_gaps if vertical_gaps > 0 else 0

# recompute final actual dimensions (so no rounding mismatch)
true_final_width = width * repeat_x + horizontal_gap * horizontal_gaps
true_final_height = height * repeat_y + vertical_gap * vertical_gaps

# === Create new blank canvas ===
final_img = Image.new("RGBA", (true_final_width, true_final_height), (0, 0, 0, 0))

# === Paste all tiles ===
for y in range(repeat_y):
    for x in range(repeat_x):
        x_offset = x * (width + horizontal_gap)
        y_offset = y * (height + vertical_gap)
        final_img.paste(original, (x_offset, y_offset))

# === Save ===
final_img.save(output_path)
print(f"✅ Done! Saved as {output_path}")
print(f"Grid: {repeat_x}×{repeat_y}")
print(f"Gaps: horizontal={horizontal_gap}px, vertical={vertical_gap}px")
print(f"Final size: {true_final_width}×{true_final_height}px")

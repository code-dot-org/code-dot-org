// The limited drawing tools, for a level that is not about painting: the
// tools that draw a picture, a fixed set of colors and the finest brush.
// The full tools, as in free play, offer every color and more brush sizes.

import {PaletteColor, ToolbarItem} from '@cdo/apps/pixelEditor/PixelEditor';
import {PixelTool} from '@cdo/apps/pixelEditor/toolDefinitions';

export const PAINT_TOOLS: readonly PixelTool[] = [
  'pen',
  'bucket',
  'eraser',
  'eyedropper',
];
// The color the limited tools start on: the closest of their colors to the
// blue the editor starts on when it offers every color.
const LIGHT_BLUE: PaletteColor = {
  name: 'Light blue',
  rgba: [41, 173, 255, 255],
};
export const PAINT_START_COLOR = LIGHT_BLUE.rgba;
// The colors the limited tools offer, chosen by the designer. The color
// square opens them as round swatches, five to a row, so each group below
// is one row. The eyedropper can still pick any other color from the
// picture.
export const PAINT_COLORS: readonly PaletteColor[] = [
  {name: 'Black', rgba: [0, 0, 0, 255]},
  {name: 'Dark gray', rgba: [95, 87, 79, 255]},
  {name: 'Light gray', rgba: [194, 195, 199, 255]},
  {name: 'Cream', rgba: [255, 241, 232, 255]},
  {name: 'White', rgba: [255, 255, 255, 255]},

  {name: 'Red', rgba: [255, 0, 77, 255]},
  {name: 'Brown', rgba: [171, 82, 54, 255]},
  {name: 'Orange', rgba: [255, 163, 0, 255]},
  {name: 'Peach', rgba: [255, 204, 170, 255]},
  {name: 'Yellow', rgba: [255, 236, 39, 255]},

  {name: 'Dark green', rgba: [0, 135, 81, 255]},
  {name: 'Green', rgba: [0, 228, 54, 255]},
  {name: 'Navy', rgba: [29, 43, 83, 255]},
  {name: 'Blue', rgba: [6, 90, 181, 255]},
  LIGHT_BLUE,

  {name: 'Dark purple', rgba: [126, 37, 83, 255]},
  {name: 'Purple', rgba: [117, 70, 101, 255]},
  {name: 'Lavender', rgba: [131, 118, 156, 255]},
  {name: 'Pink', rgba: [255, 119, 168, 255]},
  {name: 'Dark pink', rgba: [173, 31, 113, 255]},
];
// One brush, the finest on the pixel grid.
export const PAINT_BRUSH_SIZES: readonly number[] = [1];

// The limited tools: the eyedropper and the color swatches, then the tools
// that draw.
export const PAINT_TOOLBAR: readonly (readonly ToolbarItem[])[] = [
  ['eyedropper', 'color'],
  ['pen', 'bucket', 'eraser'],
];
// The full tools: the eyedropper and the picker, the tools that draw, and
// the three finer brushes; the shapes wait.
export const FREEPLAY_TOOLS: readonly PixelTool[] = [
  'pen',
  'bucket',
  'eraser',
  'eyedropper',
];
export const FREEPLAY_BRUSH_SIZES: readonly number[] = [1, 2, 4];
export const FREEPLAY_TOOLBAR: readonly (readonly ToolbarItem[])[] = [
  ['eyedropper', 'color'],
  ['pen', 'bucket', 'eraser'],
  ['sizes'],
];

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
// The colors the limited tools offer. The color square opens them as
// round swatches, five to a row. The first is the color the editor starts
// on: the pixel editor's own blue. The eyedropper can still pick any other
// color from the picture.
export const PAINT_COLORS: readonly PaletteColor[] = [
  {name: 'Blue', rgba: [0, 155, 233, 255]},
  {name: 'Black', rgba: [34, 34, 34, 255]},
  {name: 'White', rgba: [255, 255, 255, 255]},
  {name: 'Red', rgba: [226, 52, 52, 255]},
  {name: 'Orange', rgba: [245, 137, 37, 255]},
  {name: 'Yellow', rgba: [250, 213, 36, 255]},
  {name: 'Green', rgba: [61, 176, 74, 255]},
  {name: 'Purple', rgba: [138, 79, 214, 255]},
  {name: 'Brown', rgba: [133, 87, 51, 255]},
  {name: 'Tan', rgba: [232, 190, 148, 255]},
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

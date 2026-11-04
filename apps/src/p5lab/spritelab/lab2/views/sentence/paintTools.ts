// The drawing tools a level before free play offers: the fewest that draw
// a picture, with three colors and the finest brush.

import {PaletteColor, ToolbarItem} from '@cdo/apps/pixelEditor/PixelEditor';
import {PixelTool} from '@cdo/apps/pixelEditor/toolDefinitions';

export const PAINT_TOOLS: readonly PixelTool[] = ['pen', 'bucket', 'eraser'];
// The pixel editor's own starting blue, then black and white.
export const PAINT_COLORS: readonly PaletteColor[] = [
  {name: 'Blue', rgba: [0, 155, 233, 255]},
  {name: 'Black', rgba: [34, 34, 34, 255]},
  {name: 'White', rgba: [255, 255, 255, 255]},
];
// One brush, the finest on the pixel grid.
export const PAINT_BRUSH_SIZES: readonly number[] = [1];

// A level about one image: the three colors, then the tools that draw.
export const PAINT_TOOLBAR: readonly (readonly ToolbarItem[])[] = [
  ['color'],
  ['pen', 'bucket', 'eraser'],
];
// Free play: the eyedropper and the picker, the tools that draw, and the
// three finer brushes; the shapes wait.
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

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import * as React from 'react';

export type PixelTool =
  | 'pen'
  | 'eraser'
  | 'bucket'
  | 'eyedropper'
  | 'circle'
  | 'filledCircle'
  | 'rect'
  | 'filledRect';

// Each tool has a single-key shortcut; the hover tooltip reads
// "<label> (<KEY>)". Order matters: the toolbar lays these out two per row
// (pen/fill, erase/eyedrop, circles, rectangles). The regular (outline) vs
// solid FontAwesome style distinguishes the hollow/filled shape pairs. A
// shape's outline and solid variants share one letter (Shift = solid), so
// the pair is one thing to remember rather than two arbitrary keys.
export const TOOLS: {
  id: PixelTool;
  label: string;
  shortcut: string;
  // Solid shape variants: same letter as the outline, held with Shift.
  requiresShift?: boolean;
  icon: React.ReactNode;
}[] = [
  {
    id: 'pen',
    label: 'Pen',
    shortcut: 'p',
    icon: <FontAwesomeV6Icon iconName="pen" />,
  },
  {
    id: 'bucket',
    label: 'Fill',
    shortcut: 'f',
    icon: <FontAwesomeV6Icon iconName="fill-drip" />,
  },
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'e',
    icon: <FontAwesomeV6Icon iconName="eraser" />,
  },
  {
    id: 'eyedropper',
    label: 'Eyedropper',
    shortcut: 'i',
    icon: <FontAwesomeV6Icon iconName="eye-dropper" />,
  },
  {
    id: 'circle',
    label: 'Circle outline',
    // O, not C: the glyph resembles a circle, and it frees C for Color.
    shortcut: 'o',
    icon: <FontAwesomeV6Icon iconName="circle" iconStyle="regular" />,
  },
  {
    id: 'filledCircle',
    label: 'Solid circle',
    shortcut: 'o',
    requiresShift: true,
    icon: <FontAwesomeV6Icon iconName="circle" iconStyle="solid" />,
  },
  {
    id: 'rect',
    label: 'Rectangle outline',
    shortcut: 'r',
    icon: <FontAwesomeV6Icon iconName="square" iconStyle="regular" />,
  },
  {
    id: 'filledRect',
    label: 'Solid rectangle',
    shortcut: 'r',
    requiresShift: true,
    icon: <FontAwesomeV6Icon iconName="square" iconStyle="solid" />,
  },
];

export function toolTitle(tool: (typeof TOOLS)[number]): string {
  const combo = `${
    tool.requiresShift ? 'Shift+' : ''
  }${tool.shortcut.toUpperCase()}`;
  return `${tool.label} (${combo})`;
}

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

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
// solid FontAwesome style distinguishes the hollow/filled shape pairs.
export const TOOLS: {
  id: PixelTool;
  label: string;
  shortcut: string;
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
    shortcut: 'c',
    icon: <FontAwesomeV6Icon iconName="circle" iconStyle="regular" />,
  },
  {
    id: 'filledCircle',
    label: 'Solid circle',
    shortcut: 's',
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
    shortcut: 'b',
    icon: <FontAwesomeV6Icon iconName="square" iconStyle="solid" />,
  },
];

export function toolTitle(tool: (typeof TOOLS)[number]): string {
  return `${tool.label} (${tool.shortcut.toUpperCase()})`;
}

import React from 'react';

export type PixelTool = 'pen' | 'eraser' | 'bucket' | 'circle' | 'filledCircle';

// Each tool has a single-key shortcut; the hover tooltip reads
// "<label> (<KEY>)".
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
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 14l1-4 8-8 3 3-8 8-4 1z" />
      </svg>
    ),
  },
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'e',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 13L2 9l7-7 5 5-6 6H6zm-1 1h9v1H5v-1z" />
      </svg>
    ),
  },
  {
    id: 'bucket',
    label: 'Fill',
    shortcut: 'f',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1l6 6-6 6-5-5 5-5V1zm5.5 9.5S15 12.4 15 13.5a1.5 1.5 0 0 1-3 0c0-1.1 1.5-3 1.5-3z" />
      </svg>
    ),
  },
  {
    id: 'circle',
    label: 'Circle outline',
    shortcut: 'c',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'filledCircle',
    label: 'Solid circle',
    shortcut: 's',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" />
      </svg>
    ),
  },
];

export function toolTitle(tool: (typeof TOOLS)[number]): string {
  return `${tool.label} (${tool.shortcut.toUpperCase()})`;
}

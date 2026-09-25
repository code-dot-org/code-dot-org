import {getContrastRatio} from '@mui/material/styles';

export const TEXT_STYLES = ['Normal', 'Outline', 'Fill', 'Glow'] as const;
export type TextStyle = (typeof TEXT_STYLES)[number];

export const TEXT_FONT_FAMILY = 'Geist, sans-serif';
export const TEXT_FONT_STYLE = 'bold';

export const MIN_FONT_SIZE = 12;
export const MIN_TEXT_WIDTH = 40;

export interface CanvasTextItem {
  id: string;
  text: string;
  color: string;
  style: TextStyle;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

export type NewCanvasText = Pick<CanvasTextItem, 'text' | 'color' | 'style'>;

export interface TextAttrs {
  fill: string;
  padding: number;
  stroke?: string;
  strokeWidth?: number;
  fillAfterStrokeEnabled?: boolean;
  lineJoin?: 'round';
  shadowColor?: string;
  shadowBlur?: number;
  shadowOpacity?: number;
}

export interface TagAttrs {
  fill?: string;
  cornerRadius?: number;
}

// Black or white, whichever has the higher WCAG contrast ratio with `color`.
export function contrastColor(color: string): '#000000' | '#ffffff' {
  return getContrastRatio(color, '#000000') > getContrastRatio(color, '#ffffff')
    ? '#000000'
    : '#ffffff';
}

export function textStyleAttrs(
  style: TextStyle,
  color: string,
  fontSize: number
): {text: TextAttrs; tag: TagAttrs} {
  const padding = fontSize * 0.25;
  switch (style) {
    case 'Outline':
      return {
        text: {
          fill: color,
          padding,
          stroke: contrastColor(color),
          strokeWidth: fontSize * 0.12,
          fillAfterStrokeEnabled: true,
          lineJoin: 'round',
        },
        tag: {},
      };
    case 'Fill':
      return {
        text: {fill: contrastColor(color), padding},
        tag: {fill: color, cornerRadius: fontSize * 0.25},
      };
    case 'Glow':
      return {
        text: {
          fill: color,
          padding,
          shadowColor: color,
          shadowBlur: fontSize * 0.5,
          shadowOpacity: 1,
        },
        tag: {},
      };
    case 'Normal':
      return {text: {fill: color, padding}, tag: {}};
  }
}

const CORNER_ANCHORS = new Set([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]);

// Corner drags scale the font with the box; side drags only rewrap
export function resizeText(
  {width, fontSize}: Pick<CanvasTextItem, 'width' | 'fontSize'>,
  anchor: string | null,
  scale: number
): Pick<CanvasTextItem, 'width' | 'fontSize'> {
  if (anchor && CORNER_ANCHORS.has(anchor)) {
    // One factor for both keeps the box's proportions
    const clamped = Math.max(
      scale,
      MIN_FONT_SIZE / fontSize,
      MIN_TEXT_WIDTH / width
    );
    return {width: width * clamped, fontSize: fontSize * clamped};
  }
  return {width: Math.max(MIN_TEXT_WIDTH, width * scale), fontSize};
}

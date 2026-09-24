export const TEXT_STYLES = ['Normal', 'Outline', 'Fill', 'Glow'] as const;
export type TextStyle = (typeof TEXT_STYLES)[number];

// Konva quotes each name in the list, so this reaches ctx.font intact.
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

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map(c =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Black or white, whichever has the higher WCAG contrast ratio with `hex`.
export function contrastColor(hex: string): '#000000' | '#ffffff' {
  const luminance = relativeLuminance(hex);
  const againstWhite = 1.05 / (luminance + 0.05);
  const againstBlack = (luminance + 0.05) / 0.05;
  return againstBlack > againstWhite ? '#000000' : '#ffffff';
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

// Folds a transformer's scale into the text's own size: a corner drag grows
// the type with the box, a side drag only rewraps it.
export function resizeText(
  {width, fontSize}: Pick<CanvasTextItem, 'width' | 'fontSize'>,
  anchor: string | null,
  scale: number
): Pick<CanvasTextItem, 'width' | 'fontSize'> {
  if (anchor && CORNER_ANCHORS.has(anchor)) {
    // One clamped factor for both, so the box keeps its proportions.
    const clamped = Math.max(
      scale,
      MIN_FONT_SIZE / fontSize,
      MIN_TEXT_WIDTH / width
    );
    return {width: width * clamped, fontSize: fontSize * clamped};
  }
  return {width: Math.max(MIN_TEXT_WIDTH, width * scale), fontSize};
}

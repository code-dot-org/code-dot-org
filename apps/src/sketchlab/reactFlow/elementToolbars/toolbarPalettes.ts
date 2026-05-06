export interface ColorSwatch {
  value: string;
  label: string;
  darkModeLabel?: string;
  transparent?: boolean;
}

export const STROKE_FONT_PALETTE: ColorSwatch[] = [
  {
    value: 'var(--sketchlab-stroke-default)',
    label: 'Black',
    darkModeLabel: 'White',
  },
  {value: 'var(--sketchlab-stroke-red)', label: 'Red'},
  {value: 'var(--sketchlab-stroke-yellow)', label: 'Yellow'},
  {value: 'var(--sketchlab-stroke-green)', label: 'Green'},
  {value: 'var(--sketchlab-stroke-blue)', label: 'Blue'},
  {value: 'var(--sketchlab-stroke-purple)', label: 'Purple'},
  {value: 'var(--sketchlab-stroke-pink)', label: 'Pink'},
];

export const BACKGROUND_PALETTE: ColorSwatch[] = [
  {value: 'transparent', label: 'Transparent', transparent: true},
  {value: 'var(--sketchlab-bg-gray)', label: 'Gray'},
  {value: 'var(--sketchlab-bg-red)', label: 'Red'},
  {value: 'var(--sketchlab-bg-yellow)', label: 'Yellow'},
  {value: 'var(--sketchlab-bg-green)', label: 'Green'},
  {value: 'var(--sketchlab-bg-blue)', label: 'Blue'},
  {value: 'var(--sketchlab-bg-purple)', label: 'Purple'},
  {value: 'var(--sketchlab-bg-pink)', label: 'Pink'},
];

export const FONT_SIZE_OPTIONS = [
  {value: 'small', label: 'Small', px: 12, shortLabel: 'S'},
  {value: 'medium', label: 'Medium', px: 16, shortLabel: 'M'},
  {value: 'large', label: 'Large', px: 22, shortLabel: 'L'},
  {value: 'extra-large', label: 'Extra Large', px: 30, shortLabel: 'XL'},
] as const;

export type FontSizeValue = (typeof FONT_SIZE_OPTIONS)[number]['value'];

export const LINE_WIDTH_OPTIONS = [
  {value: 1, label: 'Thin'},
  {value: 3, label: 'Medium'},
  {value: 5, label: 'Thick'},
] as const;

export type LineWidthValue = (typeof LINE_WIDTH_OPTIONS)[number]['value'];

export const LINE_STROKE_STYLE_OPTIONS = [
  {value: 'solid', label: 'Solid'},
  {value: 'dashed', label: 'Dashed'},
  {value: 'dotted', label: 'Dotted'},
] as const;

export type LineStrokeStyleValue =
  (typeof LINE_STROKE_STYLE_OPTIONS)[number]['value'];

export const TEXT_ALIGN_OPTIONS = [
  {value: 'left', label: 'Align left', icon: 'align-left'},
  {value: 'center', label: 'Align center', icon: 'align-center'},
  {value: 'right', label: 'Align right', icon: 'align-right'},
] as const;

export type TextAlignValue = (typeof TEXT_ALIGN_OPTIONS)[number]['value'];

export const DEFAULT_BACKGROUND_COLOR = 'transparent';
export const DEFAULT_STROKE_COLOR = 'var(--sketchlab-stroke-default)';
export const DEFAULT_FONT_COLOR = 'var(--sketchlab-stroke-default)';
export const DEFAULT_FONT_SIZE: FontSizeValue = 'medium';
export const DEFAULT_TEXT_ALIGN: TextAlignValue = 'center';
export const DEFAULT_LINE_WIDTH: LineWidthValue = 1;
export const DEFAULT_LINE_STROKE_STYLE: LineStrokeStyleValue = 'solid';

export function fontSizePx(value: string | undefined): number | undefined {
  const match = FONT_SIZE_OPTIONS.find(option => option.value === value);
  return (
    match?.px ||
    FONT_SIZE_OPTIONS.find(option => option.value === DEFAULT_FONT_SIZE)?.px
  );
}

export function strokeDasharrayFromStyle(
  style: LineStrokeStyleValue
): string | undefined {
  if (style === 'dashed') {
    return '8 4';
  }
  if (style === 'dotted') {
    return '2 4';
  }
  return undefined;
}

export function strokeStyleFromDasharray(
  dasharray: string | number | undefined
): LineStrokeStyleValue {
  const normalizedDasharray =
    typeof dasharray === 'number' ? `${dasharray}` : dasharray;
  if (normalizedDasharray === strokeDasharrayFromStyle('dashed')) {
    return 'dashed';
  }
  if (normalizedDasharray === strokeDasharrayFromStyle('dotted')) {
    return 'dotted';
  }
  return DEFAULT_LINE_STROKE_STYLE;
}

export interface ColorSwatch {
  value: string;
  label: string;
  transparent?: boolean;
}

export const STROKE_FONT_PALETTE: ColorSwatch[] = [
  {value: '#000000', label: 'Black'},
  {value: '#B42318', label: 'Red'},
  {value: '#15803D', label: 'Green'},
  {value: '#1D4ED8', label: 'Blue'},
  {value: '#C2410C', label: 'Orange'},
  {value: '#6D28D9', label: 'Purple'},
];

export const BACKGROUND_PALETTE: ColorSwatch[] = [
  {value: 'transparent', label: 'Transparent', transparent: true},
  {value: '#FECDD3', label: 'Pink'},
  {value: '#BBF7D0', label: 'Light green'},
  {value: '#BFDBFE', label: 'Light blue'},
  {value: '#FEF08A', label: 'Yellow'},
  {value: '#DDD6FE', label: 'Light purple'},
];

export const FONT_SIZE_OPTIONS = [
  {value: 'small', label: 'Small', px: 12},
  {value: 'medium', label: 'Medium', px: 16},
  {value: 'large', label: 'Large', px: 22},
] as const;

export type FontSizeValue = (typeof FONT_SIZE_OPTIONS)[number]['value'];

export function fontSizePx(value: string | undefined): number | undefined {
  const match = FONT_SIZE_OPTIONS.find(option => option.value === value);
  return match?.px;
}

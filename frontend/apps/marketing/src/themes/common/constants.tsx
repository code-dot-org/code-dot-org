export const createFontStack = (font: string, fallback: string) => {
  return [font, fallback, 'sans-serif'].join(', ');
};

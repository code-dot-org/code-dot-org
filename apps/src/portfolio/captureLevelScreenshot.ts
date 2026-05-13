import {toPng} from 'html-to-image';

import {SelectionRect} from './RegionSelector';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

export default async function captureLevelScreenshot(
  rect?: SelectionRect
): Promise<string | null> {
  try {
    const target = document.body;
    const fullDataUrl = await toPng(target, {cacheBust: true, pixelRatio: 1});
    if (!rect) return fullDataUrl;

    const img = await loadImage(fullDataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      img,
      rect.x + window.scrollX,
      rect.y + window.scrollY,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height
    );
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

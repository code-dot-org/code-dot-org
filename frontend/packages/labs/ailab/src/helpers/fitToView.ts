export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

export function fitToView(
  rect: Rect,
  viewport: {width: number; height: number},
  padding: number,
  maxScale: number,
): ViewTransform {
  const scale = Math.min(
    maxScale,
    (viewport.width - 2 * padding) / rect.width,
    (viewport.height - 2 * padding) / rect.height,
  );
  return {
    x: viewport.width / 2 - scale * (rect.x + rect.width / 2),
    y: viewport.height / 2 - scale * (rect.y + rect.height / 2),
    scale,
  };
}

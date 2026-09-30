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
  frame: Rect,
  maxScale: number,
): ViewTransform | undefined {
  if (frame.width <= 0 || frame.height <= 0) {
    return undefined;
  }
  const scale = Math.min(
    maxScale,
    frame.width / rect.width,
    frame.height / rect.height,
  );
  return {
    x: frame.x + frame.width / 2 - scale * (rect.x + rect.width / 2),
    y: frame.y + frame.height / 2 - scale * (rect.y + rect.height / 2),
    scale,
  };
}

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

export function panIntoView(
  rect: Rect,
  frame: Rect,
): {x: number; y: number} | undefined {
  if (frame.width <= 0 || frame.height <= 0) {
    return undefined;
  }
  return {
    x: panAxis(rect.x, rect.width, frame.x, frame.width),
    y: panAxis(rect.y, rect.height, frame.y, frame.height),
  };
}

function panAxis(
  start: number,
  size: number,
  frameStart: number,
  frameSize: number,
): number {
  if (start < frameStart || size > frameSize) {
    return frameStart - start;
  }
  return Math.min(0, frameStart + frameSize - (start + size));
}

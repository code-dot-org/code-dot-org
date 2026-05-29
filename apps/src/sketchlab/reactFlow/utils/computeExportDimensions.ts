export interface ContentBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ExportDimensions {
  imageWidth: number;
  imageHeight: number;
  scale: number;
  translateX: number;
  translateY: number;
}

// Utility for sizing the backpack PNG export. Given a bounding box containing
// every node + edge, compute the output image dimensions and the transform to apply
// to the React Flow viewport so the content fills the image with `padding` pixels of margin.
//
// Small content exports at 1:1 so a single node doesn't get shrunk into an
// otherwise-empty canvas. Only content whose longer side (including padding)
// exceeds `maxDimension` is scaled down proportionally to fit, including padding.
export function computeExportDimensions(
  bounds: ContentBounds,
  padding: number,
  maxDimension: number
): ExportDimensions {
  const contentWidth = bounds.maxX - bounds.minX + 2 * padding;
  const contentHeight = bounds.maxY - bounds.minY + 2 * padding;
  const scale = Math.min(
    1,
    maxDimension / Math.max(contentWidth, contentHeight)
  );
  return {
    imageWidth: Math.round(contentWidth * scale),
    imageHeight: Math.round(contentHeight * scale),
    scale,
    translateX: (-bounds.minX + padding) * scale,
    translateY: (-bounds.minY + padding) * scale,
  };
}

import {MAX_MINI_APP_SIZE} from '@codebridge/Workspace/constants';

/**
 * Scales and centers the SVG maze visualization to fit within the given dimensions.
 * Returns the applied scale factor
 */
export function scaleMiniApp(newHeight: number, newWidth: number): number {
  const sliderHeight = 37;
  // The original visualization is rendered at 800x800.
  const originalVisualizationWidth = MAX_MINI_APP_SIZE;
  const headerSize = 40;
  const availableHeight = newHeight - headerSize - sliderHeight;
  const newVisualizationWidth = Math.min(availableHeight, newWidth);
  // Scale the visualization.
  let scale = newVisualizationWidth / originalVisualizationWidth;
  if (scale < 0) {
    // Avoid inverting.
    scale = 0;
  }
  const scaleCss = `scale(${scale})`;
  $('#svgMaze').css({
    transform: scaleCss,
    'transform-origin': '0 0',
    position: 'absolute',
  });

  // Scale the visualization div
  $('#visualization').css({
    height: newVisualizationWidth,
    width: newVisualizationWidth,
    'margin-left': (newWidth - newVisualizationWidth) / 2,
  });

  return newVisualizationWidth / originalVisualizationWidth;
}

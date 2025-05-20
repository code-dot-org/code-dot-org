export function scaleMiniApp(newHeight: number, newWidth: number) {
  const sliderHeight = 37;
  // The original visualization is rendered at 800x800.
  const originalVisualizationWidth = 800;
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
}

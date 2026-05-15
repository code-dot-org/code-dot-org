import NeighborhoodVisualization from './NeighborhoodVisualization';

/**
 * Codebridge mounts this component inside its preview panel. For now it
 * just renders the visualization — orchestration (instantiating the
 * MazeController, calling `Neighborhood.afterInject` with level
 * properties / skin / serialized maze) will move in here once codebridge
 * delegates the full preview to the mini-app package.
 *
 * It satisfies `MiniApp.PreviewComponent: ComponentType<MiniAppPreviewProps>`
 * by ignoring all props — TS function-parameter contravariance accepts a
 * no-arg component where one taking the wider props is expected.
 */
const NeighborhoodPreview = () => {
  return <NeighborhoodVisualization />;
};

export default NeighborhoodPreview;

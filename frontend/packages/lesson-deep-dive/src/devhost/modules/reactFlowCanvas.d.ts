// Typecheck-only contract for
// @cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas.
//
// Unlike the sibling shims this has no runtime half: cdoResolverPlugin serves
// the real apps/src/sketchlab canvas to Vite and Vitest, while tsc keeps
// checking the feature against this contract instead of crawling into apps/.

import type {FC} from 'react';

import type {ReactFlowSketchLabSources} from '../hostTypes';

declare const ReactFlowCanvas: FC<{
  updateSources: (sources: ReactFlowSketchLabSources) => void;
  levelName?: string;
  initialNodes?: unknown[];
  initialEdges?: unknown[];
  initialViewport?: unknown;
  colorMode?: string;
  readOnly?: boolean;
}>;

export default ReactFlowCanvas;

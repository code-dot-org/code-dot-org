import {Sketchlab2Source, ProjectSources} from '@cdo/apps/lab2/types';

// `Sketchlab2Source` lives in lab2/types.ts for historical reasons (it was
// added when Sketchlab 2 existed as a separate lab type). We re-export it
// under a name that matches its current home as the React-Flow Sketchlab
// implementation, so callers in this directory don't need to know the
// historical naming.
export type SketchlabReactFlowSource = Sketchlab2Source;

export interface SketchlabReactFlowSources extends ProjectSources {
  source: SketchlabReactFlowSource;
}

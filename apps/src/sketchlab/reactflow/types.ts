import {ProjectSources, SketchlabReactFlowSource} from '@cdo/apps/lab2/types';

// `SketchlabReactFlowSource` itself lives in lab2/types.ts so it can
// participate in the global `Source` union; re-exported here so callers in
// this directory don't have to reach out of the implementation.
export type {SketchlabReactFlowSource};

export interface SketchlabReactFlowSources extends ProjectSources {
  source: SketchlabReactFlowSource;
}

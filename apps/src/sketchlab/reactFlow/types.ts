import {ProjectSources, SketchlabReactFlowSource} from '@cdo/apps/lab2/types';

export type ShapeType = 'rectangle' | 'triangle' | 'circle';

export type ReactFlowSketchLabSources = ProjectSources & {
  source: SketchlabReactFlowSource;
};

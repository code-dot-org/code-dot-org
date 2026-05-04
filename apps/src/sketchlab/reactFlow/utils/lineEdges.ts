import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

export function isArrowEdge(edge: SketchlabReactFlowEdge): boolean {
  return Boolean(edge.markerStart || edge.markerEnd);
}

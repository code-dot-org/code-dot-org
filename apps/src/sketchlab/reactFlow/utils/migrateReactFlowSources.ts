import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';

import {ShapeNodeData} from '../types';

import {nearestTriangleSideHandle} from './nearestTriangleSideHandle';

// Triangle handle IDs went through two renames:
//   stage 0: left-*, right-*, top-*, bottom-*  (shared with all shapes)
//   stage 1: side-left-*, side-right-*, side-bottom-*  (no top)
//   stage 2: left-*, right-*, bottom-*  (no top)
// side-left -> left, side-right -> right is 1:1. top-* has no equivalent.
// pick left or right based on the other endpoint's X position relative to the triangle center.
const TRIANGLE_SIDE_HANDLE_MIGRATION: Record<string, string> = {
  'side-left-target': 'left-target',
  'side-left-source': 'left-source',
  'side-right-target': 'right-target',
  'side-right-source': 'right-source',
  'side-bottom-target': 'bottom-target',
  'side-bottom-source': 'bottom-source',
};

export function migrateTriangleHandleIds(
  source: SketchlabReactFlowSource
): SketchlabReactFlowSource {
  const nodeById = new Map(source.nodes.map(n => [n.id, n]));
  const triangleIds = new Set(
    source.nodes
      .filter(
        n =>
          n.type === 'shape' &&
          (n.data as ShapeNodeData).shapeType === 'triangle'
      )
      .map(n => n.id)
  );
  if (triangleIds.size === 0) return source;

  const edges = source.edges.map(edge => {
    const patch: Partial<SketchlabReactFlowEdge> = {};
    if (triangleIds.has(edge.target) && edge.targetHandle) {
      const h = edge.targetHandle;
      if (TRIANGLE_SIDE_HANDLE_MIGRATION[h]) {
        patch.targetHandle = TRIANGLE_SIDE_HANDLE_MIGRATION[h];
      } else if (h === 'top-target') {
        const tri = nodeById.get(edge.target);
        const other = nodeById.get(edge.source);
        patch.targetHandle =
          tri && other
            ? nearestTriangleSideHandle(tri, other, 'target')
            : 'left-target';
      }
    }
    if (triangleIds.has(edge.source) && edge.sourceHandle) {
      const h = edge.sourceHandle;
      if (TRIANGLE_SIDE_HANDLE_MIGRATION[h]) {
        patch.sourceHandle = TRIANGLE_SIDE_HANDLE_MIGRATION[h];
      } else if (h === 'top-source') {
        const tri = nodeById.get(edge.source);
        const other = nodeById.get(edge.target);
        patch.sourceHandle =
          tri && other
            ? nearestTriangleSideHandle(tri, other, 'source')
            : 'left-source';
      }
    }
    return Object.keys(patch).length ? {...edge, ...patch} : edge;
  });
  return {...source, edges};
}

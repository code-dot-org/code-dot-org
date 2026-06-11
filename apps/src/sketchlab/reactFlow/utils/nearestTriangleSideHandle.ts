import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

export function nearestTriangleSideHandle(
  triangleNode: SketchlabReactFlowNode,
  otherNode: SketchlabReactFlowNode,
  type: 'target' | 'source'
): string {
  const triangleCenterX =
    triangleNode.position.x +
    Number((triangleNode.style as {width?: number})?.width ?? 0) / 2;
  const otherCenterX =
    otherNode.position.x +
    Number((otherNode.style as {width?: number})?.width ?? 0) / 2;
  return `${otherCenterX <= triangleCenterX ? 'left' : 'right'}-${type}`;
}

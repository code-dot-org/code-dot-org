import {getSmoothStepPath, ConnectionLineComponentProps} from '@xyflow/react';
import React from 'react';

const CustomSmoothStepConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}: ConnectionLineComponentProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return <path fill="none" stroke="#666" strokeWidth={1} d={edgePath} />;
};

export default CustomSmoothStepConnectionLine;

import {useConnection} from '@xyflow/react';
import {useCallback, useMemo, useState} from 'react';

import {useIsAnchorDragging, useSketchLabReadOnly} from '../context';

/**
 * Decides when a node's connection handles are shown. Handles appear while the
 * node is selected, while any anchor or connection drag is in progress, and
 * while the pointer hovers the node. Hover only reveals handles on a connectable node.
 * Returns the visibility flag plus mouse handlers to spread onto the node's root element.
 */
export function useConnectionHandleVisibility(
  selected: boolean,
  connectable: boolean
) {
  const connection = useConnection();
  const isAnchorDragging = useIsAnchorDragging();
  const readOnly = useSketchLabReadOnly();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const showHandles =
    !readOnly &&
    (selected ||
      isAnchorDragging ||
      connection.inProgress ||
      (connectable && isHovered));

  const hoverHandlers = useMemo(
    () => ({onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave}),
    [handleMouseEnter, handleMouseLeave]
  );

  return {showHandles, hoverHandlers};
}

import {ViewportPortal} from '@xyflow/react';
import React, {useLayoutEffect, useRef} from 'react';

import {LINE_INTERACTION_WIDTH_PX} from '../constants';
import {
  computeEdgeSelectionBox,
  type EdgeSelectionBox,
} from '../utils/edgeSelectionBox';

import styles from './react-flow-canvas.module.scss';

interface EdgeSelectionOutlinesProps {
  edgeIds: string[];
}

function sameBox(
  a: EdgeSelectionBox | undefined,
  b: EdgeSelectionBox
): boolean {
  return (
    !!a &&
    a.centerX === b.centerX &&
    a.centerY === b.centerY &&
    a.width === b.width &&
    a.height === b.height &&
    a.angleDegrees === b.angleDegrees
  );
}

/**
 * Draws the selection ring for each selected or focused edge: a node-style ring
 * around the band that accepts clicks, rotated onto the line rather than boxing
 * its endpoints.
 *
 * The ring is measured off the rendered path so it fits every line shape. React
 * Flow renders that path from its own store, which syncs a commit behind the
 * node state that moved it, so measuring during our own commit would leave the
 * ring a step behind throughout a drag. Measuring on an animation frame instead
 * reads whatever the path currently is, and writing straight to the ring's
 * style keeps that off React's render path.
 */
export default function EdgeSelectionOutlines({
  edgeIds,
}: EdgeSelectionOutlinesProps) {
  const outlineRefs = useRef(new Map<string, HTMLDivElement>());
  const lastBoxes = useRef(new Map<string, EdgeSelectionBox>());

  // The frame loop reads this rather than closing over a stale prop.
  const edgeIdsRef = useRef(edgeIds);
  edgeIdsRef.current = edgeIds;

  const active = edgeIds.length > 0;
  useLayoutEffect(() => {
    if (!active) {
      lastBoxes.current.clear();
      return;
    }
    let frame = 0;
    const positionOutlines = () => {
      edgeIdsRef.current.forEach(edgeId => {
        const outline = outlineRefs.current.get(edgeId);
        if (!outline) return;
        const path = document.querySelector<SVGPathElement>(
          `.react-flow__edge[data-id="${CSS.escape(
            edgeId
          )}"] .react-flow__edge-path`
        );
        const box = path
          ? computeEdgeSelectionBox(path, LINE_INTERACTION_WIDTH_PX)
          : null;
        if (!box) {
          outline.style.display = 'none';
          lastBoxes.current.delete(edgeId);
          return;
        }
        if (sameBox(lastBoxes.current.get(edgeId), box)) return;
        lastBoxes.current.set(edgeId, box);
        outline.style.display = '';
        outline.style.left = `${box.centerX}px`;
        outline.style.top = `${box.centerY}px`;
        outline.style.width = `${box.width}px`;
        outline.style.height = `${box.height}px`;
        outline.style.transform = `translate(-50%, -50%) rotate(${box.angleDegrees}deg)`;
      });
      frame = requestAnimationFrame(positionOutlines);
    };
    // Position once before the first paint so no ring flashes at the origin.
    positionOutlines();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <ViewportPortal>
      {edgeIds.map(edgeId => (
        <div
          key={edgeId}
          ref={element => {
            if (element) {
              outlineRefs.current.set(edgeId, element);
            } else {
              outlineRefs.current.delete(edgeId);
              lastBoxes.current.delete(edgeId);
            }
          }}
          className={styles.edgeSelectionOutline}
          style={{display: 'none'}}
        />
      ))}
    </ViewportPortal>
  );
}

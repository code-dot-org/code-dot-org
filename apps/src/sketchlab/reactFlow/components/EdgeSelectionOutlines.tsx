import {ViewportPortal} from '@xyflow/react';
import React, {useLayoutEffect, useRef} from 'react';

import {LINE_INTERACTION_WIDTH_PX} from '../constants';
import {REACT_FLOW_SELECTOR} from '../reactFlowSelectors';
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
 * around the band that accepts clicks, rotated onto the line.
 * The ring is measured off the rendered path so it fits every line shape.
 */
export default function EdgeSelectionOutlines({
  edgeIds,
}: EdgeSelectionOutlinesProps) {
  const outlineRefs = useRef(new Map<string, HTMLDivElement>());
  const lastBoxes = useRef(new Map<string, EdgeSelectionBox>());

  // The observer callback reads this rather than closing over a stale prop.
  const edgeIdsRef = useRef(edgeIds);
  edgeIdsRef.current = edgeIds;

  // Restarts the effect when the outlined set changes, without depending on the
  // identity of an array the parent rebuilds on most renders.
  const edgeIdsKey = edgeIds.join('\n');

  useLayoutEffect(() => {
    if (edgeIdsRef.current.length === 0) {
      lastBoxes.current.clear();
      return;
    }
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
    };
    // Position once before the first paint so no ring flashes at the origin.
    positionOutlines();

    const viewport = document.querySelector(REACT_FLOW_SELECTOR.viewport);
    if (!viewport) return;
    // React Flow rewrites an edge's `d` whenever the line moves, so watching for
    // those writes repositions the rings only when something actually changed,
    // and still before the next paint. Repositioning writes styles and adds no
    // elements, so it cannot retrigger the observer.
    const observer = new MutationObserver(positionOutlines);
    observer.observe(viewport, {
      subtree: true,
      // Catches an edge whose path element mounts or gets replaced later.
      childList: true,
      attributeFilter: ['d'],
    });
    return () => observer.disconnect();
  }, [edgeIdsKey]);

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

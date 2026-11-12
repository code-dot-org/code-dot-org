import classNames from 'classnames';
import React, {useContext, useRef} from 'react';

import useElementSize from '@cdo/apps/util/hooks/useElementSize';

import {CheckpointStatusMap} from '../../progress/model';

import {DrawnEdge} from './layout/busRoutes';
import {MapLayout, NodePosition} from './layout/types';
import {MapFit} from './MapView';
import {MapZoomContext} from './MapZoom';

import styles from './mapBoard.module.scss';

// On-screen scale of the board when zoomed onto a single checkpoint.
const FOCUS_SCALE = 2;
// Maximum on-screen scale during the tour's "pick a checkpoint" step.
// When all focus nodes fit at this scale, we use it; when they don't, we
// zoom out just enough to fit them all.
const TOUR_FOCUS_SCALE = 1.75;
// Fraction of the viewport the bbox of focus nodes should fill.
const TOUR_FOCUS_PADDING = 0.75;

interface MapBoardProps {
  layout: MapLayout;
  /** What to draw for the layout's edges. */
  lines: DrawnEdge[];
  statusMap: CheckpointStatusMap;
  /** The checkpoint the map is zoomed onto, if any. */
  focus?: NodePosition;
  /** See MapProps. */
  fit?: MapFit;
  /** Bounding box center and size of the nodes to highlight during the tour. */
  tourFocus?: {x: number; y: number; width: number; height: number};
  children: React.ReactNode;
}

/**
 * The board a map draws on, at the layout's size, shrunk until it fits the
 * space it is given and centered in it; fitted to the width, scaled to the
 * space's width and as tall as that makes it. Zoomed onto a checkpoint, the
 * board scales up about it and slides so it sits at the center of the view,
 * title and all. Lines go under the children; a line is active once any
 * edge it carries starts from a finished checkpoint.
 */
const MapBoard: React.FunctionComponent<MapBoardProps> = ({
  layout,
  lines,
  statusMap,
  focus,
  fit: fitTo = 'whole',
  tourFocus,
  children,
}) => {
  const fitRef = useRef<HTMLDivElement>(null);
  const [spaceWidth, spaceHeight] = useElementSize(fitRef);
  // The board fills the zoomed content, so they share coordinates.
  const outer = useContext(MapZoomContext);
  const center = outer.center || {x: spaceWidth / 2, y: spaceHeight / 2};
  const byWidth = fitTo === 'width';
  const widthFit = spaceWidth ? spaceWidth / layout.width : 1;
  const fit = byWidth
    ? widthFit
    : spaceWidth
    ? Math.min(1, widthFit, spaceHeight / layout.height)
    : 1;
  const fitLeft = byWidth
    ? 0
    : Math.max(0, (spaceWidth - layout.width * fit) / 2);
  const fitTop = byWidth
    ? 0
    : Math.max(0, (spaceHeight - layout.height * fit) / 2);
  const effectiveFocus = focus ?? tourFocus;
  // For the tour, zoom to fit the bounding box of all highlighted nodes,
  // capped at TOUR_FOCUS_SCALE so nearby nodes don't over-zoom.
  const tourTargetScale =
    !focus && tourFocus && spaceWidth && spaceHeight
      ? Math.min(
          TOUR_FOCUS_SCALE,
          TOUR_FOCUS_PADDING *
            Math.min(
              spaceWidth / tourFocus.width,
              spaceHeight / tourFocus.height
            )
        )
      : TOUR_FOCUS_SCALE;
  const focusScale = Math.max(
    1,
    (focus ? FOCUS_SCALE : tourTargetScale) / (fit * outer.zoom)
  );
  // How far, in board units, the focused point is from the center of the
  // view.
  const shift = effectiveFocus
    ? {
        x: (center.x - fitLeft) / fit - effectiveFocus.x,
        y: (center.y - fitTop) / fit - effectiveFocus.y,
      }
    : {x: 0, y: 0};
  const board = (
    <div
      className={styles.board}
      style={{
        width: layout.width,
        height: layout.height,
        marginLeft: fitLeft,
        marginTop: fitTop,
        transform: `scale(${fit})`,
      }}
    >
      <div
        className={styles.zoom}
        style={
          effectiveFocus && {
            transformOrigin: `${effectiveFocus.x}px ${effectiveFocus.y}px`,
            transform: `translate(${shift.x}px, ${shift.y}px) scale(${focusScale})`,
          }
        }
      >
        <svg
          className={styles.edges}
          width={layout.width}
          height={layout.height}
          aria-hidden
        >
          {lines.map(line => (
            <path
              key={line.key}
              className={classNames(
                styles.edge,
                line.edges.some(
                  e =>
                    statusMap[e.from] === 'complete' ||
                    statusMap[e.from] === 'skipped'
                ) && styles.edgeActive
              )}
              d={line.d}
            />
          ))}
        </svg>
        {children}
      </div>
    </div>
  );
  return (
    <div
      ref={fitRef}
      id="adaptive-tour-map-canvas"
      className={classNames(styles.fit, byWidth && styles.byWidth)}
      // The board's own box keeps its unscaled size, so this one sets the height.
      style={byWidth ? {height: Math.floor(layout.height * fit)} : undefined}
    >
      {board}
    </div>
  );
};

export default MapBoard;

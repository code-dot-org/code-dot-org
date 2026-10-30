import classNames from 'classnames';
import React, {useContext} from 'react';

import {CheckpointStatusMap} from '../../progress/model';

import {DrawnEdge} from './layout/busRoutes';
import {MapLayout, NodePosition} from './layout/types';
import {MapFit} from './MapView';
import {MapZoomContext} from './MapZoom';
import {useElementSize} from './useElementSize';

import styles from './mapBoard.module.scss';

// On-screen scale of the board when zoomed onto a checkpoint, whatever the
// fit shrank it to, unless the viewer had already zoomed in further.
const FOCUS_SCALE = 2;

interface MapBoardProps {
  layout: MapLayout;
  /** What to draw for the layout's edges. */
  lines: DrawnEdge[];
  statusMap: CheckpointStatusMap;
  /** The checkpoint the map is zoomed onto, if any. */
  focus?: NodePosition;
  /** See MapProps. */
  fit?: MapFit;
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
  children,
}) => {
  const [fitRef, space] = useElementSize<HTMLDivElement>();
  // The board fills the zoomed content, so they share coordinates.
  const outer = useContext(MapZoomContext);
  const center = outer.center || {x: space.width / 2, y: space.height / 2};
  const byWidth = fitTo === 'width';
  const widthFit = space.width ? space.width / layout.width : 1;
  const fit = byWidth
    ? widthFit
    : space.width
    ? Math.min(1, widthFit, space.height / layout.height)
    : 1;
  const fitLeft = byWidth
    ? 0
    : Math.max(0, (space.width - layout.width * fit) / 2);
  const fitTop = byWidth
    ? 0
    : Math.max(0, (space.height - layout.height * fit) / 2);
  const focusScale = Math.max(1, FOCUS_SCALE / (fit * outer.zoom));
  // How far, in board units, the focused checkpoint is from the center of
  // the view.
  const shift = focus
    ? {
        x: (center.x - fitLeft) / fit - focus.x,
        y: (center.y - fitTop) / fit - focus.y,
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
          focus && {
            transformOrigin: `${focus.x}px ${focus.y}px`,
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
      className={classNames(styles.fit, byWidth && styles.byWidth)}
      // The board's own box keeps its unscaled size, so this one sets the height.
      style={byWidth ? {height: Math.floor(layout.height * fit)} : undefined}
    >
      {board}
    </div>
  );
};

export default MapBoard;

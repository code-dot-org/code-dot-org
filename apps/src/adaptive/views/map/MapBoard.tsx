import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {CheckpointStatusMap} from '../../progress';

import {DrawnEdge} from './layout/busRoutes';
import {MapLayout, NodePosition} from './layout/types';

import styles from './mapBoard.module.scss';

// On-screen scale of the board when zoomed onto a checkpoint, whatever
// the fit shrank it to.
const FOCUS_SCALE = 2;
const TOUR_FOCUS_SCALE = 1.75;

interface Size {
  width: number;
  height: number;
}

/** The element's size, tracked as it resizes; zero until measured. */
function useElementSize<T extends HTMLElement>(): [React.RefObject<T>, Size] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({width: 0, height: 0});
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const {width, height} = element.getBoundingClientRect();
      setSize(prev =>
        prev.width === width && prev.height === height ? prev : {width, height}
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}

interface MapBoardProps {
  layout: MapLayout;
  /** What to draw for the layout's edges. */
  lines: DrawnEdge[];
  statusMap: CheckpointStatusMap;
  /** The checkpoint the map is zoomed onto, if any. */
  focus?: NodePosition;
  tourFocus?: {x: number; y: number};
  children: React.ReactNode;
}

/**
 * The board a map draws on, at the layout's size, shrunk until it fits the
 * space it is given and centered in it. Zoomed onto a checkpoint, the board
 * scales up about it and slides so it sits at the center of that space,
 * title and all. Lines go under the children; a line is active once any
 * edge it carries starts from a finished checkpoint.
 */
const MapBoard: React.FunctionComponent<MapBoardProps> = ({
  layout,
  lines,
  statusMap,
  focus,
  tourFocus,
  children,
}) => {
  const [fitRef, space] = useElementSize<HTMLDivElement>();
  const fit = space.width
    ? Math.min(1, space.width / layout.width, space.height / layout.height)
    : 1;
  const fitLeft = Math.max(0, (space.width - layout.width * fit) / 2);
  const fitTop = Math.max(0, (space.height - layout.height * fit) / 2);
  const effectiveFocus = focus ?? tourFocus;
  // How far, in board units, the focused point is from the center of the space.
  const shift = effectiveFocus
    ? {
        x: (space.width / 2 - fitLeft) / fit - effectiveFocus.x,
        y: (space.height / 2 - fitTop) / fit - effectiveFocus.y,
      }
    : {x: 0, y: 0};
  return (
    <div ref={fitRef} id="adaptive-tour-map-canvas" className={styles.fit}>
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
              transform: `translate(${shift.x}px, ${shift.y}px) scale(${
                (focus ? FOCUS_SCALE : TOUR_FOCUS_SCALE) / fit
              })`,
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
    </div>
  );
};

export default MapBoard;

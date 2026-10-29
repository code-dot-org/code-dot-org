import classNames from 'classnames';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

import {CheckpointStatusMap} from '../../progress/model';

import {DrawnEdge} from './layout/busRoutes';
import {MapLayout, NodePosition} from './layout/types';

import styles from './mapBoard.module.scss';

// On-screen scale of the board when zoomed onto a checkpoint, whatever
// the fit shrank it to.
const FOCUS_SCALE = 2;

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
    // The client box leaves out scrollbars, so a scrolling board fits beside them.
    const measure = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
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
  /** See MapProps. */
  zoom?: number;
  /** Where a zoomed board first scrolls to the center of the view. */
  start?: NodePosition;
  children: React.ReactNode;
}

/**
 * The board a map draws on, at the layout's size, shrunk until it fits the
 * space it is given and centered in it; given a zoom, scaled to the space's
 * width times the zoom and scrolled instead. Zoomed onto a checkpoint, the board
 * scales up about it and slides so it sits at the center of that space,
 * title and all. Lines go under the children; a line is active once any
 * edge it carries starts from a finished checkpoint.
 */
const MapBoard: React.FunctionComponent<MapBoardProps> = ({
  layout,
  lines,
  statusMap,
  focus,
  zoom,
  start,
  children,
}) => {
  const [fitRef, space] = useElementSize<HTMLDivElement>();
  const scrolls = zoom !== undefined;
  const widthFit = space.width ? space.width / layout.width : 1;
  const fit = scrolls
    ? widthFit * zoom
    : space.width
    ? Math.min(1, widthFit, space.height / layout.height)
    : 1;
  const fitLeft = Math.max(0, (space.width - layout.width * fit) / 2);
  const fitTop = Math.max(0, (space.height - layout.height * fit) / 2);
  // How far, in board units, the focused checkpoint is from the center of
  // the space.
  const shift = focus
    ? {
        x: (space.width / 2 - fitLeft) / fit - focus.x,
        y: (space.height / 2 - fitTop) / fit - focus.y,
      }
    : {x: 0, y: 0};
  // Zooming keeps the point at the center of the view where it was.
  const lastFit = useRef(fit);
  useLayoutEffect(() => {
    const element = fitRef.current;
    const ratio = fit / lastFit.current;
    lastFit.current = fit;
    if (!scrolls || !element || ratio === 1) return;
    const {clientWidth, clientHeight} = element;
    element.scrollLeft =
      (element.scrollLeft + clientWidth / 2) * ratio - clientWidth / 2;
    element.scrollTop =
      (element.scrollTop + clientHeight / 2) * ratio - clientHeight / 2;
  }, [fit, scrolls, fitRef]);
  // Runs after the zoom effect, so the first measured scale's scroll is this one.
  const started = useRef(false);
  useLayoutEffect(() => {
    const element = fitRef.current;
    if (!scrolls || !start || !element || !space.width || started.current) {
      return;
    }
    started.current = true;
    element.scrollLeft = fitLeft + start.x * fit - element.clientWidth / 2;
    element.scrollTop = fitTop + start.y * fit - element.clientHeight / 2;
  }, [scrolls, start, space.width, fit, fitLeft, fitTop, fitRef]);
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
            transform: `translate(${shift.x}px, ${shift.y}px) scale(${
              FOCUS_SCALE / fit
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
  );
  return (
    <div
      ref={fitRef}
      className={classNames(styles.fit, scrolls && styles.scrolling)}
    >
      {scrolls ? (
        // The board's own box keeps its unscaled size, so this box, at the
        // scaled size, is what sets the scroll extent.
        <div
          className={styles.scrollExtent}
          style={{
            width: Math.floor(fitLeft + layout.width * fit),
            height: Math.floor(fitTop + layout.height * fit),
          }}
        >
          {board}
        </div>
      ) : (
        board
      )}
    </div>
  );
};

export default MapBoard;

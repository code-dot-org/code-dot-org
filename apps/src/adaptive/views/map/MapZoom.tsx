import classNames from 'classnames';
import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import useElementSize from '@cdo/apps/util/hooks/useElementSize';

import {MapFit} from './MapView';
import ZoomControls from './ZoomControls';

import styles from './mapZoom.module.scss';

interface MapZoomProps {
  /** Percentages of the map's fitted size to step through, smallest first. */
  zoomPercentages: readonly number[];
  /** Index into zoomPercentages the map opens at and the reset button returns to. */
  startLevel: number;
  /** The fit of the map inside; 'whole' gives it the view's height to fill. */
  fit: MapFit;
  /** Checkpoint centered in the view until the viewer moves the map. */
  startId?: string;
  /** Holds the map where it is and hides the controls. */
  disabled?: boolean;
  className?: string;
  /** Places the controls, which have no position of their own. */
  controlsClassName?: string;
  children: React.ReactNode;
}

export interface MapZoomState {
  zoom: number;
  /** The point of the unscaled content at the center of the view. */
  center?: {x: number; y: number};
}

export const MapZoomContext = createContext<MapZoomState>({zoom: 1});

const ZOOM_MS = 250;

/**
 * The zoom eased toward target a frame at a time, evenly in ratio so each
 * doubling takes as long as the last; at once when motion is reduced.
 */
function useEasedZoom(target: number): number {
  const [zoom, setZoom] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    const show = (value: number) => {
      current.current = value;
      setZoom(value);
    };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      show(target);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / ZOOM_MS);
      const eased = 1 - (1 - t) ** 3;
      show(t === 1 ? target : from * (target / from) ** eased);
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return zoom;
}

/**
 * Zoom for a map: scales the fitted map inside it by the chosen level and
 * scrolls it, with a column of zoom controls. A map smaller than the view is
 * centered in it, and zooming keeps the point at the center of the view.
 */
const MapZoom: React.FunctionComponent<MapZoomProps> = ({
  zoomPercentages,
  startLevel,
  fit,
  startId,
  disabled,
  className,
  controlsClassName,
  children,
}) => {
  const [level, setLevel] = useState(startLevel);
  const viewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewWidth, viewHeight] = useElementSize(viewRef);
  const [contentWidth, contentHeight] = useElementSize(contentRef);
  const moved = useRef(false);
  const zoom = useEasedZoom(zoomPercentages[level] / 100);
  const left = Math.max(0, (viewWidth - contentWidth * zoom) / 2);
  const top = Math.max(0, (viewHeight - contentHeight * zoom) / 2);
  // Read in render: scrolling does not render, and a disabled view cannot
  // scroll, so this holds for as long as it is disabled.
  const element = viewRef.current;
  const state: MapZoomState = {
    zoom,
    center: element
      ? {
          x: (element.scrollLeft + element.clientWidth / 2 - left) / zoom,
          y: (element.scrollTop + element.clientHeight / 2 - top) / zoom,
        }
      : undefined,
  };

  const last = useRef({zoom, left, top});
  useLayoutEffect(() => {
    const element = viewRef.current;
    const prev = last.current;
    last.current = {zoom, left, top};
    if (!element || zoom === prev.zoom) return;
    const ratio = zoom / prev.zoom;
    const {clientWidth, clientHeight} = element;
    element.scrollLeft =
      left +
      (element.scrollLeft + clientWidth / 2 - prev.left) * ratio -
      clientWidth / 2;
    element.scrollTop =
      top +
      (element.scrollTop + clientHeight / 2 - prev.top) * ratio -
      clientHeight / 2;
  }, [zoom, left, top]);

  // The map inside fits itself after this box is measured, so this repeats
  // as sizes settle.
  useLayoutEffect(() => {
    const element = viewRef.current;
    if (!element || !startId || moved.current || !contentWidth) return;
    const node = Array.from(
      element.querySelectorAll<HTMLElement>('[data-checkpoint-id]')
    ).find(n => n.dataset.checkpointId === startId);
    if (!node) return;
    const nodeBox = node.getBoundingClientRect();
    const viewBox = element.getBoundingClientRect();
    element.scrollLeft +=
      nodeBox.left +
      nodeBox.width / 2 -
      (viewBox.left + element.clientLeft + element.clientWidth / 2);
    element.scrollTop +=
      nodeBox.top +
      nodeBox.height / 2 -
      (viewBox.top + element.clientTop + element.clientHeight / 2);
  }, [startId, viewWidth, viewHeight, contentWidth, contentHeight]);

  const onMove = () => {
    moved.current = true;
  };

  return (
    <div className={classNames(styles.mapZoom, className)}>
      {!disabled && (
        <ZoomControls
          zoomPercentages={zoomPercentages}
          level={level}
          resetLevel={startLevel}
          onChange={next => {
            onMove();
            setLevel(next);
          }}
          className={controlsClassName}
        />
      )}
      <div
        ref={viewRef}
        className={classNames(styles.view, disabled && styles.still)}
        onWheel={onMove}
        onPointerDown={onMove}
        onKeyDown={onMove}
      >
        <div
          className={styles.extent}
          style={
            contentWidth
              ? {
                  width: Math.floor(contentWidth * zoom),
                  height: Math.floor(contentHeight * zoom),
                }
              : undefined
          }
        >
          <div
            ref={contentRef}
            className={styles.content}
            style={{
              width: viewWidth || undefined,
              height: fit === 'whole' ? viewHeight || undefined : undefined,
              transform: zoom === 1 ? undefined : `scale(${zoom})`,
            }}
          >
            <MapZoomContext.Provider value={state}>
              {children}
            </MapZoomContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapZoom;

import classNames from 'classnames';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

import {MapFit} from './MapView';
import {useElementSize} from './useElementSize';
import ZoomControls from './ZoomControls';

import styles from './mapZoom.module.scss';

interface MapZoomProps {
  /** Multiples of the map's fitted size to step through, smallest first. */
  levels: readonly number[];
  /** Index into levels the map opens at and the reset button returns to. */
  startLevel: number;
  /** The fit of the map inside; 'whole' gives it the view's height to fill. */
  fit: MapFit;
  /** Checkpoint centered in the view until the viewer moves the map. */
  startId?: string;
  /** Holds the map at the start level and hides the controls. */
  disabled?: boolean;
  className?: string;
  /** Places the controls, which have no position of their own. */
  controlsClassName?: string;
  children: React.ReactNode;
}

/**
 * Zoom for a map: scales the fitted map inside it by the chosen level and
 * scrolls it, with a column of zoom controls. A map smaller than the view is
 * centered in it, and zooming keeps the point at the center of the view.
 */
const MapZoom: React.FunctionComponent<MapZoomProps> = ({
  levels,
  startLevel,
  fit,
  startId,
  disabled,
  className,
  controlsClassName,
  children,
}) => {
  const [level, setLevel] = useState(startLevel);
  const [viewRef, view] = useElementSize<HTMLDivElement>();
  const [contentRef, content] = useElementSize<HTMLDivElement>();
  const moved = useRef(false);
  const zoom = levels[disabled ? startLevel : level];
  const left = Math.max(0, (view.width - content.width * zoom) / 2);
  const top = Math.max(0, (view.height - content.height * zoom) / 2);

  useEffect(() => {
    if (disabled) setLevel(startLevel);
  }, [disabled, startLevel]);

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
  }, [zoom, left, top, viewRef]);

  // The map inside fits itself after this box is measured, so this repeats
  // as sizes settle.
  useLayoutEffect(() => {
    const element = viewRef.current;
    if (!element || !startId || moved.current || !content.width) return;
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
  }, [startId, view, content, viewRef]);

  const onMove = () => {
    moved.current = true;
  };

  return (
    <div className={classNames(styles.mapZoom, className)}>
      {!disabled && (
        <ZoomControls
          levels={levels}
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
            content.width
              ? {
                  width: Math.floor(content.width * zoom),
                  height: Math.floor(content.height * zoom),
                }
              : undefined
          }
        >
          <div
            ref={contentRef}
            className={styles.content}
            style={{
              width: view.width || undefined,
              height: fit === 'whole' ? view.height || undefined : undefined,
              transform: zoom === 1 ? undefined : `scale(${zoom})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapZoom;

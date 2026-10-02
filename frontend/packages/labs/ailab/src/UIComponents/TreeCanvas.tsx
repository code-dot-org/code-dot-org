import {select} from 'd3-selection';
import 'd3-transition';
import {zoom, zoomIdentity, zoomTransform, type ZoomBehavior} from 'd3-zoom';
import {type ReactNode, useLayoutEffect, useMemo, useRef} from 'react';

import {fitToView, type Rect} from '../helpers/fitToView';

import ZoomButton from './ZoomButton';

import styles from './treeCanvas.module.scss';

const FIT_PADDING = 24;
const FIT_MAX_SCALE = 1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2;
const ZOOM_STEP = 1.25;
const ZOOM_DURATION_MS = 250;

function zoomDuration(): number {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ? 0
    : ZOOM_DURATION_MS;
}

function fitTransform(
  viewport: HTMLElement,
  toolbar: HTMLElement,
  insetRight: number,
  rect: Rect,
) {
  const frameLeft = toolbar.offsetLeft + toolbar.offsetWidth + FIT_PADDING;
  const fitted = fitToView(
    rect,
    {
      x: frameLeft,
      y: FIT_PADDING,
      width: viewport.clientWidth - insetRight - frameLeft - FIT_PADDING,
      height: viewport.clientHeight - 2 * FIT_PADDING,
    },
    FIT_MAX_SCALE,
  );
  return (
    fitted && zoomIdentity.translate(fitted.x, fitted.y).scale(fitted.scale)
  );
}

interface TreeCanvasProps {
  contentWidth: number;
  contentHeight: number;
  pathBounds?: Rect;
  /** Width along the right edge that fits keep clear, for a panel floating there. */
  insetRight?: number;
  children: ReactNode;
}

const TreeCanvas = ({
  contentWidth,
  contentHeight,
  pathBounds,
  insetRight = 0,
  children,
}: TreeCanvasProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown>>();
  const scaleTargetRef = useRef<number>();
  const contentRect = useMemo(
    () => ({x: 0, y: 0, width: contentWidth, height: contentHeight}),
    [contentWidth, contentHeight],
  );

  useLayoutEffect(() => {
    const viewport = select(viewportRef.current!);
    const content = contentRef.current!;
    zoomRef.current = zoom<HTMLDivElement, unknown>().on(
      'zoom',
      ({transform}) => {
        content.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
      },
    );
    viewport.call(zoomRef.current).on('dblclick.zoom', null);
    return () => {
      viewport.on('.zoom', null);
    };
  }, []);

  // ResizeObserver reports the starting size before first paint, which makes the initial fit.
  useLayoutEffect(() => {
    const viewport = viewportRef.current!;
    const observer = new ResizeObserver(() => {
      const fitted = fitTransform(
        viewport,
        toolbarRef.current!,
        insetRight,
        contentRect,
      );
      if (fitted) {
        zoomRef
          .current!.scaleExtent([Math.min(MIN_SCALE, fitted.k), MAX_SCALE])
          .transform(select(viewport), fitted);
      }
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [contentRect, insetRight]);

  const animate = () =>
    select(viewportRef.current!).transition().duration(zoomDuration());

  const zoomBy = (factor: number) => {
    const zoomer = zoomRef.current!;
    const [minScale, maxScale] = zoomer.scaleExtent();
    const from =
      scaleTargetRef.current ?? zoomTransform(viewportRef.current!).k;
    const target = Math.min(maxScale, Math.max(minScale, from * factor));
    scaleTargetRef.current = target;
    zoomer.scaleTo(
      animate().on('end interrupt cancel', () => {
        if (scaleTargetRef.current === target) {
          scaleTargetRef.current = undefined;
        }
      }),
      target,
    );
  };

  const zoomTo = (rect: Rect) => {
    const fitted = fitTransform(
      viewportRef.current!,
      toolbarRef.current!,
      insetRight,
      rect,
    );
    if (fitted) {
      zoomRef.current!.transform(animate(), fitted);
    }
  };

  return (
    <div className={styles.treeCanvas}>
      <div ref={viewportRef} className={styles.viewport}>
        <div ref={contentRef} className={styles.content}>
          {children}
        </div>
      </div>
      <div
        ref={toolbarRef}
        role="group"
        aria-label="Zoom"
        className={styles.toolbar}
      >
        <ZoomButton
          label="Zoom in"
          iconName="plus"
          onClick={() => zoomBy(ZOOM_STEP)}
        />
        <ZoomButton
          label="Zoom out"
          iconName="minus"
          onClick={() => zoomBy(1 / ZOOM_STEP)}
        />
        <ZoomButton
          label="Zoom to fit"
          iconName="expand"
          onClick={() => zoomTo(contentRect)}
        />
        <ZoomButton
          label="Zoom to your path"
          iconName="arrows-minimize"
          onClick={() => pathBounds && zoomTo(pathBounds)}
          disabled={!pathBounds}
          disabledHint="Make a prediction to see your path"
        />
      </div>
    </div>
  );
};

export default TreeCanvas;

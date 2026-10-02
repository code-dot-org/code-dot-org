import {select} from 'd3-selection';
import 'd3-transition';
import {
  zoom,
  zoomIdentity,
  zoomTransform,
  type ZoomBehavior,
  type ZoomTransform,
} from 'd3-zoom';
import {
  type FocusEvent,
  type MutableRefObject,
  type ReactNode,
  type RefObject,
  type UIEvent,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import {fitToView, panIntoView, type Rect} from '../helpers/fitToView';

import ZoomButton from './ZoomButton';

import styles from './treeCanvas.module.scss';

const FRAME_PADDING = 24;
const FIT_MAX_SCALE = 1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2;
const ZOOM_STEP = 1.25;
const ZOOM_DURATION_MS = 250;
const READABLE_SCALE = 1;
const SCALE_PROPERTY = '--tree-canvas-scale';

function zoomDuration(): number {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ? 0
    : ZOOM_DURATION_MS;
}

function overlayInset(viewport: HTMLElement, overlay: HTMLElement | null) {
  if (!overlay) {
    return 0;
  }
  const view = viewport.getBoundingClientRect();
  const box = overlay.getBoundingClientRect();
  const overlaps = box.top < view.bottom && box.bottom > view.top;
  return overlaps ? Math.max(0, view.right - box.left) : 0;
}

function viewFrame(
  viewport: HTMLElement,
  toolbar: HTMLElement,
  insetRight = 0,
): Rect {
  const frameLeft = toolbar.offsetLeft + toolbar.offsetWidth + FRAME_PADDING;
  return {
    x: frameLeft,
    y: FRAME_PADDING,
    width: viewport.clientWidth - insetRight - frameLeft - FRAME_PADDING,
    height: viewport.clientHeight - 2 * FRAME_PADDING,
  };
}

function fitTransform(
  viewport: HTMLElement,
  toolbar: HTMLElement,
  overlay: HTMLElement | null,
  rect: Rect,
) {
  const insetRight = overlayInset(viewport, overlay);
  const fitted =
    fitToView(rect, viewFrame(viewport, toolbar, insetRight), FIT_MAX_SCALE) ??
    fitToView(rect, viewFrame(viewport, toolbar), FIT_MAX_SCALE);
  return (
    fitted && zoomIdentity.translate(fitted.x, fitted.y).scale(fitted.scale)
  );
}

function boundingBox(element: Element): Rect {
  const boxes = [element, ...element.children].map(part =>
    part.getBoundingClientRect(),
  );
  const left = Math.min(...boxes.map(box => box.left));
  const top = Math.min(...boxes.map(box => box.top));
  return {
    x: left,
    y: top,
    width: Math.max(...boxes.map(box => box.right)) - left,
    height: Math.max(...boxes.map(box => box.bottom)) - top,
  };
}

// Focusing a node scrolls this clipping box, but only the transform may place the content.
function undoScroll({currentTarget}: UIEvent<HTMLElement>) {
  currentTarget.scrollTop = 0;
  currentTarget.scrollLeft = 0;
}

interface TreeCanvasProps {
  contentWidth: number;
  contentHeight: number;
  pathBounds?: Rect;
  overlayRef?: RefObject<HTMLElement>;
  toolbarTabbable?: boolean;
  children: ReactNode;
}

const TreeCanvas = ({
  contentWidth,
  contentHeight,
  pathBounds,
  overlayRef,
  toolbarTabbable = true,
  children,
}: TreeCanvasProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown>>();
  const scaleTargetRef = useRef<number>();
  const panTargetRef = useRef<ZoomTransform>();
  const autoFitRef = useRef(true);
  const contentRect = useMemo(
    () => ({x: 0, y: 0, width: contentWidth, height: contentHeight}),
    [contentWidth, contentHeight],
  );

  useLayoutEffect(() => {
    const viewport = select(viewportRef.current!);
    const content = contentRef.current!;
    zoomRef.current = zoom<HTMLDivElement, unknown>().on(
      'zoom',
      ({transform, sourceEvent}) => {
        if (sourceEvent) {
          autoFitRef.current = false;
        }
        content.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && content.contains(focused)) {
          focused.style.setProperty(SCALE_PROPERTY, String(transform.k));
        }
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
    autoFitRef.current = true;
    const observer = new ResizeObserver(() => {
      const fitted = fitTransform(
        viewport,
        toolbarRef.current!,
        overlayRef?.current ?? null,
        contentRect,
      );
      if (!fitted) {
        return;
      }
      const zoomer = zoomRef.current!.scaleExtent([
        Math.min(MIN_SCALE, fitted.k),
        MAX_SCALE,
      ]);
      if (autoFitRef.current) {
        zoomer.transform(select(viewport), fitted);
      }
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [contentRect, overlayRef]);

  const animate = () =>
    select(viewportRef.current!).transition().duration(zoomDuration());

  const animateToward = <T,>(
    targetRef: MutableRefObject<T | undefined>,
    target: T,
  ) => {
    targetRef.current = target;
    return animate().on('end interrupt cancel', () => {
      if (targetRef.current === target) {
        targetRef.current = undefined;
      }
    });
  };

  const zoomBy = (factor: number) => {
    autoFitRef.current = false;
    const zoomer = zoomRef.current!;
    const [minScale, maxScale] = zoomer.scaleExtent();
    const from =
      scaleTargetRef.current ?? zoomTransform(viewportRef.current!).k;
    const target = Math.min(maxScale, Math.max(minScale, from * factor));
    zoomer.scaleTo(animateToward(scaleTargetRef, target), target);
  };

  const zoomTo = (rect: Rect) => {
    autoFitRef.current = rect === contentRect;
    const fitted = fitTransform(
      viewportRef.current!,
      toolbarRef.current!,
      overlayRef?.current ?? null,
      rect,
    );
    if (fitted) {
      zoomRef.current!.transform(animate(), fitted);
    }
  };

  const followFocus = ({target}: FocusEvent<HTMLElement>) => {
    const viewport = viewportRef.current!;
    const toolbar = toolbarRef.current!;
    const current = zoomTransform(viewport);
    target.style.setProperty(SCALE_PROPERTY, String(current.k));
    if (!target.matches(':focus-visible')) {
      return;
    }
    const from = panTargetRef.current ?? current;
    const box = boundingBox(target);
    const origin = contentRef.current!.getBoundingClientRect();
    const node = {
      x: (box.x - origin.left) / current.k,
      y: (box.y - origin.top) / current.k,
      width: box.width / current.k,
      height: box.height / current.k,
    };
    const k = Math.max(from.k, READABLE_SCALE);
    const zoomedAboutNode = zoomIdentity
      .translate(from.x + node.x * (from.k - k), from.y + node.y * (from.k - k))
      .scale(k);
    const zoomedNode = {
      x: zoomedAboutNode.applyX(node.x),
      y: zoomedAboutNode.applyY(node.y),
      width: node.width * k,
      height: node.height * k,
    };
    const insetRight = overlayInset(viewport, overlayRef?.current ?? null);
    const pan =
      panIntoView(zoomedNode, viewFrame(viewport, toolbar, insetRight)) ??
      panIntoView(zoomedNode, viewFrame(viewport, toolbar));
    if (pan && (pan.x || pan.y || k !== from.k)) {
      autoFitRef.current = false;
      const to = zoomedAboutNode.translate(pan.x / k, pan.y / k);
      zoomRef.current!.transform(animateToward(panTargetRef, to), to);
    }
  };

  return (
    <div className={styles.treeCanvas} onScroll={undoScroll}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- it only watches focus rising from the tree's nodes */}
      <div ref={viewportRef} className={styles.viewport} onFocus={followFocus}>
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
          tabbable={toolbarTabbable}
          iconName="plus"
          onClick={() => zoomBy(ZOOM_STEP)}
        />
        <ZoomButton
          label="Zoom out"
          tabbable={toolbarTabbable}
          iconName="minus"
          onClick={() => zoomBy(1 / ZOOM_STEP)}
        />
        <ZoomButton
          label="Zoom to fit"
          tabbable={toolbarTabbable}
          iconName="expand"
          onClick={() => zoomTo(contentRect)}
        />
        <ZoomButton
          label="Zoom to your path"
          tabbable={toolbarTabbable}
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

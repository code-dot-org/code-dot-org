import {IconButton, Tooltip} from '@mui/material';
import {select} from 'd3-selection';
import 'd3-transition';
import {zoom, zoomIdentity, type ZoomBehavior} from 'd3-zoom';
import {type ReactNode, useEffect, useRef} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {fitToView, type Rect} from '../helpers/fitToView';

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

function fitTransform(viewport: HTMLElement, rect: Rect) {
  const {x, y, scale} = fitToView(
    rect,
    {width: viewport.clientWidth, height: viewport.clientHeight},
    FIT_PADDING,
    FIT_MAX_SCALE,
  );
  return zoomIdentity.translate(x, y).scale(scale);
}

interface ZoomButtonProps {
  label: string;
  iconName: string;
  onClick: () => void;
  disabled?: boolean;
  disabledHint?: string;
}

// The span lets the tooltip open over a disabled button, which gets no pointer events.
const ZoomButton = ({
  label,
  iconName,
  onClick,
  disabled,
  disabledHint,
}: ZoomButtonProps) => (
  <Tooltip
    title={disabled && disabledHint ? disabledHint : label}
    placement="right"
    describeChild
  >
    <span>
      <IconButton
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        size="extraSmall"
        color="tertiary"
        variant="text"
      >
        <FontAwesomeV6Icon iconName={iconName} aria-hidden="true" />
      </IconButton>
    </span>
  </Tooltip>
);

interface TreeCanvasProps {
  contentWidth: number;
  contentHeight: number;
  pathBounds?: Rect;
  children: ReactNode;
}

const TreeCanvas = ({
  contentWidth,
  contentHeight,
  pathBounds,
  children,
}: TreeCanvasProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown>>();

  useEffect(() => {
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

  useEffect(() => {
    const viewport = viewportRef.current!;
    const fitted = fitTransform(viewport, {
      x: 0,
      y: 0,
      width: contentWidth,
      height: contentHeight,
    });
    zoomRef
      .current!.scaleExtent([Math.min(MIN_SCALE, fitted.k), MAX_SCALE])
      .transform(select(viewport), fitted);
  }, [contentWidth, contentHeight]);

  const animate = () =>
    select(viewportRef.current!).transition().duration(zoomDuration());

  const zoomBy = (factor: number) =>
    zoomRef.current!.scaleBy(animate(), factor);

  const zoomTo = (rect: Rect) =>
    zoomRef.current!.transform(
      animate(),
      fitTransform(viewportRef.current!, rect),
    );

  return (
    <div className={styles.treeCanvas}>
      <div ref={viewportRef} className={styles.viewport}>
        <div ref={contentRef} className={styles.content}>
          {children}
        </div>
      </div>
      <div role="group" aria-label="Zoom" className={styles.toolbar}>
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
          onClick={() =>
            zoomTo({x: 0, y: 0, width: contentWidth, height: contentHeight})
          }
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

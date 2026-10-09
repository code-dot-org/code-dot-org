import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {
  CheckpointStatus,
  CheckpointStatusMap,
  STATUS_LABELS,
} from '../progress';
import {Checkpoint, Pathway} from '../types';

import {DrawnEdge, gridRoutes} from './gridRoutes';
import {
  Edge,
  MapLayout,
  NODE_RADIUS,
  NORMAL_SPACING,
  NodePosition,
  PACKED_SPACING,
  Spacing,
  layoutCheckpoints,
  layoutCluster,
  layoutHoneycomb,
  layoutRadial,
} from './layout';
import {Rect, Size, ZoomLevel, boardTransform} from './mapZoom';
import {EdgeShape, LayoutMode, NodeShape, useUiVariants} from './uiVariants';

import styles from './mapView.module.scss';

const ICONS: {[status in CheckpointStatus]: string} = {
  locked: 'lock',
  available: 'play',
  inProgress: 'ellipsis',
  complete: 'check',
};

// Height of the title box above a circle, so the circle's center lands on
// the layout's (x, y). Edges stop at the top of the box.
const LABEL_HEIGHT = 40;

/** How far a node extends from its (x, y), per shape; edges stop there. */
interface NodeMetrics {
  top: number;
  bottom: number;
  halfWidth: number;
}
const NODE_METRICS: {[shape in NodeShape]: NodeMetrics} = {
  circle: {top: NODE_RADIUS + LABEL_HEIGHT, bottom: NODE_RADIUS, halfWidth: 95},
  circleTitled: {top: 58, bottom: 58, halfWidth: 58},
  square: {top: 40, bottom: 40, halfWidth: 60},
  hexagon: {top: 62, bottom: 62, halfWidth: 54},
};
// Room around that extent.
const EXTENT_PADDING = 40;
// One wheel gesture is many events; after a step, the rest are ignored for
// about as long as the zoom transition runs.
const WHEEL_COOLDOWN_MS = 500;

type EdgePath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  mid: number
) => string;
const EDGE_PATHS: {[shape in Exclude<EdgeShape, 'elbow'>]: EdgePath} = {
  curve: (x1, y1, x2, y2, mid) =>
    `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`,
  straight: (x1, y1, x2, y2) => `M ${x1} ${y1} L ${x2} ${y2}`,
};

// Least distance from a lane to a column, so the lane clears its labels.
const LANE = 100;
// Height of the final jog from the lane back over the child.
const JOG = 12;

/**
 * An L-shaped edge: down from the parent to its track in the gap below,
 * across, and down into the child. An edge that spans rows takes a lane to
 * the side of the child's column instead, clear of the nodes in between,
 * so it does not look like it feeds them.
 */
function elbowPath(
  a: NodePosition,
  b: NodePosition,
  track: number,
  layout: MapLayout,
  metrics: NodeMetrics,
  dir: 1 | -1
): string {
  const [y1, y2] = edgeEnds(a, b, metrics, dir);
  // The vertical space between this row's nodes and the next row's.
  const rowGap = layout.spacing.row - metrics.top - metrics.bottom;
  const ty = y1 + dir * rowGap * track;
  if (b.row - a.row <= 1) return `M ${a.x} ${y1} V ${ty} H ${b.x} V ${y2}`;

  // Candidate lanes: midway between neighbouring columns of the rows in
  // between, and outside the outermost ones. The nearest to the child wins,
  // preferring a clear one, and the parent's side on a tie.
  const xs = [
    ...new Set(
      Object.values(layout.nodes)
        .filter(n => n.row > a.row && n.row < b.row)
        .map(n => n.x)
    ),
  ].sort((p, q) => p - q);
  const candidates = [
    xs[0] - LANE,
    ...xs.slice(1).map((x, i) => (xs[i] + x) / 2),
    xs[xs.length - 1] + LANE,
  ];
  const clearance = (x: number) => Math.min(...xs.map(n => Math.abs(n - x)));
  const clear = candidates.filter(x => clearance(x) >= LANE);
  const toward = a.x < b.x ? -1 : 1;
  const cost = (x: number) =>
    Math.abs(x - b.x) + (Math.sign(x - b.x) === toward ? 0 : 0.5);
  const lane = (clear.length ? clear : candidates).reduce((best, x) =>
    cost(x) < cost(best) ? x : best
  );
  return `M ${a.x} ${y1} V ${ty} H ${lane} V ${y2 - dir * JOG} H ${
    b.x
  } V ${y2}`;
}

// Where a tree edge leaves the parent and meets the child: the parent's
// bottom and the child's top, or the reverse when the tree grows upward.
function edgeEnds(
  a: NodePosition,
  b: NodePosition,
  metrics: NodeMetrics,
  dir: 1 | -1
): [number, number] {
  return dir > 0
    ? [a.y + metrics.bottom, b.y - metrics.top]
    : [a.y - metrics.top, b.y + metrics.bottom];
}

const LAYOUTS: {
  [mode in LayoutMode]: (c: Checkpoint[], spacing: Spacing) => MapLayout;
} = {
  tree: layoutCheckpoints,
  treeUp: (c, spacing) => layoutCheckpoints(c, spacing, true),
  cluster: layoutCluster,
  radial: layoutRadial,
  honeycomb: layoutHoneycomb,
};

interface MapViewProps {
  pathway: Pathway;
  statusMap: CheckpointStatusMap;
  level: ZoomLevel;
  /** Checkpoint the zoomed levels center on. */
  anchorId: string;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  onSelect: (id: string) => void;
  onZoomStep: (direction: 1 | -1) => void;
}

/** The element's content box, tracked as it resizes; zero until measured. */
function useElementSize<T extends HTMLElement>(): [React.RefObject<T>, Size] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({width: 0, height: 0});
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const {width, height} = element.getBoundingClientRect();
      setSize(prev =>
        prev.width === width && prev.height === height ? prev : {width, height}
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}

const MapView: React.FunctionComponent<MapViewProps> = ({
  pathway,
  statusMap,
  level,
  anchorId,
  focusId,
  onSelect,
  onZoomStep,
}) => {
  const {variants} = useUiVariants();
  const metrics = NODE_METRICS[variants.nodeShape];
  const layout = useMemo(
    () =>
      LAYOUTS[variants.layoutMode](
        pathway.checkpoints,
        variants.showEdges ? NORMAL_SPACING : PACKED_SPACING
      ),
    [pathway, variants.layoutMode, variants.showEdges]
  );
  // The selected checkpoint's immediate requirements, marked on the map and
  // kept in view at focus.
  const required = useMemo(() => {
    const focused = pathway.checkpoints.find(c => c.id === focusId);
    return new Set(focused?.requires ?? []);
  }, [pathway, focusId]);
  const focusExtent = useMemo((): Rect | undefined => {
    if (!focusId) return undefined;
    const ids = [focusId, ...required].filter(id => layout.nodes[id]);
    const xs = ids.map(id => layout.nodes[id].x);
    const ys = ids.map(id => layout.nodes[id].y);
    const left = Math.min(...xs) - metrics.halfWidth - EXTENT_PADDING;
    const top = Math.min(...ys) - metrics.top - EXTENT_PADDING;
    return {
      x: left,
      y: top,
      width: Math.max(...xs) + metrics.halfWidth + EXTENT_PADDING - left,
      height: Math.max(...ys) + metrics.bottom + EXTENT_PADDING - top,
    };
  }, [layout, focusId, required, metrics]);
  const feedsFocus = (edge: Edge) => !!focusId && edge.to === focusId;
  // With lines off, only the selected checkpoint's own dependency lines
  // show, if asked for, always highlighted. With them on, highlighting is
  // the option.
  const isIncoming = (edge: Edge) =>
    feedsFocus(edge) &&
    (!variants.showEdges || variants.highlightIncomingEdges);
  // Lines to the selected checkpoint alone, and all radial and honeycomb
  // lines, run straight center to center, over whatever lies between. Only
  // the tree keeps parents in a row above, which its shapes assume; the
  // grid routes through its gaps.
  const edgePath = (a: NodePosition, b: NodePosition, edge: Edge) => {
    if (
      !variants.showEdges ||
      variants.layoutMode === 'radial' ||
      variants.layoutMode === 'honeycomb'
    ) {
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    }
    const dir = variants.layoutMode === 'treeUp' ? -1 : 1;
    const [y1, y2] = edgeEnds(a, b, metrics, dir);
    return variants.edgeShape === 'elbow'
      ? elbowPath(a, b, trackOf(edge.from), layout, metrics, dir)
      : EDGE_PATHS[variants.edgeShape](a.x, y1, b.x, y2, (y1 + y2) / 2);
  };
  // For elbows: each parent in a row gets its own horizontal track in the
  // gap below, so runs from different parents do not merge into one bar.
  const trackOf = useMemo(() => {
    const rows = new Map<number, string[]>();
    for (const node of Object.values(layout.nodes)) {
      (rows.get(node.row) ?? rows.set(node.row, []).get(node.row)!).push(
        node.id
      );
    }
    const track = new Map<string, number>();
    for (const ids of rows.values()) {
      ids.sort((p, q) => layout.nodes[p].x - layout.nodes[q].x);
      ids.forEach((id, i) => track.set(id, (i + 1) / (ids.length + 1)));
    }
    return (id: string) => track.get(id) ?? 0.5;
  }, [layout]);
  // What to draw: every edge, the selected checkpoint's, or none. The grid
  // merges elbows that share a stretch; elsewhere each edge is one line.
  // Highlighted lines come last, so they sit over the rest.
  const lines = useMemo((): DrawnEdge[] => {
    const shown = variants.showEdges
      ? layout.edges
      : variants.showFocusEdges
      ? layout.edges.filter(feedsFocus)
      : [];
    const drawn =
      variants.showEdges && variants.layoutMode === 'cluster'
        ? gridRoutes(layout, variants.edgeShape)
        : shown.map(edge => ({
            key: `${edge.from}-${edge.to}`,
            d: edgePath(layout.nodes[edge.from], layout.nodes[edge.to], edge),
            edges: [edge],
          }));
    const lit = (line: DrawnEdge) => Number(line.edges.some(isIncoming));
    return [...drawn].sort((p, q) => lit(p) - lit(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, focusId, variants]);
  const [viewportRef, viewport] = useElementSize<HTMLDivElement>();
  const measured = viewport.width > 0 && viewport.height > 0;
  const {scale, x, y} = boardTransform(
    level,
    layout,
    viewport,
    layout.nodes[anchorId],
    focusExtent
  );

  // Native, not React's onWheel, which is passive and cannot stop the page
  // from scrolling under the map. The cooldown outlives the listener, which
  // is replaced whenever onZoomStep is.
  const coolingUntil = useRef(0);
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now < coolingUntil.current || e.deltaY === 0) return;
      coolingUntil.current = now + WHEEL_COOLDOWN_MS;
      onZoomStep(e.deltaY < 0 ? 1 : -1);
    };
    element.addEventListener('wheel', onWheel, {passive: false});
    return () => element.removeEventListener('wheel', onWheel);
  }, [viewportRef, onZoomStep]);

  return (
    <div ref={viewportRef} className={styles.viewport}>
      <div
        className={classNames(styles.board, measured && styles.boardSettled)}
        style={{
          width: layout.width,
          height: layout.height,
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
        }}
      >
        {(lines.length > 0 || layout.rings) && (
          <svg
            className={styles.edges}
            width={layout.width}
            height={layout.height}
            aria-hidden
          >
            {layout.rings?.radii.map(r => (
              <circle
                key={r}
                className={styles.ring}
                cx={layout.rings!.x}
                cy={layout.rings!.y}
                r={r}
              />
            ))}
            {lines.map(line => (
              <path
                key={line.key}
                className={classNames(
                  styles.edge,
                  line.edges.some(e => statusMap[e.from] === 'complete') &&
                    styles.edgeActive,
                  line.edges.some(isIncoming) && styles.edgeIncoming
                )}
                d={line.d}
              />
            ))}
          </svg>
        )}
        {pathway.checkpoints.map(checkpoint => {
          const pos = layout.nodes[checkpoint.id];
          const status = statusMap[checkpoint.id];
          return (
            <div
              key={checkpoint.id}
              className={classNames(
                styles.node,
                styles[status],
                styles[variants.nodeShape],
                level === 'focus' &&
                  focusId &&
                  focusId !== checkpoint.id &&
                  !required.has(checkpoint.id) &&
                  styles.dimmed,
                focusId === checkpoint.id && styles.focused,
                required.has(checkpoint.id) && styles.required
              )}
              style={{left: pos.x, top: pos.y - metrics.top}}
            >
              {variants.nodeShape === 'circle' && (
                <MuiTypography variant="strong" className={styles.nodeLabel}>
                  {checkpoint.title}
                </MuiTypography>
              )}
              <div className={styles.shapeWrap}>
                <button
                  type="button"
                  className={styles.shape}
                  onClick={() => onSelect(checkpoint.id)}
                  aria-label={`${checkpoint.title}: ${STATUS_LABELS[status]}`}
                  aria-pressed={focusId === checkpoint.id}
                >
                  <span className={styles.shapeInner}>
                    {!variants.statusBadge && (
                      <FontAwesomeV6Icon
                        iconName={ICONS[status]}
                        className={styles.shapeIcon}
                      />
                    )}
                    {variants.nodeShape !== 'circle' && (
                      <span className={styles.shapeTitle}>
                        {checkpoint.title}
                      </span>
                    )}
                  </span>
                </button>
                {variants.statusBadge && (
                  <span className={styles.badge} aria-hidden>
                    <FontAwesomeV6Icon iconName={ICONS[status]} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapView;

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {
  CheckpointStatus,
  CheckpointStatusMap,
  STATUS_LABELS,
} from '../progress';
import {Pathway} from '../types';

import {DrawnEdge, busRoutes} from './busRoutes';
import {
  MapLayout,
  NODE_RADIUS,
  layoutCheckpoints,
  layoutDestinations,
} from './layout';
import {MapSettings} from './mapSettings';

import styles from './mapView.module.scss';

const ICONS: {[status in CheckpointStatus]: string} = {
  locked: 'lock',
  available: 'play',
  inProgress: 'ellipsis',
  complete: 'check',
  skipped: 'forward',
};

// Height of the title box above a tree circle, so the circle's center lands
// on the layout's (x, y). Tree edges stop at the top of the box.
const LABEL_HEIGHT = 40;
const ZOOM = 1.5;
// How far a destination member's title, beside its circle, reaches out from
// the circle's center; matches the stylesheet.
const SIDE_LABEL_REACH = NODE_RADIUS + 8 + 110;
// Room between a destination box and its circles, more above for the title,
// and from the box to the group's trunk line beside it.
const BOX_PADDING = 12;
const BOX_TITLE_ROOM = 28;
const TRUNK_GAP = 14;

interface DestinationBox {
  title: string;
  ids: string[];
  side: 'left' | 'right';
  x: number;
  y: number;
  width: number;
  height: number;
  /** The x of the group's trunk line, just outside the box. */
  trunk: number;
}

/** A titled box around each destination group's circles. */
function destinationBoxes(layout: MapLayout): DestinationBox[] {
  return (layout.destinations || []).map(({title, ids}) => {
    const xs = ids.map(id => layout.nodes[id].x);
    const ys = ids.map(id => layout.nodes[id].y);
    const side = Math.min(...xs) < layout.width / 2 ? 'left' : 'right';
    // Members carry their title beside them, on the outer side.
    const reach = (toward: typeof side) =>
      toward === side ? SIDE_LABEL_REACH : NODE_RADIUS;
    const x = Math.min(...xs) - reach('left') - BOX_PADDING;
    const y = Math.min(...ys) - NODE_RADIUS - BOX_PADDING - BOX_TITLE_ROOM;
    const width = Math.max(...xs) + reach('right') + BOX_PADDING - x;
    const height = Math.max(...ys) + NODE_RADIUS + BOX_PADDING - y;
    const trunk = side === 'left' ? x + width + TRUNK_GAP : x - TRUNK_GAP;
    return {title, ids, side, x, y, width, height, trunk};
  });
}

/** The element's content width, tracked as it resizes; zero until measured. */
function useElementWidth<T extends HTMLElement>(): [
  React.RefObject<T>,
  number
] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const measure = () => setWidth(element.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

interface MapViewProps {
  pathway: Pathway;
  statusMap: CheckpointStatusMap;
  settings: MapSettings;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  onSelect: (id: string) => void;
}

const MapView: React.FunctionComponent<MapViewProps> = ({
  pathway,
  statusMap,
  settings,
  focusId,
  onSelect,
}) => {
  const destinations = settings.layout === 'destinations';
  const layout = useMemo(
    () =>
      destinations
        ? layoutDestinations(pathway.checkpoints, settings.turns)
        : layoutCheckpoints(pathway.checkpoints),
    [pathway, destinations, settings.turns]
  );
  const boxes = useMemo(() => destinationBoxes(layout), [layout]);
  const sideOf = useMemo(
    () => new Map(boxes.flatMap(b => b.ids.map(id => [id, b.side]))),
    [boxes]
  );
  // Tree lines curve from a parent's circle to the top of its child's title;
  // destination lines are roads along the grid.
  const lines = useMemo((): DrawnEdge[] => {
    if (destinations) {
      const trunkOf = Object.fromEntries(
        boxes.flatMap(b => b.ids.map(id => [id, b.trunk]))
      );
      return busRoutes(layout, trunkOf);
    }
    return layout.edges.map(edge => {
      const a = layout.nodes[edge.from];
      const b = layout.nodes[edge.to];
      const y1 = a.y + NODE_RADIUS;
      const y2 = b.y - NODE_RADIUS - LABEL_HEIGHT;
      const mid = (y1 + y2) / 2;
      return {
        key: `${edge.from}-${edge.to}`,
        d: `M ${a.x} ${y1} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${y2}`,
        edges: [edge],
      };
    });
  }, [layout, destinations, boxes]);
  // The board shrinks to the width it is given, never grows, and sits
  // centered in it.
  const [fitRef, fitWidth] = useElementWidth<HTMLDivElement>();
  const fit = fitWidth ? Math.min(1, fitWidth / layout.width) : 1;
  const fitLeft = Math.max(0, (fitWidth - layout.width * fit) / 2);
  const focus = focusId ? layout.nodes[focusId] : undefined;
  const circleTop = destinations ? NODE_RADIUS : NODE_RADIUS + LABEL_HEIGHT;

  return (
    <div
      ref={fitRef}
      className={styles.fit}
      style={{height: layout.height * fit}}
    >
      <div
        className={styles.board}
        style={{
          width: layout.width,
          height: layout.height,
          marginLeft: fitLeft,
          transform: `scale(${fit})`,
        }}
      >
        <div
          className={styles.zoom}
          style={
            focus && {
              transformOrigin: `${focus.x}px ${focus.y}px`,
              transform: `scale(${ZOOM})`,
            }
          }
        >
          {boxes.map(box => (
            <div
              key={box.title}
              className={classNames(
                styles.destination,
                box.side === 'right' && styles.destinationRight
              )}
              style={{
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
              }}
            >
              <span className={styles.destinationTitle}>{box.title}</span>
            </div>
          ))}
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
          {pathway.checkpoints.map(checkpoint => {
            const pos = layout.nodes[checkpoint.id];
            const status = statusMap[checkpoint.id];
            const side = sideOf.get(checkpoint.id);
            return (
              <div
                key={checkpoint.id}
                className={classNames(
                  styles.node,
                  destinations && styles.nodeBelow,
                  styles[status],
                  focusId && focusId !== checkpoint.id && styles.dimmed,
                  focusId === checkpoint.id && styles.focused
                )}
                style={{left: pos.x, top: pos.y - circleTop}}
              >
                {!destinations && (
                  <MuiTypography variant="strong" className={styles.nodeLabel}>
                    {checkpoint.title}
                  </MuiTypography>
                )}
                <button
                  type="button"
                  className={styles.circle}
                  onClick={() => onSelect(checkpoint.id)}
                  aria-label={`${checkpoint.title}: ${STATUS_LABELS[status]}`}
                  aria-pressed={focusId === checkpoint.id}
                >
                  <FontAwesomeV6Icon iconName={ICONS[status]} />
                </button>
                {destinations && (
                  <span
                    className={classNames(
                      styles.labelBelow,
                      side === 'left' && styles.labelLeft,
                      side === 'right' && styles.labelRight
                    )}
                  >
                    {checkpoint.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapView;

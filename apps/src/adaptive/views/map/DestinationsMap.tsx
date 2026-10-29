import classNames from 'classnames';
import React, {useMemo} from 'react';

import {busRoutes} from './layout/busRoutes';
import {layoutDestinations} from './layout/destinations';
import {MapLayout, NODE_RADIUS} from './layout/types';
import MapBoard from './MapBoard';
import MapNode from './MapNode';
import {MapProps} from './MapView';

import styles from './destinationsMap.module.scss';

// How far a member's title, beside its circle, reaches out from the
// circle's center; matches the stylesheet. Other titles sit below.
const SIDE_LABEL_REACH = NODE_RADIUS + 16 + 110;
const NODE_WIDTH = 112;
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

interface DestinationsMapProps extends MapProps {
  /** Quarter turns clockwise of the destinations around their corners. */
  turns: number;
}

/**
 * The map with its destinations stacked around the outside and the rest
 * fanning out from the center, lines running as roads along the grid.
 */
const DestinationsMap: React.FunctionComponent<DestinationsMapProps> = ({
  pathway,
  statusMap,
  turns,
  focusId,
  zoom,
  startId,
  onSelect,
}) => {
  const layout = useMemo(
    () => layoutDestinations(pathway.checkpoints, turns),
    [pathway, turns]
  );
  const boxes = useMemo(() => destinationBoxes(layout), [layout]);
  const sideOf = useMemo(
    () => new Map(boxes.flatMap(b => b.ids.map(id => [id, b.side]))),
    [boxes]
  );
  const lines = useMemo(() => {
    const trunkOf = Object.fromEntries(
      boxes.flatMap(b => b.ids.map(id => [id, b.trunk]))
    );
    return busRoutes(layout, trunkOf);
  }, [layout, boxes]);
  return (
    <MapBoard
      layout={layout}
      lines={lines}
      statusMap={statusMap}
      focus={focusId ? layout.nodes[focusId] : undefined}
      zoom={zoom}
      start={startId ? layout.nodes[startId] : undefined}
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
      {pathway.checkpoints.map(checkpoint => {
        const side = sideOf.get(checkpoint.id);
        return (
          <MapNode
            key={checkpoint.id}
            checkpoint={checkpoint}
            position={layout.nodes[checkpoint.id]}
            status={statusMap[checkpoint.id]}
            focusId={focusId}
            circleTop={NODE_RADIUS}
            width={NODE_WIDTH}
            onSelect={onSelect}
          >
            <span
              className={classNames(
                styles.labelBelow,
                side === 'left' && styles.labelLeft,
                side === 'right' && styles.labelRight
              )}
            >
              {checkpoint.title}
            </span>
          </MapNode>
        );
      })}
    </MapBoard>
  );
};

export default DestinationsMap;

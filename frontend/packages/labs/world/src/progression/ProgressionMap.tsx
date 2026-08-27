// The map: sixty-seven hexagons, fourteen regions, and the edges between them.
//
// An SVG rather than a canvas. Sixty-seven polygons is not a rendering problem,
// and what an SVG buys is everything else: each tile is an element that can be
// focused, labelled, styled by a stylesheet and printed. See
// specs/PROGRESSION_UI.md.
//
// Layers, back to front: region fills, region outlines, region names, edges,
// tiles, labels, rings. Grouping by layer rather than by tile is what lets a
// region's fill sit under every tile of that region without any z-index games,
// and what lets an edge bar sit on top of the two tiles it joins.
//
// WHAT IS NOT HERE YET (specs/PROGRESSION_UI.md, milestone 5): the list view,
// which is the other first-class way to read this and the only way to read it
// with a screen reader. The keyboard model IS here — a roving tabindex and
// nearest-tile-in-direction on the arrows — because building a mouse-only map
// first and retrofitting keys later produces a map shaped around the mouse.

import {useCallback, useMemo, useRef, useState} from 'react';

import {TILES} from './catalogue';
import {
  boundaryPath,
  cellPoints,
  centre,
  edgeBar,
  extent,
  wrapTitle,
  type Point,
} from './mapGeometry';
import styles from './progressionMap.module.css';
import {REGIONS, regionHue} from './regions';
import type {Tile, TileId, TileState} from './types';

import {TILES_BY_ID, tileState} from './index';

/** Hexagon circumradius, in SVG user units. One number scales the whole map. */
const SIZE = 44;
/** How much smaller a tile is drawn than its cell, leaving the fill showing. */
const TILE_INSET = 0.93;
/** How far outside a tile a selection or focus ring sits. */
const RING_INSET = 1.06;
/** Type size of a region's name, in the same units as everything else. */
const NAME_FONT = SIZE * 0.3;

/** How far a pointer must travel before a press becomes a drag, in pixels. */
const DRAG_THRESHOLD = 4;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

export interface ProgressionMapProps {
  /** Which tiles are done. Everything else follows from this and the edges. */
  completed: ReadonlySet<TileId>;
  /** The tile whose detail is being shown, if any. */
  selected?: TileId;
  onSelect?: (id: TileId) => void;
  /** For a test or a story that wants a smaller map than the catalogue. */
  tiles?: readonly Tile[];
}

export const ProgressionMap = ({
  completed,
  selected,
  onSelect,
  tiles = TILES,
}: ProgressionMapProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({x: 0, y: 0});
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState<TileId>(
    selected ?? tiles[0]?.id ?? '',
  );
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{x: number; y: number; pan: Point} | null>(null);
  // Whether the gesture that just ended was a drag rather than a click. A drag
  // that happens to finish over a tile must not select it.
  const dragged = useRef(false);

  // Region shapes are a function of which cells a region holds, so they are
  // recomputed only when the catalogue is (which is never, in practice).
  const regions = useMemo(() => {
    const everywhere = tiles.map(tile => centre(tile.at, SIZE));
    return REGIONS.map(region => {
      const cells = tiles
        .filter(tile => tile.region === region.id)
        .map(tile => tile.at);
      const points = cells.map(cell => centre(cell, SIZE));
      return {
        ...region,
        hue: regionHue(region.id),
        cells,
        outline: boundaryPath(cells, SIZE),
        // Where the region's name goes: OUTSIDE the region, on the line
        // from the centre of the map through the region's own centre.
        //
        // Written at the centroid it was unreadable, and the reason is worth
        // recording — a region's centroid is by definition covered in that
        // region's own tiles, so the name landed under them. Drawing it above
        // the tiles instead would lay a word across two titles. There is
        // nothing beyond a region but empty map, so that is where it goes.
        label: outward(points, everywhere, SIZE * 1.5),
      };
    });
  }, [tiles]);

  // Big enough for the tiles AND for the region names outside them, which sit
  // further out than any cell and would otherwise be cropped by the viewBox.
  //
  // A name's box is measured from its own length and the side it runs to, not
  // padded by a fixed amount all round. A fixed pad has to be as wide as the
  // longest word to be safe, and then every edge of the map carries that much
  // slack whether a word is there or not — which at this many tiles is the
  // difference between a title being readable and not.
  const box = useMemo(() => {
    const cells = extent(
      tiles.map(tile => tile.at),
      SIZE,
      0.4,
    );
    const boxes = regions.map(region => {
      const width = region.name.length * NAME_FONT * 0.78;
      const left =
        region.label.anchor === 'start'
          ? 0
          : region.label.anchor === 'end'
            ? width
            : width / 2;
      return {
        left: region.label.x - left,
        right: region.label.x - left + width,
        top: region.label.y - NAME_FONT,
        bottom: region.label.y + NAME_FONT,
      };
    });
    const x = Math.min(cells.x, ...boxes.map(b => b.left));
    const y = Math.min(cells.y, ...boxes.map(b => b.top));
    return {
      x,
      y,
      width: Math.max(cells.x + cells.width, ...boxes.map(b => b.right)) - x,
      height: Math.max(cells.y + cells.height, ...boxes.map(b => b.bottom)) - y,
    };
  }, [tiles, regions]);

  const state = useCallback(
    (id: TileId): TileState => tileState(completed, id),
    [completed],
  );

  const choose = useCallback(
    (id: TileId) => {
      // A drag that ended over a tile is not a choice of that tile.
      if (dragged.current) {
        dragged.current = false;
        return;
      }
      setFocused(id);
      onSelect?.(id);
    },
    [onSelect],
  );

  const fit = useCallback(() => {
    setZoom(1);
    setPan({x: 0, y: 0});
  }, []);

  // Zoom about the pointer, so the thing under the cursor stays under it. The
  // alternative — zooming about the centre — walks whatever you were looking at
  // off the edge of the screen, which is the behaviour every map gets wrong.
  const onWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const rect = svg.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const next = clamp(
      zoom * Math.exp(-event.deltaY / 400),
      MIN_ZOOM,
      MAX_ZOOM,
    );
    const factor = next / zoom;
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    setPan({
      x: px - (px - pan.x) * factor,
      y: py - (py - pan.y) * factor,
    });
    setZoom(next);
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) {
      return;
    }
    drag.current = {x: event.clientX, y: event.clientY, pan};
    dragged.current = false;
  };

  // Capture is taken on the first real MOVEMENT, not on the press, and that is
  // load-bearing rather than tidy. Capturing on pointerdown sends the pointerup
  // to the <svg> instead of to the tile, so the browser resolves the click
  // against their common ancestor — the <svg> — and a tile's onClick never
  // runs at all. Every tile was unclickable, silently, and the map still panned
  // perfectly.
  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const from = drag.current;
    if (!from) {
      return;
    }
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    if (!dragged.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) {
        return;
      }
      dragged.current = true;
      setDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    setPan({x: from.pan.x + dx, y: from.pan.y + dy});
  };

  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (event: React.KeyboardEvent, tile: Tile) => {
    const step = ARROWS[event.key];
    if (step) {
      event.preventDefault();
      const next = nearestInDirection(tiles, tile, step);
      if (next) {
        setFocused(next.id);
        onSelect?.(next.id);
        // Focus follows the roving tabindex, which React has not written yet at
        // this point, so ask for the element by name rather than by ref.
        svg.current
          ?.querySelector<SVGGElement>(`[data-tile="${cssEscape(next.id)}"]`)
          ?.focus();
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(tile.id);
    }
  };

  return (
    <div className={styles.frame}>
      <svg
        ref={svg}
        className={`${styles.map} ${dragging ? styles.dragging : ''}`}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        role="group"
        aria-label="Progression map"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Pan is in screen pixels and zoom is about the viewport, so the
            transform is applied outside the viewBox's own scale — hence the
            second group rather than a mutated viewBox. */}
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          <g>
            {regions.map(region => (
              <g
                key={region.id}
                style={{'--hue': `${region.hue}`} as React.CSSProperties}
              >
                {region.cells.map(cell => (
                  <polygon
                    key={cell.join(',')}
                    className={styles.regionFill}
                    points={cellPoints(cell, SIZE)}
                  />
                ))}
                <path className={styles.regionOutline} d={region.outline} />
              </g>
            ))}
          </g>

          <g>
            {tiles.map(tile => (
              <TileShape
                key={tile.id}
                tile={tile}
                state={state(tile.id)}
                hue={regionHue(tile.region)}
                selected={tile.id === selected}
                focusable={tile.id === focused}
                onSelect={() => choose(tile.id)}
                onKeyDown={event => onKeyDown(event, tile)}
              />
            ))}
          </g>

          {/* On top of the tiles, not under them. Under, the only part that
              shows is the sliver in the gap between two tiles — four or five
              pixels, carrying a whole relation. Over, it reads as the staple
              it is. */}
          <g>
            {tiles.flatMap(tile =>
              tile.requires.map(need => {
                const from = TILES_BY_ID.get(need);
                const bar = from && edgeBar(from.at, tile.at, SIZE);
                if (!bar) {
                  return null;
                }
                const met = completed.has(need);
                return (
                  <line
                    key={`${need}->${tile.id}`}
                    className={`${styles.edge} ${met ? '' : styles.edgeUnmet}`}
                    style={
                      {
                        '--hue': `${regionHue(tile.region)}`,
                      } as React.CSSProperties
                    }
                    strokeWidth={SIZE * 0.14}
                    x1={bar[0].x}
                    y1={bar[0].y}
                    x2={bar[1].x}
                    y2={bar[1].y}
                  />
                );
              }),
            )}
          </g>

          <g>
            {regions
              .filter(region => region.kind !== 'origin' && !region.scattered)
              .map(region => (
                <text
                  key={region.id}
                  className={styles.regionName}
                  style={{'--hue': `${region.hue}`} as React.CSSProperties}
                  x={region.label.x}
                  y={region.label.y}
                  textAnchor={region.label.anchor}
                  fontSize={NAME_FONT}
                >
                  {region.name}
                </text>
              ))}
          </g>
        </g>
      </svg>

      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom(z => clamp(z * 1.25, MIN_ZOOM, MAX_ZOOM))}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom(z => clamp(z / 1.25, MIN_ZOOM, MAX_ZOOM))}
        >
          −
        </button>
        <button type="button" aria-label="Fit the whole map" onClick={fit}>
          ⤢
        </button>
      </div>
    </div>
  );
};

interface TileShapeProps {
  tile: Tile;
  state: TileState;
  hue: number;
  selected: boolean;
  focusable: boolean;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

const TileShape = ({
  tile,
  state,
  hue,
  selected,
  focusable,
  onSelect,
  onKeyDown,
}: TileShapeProps) => {
  const at = centre(tile.at, SIZE);
  const lines = wrapTitle(tile.title, {
    width: SIZE * 1.42,
    charWidth: SIZE * 0.115,
  });
  const lineHeight = SIZE * 0.24;
  // Titles are centred on the hexagon and the glyph hangs below them, so the
  // block rises as it grows rather than pushing the glyph off the bottom.
  const top = at.y - ((lines.length - 1) * lineHeight) / 2 - SIZE * 0.1;

  return (
    <g
      className={`${styles.tile} ${styles[state]}`}
      style={{'--hue': `${hue}`} as React.CSSProperties}
      data-tile={tile.id}
      role="button"
      tabIndex={focusable ? 0 : -1}
      aria-label={accessibleName(tile, state)}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <polygon
        className={styles.tileShape}
        points={cellPoints(tile.at, SIZE, TILE_INSET)}
      />
      {selected && (
        <polygon
          className={styles.ring}
          points={cellPoints(tile.at, SIZE, RING_INSET)}
        />
      )}
      {focusable && (
        // Rendered whenever this is the tile the roving tabindex points at,
        // and painted only while the map actually has focus — see the
        // `:focus-visible` rule, which is what tells "the keyboard is here"
        // apart from "this is where the keyboard would arrive".
        <polygon
          className={styles.focusRing}
          points={cellPoints(tile.at, SIZE, RING_INSET)}
        />
      )}
      <text className={styles.label} fontSize={SIZE * 0.21}>
        {lines.map((line, index) => (
          <tspan key={line + index} x={at.x} y={top + index * lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
      <Glyph state={state} x={at.x} y={at.y + SIZE * 0.52} />
    </g>
  );
};

/**
 * The mark that says what state a tile is in, beside the colour that says the
 * same thing — because colour on its own is not something everybody can read.
 * A tick for done, a padlock for shut, and nothing for open, which is the
 * ordinary case and needs no mark.
 */
const Glyph = ({state, x, y}: {state: TileState; x: number; y: number}) => {
  const r = SIZE * 0.11;
  if (state === 'done') {
    return (
      <path
        className={styles.glyph}
        strokeWidth={r * 0.55}
        d={`M${x - r},${y} l${r * 0.75},${r * 0.8} L${x + r},${y - r}`}
      />
    );
  }
  if (state === 'shut') {
    return (
      <g className={styles.glyph} strokeWidth={r * 0.42}>
        <rect
          x={x - r * 0.8}
          y={y - r * 0.15}
          width={r * 1.6}
          height={r * 1.2}
          rx={r * 0.25}
        />
        <path
          d={`M${x - r * 0.42},${y - r * 0.15} v${-r * 0.45} a${r * 0.42},${r * 0.42} 0 0 1 ${r * 0.84},0 v${r * 0.45}`}
        />
      </g>
    );
  }
  return null;
};

/**
 * What a screen reader says about a tile: everything the picture says, in the
 * order it matters. "Jumping. Platformer. Locked — needs Gravity."
 */
const accessibleName = (tile: Tile, state: TileState): string => {
  const region = REGIONS.find(r => r.id === tile.region)?.name ?? tile.region;
  if (state === 'done') {
    return `${tile.title}. ${region}. Done.`;
  }
  if (state === 'open') {
    return `${tile.title}. ${region}. Ready to start.`;
  }
  const missing = tile.requires
    .map(id => TILES_BY_ID.get(id)?.title ?? id)
    .join(' and ');
  return `${tile.title}. ${region}. Locked — needs ${missing}.`;
};

/** Screen directions the arrow keys mean, as unit vectors. */
const ARROWS: Record<string, Point | undefined> = {
  ArrowLeft: {x: -1, y: 0},
  ArrowRight: {x: 1, y: 0},
  ArrowUp: {x: 0, y: -1},
  ArrowDown: {x: 0, y: 1},
};

/**
 * The nearest tile in a screen direction — not the neighbour in that direction.
 *
 * Six neighbours do not fit on four arrow keys, and every scheme that tries to
 * make them (modifiers, letter keys for the diagonals) is a scheme nobody
 * discovers. Nearest-in-direction works with four keys, crosses the holes in
 * the map, and cannot get stuck at a region boundary.
 *
 * "In a direction" means within 60° of the axis, which tiles the plane into
 * four quadrants with no gaps and no overlap.
 */
export const nearestInDirection = (
  tiles: readonly Tile[],
  from: Tile,
  direction: Point,
): Tile | undefined => {
  const here = centre(from.at, SIZE);
  let best: {tile: Tile; distance: number} | undefined;
  for (const tile of tiles) {
    if (tile === from) {
      continue;
    }
    const there = centre(tile.at, SIZE);
    const dx = there.x - here.x;
    const dy = there.y - here.y;
    const distance = Math.hypot(dx, dy);
    const along = (dx * direction.x + dy * direction.y) / distance;
    if (along < Math.cos((60 * Math.PI) / 180)) {
      continue;
    }
    // Ties go to the tile more squarely in the direction asked for, which is
    // what makes a column of hexagons walk straight up rather than zig-zag.
    const cost = distance / along;
    if (!best || cost < best.distance) {
      best = {tile, distance: cost};
    }
  }
  return best?.tile;
};

/**
 * A point past the far edge of a cluster, on the line from the map's centre
 * through the cluster's own centre — where a region's name goes.
 *
 * The direction is the centroid's, so the name sits at the angle the region
 * occupies; the distance is the region's outermost cell plus a margin, so it
 * clears every tile in the region whatever shape the region is.
 */
const outward = (
  points: readonly Point[],
  all: readonly Point[],
  margin: number,
): Point & {anchor: 'start' | 'middle' | 'end'} => {
  const mean = {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
  const length = Math.hypot(mean.x, mean.y) || 1;
  const direction = {x: mean.x / length, y: mean.y / length};
  // The direction is the REGION's; the distance is the whole MAP's.
  //
  // Two wrong answers came before this one. Clearing the region's outermost
  // cell by its plain distance puts the label inside the region whenever that
  // cell is off to one side, which for a wedge it always is. Clearing the
  // region's own reach along this line fixes that and still collides — with
  // whatever ELSE lies further out on the same bearing, which for a genre is
  // its Making tile and for a foundation is the genre beside it.
  //
  // So: outside everything. Twelve names then sit in a ring around the map,
  // which is where a legend belongs anyway.
  const reach = Math.max(
    ...all.map(p => p.x * direction.x + p.y * direction.y),
  );
  return {
    x: direction.x * (reach + margin),
    y: direction.y * (reach + margin),
    // Which way the words run from that point. Centred is right for a name
    // directly above or below the map and wrong for one beside it, where half
    // the word grows back over the tiles the margin just cleared.
    anchor: direction.x > 0.3 ? 'start' : direction.x < -0.3 ? 'end' : 'middle',
  };
};

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

/** `CSS.escape`, which jsdom has and older browsers do not. */
const cssEscape = (value: string): string =>
  typeof CSS !== 'undefined' && CSS.escape
    ? CSS.escape(value)
    : value.replace(/["\\]/g, '\\$&');

export {SIZE as MAP_TILE_SIZE};

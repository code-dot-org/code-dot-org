// The map: sixty-seven hexagons, fourteen regions, and the edges between them.
//
// An SVG rather than a canvas. Sixty-seven polygons is not a rendering problem,
// and what an SVG buys is everything else: each tile is an element that can be
// focused, labeled, styled by a stylesheet and printed. See
// specs/PROGRESSION_UI.md.
//
// Layers, back to front: region fills, region outlines, region names, edges,
// tiles, labels, rings. Grouping by layer rather than by tile is what lets a
// region's fill sit under every tile of that region without any z-index games,
// and what lets an edge bar sit on top of the two tiles it joins.
//
// It is a LISTBOX of options, with a roving tabindex and arrows that move to
// the nearest tile in a direction. What it is not is the only way to read the
// catalogue: `./ProgressionList` says the same thing in headings and lists, and
// is not a fallback — an SVG is the wrong medium for "which lessons teach me
// about text", and no medium at all for a screen reader.

import {IconButton} from '@mui/material';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {ICON_FAMILY, ICON_WEIGHT} from '../blockly/extensions/glyphIcon';

import {TILES} from './catalogue';
import {
  boundaryPath,
  cellPoints,
  center,
  edgeBar,
  extent,
  wrapTitle,
  type Point,
} from './mapGeometry';
import {regionColors, SURFACES} from './palette';
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
  // The listener below is attached once; a closure over `zoom` would zoom from
  // whatever it was when the map mounted.
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const drag = useRef<{x: number; y: number; pan: Point} | null>(null);
  // Whether the gesture that just ended was a drag rather than a click. A drag
  // that happens to finish over a tile must not select it.
  const dragged = useRef(false);

  // Region shapes are a function of which cells a region holds, so they are
  // recomputed only when the catalogue is (which is never, in practice).
  const regions = useMemo(() => {
    const everywhere = tiles.map(tile => center(tile.at, SIZE));
    return REGIONS.map(region => {
      const cells = tiles
        .filter(tile => tile.region === region.id)
        .map(tile => tile.at);
      const points = cells.map(cell => center(cell, SIZE));
      return {
        ...region,
        hue: regionHue(region.id),
        colors: regionVariables(regionHue(region.id)),
        cells,
        outline: boundaryPath(cells, SIZE),
        // Where the region's name goes: OUTSIDE the region, on the line
        // from the center of the map through the region's own center.
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

  /**
   * The tiles in paint order: everything, then the focused one, then the
   * selected one.
   *
   * Focus under selection because the two rings are concentric and the
   * selection is the louder of them; when one tile is both, it is drawn once
   * either way.
   */
  const ordered = useMemo(() => {
    const rank = (tile: Tile) =>
      tile.id === selected ? 2 : tile.id === focused ? 1 : 0;
    return [...tiles].sort((one, other) => rank(one) - rank(other));
  }, [tiles, selected, focused]);

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

  /** How many user units a screen pixel is worth right now. */
  const perPixel = useCallback(
    () => 1 / (svg.current?.getScreenCTM?.()?.a || 1),
    [],
  );

  /**
   * Pan until a tile is inside the visible box, if it is not already.
   *
   * Two criteria and one convenience rest on this. **Focus Not Obscured**
   * (WCAG 2.4.11): arrowing to a tile that is off the edge of a zoomed map puts
   * focus somewhere nobody can see. **Dragging Movements** (2.5.7): dragging is
   * the only way to pan, so there has to be a way to reach any tile without it
   * — picking a tile in the list is that way, and this is what makes picking it
   * bring the map along.
   *
   * Measured in screen pixels and converted back, rather than reasoned about in
   * viewBox coordinates: `preserveAspectRatio` decides how the box maps onto
   * the element, and the two rectangles already know the answer.
   */
  const bringIntoView = useCallback(
    (id: TileId) => {
      const element = svg.current?.querySelector<SVGGElement>(
        `[data-tile="${cssEscape(id)}"]`,
      );
      const frame = svg.current?.getBoundingClientRect();
      if (!element || !frame || !frame.width) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const margin = 12;
      const dx =
        rect.left < frame.left + margin
          ? frame.left + margin - rect.left
          : rect.right > frame.right - margin
            ? frame.right - margin - rect.right
            : 0;
      const dy =
        rect.top < frame.top + margin
          ? frame.top + margin - rect.top
          : rect.bottom > frame.bottom - margin
            ? frame.bottom - margin - rect.bottom
            : 0;
      if (!dx && !dy) {
        return;
      }
      const scale = perPixel();
      setPan(previous => ({
        x: previous.x + dx * scale,
        y: previous.y + dy * scale,
      }));
    },
    [perPixel],
  );

  // Whatever the detail pane is showing, the map is looking at.
  useEffect(() => {
    if (selected) {
      bringIntoView(selected);
    }
  }, [selected, bringIntoView]);

  /**
   * Where a screen point is in the map's own coordinates.
   *
   * Through the SVG's own matrix rather than by arithmetic on the bounding
   * box, because `preserveAspectRatio` letterboxes the viewBox inside the
   * element and the amount of that is not something this file should be
   * working out for itself. `getScreenCTM` already knows.
   */
  const userPoint = useCallback((clientX: number, clientY: number) => {
    const node = svg.current;
    const matrix = node?.getScreenCTM?.();
    if (!node || !matrix) {
      return null;
    }
    const point = node.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(matrix.inverse());
  }, []);

  /**
   * Zoom about a point, keeping whatever is under it under it.
   *
   * The alternative — zooming about the middle — walks the thing you were
   * looking at off the edge, which is the behavior every map gets wrong.
   *
   * The arithmetic is in USER UNITS, which is the part that has to be said.
   * The pan is applied inside the viewBox (`translate(pan) scale(zoom)`), so a
   * map point `u` is drawn at `pan + zoom * u`; holding the point under the
   * cursor fixed gives `pan' = c - (c - pan) * factor`, and every term in that
   * has to be in the same units as the pan. Feeding it a pixel offset instead
   * — which is what a bounding-box subtraction gives you — zooms about a point
   * that drifts further from the cursor the further the map is panned.
   */
  const zoomTo = useCallback((next: number, at?: {x: number; y: number}) => {
    setZoom(current => {
      const limited = clamp(next, MIN_ZOOM, MAX_ZOOM);
      const factor = limited / current;
      if (at) {
        setPan(previous => ({
          x: at.x - (at.x - previous.x) * factor,
          y: at.y - (at.y - previous.y) * factor,
        }));
      }
      return limited;
    });
  }, []);

  /**
   * The wheel listener, attached by hand and NOT passive.
   *
   * React attaches `onWheel` at the root as a passive listener, so
   * `preventDefault` inside one does nothing and says so in the console:
   * "Unable to preventDefault inside passive event listener invocation." The
   * visible half of that is the page scrolling while the map zooms.
   */
  useEffect(() => {
    const node = svg.current;
    if (!node) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const at = userPoint(event.clientX, event.clientY);
      zoomTo(zoomRef.current * Math.exp(-event.deltaY / 400), at ?? undefined);
    };
    node.addEventListener('wheel', onWheel, {passive: false});
    return () => node.removeEventListener('wheel', onWheel);
  }, [userPoint, zoomTo]);

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
    // The pan is applied INSIDE the viewBox, so it is in user units and the
    // pointer's travel is in pixels. Without the conversion the map moves by
    // the wrong amount and does not keep up with the hand dragging it.
    const scale = perPixel();
    setPan({x: from.pan.x + dx * scale, y: from.pan.y + dy * scale});
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
        bringIntoView(next.id);
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
        style={SURFACE_VARIABLES}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        // A LISTBOX, not sixty-seven buttons. What a tile does when you pick it
        // is get selected — the detail pane follows — and `aria-selected` says
        // that where `aria-pressed` would have claimed a toggle. It also comes
        // with the keyboard model already built here: one tab stop, arrows to
        // move within it (WAI-ARIA listbox, roving tabindex variant).
        role="listbox"
        aria-label="Progression map"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Pan is in screen pixels and zoom is about the viewport, so the
            transform is applied outside the viewBox's own scale — hence the
            second group rather than a mutated viewBox. */}
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          <g aria-hidden="true">
            {regions.map(region => (
              <g key={region.id} style={region.colors}>
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

          {/* THE SELECTED AND FOCUSED TILES LAST, which in an SVG is the
              only way to say "in front": paint order is document order, and
              there is no z-index. A ring drawn inside a tile's own group is
              painted over by every tile that comes after it in the catalogue,
              so a selection ring appeared and disappeared along its own edges
              depending on which neighbors happened to be listed later.
              Reordering rather than lifting the ring out into a layer of its
              own, because the ring belongs to the tile — it moves with it, it
              is described by the same `aria-selected`, and a layer would be a
              second place to keep the geometry in step. */}
          <g>
            {ordered.map(tile => (
              <TileShape
                key={tile.id}
                tile={tile}
                state={state(tile.id)}
                colors={regionVariables(regionHue(tile.region))}
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
          <g aria-hidden="true">
            {tiles.flatMap(tile =>
              tile.requires.map(need => {
                const from = TILES_BY_ID.get(need);
                const bar = from && edgeBar(from.at, tile.at, SIZE);
                if (!bar) {
                  return null;
                }
                const met = completed.has(need);
                // A halo of the page color under the bar, and the bar over
                // it. A bar lies across whatever the two tiles are filled with
                // — a finished tile, a locked one, the wash between them — and
                // cannot be asked to contrast with all of them at once. The
                // halo gives it one background it can.
                const line = {
                  strokeWidth: SIZE * 0.14,
                  x1: bar[0].x,
                  y1: bar[0].y,
                  x2: bar[1].x,
                  y2: bar[1].y,
                };
                return (
                  <g
                    key={`${need}->${tile.id}`}
                    className={styles.region}
                    style={regionVariables(regionHue(tile.region))}
                  >
                    <line
                      {...line}
                      className={styles.edgeHalo}
                      strokeWidth={SIZE * 0.22}
                    />
                    <line
                      {...line}
                      className={`${styles.edge} ${met ? '' : styles.edgeUnmet}`}
                    />
                  </g>
                );
              }),
            )}
          </g>

          <g aria-hidden="true">
            {regions
              .filter(region => region.kind !== 'origin' && !region.scattered)
              .map(region => (
                <text
                  key={region.id}
                  className={`${styles.regionName} ${styles.region}`}
                  style={region.colors}
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

      {/* MUI's IconButton and FontAwesome, so these three read as the same
          kind of control as every other icon button in the lab rather than as
          three characters typed into a box. The surface, the border and the
          focus ring stay the map's, because they sit ON the map. */}
      <div className={styles.controls}>
        {(
          [
            ['Zoom in', 'plus', () => zoomTo(zoomRef.current * 1.25)],
            ['Zoom out', 'minus', () => zoomTo(zoomRef.current / 1.25)],
            ['Fit the whole map', 'expand', fit],
          ] as const
        ).map(([label, icon, act]) => (
          <IconButton
            key={label}
            aria-label={label}
            title={label}
            onClick={act}
            className={styles.control}
            size="small"
          >
            <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
          </IconButton>
        ))}
      </div>
    </div>
  );
};

interface TileShapeProps {
  tile: Tile;
  state: TileState;
  /** Its region's four colors, both themes, as custom properties. */
  colors: React.CSSProperties;
  selected: boolean;
  focusable: boolean;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

const TileShape = ({
  tile,
  state,
  colors,
  selected,
  focusable,
  onSelect,
  onKeyDown,
}: TileShapeProps) => {
  const at = center(tile.at, SIZE);
  const lines = wrapTitle(tile.title, {
    width: SIZE * 1.42,
    charWidth: SIZE * 0.115,
  });
  const lineHeight = SIZE * 0.24;
  // Titles are centered on the hexagon and the glyph hangs below them, so the
  // block rises as it grows rather than pushing the glyph off the bottom.
  const top = at.y - ((lines.length - 1) * lineHeight) / 2 - SIZE * 0.1;

  return (
    <g
      className={`${styles.tile} ${styles[state]} ${styles.region}`}
      style={colors}
      data-tile={tile.id}
      role="option"
      tabIndex={focusable ? 0 : -1}
      aria-label={accessibleName(tile, state)}
      aria-selected={selected}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <polygon
        className={styles.tileShape}
        points={cellPoints(tile.at, SIZE, TILE_INSET)}
      />
      {selected && (
        <>
          {/* A halo under the ring, in the page color: the ring lies across
              whatever region fill and edge bars happen to be beneath it and
              cannot be asked to contrast with all of them at once. The edges
              solve the same problem the same way. */}
          <polygon
            className={styles.ringHalo}
            points={cellPoints(tile.at, SIZE, RING_INSET)}
          />
          <polygon
            className={styles.ring}
            // Keyed by the tile, so React replaces the element when the
            // selection moves rather than reusing it — which is what restarts
            // the arrival pulse. Reused, the animation would play once for the
            // first tile ever selected and never again.
            key={tile.id}
            points={cellPoints(tile.at, SIZE, RING_INSET)}
          />
        </>
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
 * The mark that says what state a tile is in, beside the color that says the
 * same thing — because color on its own is not something everybody can read.
 * A tick for done, a padlock for shut, and nothing for open, which is the
 * ordinary case and needs no mark.
 *
 * FONTAWESOME, as a glyph rather than as an `<i>`: this is inside an SVG, so
 * the icon component's element would not render. The lab injects the font
 * (`@code-dot-org/fonts`) and the block editor's own icons are drawn the same
 * way (`blockly/extensions/enhanceButton`), so the two agree about what a lock
 * looks like — which two hand-drawn paths could not promise.
 */
const ICONS: Partial<Record<TileState, string>> = {
  // fa-check and fa-lock, by codepoint. The names are in the comment because
  // the codepoints are not readable and the names are what anybody would
  // search for.
  done: '\uf00c',
  shut: '\uf023',
};

const Glyph = ({state, x, y}: {state: TileState; x: number; y: number}) => {
  const icon = ICONS[state];
  if (!icon) {
    return null;
  }
  return (
    <text
      className={styles.glyph}
      x={x}
      y={y}
      fontSize={SIZE * 0.24}
      // The family from `glyphIcon` rather than from this file's stylesheet:
      // it is the same list the block buttons use, and the one time it was
      // written out twice the two copies fell out of step with each other.
      style={{fontFamily: ICON_FAMILY, fontWeight: ICON_WEIGHT}}
    >
      {icon}
    </text>
  );
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

/**
 * A region's four colors, for both themes, as custom properties. The
 * stylesheet aliases one set or the other; nothing here knows which.
 */
const regionVariables = (hue: number): React.CSSProperties => {
  const light = regionColors(hue, 'light');
  const dark = regionColors(hue, 'dark');
  return {
    '--field-light': light.field,
    '--tone-light': light.tone,
    '--line-light': light.line,
    '--name-light': light.name,
    '--field-dark': dark.field,
    '--tone-dark': dark.tone,
    '--line-dark': dark.line,
    '--name-dark': dark.name,
  } as React.CSSProperties;
};

/**
 * Everything that is not a region's own color, on the map's root.
 *
 * BOTH themes, chosen in the stylesheet on `[data-theme]` — the same signal the
 * design system's own tokens are scoped by. Choosing in React instead looked
 * simpler and was wrong twice over: the OS preference is not the lab's theme,
 * and even the lab's own `useTheme` context can disagree with the `data-theme`
 * attribute the dialog's surface is painted from. Reading the same attribute
 * the tokens read is the only arrangement in which the map and the panel it
 * sits in cannot end up in different themes.
 */
const SURFACE_VARIABLES = {
  '--page-light': SURFACES.light.page,
  '--surface-light': SURFACES.light.surface,
  '--ink-light': SURFACES.light.ink,
  '--shut-fill-light': SURFACES.light.shutFill,
  '--shut-ink-light': SURFACES.light.shutInk,
  '--shut-line-light': SURFACES.light.shutLine,
  '--ring-light': SURFACES.light.ring,
  '--focus-light': SURFACES.light.focus,
  '--page-dark': SURFACES.dark.page,
  '--surface-dark': SURFACES.dark.surface,
  '--ink-dark': SURFACES.dark.ink,
  '--shut-fill-dark': SURFACES.dark.shutFill,
  '--shut-ink-dark': SURFACES.dark.shutInk,
  '--shut-line-dark': SURFACES.dark.shutLine,
  '--ring-dark': SURFACES.dark.ring,
  '--focus-dark': SURFACES.dark.focus,
} as React.CSSProperties;

/** Screen directions the arrow keys mean, as unit vectors. */
const ARROWS: Record<string, Point | undefined> = {
  ArrowLeft: {x: -1, y: 0},
  ArrowRight: {x: 1, y: 0},
  ArrowUp: {x: 0, y: -1},
  ArrowDown: {x: 0, y: 1},
};

/**
 * The nearest tile in a screen direction — not the neighbor in that direction.
 *
 * Six neighbors do not fit on four arrow keys, and every scheme that tries to
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
  const here = center(from.at, SIZE);
  let best: {tile: Tile; distance: number} | undefined;
  for (const tile of tiles) {
    if (tile === from) {
      continue;
    }
    const there = center(tile.at, SIZE);
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
 * A point past the far edge of a cluster, on the line from the map's center
 * through the cluster's own center — where a region's name goes.
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

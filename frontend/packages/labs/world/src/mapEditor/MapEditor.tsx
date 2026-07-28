import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {
  projectActorOptions,
  projectWorldOptions,
} from '../blockly/projectModules';
import {projectFiles} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import styles from './mapEditor.module.css';

// The map's world-coordinate space is the game's native resolution. The canvas
// FILLS its pane; a camera (scale + offset) maps world coords onto it, so the map
// region is a bordered rectangle you can pan and zoom around. Actors draw at
// their sprite size, centred on their position.
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const DEFAULT_TILE = 32;
const DRAW_SIZE = 32;

// Camera limits. `FIT_PADDING` leaves a margin so the bordered map doesn't touch
// the pane edges at the default (reset) zoom.
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const FIT_PADDING = 0.92;

const OUTSIDE_BG = '#0b0b12'; // the space beyond the map
const MAP_BG = '#151521'; // the map region itself
const GRID = 'rgba(255, 255, 255, 0.07)';
const BORDER = 'rgba(255, 255, 255, 0.6)'; // outlines the placeable map space
const SELECT = '#4d9fff'; // highlights the selected placed actor

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

interface Tile {
  width: number;
  height: number;
}
interface Vec {
  x: number;
  y: number;
}
interface Placement {
  type: string;
  id: string;
  properties?: {positional?: {position?: Vec}};
}
interface MapDoc {
  type: 'map';
  tile: Tile;
  actors: Placement[];
}
/** The camera: screen_px = world * scale + offset (offset in CSS pixels). */
interface View {
  scale: number;
  x: number;
  y: number;
}
interface Size {
  w: number;
  h: number;
}

function parseMap(contents: string): MapDoc {
  const empty: MapDoc = {
    type: 'map',
    tile: {width: DEFAULT_TILE, height: DEFAULT_TILE},
    actors: [],
  };
  if (!contents.trim()) {
    return empty;
  }
  try {
    const raw = JSON.parse(contents) as Partial<MapDoc>;
    return {
      type: 'map',
      tile: {
        width: raw.tile?.width ?? DEFAULT_TILE,
        height: raw.tile?.height ?? DEFAULT_TILE,
      },
      actors: Array.isArray(raw.actors) ? raw.actors : [],
    };
  } catch {
    return empty;
  }
}

const positionOf = (actor: Placement): Vec | undefined =>
  actor.properties?.positional?.position;

/** A copy of `actor` with its positional position set to `pos`. */
const withPosition = (actor: Placement, pos: Vec): Placement => ({
  ...actor,
  properties: {
    ...actor.properties,
    positional: {...actor.properties?.positional, position: pos},
  },
});

/** Centre the whole map in a `w`×`h` pane with a margin (the reset view). */
function fitView(w: number, h: number): View {
  const scale = clamp(
    Math.min(w / GAME_WIDTH, h / GAME_HEIGHT) * FIT_PADDING,
    MIN_SCALE,
    MAX_SCALE,
  );
  return {
    scale,
    x: (w - GAME_WIDTH * scale) / 2,
    y: (h - GAME_HEIGHT * scale) / 2,
  };
}

/**
 * The map editor (Codebridge `.map` editorComponent): an actor picker of
 * sandbox-rendered thumbnails, and a pannable/zoomable canvas you click to place
 * instances. The canvas fills the pane; the placeable map space is drawn as a
 * bordered rectangle. Placing writes the `.map` JSON back through `onChange`, so
 * the running game updates. Snap-to-grid by default; hold Alt to place freely.
 * Middle-drag (or left-drag with no actor selected) pans; the wheel zooms toward
 * the cursor; a button resets the view. Moving/deleting/editing placed actors is
 * future work.
 */
export const MapEditor = ({
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  const {getActorThumbnails, hasCompiled} = useWorldRuntime();
  const {currentSources} = useSources<MultiFileSource>();

  const files = useMemo(
    () => projectFiles(currentSources.source),
    [currentSources],
  );
  const actorOptions = useMemo(() => projectActorOptions(files), [files]);
  const worldPath = useMemo(
    () => projectWorldOptions(files)[0]?.[1] ?? '',
    [files],
  );

  const [map, setMap] = useState(() => parseMap(initialContents));
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  // `selected` is the picker template to PLACE (place mode); when null we are in
  // select mode, where `selectedId` is the placed instance under edit.
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<Vec | null>(null);
  const [size, setSize] = useState<Size>({w: 0, h: 0});
  const [view, setView] = useState<View | null>(null);
  const [panning, setPanning] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Latest map, for gesture handlers that commit once at the end (a drag mutates
  // it live for feedback but writes `onChange` only on release).
  const mapRef = useRef(map);
  mapRef.current = map;
  // Active pan gesture: the pointer/offset at drag start (a ref so pointermove
  // doesn't need it in a dependency).
  const panRef = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    id: number;
  } | null>(null);
  // Active actor-move gesture: which instance, the grab offset (actor − pointer,
  // in world units), the pointer id, and whether it actually moved.
  const dragRef = useRef<{
    id: string;
    offX: number;
    offY: number;
    pointerId: number;
    moved: boolean;
  } | null>(null);

  // `getActorThumbnails` is a fresh closure each render; hold it in a ref so the
  // fetch effect doesn't re-run every render.
  const thumbFn = useRef(getActorThumbnails);
  thumbFn.current = getActorThumbnails;

  // Fetch thumbnails as soon as the project has compiled once (compiler warm,
  // surfaces up) and we have actors + a world to render them in — not waiting
  // for the game to finish booting. Merge so new templates fill in.
  useEffect(() => {
    const paths = actorOptions.map(([, path]) => path);
    if (!hasCompiled || !paths.length || !worldPath) {
      return;
    }
    if (paths.every(path => thumbnails[path])) {
      return;
    }
    let alive = true;
    void thumbFn.current(paths, worldPath).then(rendered => {
      if (alive) {
        setThumbnails(prev => ({...prev, ...rendered}));
      }
    });
    return () => {
      alive = false;
    };
  }, [actorOptions, worldPath, hasCompiled, thumbnails]);

  // Decode thumbnail data URLs to images for canvas drawing.
  useEffect(() => {
    for (const [type, url] of Object.entries(thumbnails)) {
      if (images[type]) {
        continue;
      }
      const image = new Image();
      image.onload = () => setImages(prev => ({...prev, [type]: image}));
      image.src = url;
    }
  }, [thumbnails, images]);

  // Track the pane size; the canvas buffer follows it so the map fills the space.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({w: Math.round(rect.width), h: Math.round(rect.height)});
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Initialise the camera to the fit view once the pane has a size.
  useEffect(() => {
    if (size.w > 0 && size.h > 0 && !view) {
      setView(fitView(size.w, size.h));
    }
  }, [size, view]);

  // Wheel zoom toward the cursor. A native, non-passive listener so we can
  // preventDefault (the pane must not scroll under the zoom).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      setView(v => {
        if (!v) {
          return v;
        }
        const scale = clamp(
          v.scale * Math.exp(-event.deltaY * 0.0015),
          MIN_SCALE,
          MAX_SCALE,
        );
        // Keep the world point under the cursor pinned in place.
        const wx = (sx - v.x) / v.scale;
        const wy = (sy - v.y) / v.scale;
        return {scale, x: sx - wx * scale, y: sy - wy * scale};
      });
    };
    canvas.addEventListener('wheel', onWheel, {passive: false});
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const commit = useCallback(
    (next: MapDoc) => {
      setMap(next);
      onChange(JSON.stringify(next, null, 2));
    },
    [onChange],
  );

  const screenToWorld = (clientX: number, clientY: number): Vec => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const v = view!;
    return {
      x: (clientX - rect.left - v.x) / v.scale,
      y: (clientY - rect.top - v.y) / v.scale,
    };
  };

  // Snap the actor's centre to a tile cell centre unless Alt frees it.
  const snap = (pos: Vec, free: boolean): Vec => {
    if (free) {
      return {x: Math.round(pos.x), y: Math.round(pos.y)};
    }
    const {width, height} = map.tile;
    return {
      x: Math.floor(pos.x / width) * width + width / 2,
      y: Math.floor(pos.y / height) * height + height / 2,
    };
  };

  // Topmost placed actor under a world point (actors draw in array order, so
  // search back-to-front); its DRAW_SIZE box is the hit area.
  const hitTest = (world: Vec): Placement | undefined => {
    const actors = mapRef.current.actors;
    for (let i = actors.length - 1; i >= 0; i--) {
      const pos = positionOf(actors[i]);
      if (
        pos &&
        Math.abs(world.x - pos.x) <= DRAW_SIZE / 2 &&
        Math.abs(world.y - pos.y) <= DRAW_SIZE / 2
      ) {
        return actors[i];
      }
    }
    return undefined;
  };

  // Live-move a placed actor (local only — the drag commits once on release).
  const moveActor = (id: string, pos: Vec) => {
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === id ? withPosition(a, pos) : a,
      ),
    };
    mapRef.current = next;
    setMap(next);
  };

  const deleteActor = (id: string) => {
    commit({
      ...mapRef.current,
      actors: mapRef.current.actors.filter(a => a.id !== id),
    });
    setSelectedId(null);
  };

  const beginPan = (event: ReactPointerEvent, v: View) => {
    panRef.current = {
      sx: event.clientX,
      sy: event.clientY,
      ox: v.x,
      oy: v.y,
      id: event.pointerId,
    };
    canvasRef.current?.setPointerCapture(event.pointerId);
    setPanning(true);
  };

  const endGesture = () => {
    const drag = dragRef.current;
    if (drag) {
      canvasRef.current?.releasePointerCapture(drag.pointerId);
      dragRef.current = null;
      // Commit ONCE, and only if the actor actually moved — writing the `.map`
      // recompiles the game, so a bare select (down-up, no move) must not.
      if (drag.moved) {
        commit(mapRef.current);
      }
    }
    const pan = panRef.current;
    if (pan) {
      canvasRef.current?.releasePointerCapture(pan.id);
      panRef.current = null;
      setPanning(false);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (!view) {
      return;
    }
    if (event.button === 1) {
      event.preventDefault(); // middle button always pans
      beginPan(event, view);
      return;
    }
    if (event.button !== 0) {
      return;
    }
    // Left button in PLACE mode: placement happens on click, nothing on down.
    if (selected) {
      return;
    }
    // Left button in SELECT mode: grab a placed actor, else deselect + pan.
    const world = screenToWorld(event.clientX, event.clientY);
    const hit = isReadOnly ? undefined : hitTest(world);
    if (hit) {
      event.preventDefault();
      const pos = positionOf(hit)!;
      setSelectedId(hit.id);
      dragRef.current = {
        id: hit.id,
        offX: pos.x - world.x,
        offY: pos.y - world.y,
        pointerId: event.pointerId,
        moved: false,
      };
      canvasRef.current?.setPointerCapture(event.pointerId);
      canvasRef.current?.focus(); // so Delete/Backspace reach onKeyDown
      return;
    }
    setSelectedId(null);
    event.preventDefault();
    beginPan(event, view);
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (drag) {
      drag.moved = true;
      const world = screenToWorld(event.clientX, event.clientY);
      moveActor(
        drag.id,
        snap({x: world.x + drag.offX, y: world.y + drag.offY}, event.altKey),
      );
      return;
    }
    const pan = panRef.current;
    if (pan) {
      const dx = event.clientX - pan.sx;
      const dy = event.clientY - pan.sy;
      setView(v => v && {...v, x: pan.ox + dx, y: pan.oy + dy});
      return;
    }
    if (selected && view) {
      setHover(snap(screenToWorld(event.clientX, event.clientY), event.altKey));
    }
  };

  const handlePointerLeave = () => {
    endGesture();
    setHover(null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (
      !isReadOnly &&
      selectedId &&
      (event.key === 'Delete' || event.key === 'Backspace')
    ) {
      event.preventDefault();
      deleteActor(selectedId);
    }
  };

  const handleClick = (event: ReactMouseEvent) => {
    // Placement (place mode). A pan drag ends with a click; ignore it, and any
    // click with no template selected.
    if (isReadOnly || !selected || !view || panRef.current) {
      return;
    }
    const pos = snap(screenToWorld(event.clientX, event.clientY), event.altKey);
    const name = selected.split('/').pop() ?? selected;
    commit({
      ...map,
      actors: [
        ...map.actors,
        {
          type: selected,
          id: `${name}-${crypto.randomUUID().slice(0, 8)}`,
          properties: {positional: {position: pos}},
        },
      ],
    });
  };

  const resetView = () => {
    if (size.w > 0 && size.h > 0) {
      setView(fitView(size.w, size.h));
    }
  };

  // Draw the scene through the camera transform: the outside fill, then (in world
  // space) the map region, grid, its border, the placed actors, and the ghost.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !view || size.w === 0 || size.h === 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(size.w * dpr);
    const bh = Math.round(size.h * dpr);
    if (canvas.width !== bw) {
      canvas.width = bw;
    }
    if (canvas.height !== bh) {
      canvas.height = bh;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = OUTSIDE_BG;
    ctx.fillRect(0, 0, bw, bh);

    // World transform (device pixels): world → scaled + offset, DPR folded in.
    const s = view.scale * dpr;
    ctx.setTransform(s, 0, 0, s, view.x * dpr, view.y * dpr);

    ctx.fillStyle = MAP_BG;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1 / view.scale; // ~1 CSS px regardless of zoom
    ctx.beginPath();
    for (let x = 0; x <= GAME_WIDTH; x += map.tile.width) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += map.tile.height) {
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
    }
    ctx.stroke();

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2 / view.scale;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const drawActor = (type: string, pos: Vec, alpha: number) => {
      ctx.globalAlpha = alpha;
      const image = images[type];
      const x = pos.x - DRAW_SIZE / 2;
      const y = pos.y - DRAW_SIZE / 2;
      if (image) {
        ctx.drawImage(image, x, y, DRAW_SIZE, DRAW_SIZE);
      } else {
        ctx.fillStyle = '#33cc66';
        ctx.fillRect(x, y, DRAW_SIZE, DRAW_SIZE);
      }
      ctx.globalAlpha = 1;
    };
    let selectedPos: Vec | undefined;
    for (const actor of map.actors) {
      const pos = positionOf(actor);
      if (pos) {
        drawActor(actor.type, pos, 1);
        if (actor.id === selectedId) {
          selectedPos = pos;
        }
      }
    }
    // Outline the selected placed actor (drawn last so it sits on top).
    if (selectedPos) {
      ctx.strokeStyle = SELECT;
      ctx.lineWidth = 2 / view.scale;
      const inset = DRAW_SIZE / 2 + 2;
      ctx.strokeRect(
        selectedPos.x - inset,
        selectedPos.y - inset,
        inset * 2,
        inset * 2,
      );
    }
    if (selected && hover) {
      drawActor(selected, hover, 0.5);
    }
  }, [view, size, map, images, hover, selected, selectedId]);

  const canvasClass = [
    styles.canvas,
    panning ? styles.panning : selected ? styles.placing : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.editor}>
      <div className={styles.picker}>
        {actorOptions.map(([name, path]) => (
          <button
            key={path}
            type="button"
            className={
              path === selected
                ? `${styles.actor} ${styles.selected}`
                : styles.actor
            }
            onClick={() => {
              // Entering place mode clears any placed-actor selection.
              setSelected(path === selected ? null : path);
              setSelectedId(null);
            }}
            aria-pressed={path === selected}
          >
            {thumbnails[path] ? (
              <img src={thumbnails[path]} alt="" />
            ) : (
              <span className={styles.placeholder} />
            )}
            <span className={styles.name}>{name}</span>
          </button>
        ))}
      </div>
      <div className={styles.stage} ref={stageRef}>
        <canvas
          ref={canvasRef}
          className={canvasClass}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endGesture}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.toolbar}>
          <span className={styles.zoom}>
            {view ? `${Math.round(view.scale * 100)}%` : '—'}
          </span>
          <button
            type="button"
            className={styles.resetButton}
            onClick={resetView}
          >
            Reset view
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;

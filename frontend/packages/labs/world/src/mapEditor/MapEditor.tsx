import type {MouseEvent as ReactMouseEvent} from 'react';
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

// The map's world-coordinate space is the game's native resolution; the canvas
// buffer is that, displayed scaled to the pane (like the preview). Actors draw
// at their sprite size, centred on their position.
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const DEFAULT_TILE = 32;
const DRAW_SIZE = 32;

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

/**
 * The map editor (Codebridge `.map` editorComponent): an actor picker of
 * sandbox-rendered thumbnails, and a grid canvas you click to place instances.
 * Placing writes the `.map` JSON back through `onChange`, so the running game
 * updates. Snap-to-grid by default; hold Alt to place freely. Property editing
 * beyond position is future work.
 */
export const MapEditor = ({
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  const {getActorThumbnails, status} = useWorldRuntime();
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
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<Vec | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // `getActorThumbnails` is a fresh closure each render; hold it in a ref so the
  // fetch effect doesn't re-run every render.
  const thumbFn = useRef(getActorThumbnails);
  thumbFn.current = getActorThumbnails;

  // Fetch thumbnails once the sandbox is up (the game is running) and we have
  // actors + a world to render them in; merge so new templates fill in.
  useEffect(() => {
    const paths = actorOptions.map(([, path]) => path);
    if (status !== 'running' || !paths.length || !worldPath) {
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
  }, [actorOptions, worldPath, status, thumbnails]);

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

  const commit = useCallback(
    (next: MapDoc) => {
      setMap(next);
      onChange(JSON.stringify(next, null, 2));
    },
    [onChange],
  );

  const toWorld = (event: ReactMouseEvent): Vec => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * GAME_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * GAME_HEIGHT,
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

  const handleMove = (event: ReactMouseEvent) =>
    setHover(snap(toWorld(event), event.altKey));

  const handleClick = (event: ReactMouseEvent) => {
    if (isReadOnly || !selected) {
      return;
    }
    const pos = snap(toWorld(event), event.altKey);
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

  // Redraw the grid, placed actors, and the hover ghost.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.fillStyle = '#101020';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GAME_WIDTH; x += map.tile.width) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_HEIGHT; y += map.tile.height) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(GAME_WIDTH, y + 0.5);
      ctx.stroke();
    }
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
    for (const actor of map.actors) {
      const pos = positionOf(actor);
      if (pos) {
        drawActor(actor.type, pos, 1);
      }
    }
    if (selected && hover) {
      drawActor(selected, hover, 0.5);
    }
  }, [map, images, hover, selected]);

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
            onClick={() => setSelected(path === selected ? null : path)}
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
      <div className={styles.stage}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className={
            selected ? `${styles.canvas} ${styles.placing}` : styles.canvas
          }
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default MapEditor;

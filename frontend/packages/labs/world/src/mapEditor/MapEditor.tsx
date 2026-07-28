import {Button, Typography} from '@mui/material';
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import Accordion from '@code-dot-org/component-library/accordion';
import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {
  projectActorOptions,
  projectWorldOptions,
} from '../blockly/projectModules';
import type {ActorSchema, PropertySchema} from '../runtime/messages';
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
const DEG2RAD = Math.PI / 180;

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
  /** Per-instance overrides, keyed by owner (trait) id then property id. */
  properties?: Record<string, Record<string, unknown>>;
}
/** An actor's resolved transform, with engine defaults (scale 1, rotation 0). */
interface Transform {
  pos: Vec;
  scale: Vec;
  rotation: number;
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

// Overrides arrive as `unknown` (the generic property bag); coerce to what the
// canvas needs, falling back when a value is absent or malformed.
const asVec = (v: unknown): Vec | undefined =>
  v && typeof (v as Vec).x === 'number' && typeof (v as Vec).y === 'number'
    ? {x: (v as Vec).x, y: (v as Vec).y}
    : undefined;
const asNum = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : undefined;

/** Read a placement's override for `owner.prop` (undefined if unset). */
const propValue = (
  actor: Placement,
  ownerId: string,
  propId: string,
): unknown => actor.properties?.[ownerId]?.[propId];

const positionOf = (actor: Placement): Vec | undefined =>
  asVec(propValue(actor, 'positional', 'position'));

/** Resolve an actor's transform, filling the engine's defaults. */
const transformOf = (actor: Placement): Transform => ({
  pos: asVec(propValue(actor, 'positional', 'position')) ?? {x: 0, y: 0},
  scale: asVec(propValue(actor, 'positional', 'scale')) ?? {x: 1, y: 1},
  rotation: asNum(propValue(actor, 'positional', 'rotation')) ?? 0,
});

/** A copy of `actor` with `owner.prop` set to `value`. */
const withProperty = (
  actor: Placement,
  ownerId: string,
  propId: string,
  value: unknown,
): Placement => ({
  ...actor,
  properties: {
    ...actor.properties,
    [ownerId]: {...actor.properties?.[ownerId], [propId]: value},
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
 * the cursor; a button resets the view. In select mode (no template), clicking a
 * placed actor selects it, dragging moves it, Delete removes it, and an inspector
 * panel edits its position.
 */
export const MapEditor = ({
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  const {getActorInfo, hasCompiled} = useWorldRuntime();
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
  const [schemas, setSchemas] = useState<Record<string, ActorSchema>>({});
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  // `selected` is the picker template to PLACE (place mode); when null we are in
  // select mode, where `selectedId` is the placed instance under edit.
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<Vec | null>(null);
  const [size, setSize] = useState<Size>({w: 0, h: 0});
  const [view, setView] = useState<View | null>(null);
  const [panning, setPanning] = useState(false);
  // Inspector field drafts keyed by field name: `id`, or `${ownerId}.${propId}`
  // for a scalar, or `${ownerId}.${propId}.x` / `.y` for a vector component.
  // Strings so a field can be cleared mid-edit; seeded from the selected actor on
  // selection change and after a drag; a scalar edit applies live + commits on
  // blur, an id edit renames on blur.
  const [draft, setDraft] = useState<Record<string, string>>({});

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

  // `getActorInfo` is a fresh closure each render; hold it in a ref so the fetch
  // effect doesn't re-run every render.
  const infoFn = useRef(getActorInfo);
  infoFn.current = getActorInfo;

  // Introspect the actor templates (thumbnails + property schemas) as soon as the
  // project has compiled once (compiler warm, surfaces up) and we have actors + a
  // world — not waiting for the game to boot. Merge so new templates fill in.
  useEffect(() => {
    const paths = actorOptions.map(([, path]) => path);
    if (!hasCompiled || !paths.length || !worldPath) {
      return;
    }
    if (paths.every(path => thumbnails[path])) {
      return;
    }
    let alive = true;
    void infoFn.current(paths, worldPath).then(info => {
      if (alive) {
        setThumbnails(prev => ({...prev, ...info.thumbnails}));
        setSchemas(prev => ({...prev, ...info.schemas}));
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
      if (!positionOf(actors[i])) {
        continue;
      }
      const t = transformOf(actors[i]);
      // The world point in the actor's local (un-rotated, un-scaled) frame.
      const a = t.rotation * DEG2RAD;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const dx = world.x - t.pos.x;
      const dy = world.y - t.pos.y;
      const lx = (dx * cos + dy * sin) / (t.scale.x || 1);
      const ly = (-dx * sin + dy * cos) / (t.scale.y || 1);
      if (Math.abs(lx) <= DRAW_SIZE / 2 && Math.abs(ly) <= DRAW_SIZE / 2) {
        return actors[i];
      }
    }
    return undefined;
  };

  // Live-patch a placed actor's `owner.prop` override (local only — a drag or
  // field edit commits once on release / blur).
  const setProperty = (
    id: string,
    ownerId: string,
    propId: string,
    value: unknown,
  ) => {
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === id ? withProperty(a, ownerId, propId, value) : a,
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

  // --- Inspector: edit the selected actor's properties -------------------

  const selectedActor = selectedId
    ? (map.actors.find(a => a.id === selectedId) ?? null)
    : null;
  // The selected type's editable schema (trait groups), introspected in the
  // sandbox; empty until it arrives, or `[]` when nothing is selected.
  const selectedSchema: ActorSchema = selectedActor
    ? (schemas[selectedActor.type] ?? [])
    : [];

  const fieldKey = (prop: PropertySchema, axis?: 'x' | 'y') =>
    axis
      ? `${prop.ownerId}.${prop.propId}.${axis}`
      : `${prop.ownerId}.${prop.propId}`;

  // The property's current value: the placement's override, else the default.
  const valueOf = (actor: Placement, prop: PropertySchema): unknown =>
    propValue(actor, prop.ownerId, prop.propId) ?? prop.default;

  // Seed every field draft from the selected actor's schema + current values.
  const seedDraft = (actor: Placement | null) => {
    if (!actor) {
      setDraft({});
      return;
    }
    const next: Record<string, string> = {id: actor.id};
    for (const group of schemas[actor.type] ?? []) {
      for (const prop of group.props) {
        const value = valueOf(actor, prop);
        if (prop.type === 'vector') {
          const v = asVec(value) ?? {x: 0, y: 0};
          next[fieldKey(prop, 'x')] = String(v.x);
          next[fieldKey(prop, 'y')] = String(v.y);
        } else if (prop.type !== 'boolean') {
          next[fieldKey(prop)] = String(value ?? '');
        }
      }
    }
    setDraft(next);
  };

  // Re-seed on selection change, or when the schema for the type arrives (it
  // loads async). NOT on every value change — a live edit or drag must not
  // clobber a field mid-type; a drag re-seeds explicitly on release.
  useEffect(() => {
    seedDraft(mapRef.current.actors.find(a => a.id === selectedId) ?? null);
  }, [selectedId, schemas]);

  // Edit a scalar field: number applies parsed, string as-is; keep the draft.
  const editScalar = (prop: PropertySchema, value: string) => {
    setDraft(d => ({...d, [fieldKey(prop)]: value}));
    if (!selectedActor) {
      return;
    }
    if (prop.type === 'number') {
      const n = Number(value);
      if (value.trim() === '' || !Number.isFinite(n)) {
        return;
      }
      setProperty(selectedActor.id, prop.ownerId, prop.propId, n);
    } else {
      setProperty(selectedActor.id, prop.ownerId, prop.propId, value);
    }
  };

  // Edit one component of a vector field.
  const editVector = (prop: PropertySchema, axis: 'x' | 'y', value: string) => {
    setDraft(d => ({...d, [fieldKey(prop, axis)]: value}));
    const n = Number(value);
    if (value.trim() === '' || !Number.isFinite(n) || !selectedActor) {
      return;
    }
    const cur = asVec(valueOf(selectedActor, prop)) ?? {x: 0, y: 0};
    setProperty(selectedActor.id, prop.ownerId, prop.propId, {
      x: axis === 'x' ? n : cur.x,
      y: axis === 'y' ? n : cur.y,
    });
  };

  // Toggle a boolean — a discrete action, so commit immediately.
  const toggleBool = (prop: PropertySchema, checked: boolean) => {
    if (!selectedActor) {
      return;
    }
    commit({
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id
          ? withProperty(a, prop.ownerId, prop.propId, checked)
          : a,
      ),
    });
  };

  // Select an enum option (dropdown) — also a discrete action; commit at once.
  const selectOption = (prop: PropertySchema, value: string) => {
    if (!selectedActor) {
      return;
    }
    setDraft(d => ({...d, [fieldKey(prop)]: value}));
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id
          ? withProperty(a, prop.ownerId, prop.propId, value)
          : a,
      ),
    };
    mapRef.current = next;
    commit(next);
  };

  const editId = (value: string) => setDraft(d => ({...d, id: value}));

  // Persist an in-progress edit (writes the `.map`, recompiles) — on blur/Enter.
  const commitEdit = () => {
    if (selectedId) {
      commit(mapRef.current);
    }
  };

  // Apply an id rename on blur / Enter. Rejects an empty name or one already
  // taken by another actor (which would make selection ambiguous), reverting.
  const applyRename = () => {
    if (!selectedActor) {
      return;
    }
    const next = draft.id?.trim() ?? '';
    const taken = mapRef.current.actors.some(
      a => a.id === next && a !== selectedActor,
    );
    if (!next || next === selectedActor.id || taken) {
      setDraft(d => ({...d, id: selectedActor.id}));
      return;
    }
    const updated = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id ? {...a, id: next} : a,
      ),
    };
    mapRef.current = updated;
    commit(updated);
    setSelectedId(next);
  };

  const blurOnEnter = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Render one property's editor by type: number/string → a field, vector → an
  // X/Y pair, boolean → a checkbox.
  const renderProp = (actor: Placement, prop: PropertySchema) => {
    if (prop.type === 'boolean') {
      return (
        <Checkbox
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          label={capitalize(prop.name)}
          checked={Boolean(valueOf(actor, prop))}
          disabled={isReadOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            toggleBool(prop, event.target.checked)
          }
        />
      );
    }
    if (prop.type === 'string' && prop.options) {
      return (
        <SimpleDropdown
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          labelText={capitalize(prop.name)}
          size="s"
          className={styles.inspectorDropdown}
          disabled={isReadOnly}
          selectedValue={draft[fieldKey(prop)] ?? ''}
          items={[
            {value: '', text: '(none)'},
            ...prop.options.map(option => ({value: option, text: option})),
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            selectOption(prop, event.target.value)
          }
        />
      );
    }
    if (prop.type === 'vector') {
      return (
        <div key={fieldKey(prop)} className={styles.inspectorGrid}>
          {(['x', 'y'] as const).map(axis => (
            <TextField
              key={axis}
              name={`prop-${fieldKey(prop, axis)}`}
              label={`${capitalize(prop.name)} ${axis.toUpperCase()}`}
              inputType="number"
              size="s"
              value={draft[fieldKey(prop, axis)] ?? ''}
              disabled={isReadOnly}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                editVector(prop, axis, event.target.value)
              }
              onBlur={commitEdit}
              onKeyDown={blurOnEnter}
            />
          ))}
        </div>
      );
    }
    return (
      <TextField
        key={fieldKey(prop)}
        name={`prop-${fieldKey(prop)}`}
        label={capitalize(prop.name)}
        inputType={prop.type === 'number' ? 'number' : 'text'}
        size="s"
        value={draft[fieldKey(prop)] ?? ''}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          editScalar(prop, event.target.value)
        }
        onBlur={commitEdit}
        onKeyDown={blurOnEnter}
      />
    );
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
      // Reflect the dragged position in the inspector fields.
      seedDraft(mapRef.current.actors.find(a => a.id === drag.id) ?? null);
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
      setProperty(
        drag.id,
        'positional',
        'position',
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

    // Draw a sprite through its transform (translate → rotate → scale), centred
    // on its position, so the editor shows the actor as the game will.
    const drawSprite = (type: string, t: Transform, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(t.pos.x, t.pos.y);
      ctx.rotate(t.rotation * DEG2RAD);
      ctx.scale(t.scale.x, t.scale.y);
      const image = images[type];
      if (image) {
        ctx.drawImage(
          image,
          -DRAW_SIZE / 2,
          -DRAW_SIZE / 2,
          DRAW_SIZE,
          DRAW_SIZE,
        );
      } else {
        ctx.fillStyle = '#33cc66';
        ctx.fillRect(-DRAW_SIZE / 2, -DRAW_SIZE / 2, DRAW_SIZE, DRAW_SIZE);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };
    let selectedTransform: Transform | null = null;
    for (const actor of map.actors) {
      if (!positionOf(actor)) {
        continue;
      }
      const t = transformOf(actor);
      drawSprite(actor.type, t, 1);
      if (actor.id === selectedId) {
        selectedTransform = t;
      }
    }
    // Outline the selected actor: a rotated box hugging the scaled sprite, with a
    // constant 2px screen stroke (the box size — not the stroke — carries scale).
    if (selectedTransform) {
      const {pos, scale, rotation} = selectedTransform;
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(rotation * DEG2RAD);
      const hw = (DRAW_SIZE * Math.abs(scale.x)) / 2 + 3 / view.scale;
      const hh = (DRAW_SIZE * Math.abs(scale.y)) / 2 + 3 / view.scale;
      ctx.strokeStyle = SELECT;
      ctx.lineWidth = 2 / view.scale;
      ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
      ctx.restore();
    }
    if (selected && hover) {
      drawSprite(selected, {pos: hover, scale: {x: 1, y: 1}, rotation: 0}, 0.5);
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
        {selectedActor && (
          <div className={styles.inspector}>
            <div className={styles.inspectorHead}>
              <Typography variant="subtitle2" component="span">
                {selectedActor.type.split('/').pop()}
              </Typography>
              <Button
                variant="text"
                size="extraSmall"
                onClick={() => deleteActor(selectedActor.id)}
                disabled={isReadOnly}
              >
                Delete
              </Button>
            </div>
            <TextField
              name="actor-id"
              label="ID"
              size="s"
              value={draft.id ?? ''}
              disabled={isReadOnly}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                editId(event.target.value)
              }
              onBlur={applyRename}
              onKeyDown={blurOnEnter}
            />
            {selectedSchema.length > 0 && (
              <Accordion
                className={styles.inspectorAccordion}
                items={selectedSchema.map(group => ({
                  id: group.trait,
                  label: group.traitName,
                  content: (
                    <div className={styles.inspectorGroup}>
                      {group.props.map(prop => renderProp(selectedActor, prop))}
                    </div>
                  ),
                }))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapEditor;

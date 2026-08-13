// The map canvas, and the inspector beside it.
//
// Everything about arranging actors in a world: the camera, the drawing, the
// gestures, and the panel that edits the selected placement's properties.
// Everything EXCEPT which actors may be placed and where the document comes
// from, because those are what its two callers differ on — the `.map` file
// editor holds a file and offers a palette of every actor template; the
// `create actor in map` popup holds a block's placements and offers exactly one
// (MAPS.md §4).
//
// So this takes the placements it may edit, the placements it may only draw,
// and the type a click places. It knows nothing about files, blocks, or where
// the thumbnails came from.

import {Button, Typography} from '@mui/material';
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import {useEffect, useRef, useState} from 'react';

import Accordion from '@code-dot-org/component-library/accordion';
import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';

import type {ActorSchema, PropertySchema} from '../runtime/messages';
import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../runtime/viewport';

import styles from './mapEditor.module.css';
import {
  asVec,
  extentOf,
  positionOf,
  propValue,
  transformOf,
  withProperty,
  type MapDoc,
  type Placement,
  type Transform,
  type Size,
  type Vec,
  type View,
} from './mapModel';

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
// Dashed: the part of a bigger map the game's fixed viewport actually shows.
const VIEWPORT_EDGE = 'rgba(255, 214, 102, 0.75)';
const SELECT = '#4d9fff'; // highlights the selected placed actor
const HOVER = 'rgba(77, 159, 255, 0.45)'; // lighter outline for the hovered actor
const DEG2RAD = Math.PI / 180;

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
/**
 * The camera that fits a map of `extent` into a `w`×`h` pane, centred.
 *
 * Takes the extent rather than reading the viewport constant: a map is whatever
 * size it says it is now, so "fit the map" is a question about the document.
 */
function fitView(w: number, h: number, extent: Size): View {
  const scale = clamp(
    Math.min(w / extent.w, h / extent.h) * FIT_PADDING,
    MIN_SCALE,
    MAX_SCALE,
  );
  return {
    scale,
    x: (w - extent.w * scale) / 2,
    y: (h - extent.h * scale) / 2,
  };
}

export interface MapStageProps {
  /** The document this stage edits: its grid, and the placements it owns. */
  doc: MapDoc;
  /** Write back — every commit, so the caller decides what persisting means. */
  onDocChange: (next: MapDoc) => void;
  /** The actor type a click places; null is select mode. */
  placing: string | null;
  /** Sandbox-rendered thumbnails by type — what an actor is drawn as. */
  thumbnails: Record<string, string>;
  /** Editable property schemas by type — what the inspector offers. */
  schemas: Record<string, ActorSchema>;
  isReadOnly: boolean;
}

/**
 * The canvas and its inspector.
 *
 * Snap-to-grid by default; hold Alt to place freely. Middle-drag (or left-drag
 * with no actor selected) pans; the wheel zooms toward the cursor; a button
 * resets the view. In select mode, clicking a placed actor selects it, the arrow
 * keys cycle the selection (panning it into view), dragging moves it, Delete
 * removes it, and the inspector edits its position and its other properties.
 */
export const MapStage = ({
  doc,
  onDocChange,
  placing,
  thumbnails,
  schemas,
  isReadOnly,
}: MapStageProps) => {
  // The document as this stage currently has it. A drag mutates it live for
  // feedback and commits once on release, so the local copy leads and the
  // caller's follows; a document arriving from outside replaces it.
  const [map, setMap] = useState(doc);
  useEffect(() => setMap(doc), [doc]);
  // The map's extent in world pixels — what the camera fits and the canvas
  // draws. Read from the document, so resizing the map moves the border.
  const extent = extentOf(map);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  // The template to PLACE is the caller's (`placing`); when it is null we are in
  // select mode, where `selectedId` is the placed instance under edit.
  const selected = placing;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The placed actor under the cursor in select mode, highlighted so a heavily
  // skewed sprite (drawn far from a naive center point) is easy to find and grab.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  // Entering place mode drops any placed-actor selection: the two modes are
  // exclusive, and an inspector for something you are no longer editing is a
  // panel in the way.
  useEffect(() => {
    if (placing) {
      setSelectedId(null);
    }
  }, [placing]);

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
  //
  // `extent` is read but not depended on: resizing the map must NOT move a
  // camera the author has panned or zoomed — they resized the map, not the
  // view. `Fit` is how they ask for the new extent to be framed.
  const extentRef = useRef(extent);
  extentRef.current = extent;
  useEffect(() => {
    if (size.w > 0 && size.h > 0 && !view) {
      setView(fitView(size.w, size.h, extentRef.current));
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

  const commit = (next: MapDoc) => {
    setMap(next);
    onDocChange(next);
  };

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
      // Invert the draw transform (translate → skew → rotate → scale) to land the
      // world point in the sprite's local frame: un-shift, then un-shear (y -=
      // tan(skew)·x), then un-rotate, then un-scale. So the hit area tracks the
      // skewed sprite, not a box where it would sit unskewed.
      const dx = world.x - t.pos.x;
      const dy =
        world.y - t.pos.y - Math.tan(t.skew * DEG2RAD) * (world.x - t.pos.x);
      const a = t.rotation * DEG2RAD;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
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
        if (prop.type === 'vector' || prop.type === 'point') {
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
  // X/Y pair, boolean → a checkbox, color → a swatch and a hex field.
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
    if (prop.type === 'color') {
      // NOT A DESIGN-SYSTEM COMPONENT, because there is not one: the library
      // has no colour input, and `TextField`'s `inputType` does not admit
      // `color`. So this is the browser's swatch beside an ordinary field —
      // the swatch for picking, the field for pasting a hex somebody was
      // given, and both writing the same `#rrggbb` the engine and every colour
      // block already speak (engine/core/color).
      const typed = draft[fieldKey(prop)] ?? '';
      return (
        <div key={fieldKey(prop)} className={styles.inspectorColor}>
          <input
            type="color"
            className={styles.swatch}
            name={`prop-${fieldKey(prop)}-swatch`}
            aria-label={capitalize(prop.name)}
            // The picker can only show a full six-digit hex. A value it cannot
            // parse would silently become black, so it shows white and the
            // field beside it still holds what is really stored.
            value={/^#[0-9a-fA-F]{6}$/.test(typed) ? typed : '#ffffff'}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              editScalar(prop, event.target.value)
            }
            onBlur={commitEdit}
          />
          <TextField
            name={`prop-${fieldKey(prop)}`}
            label={capitalize(prop.name)}
            size="s"
            value={typed}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              editScalar(prop, event.target.value)
            }
            onBlur={commitEdit}
            onKeyDown={blurOnEnter}
          />
        </div>
      );
    }
    if (prop.type === 'vector' || prop.type === 'point') {
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
    // Idle: in place mode track the placement ghost; in select mode track which
    // placed actor sits under the cursor, so the render highlights it.
    if (selected && view) {
      setHover(snap(screenToWorld(event.clientX, event.clientY), event.altKey));
      return;
    }
    if (view) {
      const hit = isReadOnly
        ? undefined
        : hitTest(screenToWorld(event.clientX, event.clientY));
      setHoveredId(hit ? hit.id : null);
    }
  };

  const handlePointerLeave = () => {
    endGesture();
    setHover(null);
    setHoveredId(null);
  };

  // Pan the camera so `pos` is comfortably on-screen, centering it only when it
  // sits within a margin of the pane edge (or off it); the zoom is untouched. Used
  // when keyboard cycling lands on an actor that is scrolled out of view.
  const ensureVisible = (pos: Vec) => {
    if (!view || size.w === 0 || size.h === 0) {
      return;
    }
    const sx = pos.x * view.scale + view.x;
    const sy = pos.y * view.scale + view.y;
    const mx = size.w * 0.15;
    const my = size.h * 0.15;
    if (sx >= mx && sx <= size.w - mx && sy >= my && sy <= size.h - my) {
      return;
    }
    setView({
      ...view,
      x: size.w / 2 - pos.x * view.scale,
      y: size.h / 2 - pos.y * view.scale,
    });
  };

  // Move the selection to the next (`+1`) or previous (`-1`) placed actor, in
  // placement order and wrapping around. With nothing selected, `+1` starts at the
  // first actor and `-1` at the last. Only actors with a position participate.
  const cycleSelection = (dir: 1 | -1) => {
    const actors = mapRef.current.actors.filter(positionOf);
    if (actors.length === 0) {
      return;
    }
    const cur = actors.findIndex(a => a.id === selectedId);
    const next =
      cur === -1
        ? dir === 1
          ? 0
          : actors.length - 1
        : (cur + dir + actors.length) % actors.length;
    setSelectedId(actors[next].id);
    ensureVisible(positionOf(actors[next])!);
  };

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    // Place mode is click-driven; the keyboard shortcuts are select-mode only.
    if (selected) {
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      cycleSelection(1);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      cycleSelection(-1);
      return;
    }
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
      setView(fitView(size.w, size.h, extent));
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
    ctx.fillRect(0, 0, extent.w, extent.h);

    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1 / view.scale; // ~1 CSS px regardless of zoom
    ctx.beginPath();
    for (let x = 0; x <= extent.w; x += map.tile.width) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, extent.h);
    }
    for (let y = 0; y <= extent.h; y += map.tile.height) {
      ctx.moveTo(0, y);
      ctx.lineTo(extent.w, y);
    }
    ctx.stroke();

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2 / view.scale;
    ctx.strokeRect(0, 0, extent.w, extent.h);

    // What the player will actually see: the game runs at the fixed viewport
    // (runtime/viewport), so a map bigger than it has actors off screen. Drawn
    // only when the two differ, because on a viewport-sized map this line would
    // sit exactly under the border and mean nothing.
    if (extent.w !== VIEWPORT_WIDTH || extent.h !== VIEWPORT_HEIGHT) {
      ctx.save();
      ctx.strokeStyle = VIEWPORT_EDGE;
      ctx.lineWidth = 2 / view.scale;
      ctx.setLineDash([6 / view.scale, 4 / view.scale]);
      ctx.strokeRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      ctx.restore();
    }

    // Draw a sprite through its transform (translate → skew → rotate → scale),
    // centred on its position, so the editor shows the actor as the game will.
    // The skew is a vertical shear about the center (y' = y + tan(skew)·x),
    // inserted after the translate so it matches the Phaser driver's
    // T(pos)·shear·R·S ordering.
    const drawSprite = (type: string, t: Transform, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(t.pos.x, t.pos.y);
      if (t.skew) {
        ctx.transform(1, Math.tan(t.skew * DEG2RAD), 0, 1, 0, 0);
      }
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
    // Outline an actor: a box hugging its sprite through the same transform the
    // sprite uses (translate → skew → rotate), so it tracks the visible shape.
    // Scale is folded into the box size, not the context, so the stroke stays a
    // constant 2 screen px at any zoom.
    const strokeActorBox = (t: Transform, color: string) => {
      ctx.save();
      ctx.translate(t.pos.x, t.pos.y);
      if (t.skew) {
        ctx.transform(1, Math.tan(t.skew * DEG2RAD), 0, 1, 0, 0);
      }
      ctx.rotate(t.rotation * DEG2RAD);
      const hw = (DRAW_SIZE * Math.abs(t.scale.x)) / 2 + 3 / view.scale;
      const hh = (DRAW_SIZE * Math.abs(t.scale.y)) / 2 + 3 / view.scale;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / view.scale;
      ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
      ctx.restore();
    };
    let selectedTransform: Transform | null = null;
    let hoveredTransform: Transform | null = null;
    for (const actor of map.actors) {
      if (!positionOf(actor)) {
        continue;
      }
      const t = transformOf(actor);
      drawSprite(actor.type, t, 1);
      if (actor.id === selectedId) {
        selectedTransform = t;
      }
      if (actor.id === hoveredId) {
        hoveredTransform = t;
      }
    }
    // Hover highlight (a lighter outline), drawn under the selection outline and
    // skipped when the hovered actor is already the selected one.
    if (hoveredTransform && hoveredId !== selectedId) {
      strokeActorBox(hoveredTransform, HOVER);
    }
    if (selectedTransform) {
      strokeActorBox(selectedTransform, SELECT);
    }
    if (selected && hover) {
      drawSprite(
        selected,
        {pos: hover, scale: {x: 1, y: 1}, rotation: 0, skew: 0},
        0.5,
      );
    }
  }, [view, size, map, images, hover, selected, selectedId, hoveredId]);

  const canvasClass = [
    styles.canvas,
    panning
      ? styles.panning
      : selected
        ? styles.placing
        : hoveredId
          ? styles.hovering
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
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
  );
};

export default MapStage;

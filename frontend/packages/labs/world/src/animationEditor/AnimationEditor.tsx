import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Button, IconButton, Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent as ReactKeyboardEvent} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {Dialog} from '@code-dot-org/component-library/dialog';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {ImportAppearanceDialog} from '../appearance/ImportAppearanceDialog';
import {importStockSprite} from '../appearance/importStock';
import {
  projectSheets,
  sheetSpacing,
  type SheetFile,
} from '../appearance/sheetFile';
import type {StockAnimation, StockSprite} from '../appearance/stock';
import {
  animationIdOwners,
  animationPlayedIn,
  renameAnimationInSource,
} from '../blockly/renameAnimation';
import {filePath, projectFiles} from '../runtime/projectFiles';

import {AddFramesDialog} from './AddFramesDialog';
import styles from './animationEditor.module.css';
import {CellPicker} from './CellPicker';
import {pingPong, reversed} from './frameOps';
import {frameAt, previousFrame, startOf, totalTime} from './playback';
import type {CellRect} from './sheetFrames';
import {SpritePickerDialog} from './SpritePickerDialog';
import {delayOf, durations, retimed, shownRate} from './timing';

/** What a new animation runs at, in frames per second. */
const DEFAULT_FRAME_RATE = 10;
// Preview/thumbnail draw scale: a 32px sprite is drawn at 2× so it reads at a
// glance; the frame's own scale/offset multiply on top.
const BASE_SCALE = 2;
const PREVIEW_BOX = 112;
const THUMB_BOX = 44;
/** How faint the onion skin is: there, but never mistaken for the frame. */
const GHOST_ALPHA = 0.28;
/** Playback speeds the preview offers, as multiples of the authored timing. */
const SPEEDS = [0.25, 0.5, 1, 2] as const;

// What makes an image a spritesheet is a `.sheet` file beside it, with the same
// stem, saying how big a cell is (appearance/sheetFile). Nothing about a PNG
// says how it should be cut up — that is a decision someone made, so it is a
// file rather than a guess about the picture's shape.

/** A source rectangle within a spritesheet — what a frame draws (sheetFrames). */
type Cell = CellRect;
interface Frame {
  sprite: string;
  /** This frame's own timing, when it is an exception to the animation's. */
  delay?: number;
  scale?: number;
  offset?: {x: number; y: number};
  position?: Cell;
  /** Client-only stable id (drag/react keys, draft keys); stripped on save. */
  __id: string;
}
interface AnimDef {
  loop?: boolean;
  /** Frames per second, for the frames that do not name a delay (timing.ts). */
  frameRate?: number;
  frames: Frame[];
}
interface AnimFile {
  type: 'animation';
  animations: Record<string, AnimDef>;
}

const uid = (): string => crypto.randomUUID();

/** Parse the `.anim` JSON leniently; the editor always writes it back valid. */
function parseAnim(contents: string): AnimFile {
  if (contents.trim()) {
    try {
      const raw = JSON.parse(contents) as {
        type?: unknown;
        animations?: Record<string, AnimDef>;
      };
      if (
        raw.type === 'animation' &&
        raw.animations &&
        typeof raw.animations === 'object'
      ) {
        const animations: Record<string, AnimDef> = {};
        for (const [id, def] of Object.entries(raw.animations)) {
          animations[id] = {
            loop: def.loop,
            frameRate: def.frameRate,
            frames: (def.frames ?? []).map(f => ({...f, __id: uid()})),
          };
        }
        return {type: 'animation', animations};
      }
    } catch {
      // Malformed — start empty rather than throw; the file rewrites on edit.
    }
  }
  return {type: 'animation', animations: {}};
}

/** Drop client-only fields and defaults so the written file stays minimal (the
 *  hand-authored shape: no `__id`, no zero offset, no unit scale, no absent
 *  cell). `out` is rebuilt from known keys, so `__id` never leaks. */
function cleanFrame(f: Frame): Omit<Frame, '__id'> {
  const out: Omit<Frame, '__id'> = {sprite: f.sprite};
  // Only when it differs from the animation's rate: a frame that says nothing
  // is a frame that follows (timing.ts).
  if (typeof f.delay === 'number') {
    out.delay = f.delay;
  }
  if (f.position) {
    out.position = f.position;
  }
  if (f.offset && (f.offset.x !== 0 || f.offset.y !== 0)) {
    out.offset = f.offset;
  }
  if (f.scale !== undefined && f.scale !== 1) {
    out.scale = f.scale;
  }
  return out;
}

function serialize(doc: AnimFile): string {
  const animations: Record<string, object> = {};
  for (const [id, def] of Object.entries(doc.animations)) {
    animations[id] = {
      ...(def.loop === false ? {loop: false} : {}),
      ...(def.frameRate ? {frameRate: def.frameRate} : {}),
      frames: def.frames.map(cleanFrame),
    };
  }
  return JSON.stringify({type: 'animation', animations}, null, 2);
}

const parseNum = (s: string, fallback: number): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
};

/** Paint one frame into a `box`-sized context, at whatever alpha is set. */
function paintFrame(
  ctx: CanvasRenderingContext2D,
  box: number,
  frame: Frame,
  images: Record<string, HTMLImageElement>,
): void {
  const img = images[frame.sprite];
  if (!img) {
    return;
  }
  const cell = frame.position ?? {
    x: 0,
    y: 0,
    width: img.width,
    height: img.height,
  };
  const scale = (frame.scale ?? 1) * BASE_SCALE;
  const dw = cell.width * scale;
  const dh = cell.height * scale;
  const cx = box / 2 + (frame.offset?.x ?? 0) * BASE_SCALE;
  const cy = box / 2 + (frame.offset?.y ?? 0) * BASE_SCALE;
  ctx.drawImage(
    img,
    cell.x,
    cell.y,
    cell.width,
    cell.height,
    cx - dw / 2,
    cy - dh / 2,
    dw,
    dh,
  );
}

/**
 * Draw one frame centered in a `box`-sized canvas (device-pixel aware).
 *
 * `ghost` is the onion skin: the frame before this one, drawn faint underneath.
 * Offsets and scale are the reason it exists — they are numbers whose whole
 * effect is where a drawing sits RELATIVE to the frame either side of it, and
 * nudging one blind is guesswork.
 */
function drawFrame(
  canvas: HTMLCanvasElement,
  box: number,
  frame: Frame,
  images: Record<string, HTMLImageElement>,
  ghost?: Frame,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== box * dpr) {
    canvas.width = box * dpr;
  }
  if (canvas.height !== box * dpr) {
    canvas.height = box * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, box, box);
  ctx.imageSmoothingEnabled = false;
  if (ghost) {
    ctx.globalAlpha = GHOST_ALPHA;
    paintFrame(ctx, box, ghost, images);
    ctx.globalAlpha = 1;
  }
  paintFrame(ctx, box, frame, images);
}

/** A static thumbnail of one frame (redraws when the frame or images change). */
const FrameThumb = ({
  frame,
  images,
}: {
  frame: Frame;
  images: Record<string, HTMLImageElement>;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      drawFrame(ref.current, THUMB_BOX, frame, images);
    }
  }, [frame, images]);
  return (
    <canvas
      ref={ref}
      className={styles.thumb}
      style={{width: THUMB_BOX, height: THUMB_BOX}}
    />
  );
};

/**
 * The visual editor for a `.anim` file (a Codebridge `.map`-style custom
 * editor): a list of the file's animations on the left, and the selected
 * animation's settings + ordered frames on the right, with a live looping
 * preview. Frames carry a sprite, delay, scale and offset; a spritesheet frame
 * also picks a cell, and frames reorder by drag (dnd-kit) or the ▲/▼ buttons.
 * Every edit rewrites the `.anim` JSON through `onChange`, so the game updates.
 */
export const AnimationEditor = ({
  fileId,
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  const {currentSources, updateSources} = useSources<MultiFileSource>();
  // Read when a rename lands rather than captured at render, so it carries
  // against the project as it stands then.
  const sourcesRef = useRef(currentSources);
  sourcesRef.current = currentSources;

  const [doc, setDoc] = useState(() => parseAnim(initialContents));
  // Latest doc for handlers that read-modify-write without re-subscribing.
  const docRef = useRef(doc);
  docRef.current = doc;

  const ids = Object.keys(doc.animations);
  const [selectedId, setSelectedId] = useState<string | null>(ids[0] ?? null);
  // Guard against a stale selection (deleted / renamed): fall back to the first.
  const selId =
    selectedId && doc.animations[selectedId] ? selectedId : (ids[0] ?? null);
  // The frame the inspector edits, and whether the sheet picker is open. A
  // filmstrip shows every frame at once and edits one: which one is a piece of
  // editor state, not of the file.
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [addingFrames, setAddingFrames] = useState(false);
  // How the preview is playing. Playing to start with: an animation that does
  // not move is a list of pictures.
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [onionSkin, setOnionSkin] = useState(false);
  // Which frame is choosing a picture, and whether that has become a trip to
  // the stock library (which the picker offers, and comes back from).
  // The animation whose deletion is waiting on an answer, and what plays it.
  const [deleting, setDeleting] = useState<{
    id: string;
    played: string[];
  } | null>(null);
  const [pickingSprite, setPickingSprite] = useState<string | null>(null);
  const [importingSprite, setImportingSprite] = useState(false);

  const selected = selId ? doc.animations[selId] : null;
  const frames = selected?.frames ?? [];
  // Guard the frame selection the same way: a frame deleted (or an animation
  // switched to) falls back to the first one this animation has.
  const frameId =
    selectedFrame && frames.some(f => f.__id === selectedFrame)
      ? selectedFrame
      : (frames[0]?.__id ?? null);
  const frame = frames.find(f => f.__id === frameId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 4}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
  );

  // The project's images (drawn, uploaded, or imported from the library) → their
  // URLs. There is no other source: a game draws what its project holds.
  const uploaded = useMemo(() => {
    const out: Record<string, string> = {};
    for (const file of Object.values(currentSources.source.files)) {
      if (file.url) {
        out[file.name] = file.url;
      }
    }
    return out;
  }, [currentSources]);
  const spriteOptions = useMemo(
    () => [...new Set(Object.keys(uploaded))],
    [uploaded],
  );
  const spriteUrls = uploaded;
  // Which of those images are grids, and how big their cells are — the `.sheet`
  // files the project holds, keyed by the image each one describes.
  const projectText = useMemo(
    () => projectFiles(currentSources.source),
    [currentSources],
  );
  const sheets = useMemo(() => projectSheets(projectText), [projectText]);
  // Which file defines each animation id, for the rename below.
  const owners = useMemo(() => animationIdOwners(projectText), [projectText]);
  // The images that are grids — what `+ From sheet` has to offer.
  const sheetNames = useMemo(() => Object.keys(sheets), [sheets]);
  const ownPath = filePath(currentSources.source, fileId);

  // Decode every referenced sprite to an <img> for canvas drawing.
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    for (const [name, url] of Object.entries(spriteUrls)) {
      if (images[name]) {
        continue;
      }
      const img = new Image();
      img.onload = () => setImages(prev => ({...prev, [name]: img}));
      img.src = url;
    }
  }, [spriteUrls, images]);

  // Text drafts for the fields (string while editing; parsed into the doc live,
  // committed on blur). Keyed by the frame's stable __id + field, so a reorder
  // never mismatches a field to the wrong frame.
  const [draft, setDraft] = useState<Record<string, string>>({});
  // Why the id in the field was put back, if it was (commitRename).
  const [renameError, setRenameError] = useState<string | null>(null);
  const seedDraft = useCallback((animId: string | null) => {
    const def = animId ? docRef.current.animations[animId] : null;
    const next: Record<string, string> = {};
    if (def && animId) {
      next.id = animId;
    }
    // `fps` is deliberately absent: like a frame's fields, it is read from the
    // animation unless it is being typed into.
    // Only the animation's own two fields. A frame's fields are read from the
    // frame unless there is an edit in progress (`authored`, below) — seeding
    // them here would leave every frame ADDED since as a row of empty boxes,
    // which is what a frame taken from a spritesheet or a ping-pong used to be.
    setDraft(next);
    setRenameError(null);
  }, []);
  useEffect(() => {
    seedDraft(selId);
  }, [selId, seedDraft]);

  // ---- doc mutation helpers -------------------------------------------------

  const setLive = (next: AnimFile) => {
    docRef.current = next;
    setDoc(next);
  };
  // Commit — writes the `.anim` file, which recompiles the game.
  const commit = (next: AnimFile) => {
    setLive(next);
    if (!isReadOnly) {
      onChange(serialize(next));
    }
  };
  const commitCurrent = () => {
    if (!isReadOnly) {
      onChange(serialize(docRef.current));
    }
  };
  const withDef = (def: AnimDef): AnimFile => ({
    ...docRef.current,
    animations: {...docRef.current.animations, [selId as string]: def},
  });
  const withFrames = (frames: Frame[]): AnimFile =>
    withDef({...(selected as AnimDef), frames});
  const mapFrame = (id: string, fn: (f: Frame) => Frame): Frame[] =>
    (selected as AnimDef).frames.map(f => (f.__id === id ? fn(f) : f));

  // ---- animation-list ops ---------------------------------------------------

  const addAnimation = () => {
    let n = 1;
    while (docRef.current.animations[`animation${n}`]) {
      n++;
    }
    const id = `animation${n}`;
    const def: AnimDef = {
      frameRate: DEFAULT_FRAME_RATE,
      frames: [{sprite: spriteOptions[0] ?? 'ball', __id: uid()}],
    };
    commit({
      ...docRef.current,
      animations: {...docRef.current.animations, [id]: def},
    });
    setSelectedId(id);
  };
  /**
   * Delete an animation — after saying what plays it, if anything does.
   *
   * A block holds an id and nothing else, so deleting an animation that is
   * played leaves a block that quietly stops working. Renaming carries
   * (renameAnimation); deleting cannot, because there is nothing to carry to.
   * The next best thing is to say so first and let the learner decide.
   *
   * The blocks are left exactly as they are if they go ahead: a `play
   * animation` naming something the project no longer has is visible and
   * fixable, where a field silently emptied is neither.
   */
  const deleteAnimation = (id: string) => {
    const played = animationPlayedIn(projectText, id);
    if (played.length > 0) {
      setDeleting({id, played});
      return;
    }
    removeAnimation(id);
  };

  const removeAnimation = (id: string) => {
    const animations = {...docRef.current.animations};
    delete animations[id];
    if (selId === id) {
      setSelectedId(Object.keys(animations)[0] ?? null);
    }
    setDeleting(null);
    commit({...docRef.current, animations});
  };

  /**
   * Write the project and this file in ONE update.
   *
   * Anything that changes both — a rename that carries, an imported picture —
   * has to: `onChange` saves through a `saveFile` that closes over the sources
   * of the render that made it, so an ordinary per-file save following a
   * project write would put the other files back as they were.
   */
  const write = (source: MultiFileSource, doc: AnimFile): void => {
    const sources = sourcesRef.current;
    const file = source.files[fileId];
    updateSources({
      ...sources,
      source: {
        ...source,
        files: {...source.files, [fileId]: {...file, contents: serialize(doc)}},
      },
    });
  };

  /**
   * Rename the selected animation's id — the key blocks play it by.
   *
   * An id is what a `play animation` block holds, and no block records which
   * file it came from, so this is an edit to the whole project: the key is
   * rekeyed here and every play of it is rewritten with it, in ONE write.
   * Letting the ordinary per-file save follow instead would undo the rewrite —
   * `saveFile` closes over the sources of the render that made it.
   */
  const commitRename = () => {
    const oldId = selId;
    const newId = (draft.id ?? '').trim();
    if (!oldId || newId === oldId) {
      return;
    }
    const revert = (why: string): void => {
      setDraft(prev => ({...prev, id: oldId}));
      setRenameError(why);
    };
    if (!newId) {
      revert('An animation needs a name to be played by.');
      return;
    }
    // Taken anywhere in the project, not just in this file: the dropdown offers
    // every id the project defines, and two animations answering to one id is a
    // reference with two meanings. This file's own ids come from the live
    // document rather than from `owners`, which is a render behind whenever two
    // renames land in quick succession.
    const takenElsewhere = (owners[newId] ?? []).some(path => path !== ownPath);
    if (docRef.current.animations[newId] || takenElsewhere) {
      revert(`Another animation is already called \u201c${newId}\u201d.`);
      return;
    }
    setRenameError(null);

    const animations: Record<string, AnimDef> = {};
    for (const [id, def] of Object.entries(docRef.current.animations)) {
      animations[id === oldId ? newId : id] = def;
    }
    const next = {...docRef.current, animations};
    setSelectedId(newId);
    setLive(next);
    if (isReadOnly) {
      return;
    }
    // Unless the old id was ambiguous already — defined in another `.anim` too
    // — in which case a block that plays it may mean the other one, and
    // rewriting would move plays that were never this animation's. The key is
    // still rekeyed; the plays are left as written.
    const ambiguous = (owners[oldId] ?? []).some(path => path !== ownPath);
    write(
      ambiguous
        ? sourcesRef.current.source
        : renameAnimationInSource(sourcesRef.current.source, oldId, newId),
      next,
    );
  };

  /**
   * Retime the whole animation, in frames per second.
   *
   * Frames that were only keeping the old rate follow the new one; a frame that
   * said something different keeps saying it (timing.retimed).
   */
  const setFrameRate = (raw: string) => {
    setDraft(prev => ({...prev, fps: raw}));
    const rate = parseFloat(raw);
    if (!selected || !Number.isFinite(rate) || rate <= 0) {
      return;
    }
    setLive(withDef(retimed(selected, rate) as AnimDef));
  };
  const setLoop = (loop: boolean) => {
    if (selected) {
      commit(withDef({...selected, loop: loop ? undefined : false}));
    }
  };

  // ---- frame ops (by stable __id) -------------------------------------------

  /**
   * This document with one frame pointed at another picture.
   *
   * `grids` is which images are spritesheets — passed in rather than read from
   * state because an imported picture brings its `.sheet` with it, and the
   * frame is set in the same breath as the import, before the sources this
   * component rendered from have caught up.
   */
  const withFrameSprite = (
    id: string,
    sprite: string,
    grids: Record<string, SheetFile>,
  ): AnimFile => {
    // A cell belongs to a grid: default a sheet to its first cell (so it does
    // not draw the whole sheet), and clear it for a single picture.
    const sheet = grids[sprite];
    // The first cell — which is not the corner of the image when the sheet has
    // padding around its grid (appearance/sheetFile).
    const position = sheet
      ? {
          x: sheetSpacing(sheet).padding,
          y: sheetSpacing(sheet).padding,
          width: sheet.cell.width,
          height: sheet.cell.height,
        }
      : undefined;
    return withFrames(mapFrame(id, f => ({...f, sprite, position})));
  };
  const setFrameSprite = (id: string, sprite: string) => {
    if (selected) {
      commit(withFrameSprite(id, sprite, sheets));
    }
  };

  /** Give the whole animation another order — see frameOps. */
  const reverseFrames = () => {
    if (selected) {
      commit(withFrames(reversed(selected.frames)));
    }
  };
  const pingPongFrames = () => {
    if (selected) {
      commit(withFrames(pingPong(selected.frames, f => ({...f, __id: uid()}))));
    }
  };

  /** Take a picture chosen in the picker. */
  const chooseSprite = (sprite: string) => {
    if (pickingSprite) {
      setFrameSprite(pickingSprite, sprite);
    }
    setPickingSprite(null);
  };

  /**
   * Copy a picture out of the stock library and put the frame on it.
   *
   * The file and the frame that names it land together: an animation pointed at
   * a picture the project does not hold yet is a frame that draws nothing, and
   * for the length of one render that is what it would be.
   */
  const importSprite = (chosen: StockSprite | StockAnimation) => {
    const id = pickingSprite;
    setImportingSprite(false);
    setPickingSprite(null);
    if (!id || !selected || !('dataUrl' in chosen)) {
      return;
    }
    const {source, value} = importStockSprite(
      sourcesRef.current.source,
      chosen,
    );
    const next = withFrameSprite(
      id,
      value,
      projectSheets(projectFiles(source)),
    );
    setLive(next);
    if (!isReadOnly) {
      write(source, next);
    }
  };
  const setFrameCell = (id: string, cell: Cell | undefined) => {
    if (selected) {
      commit(withFrames(mapFrame(id, f => ({...f, position: cell}))));
    }
  };
  const editFrameNum = (
    id: string,
    field: 'delay' | 'scale' | 'offx' | 'offy',
    raw: string,
  ) => {
    setDraft(prev => ({...prev, [`${id}.${field}`]: raw}));
    if (!selected) {
      return;
    }
    setLive(
      withFrames(
        mapFrame(id, f => {
          if (field === 'delay') {
            // Empty means "follow the animation": a frame only carries a delay
            // when it is an exception to the rate (timing.ts).
            return {
              ...f,
              delay:
                raw === ''
                  ? undefined
                  : parseNum(raw, f.delay ?? delayOf(selected, f)),
            };
          }
          if (field === 'scale') {
            return {
              ...f,
              scale: raw === '' ? undefined : parseNum(raw, f.scale ?? 1),
            };
          }
          const base = f.offset ?? {x: 0, y: 0};
          return {
            ...f,
            offset: {
              x: field === 'offx' ? parseNum(raw, base.x) : base.x,
              y: field === 'offy' ? parseNum(raw, base.y) : base.y,
            },
          };
        }),
      ),
    );
  };

  /** Append frames, and select the first of them — the one to adjust next. */
  const appendFrames = (added: Frame[]) => {
    if (!selected || added.length === 0) {
      return;
    }
    commit(withFrames([...selected.frames, ...added]));
    setSelectedFrame(added[0].__id);
  };
  const addFrame = () => {
    if (!selected) {
      return;
    }
    // Carrying the last frame's sprite and timing: the next frame of an
    // animation is nearly always more of the same thing.
    const last = selected.frames[selected.frames.length - 1];
    appendFrames([
      {
        // The last frame's picture and cell, because the next frame of an
        // animation is nearly always more of the same thing — but not its
        // delay: an exception one frame made is not the next frame's.
        sprite: last?.sprite ?? spriteOptions[0] ?? 'ball',
        position: last?.position,
        __id: uid(),
      },
    ]);
  };
  /** One frame per cell chosen from a spritesheet, in the order chosen. */
  const addFramesFromSheet = (sprite: string, cells: CellRect[]) => {
    appendFrames(cells.map(position => ({sprite, position, __id: uid()})));
    setAddingFrames(false);
  };
  const duplicateFrame = (id: string) => {
    if (!selected) {
      return;
    }
    const at = selected.frames.findIndex(f => f.__id === id);
    if (at < 0) {
      return;
    }
    const copy = {...selected.frames[at], __id: uid()};
    const frames = [...selected.frames];
    frames.splice(at + 1, 0, copy);
    commit(withFrames(frames));
    setSelectedFrame(copy.__id);
  };
  const removeFrame = (id: string) => {
    if (!selected) {
      return;
    }
    const at = selected.frames.findIndex(f => f.__id === id);
    const rest = selected.frames.filter(f => f.__id !== id);
    // Land on the frame that took its place, so deleting several in a row does
    // not send the selection back to the start each time.
    setSelectedFrame(rest[Math.min(at, rest.length - 1)]?.__id ?? null);
    commit(withFrames(rest));
  };
  const nudgeFrame = (id: string, dir: -1 | 1) => {
    if (!selected) {
      return;
    }
    const from = selected.frames.findIndex(f => f.__id === id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= selected.frames.length) {
      return;
    }
    commit(withFrames(arrayMove(selected.frames, from, to)));
  };
  const onDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id || !selected) {
      return;
    }
    const from = selected.frames.findIndex(f => f.__id === active.id);
    const to = selected.frames.findIndex(f => f.__id === over.id);
    if (from >= 0 && to >= 0) {
      commit(withFrames(arrayMove(selected.frames, from, to)));
    }
  };

  // ---- live preview ---------------------------------------------------------

  const previewRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // How far into the animation playback has got, in authored milliseconds —
  // kept across pauses and speed changes so neither is a jump. A ref rather
  // than state: it changes sixty times a second and nothing renders from it.
  const elapsed = useRef(0);
  // The frame the playhead is on, as state, because the STRIP draws it. Set
  // only when it changes — once per frame of the animation, not per repaint.
  const [playIndex, setPlayIndex] = useState(0);
  const playheadRef = useRef(0);
  // What the preview shows while paused: the frame being edited.
  const selectedIndexRef = useRef(0);
  selectedIndexRef.current = Math.max(
    0,
    frames.findIndex(f => f.__id === frameId),
  );
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const onionRef = useRef(onionSkin);
  onionRef.current = onionSkin;

  useEffect(() => {
    let raf = 0;
    let last = 0;
    // A different animation starts at its own beginning, not wherever the last
    // one had got to.
    elapsed.current = 0;
    playheadRef.current = 0;
    setPlayIndex(0);
    const tick = (now: number) => {
      const def = selId ? docRef.current.animations[selId] : null;
      const canvas = previewRef.current;
      if (canvas && def && def.frames.length > 0) {
        // How long each frame is held, resolved: the animation's rate, or a
        // frame's own delay where it has one.
        const held = durations(def);
        const total = totalTime(held);
        if (playingRef.current) {
          // Real time scaled by the speed, rather than a start time compared
          // against: at half speed the same wall clock is half the animation.
          elapsed.current += last ? (now - last) * speed : 0;
          const t =
            def.loop === false
              ? Math.min(elapsed.current, total - 1)
              : elapsed.current % total;
          const at = frameAt(held, t);
          if (at !== playheadRef.current) {
            playheadRef.current = at;
            setPlayIndex(at);
          }
        }
        last = now;
        const index = playingRef.current
          ? playheadRef.current
          : selectedIndexRef.current;
        const frame = def.frames[Math.min(index, def.frames.length - 1)];
        // The frame before this one, for the onion skin: the one it has to
        // line up with.
        const before = previousFrame(
          def.frames.length,
          index,
          def.loop !== false,
        );
        drawFrame(
          canvas,
          PREVIEW_BOX,
          frame,
          imagesRef.current,
          onionRef.current && before >= 0 ? def.frames[before] : undefined,
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selId, speed]);

  // ---- transport ------------------------------------------------------------

  /**
   * Pause here, or play on from the frame being looked at.
   *
   * Pausing selects the frame that was on screen — pausing on the one that
   * looks wrong is how the frame that looks wrong gets fixed — and playing
   * resumes from wherever the selection has since got to.
   */
  const togglePlay = () => {
    if (playing) {
      const at = frames[playheadRef.current];
      if (at) {
        setSelectedFrame(at.__id);
      }
      setPlaying(false);
      return;
    }
    elapsed.current = startOf(
      durations(selected ?? {frames: []}),
      selectedIndexRef.current,
    );
    playheadRef.current = selectedIndexRef.current;
    setPlayIndex(selectedIndexRef.current);
    setPlaying(true);
  };

  /** Step a frame at a time, which is a thing you do while paused. */
  const step = (dir: -1 | 1) => {
    setPlaying(false);
    const at = Math.min(
      frames.length - 1,
      Math.max(0, selectedIndexRef.current + dir),
    );
    const frame = frames[at];
    if (frame) {
      setSelectedFrame(frame.__id);
      elapsed.current = startOf(durations(selected ?? {frames: []}), at);
      playheadRef.current = at;
      setPlayIndex(at);
    }
  };

  // ---------------------------------------------------------------------------

  return (
    <div className={styles.editor}>
      {/* The file's animations, along the top. A `.anim` usually holds one, and
          a full-height column for a single row spent most of the pane's width
          on saying so — width the frames and their fields wanted. */}
      <div className={styles.tabs} role="tablist" aria-label="Animations">
        {ids.map(id => (
          <button
            key={id}
            type="button"
            role="tab"
            className={
              id === selId ? `${styles.tab} ${styles.tabActive}` : styles.tab
            }
            aria-selected={id === selId}
            onClick={() => setSelectedId(id)}
          >
            {id}
          </button>
        ))}
        <Button
          variant="text"
          size="extraSmall"
          onClick={addAnimation}
          disabled={isReadOnly}
        >
          + Add
        </Button>
      </div>

      {/* Right: the selected animation's settings, preview, and frames. */}
      {selected && selId ? (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <TextField
              name="anim-id"
              // One name, which is the id blocks play it by. There used to be a
              // second, friendlier one in the file; nothing ever displayed it,
              // so it was a name to keep in step with the real name for nothing.
              label="Name"
              size="s"
              value={draft.id ?? ''}
              disabled={isReadOnly}
              errorMessage={renameError ?? undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setRenameError(null);
                setDraft(prev => ({...prev, id: e.target.value}));
              }}
              onBlur={commitRename}
              onKeyDown={blurOnEnter}
            />
            <div className={styles.rateField}>
              <TextField
                name="anim-fps"
                label="Frames / second"
                inputType="number"
                size="s"
                value={draft.fps ?? String(shownRate(selected) ?? '')}
                disabled={isReadOnly}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFrameRate(e.target.value)
                }
                onBlur={commitCurrent}
                onKeyDown={blurOnEnter}
              />
            </div>
            {/* Away from the fields, at the end of the row: a red word
                between two text boxes is a destructive action sitting where
                the eye goes next after typing a name. */}
            <div className={styles.headerSpacer} />
            <IconButton
              aria-label="Delete this animation"
              title="Delete this animation"
              size="extraSmall"
              variant="outlined"
              color="error"
              onClick={() => deleteAnimation(selId)}
              disabled={isReadOnly}
            >
              <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
            </IconButton>
          </div>

          <div className={styles.previewRow}>
            <canvas
              ref={previewRef}
              className={styles.preview}
              style={{width: PREVIEW_BOX, height: PREVIEW_BOX}}
            />
            <div className={styles.previewSettings}>
              <Checkbox
                name="anim-loop"
                label="Loop"
                checked={selected.loop !== false}
                disabled={isReadOnly}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setLoop(e.target.checked)
                }
              />
              <Checkbox
                name="anim-onion"
                label="Onion skin"
                checked={onionSkin}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setOnionSkin(e.target.checked)
                }
              />
            </div>
          </div>

          {/* The transport. Stepping and pausing move the SELECTION, so the
              frame on screen is the frame the inspector is editing. */}
          <div className={styles.transport}>
            <IconButton
              aria-label="Previous frame"
              size="extraSmall"
              variant="outlined"
              color="tertiary"
              disabled={frames.length === 0}
              onClick={() => step(-1)}
            >
              <FontAwesomeV6Icon iconName="backward-step" iconStyle="solid" />
            </IconButton>
            <IconButton
              aria-label={playing ? 'Pause' : 'Play'}
              size="extraSmall"
              variant="contained"
              color="secondary"
              disabled={frames.length === 0}
              onClick={togglePlay}
            >
              <FontAwesomeV6Icon
                iconName={playing ? 'pause' : 'play'}
                iconStyle="solid"
              />
            </IconButton>
            <IconButton
              aria-label="Next frame"
              size="extraSmall"
              variant="outlined"
              color="tertiary"
              disabled={frames.length === 0}
              onClick={() => step(1)}
            >
              <FontAwesomeV6Icon iconName="forward-step" iconStyle="solid" />
            </IconButton>
            <div className={styles.speed}>
              <SimpleDropdown
                name="anim-speed"
                labelText="Speed"
                size="s"
                selectedValue={String(speed)}
                items={SPEEDS.map(rate => ({
                  value: String(rate),
                  text: `${rate}\u00d7`,
                }))}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSpeed(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className={styles.framesHeader}>
            <Typography variant="overline3" component="h3" className={styles.h}>
              Frames
            </Typography>
            <div className={styles.headerButtons}>
              <Button
                variant="text"
                size="extraSmall"
                onClick={addFrame}
                disabled={isReadOnly}
              >
                + Frame
              </Button>
              <Button
                variant="text"
                size="extraSmall"
                onClick={() => setAddingFrames(true)}
                // Nothing to pick from until the project holds a spritesheet —
                // an image with a `.sheet` beside it.
                disabled={isReadOnly || sheetNames.length === 0}
              >
                + From sheet
              </Button>
            </div>
          </div>

          {/* The frames as a strip, the way an animation is drawn: one
              thumbnail each, in order, click to edit, drag to reorder. */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={frames.map(f => f.__id)}
              strategy={horizontalListSortingStrategy}
            >
              <ol className={styles.filmstrip}>
                {frames.map((f, i) => (
                  <StripFrame
                    key={f.__id}
                    frame={f}
                    index={i}
                    images={images}
                    active={f.__id === frameId}
                    // Where the preview has got to. Only while playing: paused,
                    // the playhead IS the selection, and two marks on one frame
                    // say less than one.
                    playing={playing && i === playIndex}
                    disabled={isReadOnly}
                    onSelect={() => setSelectedFrame(f.__id)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>

          {frames.length > 1 && (
            <div className={styles.stripActions}>
              <Button
                variant="text"
                size="extraSmall"
                disabled={isReadOnly}
                onClick={reverseFrames}
              >
                Reverse
              </Button>
              <Button
                variant="text"
                size="extraSmall"
                // Two frames already play out and back (frameOps).
                disabled={isReadOnly || frames.length < 3}
                onClick={pingPongFrames}
              >
                Ping-pong
              </Button>
            </div>
          )}

          {frame && frameId ? (
            <FrameInspector
              frame={frame}
              index={frames.findIndex(f => f.__id === frameId)}
              total={frames.length}
              images={images}
              sheets={sheets}
              draft={draft}
              inherited={delayOf(selected, {})}
              disabled={isReadOnly}
              onPickSprite={() => setPickingSprite(frameId)}
              onCell={cell => setFrameCell(frameId, cell)}
              onNum={(field, raw) => editFrameNum(frameId, field, raw)}
              onCommit={commitCurrent}
              onNudge={dir => nudgeFrame(frameId, dir)}
              onDuplicate={() => duplicateFrame(frameId)}
              onRemove={() => removeFrame(frameId)}
            />
          ) : (
            <p className={styles.empty}>
              No frames yet. Add one, or take a row of them from a spritesheet.
            </p>
          )}

          {addingFrames && (
            <AddFramesDialog
              sheets={sheets}
              images={images}
              onAdd={addFramesFromSheet}
              onCancel={() => setAddingFrames(false)}
            />
          )}

          {pickingSprite && !importingSprite && (
            <SpritePickerDialog
              sprites={spriteOptions}
              images={images}
              sheets={sheets}
              current={frames.find(f => f.__id === pickingSprite)?.sprite ?? ''}
              onPick={chooseSprite}
              onImport={() => setImportingSprite(true)}
              onCancel={() => setPickingSprite(null)}
            />
          )}

          {deleting && (
            <Dialog
              role="alertdialog"
              title={`Delete "${deleting.id}"?`}
              description={
                deleting.played.length === 1
                  ? `${deleting.played[0]} plays this animation. That block will name an animation the project no longer has.`
                  : `${deleting.played.length} files play this animation (${deleting.played.join(', ')}). Those blocks will name an animation the project no longer has.`
              }
              onClose={() => setDeleting(null)}
              closeLabel="Close"
              primaryButtonProps={{
                children: 'Delete anyway',
                color: 'error',
                onClick: () => removeAnimation(deleting.id),
              }}
              secondaryButtonProps={{
                children: 'Keep it',
                onClick: () => setDeleting(null),
              }}
            />
          )}

          {importingSprite && (
            <ImportAppearanceDialog
              kind="sprite"
              onImport={importSprite}
              // Back to the pictures the project already has, not out of the
              // choosing altogether: this was a detour, not the errand.
              onCancel={() => setImportingSprite(false)}
            />
          )}
        </div>
      ) : (
        <div className={styles.detail}>
          <p className={styles.empty}>
            {ids.length === 0
              ? 'Add an animation to begin.'
              : 'Select an animation to edit its frames.'}
          </p>
        </div>
      )}
    </div>
  );
};

const blurOnEnter = (event: ReactKeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') {
    event.currentTarget.blur();
  }
};

/**
 * One frame in the strip: its picture, its place in the order.
 *
 * Dragging is the whole item's, selecting is the button's. Not both on the
 * button: dnd-kit's keyboard sensor starts a drag on Space and Enter, which are
 * also how a button is pressed — a learner reaching the strip by keyboard would
 * pick a frame up when they meant to open it. Reordering by keyboard is the
 * inspector's ← and → instead, which say what they do.
 */
const StripFrame = ({
  frame,
  index,
  images,
  active,
  playing,
  disabled,
  onSelect,
}: {
  frame: Frame;
  index: number;
  images: Record<string, HTMLImageElement>;
  /** The frame the inspector is editing. */
  active: boolean;
  /** The frame the preview is showing right now. */
  playing: boolean;
  disabled: boolean;
  onSelect: () => void;
}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id: frame.__id, disabled});
  return (
    <li
      ref={setNodeRef}
      className={styles.stripItem}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...listeners}
    >
      <button
        type="button"
        className={[
          styles.strip,
          active ? styles.stripActive : '',
          playing ? styles.stripPlaying : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={`Frame ${index + 1}`}
        onClick={onSelect}
        // `attributes` carries the sortable's own roledescription and tabIndex;
        // `aria-pressed` after it, because here it means "the frame being
        // edited" and that is the sense to survive.
        {...attributes}
        aria-pressed={active}
      >
        <FrameThumb frame={frame} images={images} />
        <span className={styles.stripNum} aria-hidden="true">
          {index + 1}
        </span>
      </button>
    </li>
  );
};

/** The selected frame's settings: what it draws, for how long, and where. */
const FrameInspector = ({
  frame,
  index,
  total,
  images,
  sheets,
  draft,
  inherited,
  disabled,
  onPickSprite,
  onCell,
  onNum,
  onCommit,
  onNudge,
  onDuplicate,
  onRemove,
}: {
  frame: Frame;
  index: number;
  total: number;
  images: Record<string, HTMLImageElement>;
  /** The grids among those images, by image file name — see appearance/sheetFile. */
  sheets: Record<string, SheetFile>;
  draft: Record<string, string>;
  /** What this frame is held for when it names no delay of its own. */
  inherited: number;
  disabled: boolean;
  /** Open the picture picker for this frame. */
  onPickSprite: () => void;
  onCell: (cell: Cell | undefined) => void;
  onNum: (field: 'delay' | 'scale' | 'offx' | 'offy', raw: string) => void;
  onCommit: () => void;
  onNudge: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) => {
  /** What the frame itself says, for a field nobody is part-way through typing. */
  const authored = (field: string): string => {
    switch (field) {
      case 'delay':
        // Empty when the frame follows the animation — which is not the same
        // as a frame that holds for the same number by coincidence.
        return frame.delay === undefined ? '' : String(frame.delay);
      case 'scale':
        return frame.scale === undefined ? '' : String(frame.scale);
      case 'offx':
        return frame.offset ? String(frame.offset.x) : '';
      case 'offy':
        return frame.offset ? String(frame.offset.y) : '';
      default:
        return '';
    }
  };
  // A draft is an edit in progress — "1." on the way to "1.5", or an emptied
  // box. Everything else comes from the document, so a frame that was never
  // typed into still shows what it holds.
  const d = (field: string) =>
    draft[`${frame.__id}.${field}`] ?? authored(field);

  // What this frame has been tuned to, if anything — shown on the disclosure
  // when it is closed, so nothing about the frame is hidden by folding it away.
  const parts: string[] = [];
  if (frame.scale !== undefined && frame.scale !== 1) {
    parts.push(`scale ${frame.scale}`);
  }
  if (frame.offset && (frame.offset.x !== 0 || frame.offset.y !== 0)) {
    parts.push(`offset ${frame.offset.x}, ${frame.offset.y}`);
  }
  const summary = parts.join(', ');

  // Open for a frame that has been tuned, closed for one that has not — and
  // then however the learner leaves it, until they move to another frame. Set
  // during render rather than in an effect: this is state derived from a prop
  // change, which React handles without the extra pass an effect costs.
  const [open, setOpen] = useState(summary !== '');
  const shown = useRef(frame.__id);
  if (shown.current !== frame.__id) {
    shown.current = frame.__id;
    setOpen(summary !== '');
  }

  return (
    <div className={styles.frame}>
      <div className={styles.frameHead}>
        <Typography variant="overline3" component="h4" className={styles.h}>
          {`Frame ${index + 1} of ${total}`}
        </Typography>
        <div className={styles.frameSpacer} />
        <div className={styles.frameButtons}>
          <IconButton
            aria-label="Move frame earlier"
            size="extraSmall"
            variant="outlined"
            color="tertiary"
            disabled={disabled || index === 0}
            onClick={() => onNudge(-1)}
          >
            <FontAwesomeV6Icon iconName="chevron-left" iconStyle="solid" />
          </IconButton>
          <IconButton
            aria-label="Move frame later"
            size="extraSmall"
            variant="outlined"
            color="tertiary"
            disabled={disabled || index === total - 1}
            onClick={() => onNudge(1)}
          >
            <FontAwesomeV6Icon iconName="chevron-right" iconStyle="solid" />
          </IconButton>
          <IconButton
            aria-label="Duplicate frame"
            size="extraSmall"
            variant="outlined"
            color="tertiary"
            disabled={disabled}
            onClick={onDuplicate}
          >
            <FontAwesomeV6Icon iconName="clone" iconStyle="solid" />
          </IconButton>
          <IconButton
            aria-label="Delete frame"
            size="extraSmall"
            variant="outlined"
            color="error"
            disabled={disabled}
            onClick={onRemove}
          >
            <FontAwesomeV6Icon iconName="trash" iconStyle="solid" />
          </IconButton>
        </div>
      </div>
      <div className={styles.frameGrid}>
        <div className={styles.spriteWrap}>
          <Typography
            variant="body4"
            component="span"
            className={styles.fieldLabel}
          >
            Sprite
          </Typography>
          <Button
            className={styles.spriteButton}
            variant="outlined"
            color="secondary"
            size="small"
            fullWidth
            disabled={disabled}
            aria-label={`Picture: ${frame.sprite}`}
            onClick={onPickSprite}
          >
            <img
              className={styles.spriteThumb}
              src={images[frame.sprite]?.src}
              alt=""
              aria-hidden="true"
            />
            <Typography component="span" variant="body4" color="inherit">
              {frame.sprite}
            </Typography>
          </Button>
        </div>
        <TextField
          name={`f-${frame.__id}-delay`}
          label="Hold (ms)"
          inputType="number"
          size="s"
          value={d('delay')}
          // What it is held for when it says nothing: the animation's rate.
          // Empty is the ordinary case, so the field says what empty means.
          placeholder={String(Math.round(inherited))}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onNum('delay', e.target.value)
          }
          onBlur={onCommit}
          onKeyDown={blurOnEnter}
        />
      </div>

      {/* Scale and offset are tuning — a frame that needs neither (which is
          most of them) should not have to say so three times. Folded away, but
          never silently: the button carries what they are set to. */}
      <Button
        className={styles.disclosure}
        variant="text"
        size="extraSmall"
        aria-expanded={open}
        aria-controls={`f-${frame.__id}-adjust`}
        startIcon={
          <FontAwesomeV6Icon
            iconName={open ? 'chevron-down' : 'chevron-right'}
            iconStyle="solid"
          />
        }
        onClick={() => setOpen(!open)}
      >
        {open || !summary
          ? 'Size and position'
          : `Size and position — ${summary}`}
      </Button>
      {open && (
        <div className={styles.frameGrid} id={`f-${frame.__id}-adjust`}>
          <TextField
            name={`f-${frame.__id}-scale`}
            label="Scale"
            inputType="number"
            size="s"
            value={d('scale')}
            placeholder="1"
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onNum('scale', e.target.value)
            }
            onBlur={onCommit}
            onKeyDown={blurOnEnter}
          />
          <span />
          <TextField
            name={`f-${frame.__id}-offx`}
            label="Offset X"
            inputType="number"
            size="s"
            value={d('offx')}
            placeholder="0"
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onNum('offx', e.target.value)
            }
            onBlur={onCommit}
            onKeyDown={blurOnEnter}
          />
          <TextField
            name={`f-${frame.__id}-offy`}
            label="Offset Y"
            inputType="number"
            size="s"
            value={d('offy')}
            placeholder="0"
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onNum('offy', e.target.value)
            }
            onBlur={onCommit}
            onKeyDown={blurOnEnter}
          />
        </div>
      )}
      {sheets[frame.sprite] && (
        <CellPicker
          image={images[frame.sprite]}
          sheet={sheets[frame.sprite]}
          selected={frame.position}
          disabled={disabled}
          onPick={onCell}
        />
      )}
    </div>
  );
};

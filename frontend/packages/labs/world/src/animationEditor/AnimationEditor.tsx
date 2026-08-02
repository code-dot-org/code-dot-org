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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Button, IconButton, Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent as ReactKeyboardEvent} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {projectSheets, type SheetFile} from '../appearance/sheetFile';
import {
  animationIdOwners,
  renameAnimationInSource,
} from '../blockly/renameAnimation';
import {filePath, projectFiles} from '../runtime/projectFiles';

import styles from './animationEditor.module.css';

const DEFAULT_DELAY = 100;
// Preview/thumbnail draw scale: a 32px sprite is drawn at 2× so it reads at a
// glance; the frame's own scale/offset multiply on top.
const BASE_SCALE = 2;
const PREVIEW_BOX = 112;
const THUMB_BOX = 44;

// What makes an image a spritesheet is a `.sheet` file beside it, with the same
// stem, saying how big a cell is (appearance/sheetFile). Nothing about a PNG
// says how it should be cut up — that is a decision someone made, so it is a
// file rather than a guess about the picture's shape.

/** A source rectangle within a spritesheet. */
interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
}
interface Frame {
  sprite: string;
  delay: number;
  scale?: number;
  offset?: {x: number; y: number};
  position?: Cell;
  /** Client-only stable id (drag/react keys, draft keys); stripped on save. */
  __id: string;
}
interface AnimDef {
  name?: string;
  loop?: boolean;
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
            name: def.name,
            loop: def.loop,
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
  const out: Omit<Frame, '__id'> = {sprite: f.sprite, delay: f.delay};
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
      ...(def.name ? {name: def.name} : {}),
      ...(def.loop === false ? {loop: false} : {}),
      frames: def.frames.map(cleanFrame),
    };
  }
  return JSON.stringify({type: 'animation', animations}, null, 2);
}

const parseNum = (s: string, fallback: number): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
};

/** How many cells across and down a sheet's grid holds for a loaded image. */
const gridSize = (
  img: HTMLImageElement | undefined,
  sheet: SheetFile | undefined,
): {columns: number; rows: number} => {
  if (!img || !sheet) {
    return {columns: 0, rows: 0};
  }
  return {
    columns: Math.max(1, Math.floor(img.width / sheet.cell.width)),
    rows: Math.max(1, Math.floor(img.height / sheet.cell.height)),
  };
};

/** Draw one frame centered in a `box`-sized canvas (device-pixel aware). */
function drawFrame(
  canvas: HTMLCanvasElement,
  box: number,
  frame: Frame,
  images: Record<string, HTMLImageElement>,
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
  });
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
  const selected = selId ? doc.animations[selId] : null;

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
      next.label = def.name ?? '';
      for (const f of def.frames) {
        next[`${f.__id}.delay`] = String(f.delay ?? '');
        next[`${f.__id}.scale`] = f.scale === undefined ? '' : String(f.scale);
        next[`${f.__id}.offx`] = f.offset ? String(f.offset.x) : '';
        next[`${f.__id}.offy`] = f.offset ? String(f.offset.y) : '';
      }
    }
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
      frames: [
        {sprite: spriteOptions[0] ?? 'ball', delay: DEFAULT_DELAY, __id: uid()},
      ],
    };
    commit({
      ...docRef.current,
      animations: {...docRef.current.animations, [id]: def},
    });
    setSelectedId(id);
  };
  const deleteAnimation = (id: string) => {
    const animations = {...docRef.current.animations};
    delete animations[id];
    if (selId === id) {
      setSelectedId(Object.keys(animations)[0] ?? null);
    }
    commit({...docRef.current, animations});
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
    const sources = sourcesRef.current;
    const carried = ambiguous
      ? sources.source
      : renameAnimationInSource(sources.source, oldId, newId);
    const file = carried.files[fileId];
    updateSources({
      ...sources,
      source: {
        ...carried,
        files: {
          ...carried.files,
          [fileId]: {...file, contents: serialize(next)},
        },
      },
    });
  };

  const editLabel = (raw: string) => {
    setDraft(prev => ({...prev, label: raw}));
    if (selected) {
      setLive(withDef({...selected, name: raw || undefined}));
    }
  };
  const setLoop = (loop: boolean) => {
    if (selected) {
      commit(withDef({...selected, loop: loop ? undefined : false}));
    }
  };

  // ---- frame ops (by stable __id) -------------------------------------------

  const setFrameSprite = (id: string, sprite: string) => {
    if (!selected) {
      return;
    }
    // A cell belongs to a grid: default a sheet to its first cell (so it does
    // not draw the whole sheet), and clear it for a single picture.
    const sheet = sheets[sprite];
    const position = sheet
      ? {x: 0, y: 0, width: sheet.cell.width, height: sheet.cell.height}
      : undefined;
    commit(withFrames(mapFrame(id, f => ({...f, sprite, position}))));
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
            return {...f, delay: parseNum(raw, f.delay)};
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

  const addFrame = () => {
    if (!selected) {
      return;
    }
    const last = selected.frames[selected.frames.length - 1];
    commit(
      withFrames([
        ...selected.frames,
        {
          sprite: last?.sprite ?? spriteOptions[0] ?? 'ball',
          delay: DEFAULT_DELAY,
          __id: uid(),
        },
      ]),
    );
  };
  const removeFrame = (id: string) => {
    if (selected) {
      commit(withFrames(selected.frames.filter(f => f.__id !== id)));
    }
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
  useEffect(() => {
    let raf = 0;
    let startedAt = 0;
    const tick = (now: number) => {
      if (!startedAt) {
        startedAt = now;
      }
      const def = selId ? docRef.current.animations[selId] : null;
      const canvas = previewRef.current;
      if (canvas && def && def.frames.length > 0) {
        const total = def.frames.reduce((s, f) => s + Math.max(1, f.delay), 0);
        let t = now - startedAt;
        t = def.loop === false ? Math.min(t, total - 1) : t % total;
        let acc = 0;
        let idx = def.frames.length - 1;
        for (let k = 0; k < def.frames.length; k++) {
          acc += Math.max(1, def.frames[k].delay);
          if (t < acc) {
            idx = k;
            break;
          }
        }
        drawFrame(canvas, PREVIEW_BOX, def.frames[idx], imagesRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selId]);

  // ---------------------------------------------------------------------------

  return (
    <div className={styles.editor}>
      {/* Left: the file's animations. */}
      <div className={styles.list}>
        <div className={styles.listHeader}>
          <Typography variant="overline3" component="h2" className={styles.h}>
            Animations
          </Typography>
          <Button
            variant="text"
            size="extraSmall"
            onClick={addAnimation}
            disabled={isReadOnly}
          >
            + Add
          </Button>
        </div>
        {ids.length === 0 ? (
          <p className={styles.empty}>No animations yet. Add one to start.</p>
        ) : (
          <ul className={styles.animList}>
            {ids.map(id => (
              <li key={id}>
                <button
                  type="button"
                  className={
                    id === selId
                      ? `${styles.animItem} ${styles.animItemActive}`
                      : styles.animItem
                  }
                  onClick={() => setSelectedId(id)}
                  aria-pressed={id === selId}
                >
                  {id}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: the selected animation's settings, preview, and frames. */}
      {selected && selId ? (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <TextField
              name="anim-id"
              label="Name (id)"
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
            <TextField
              name="anim-label"
              label="Label (optional)"
              size="s"
              value={draft.label ?? ''}
              disabled={isReadOnly}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                editLabel(e.target.value)
              }
              onBlur={commitCurrent}
              onKeyDown={blurOnEnter}
            />
            <Button
              variant="text"
              size="extraSmall"
              color="error"
              onClick={() => deleteAnimation(selId)}
              disabled={isReadOnly}
            >
              Delete
            </Button>
          </div>

          <div className={styles.previewRow}>
            <canvas
              ref={previewRef}
              className={styles.preview}
              style={{width: PREVIEW_BOX, height: PREVIEW_BOX}}
            />
            <Checkbox
              name="anim-loop"
              label="Loop"
              checked={selected.loop !== false}
              disabled={isReadOnly}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLoop(e.target.checked)
              }
            />
          </div>

          <div className={styles.framesHeader}>
            <Typography variant="overline3" component="h3" className={styles.h}>
              Frames
            </Typography>
            <Button
              variant="text"
              size="extraSmall"
              onClick={addFrame}
              disabled={isReadOnly}
            >
              + Frame
            </Button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={selected.frames.map(f => f.__id)}
              strategy={verticalListSortingStrategy}
            >
              <ol className={styles.frames}>
                {selected.frames.map((frame, i) => (
                  <SortableFrame
                    key={frame.__id}
                    frame={frame}
                    index={i}
                    total={selected.frames.length}
                    images={images}
                    sheets={sheets}
                    draft={draft}
                    disabled={isReadOnly}
                    spriteOptions={spriteOptions}
                    onSprite={sprite => setFrameSprite(frame.__id, sprite)}
                    onCell={cell => setFrameCell(frame.__id, cell)}
                    onNum={(field, raw) => editFrameNum(frame.__id, field, raw)}
                    onCommit={commitCurrent}
                    onNudge={dir => nudgeFrame(frame.__id, dir)}
                    onRemove={() => removeFrame(frame.__id)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
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

/** One sortable frame card: thumbnail, sprite/delay/scale/offset fields, an
 *  optional spritesheet cell picker, and reorder/delete controls. */
const SortableFrame = ({
  frame,
  index,
  total,
  images,
  sheets,
  draft,
  disabled,
  spriteOptions,
  onSprite,
  onCell,
  onNum,
  onCommit,
  onNudge,
  onRemove,
}: {
  frame: Frame;
  index: number;
  total: number;
  images: Record<string, HTMLImageElement>;
  /** The grids among those images, by image file name — see appearance/sheetFile. */
  sheets: Record<string, SheetFile>;
  draft: Record<string, string>;
  disabled: boolean;
  spriteOptions: string[];
  onSprite: (sprite: string) => void;
  onCell: (cell: Cell | undefined) => void;
  onNum: (field: 'delay' | 'scale' | 'offx' | 'offy', raw: string) => void;
  onCommit: () => void;
  onNudge: (dir: -1 | 1) => void;
  onRemove: () => void;
}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id: frame.__id, disabled});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const d = (field: string) => draft[`${frame.__id}.${field}`] ?? '';

  return (
    <li ref={setNodeRef} style={style} className={styles.frame}>
      <div className={styles.frameHead}>
        <IconButton
          className={styles.grip}
          variant="contained"
          aria-label={`Reorder frame ${index + 1}`}
          size="extraSmall"
          color="tertiary"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <FontAwesomeV6Icon iconName="grip-vertical" iconStyle="solid" />
        </IconButton>
        <Typography
          variant="subtitle2"
          component="span"
          className={styles.frameNum}
          aria-hidden="true"
        >
          {index + 1}
        </Typography>
        <FrameThumb frame={frame} images={images} />
        <div className={styles.frameSpacer} />
        <div className={styles.frameButtons}>
          <IconButton
            aria-label="Move frame up"
            size="extraSmall"
            variant="outlined"
            color="tertiary"
            disabled={disabled || index === 0}
            onClick={() => onNudge(-1)}
          >
            <FontAwesomeV6Icon iconName="chevron-up" iconStyle="solid" />
          </IconButton>
          <IconButton
            aria-label="Move frame down"
            size="extraSmall"
            variant="outlined"
            color="tertiary"
            disabled={disabled || index === total - 1}
            onClick={() => onNudge(1)}
          >
            <FontAwesomeV6Icon iconName="chevron-down" iconStyle="solid" />
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
          <SimpleDropdown
            name={`f-${frame.__id}-sprite`}
            labelText="Sprite"
            size="s"
            disabled={disabled}
            selectedValue={frame.sprite}
            items={spriteOptions.map(s => ({value: s, text: s}))}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onSprite(e.target.value)
            }
          />
        </div>
        <TextField
          name={`f-${frame.__id}-delay`}
          label="Delay (ms)"
          inputType="number"
          size="s"
          value={d('delay')}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onNum('delay', e.target.value)
          }
          onBlur={onCommit}
          onKeyDown={blurOnEnter}
        />
        <TextField
          name={`f-${frame.__id}-scale`}
          label="Scale"
          inputType="number"
          size="s"
          value={d('scale')}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onNum('scale', e.target.value)
          }
          onBlur={onCommit}
          onKeyDown={blurOnEnter}
        />
        <TextField
          name={`f-${frame.__id}-offx`}
          label="Offset X"
          inputType="number"
          size="s"
          value={d('offx')}
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
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onNum('offy', e.target.value)
          }
          onBlur={onCommit}
          onKeyDown={blurOnEnter}
        />
      </div>
      {sheets[frame.sprite] && (
        <CellPicker
          image={images[frame.sprite]}
          sheet={sheets[frame.sprite]}
          selected={frame.position}
          disabled={disabled}
          onPick={onCell}
        />
      )}
    </li>
  );
};

/**
 * A spritesheet cell picker: the sheet drawn at 2×, each cell clickable.
 *
 * Clicking a cell sets the frame's `position`; the selected cell is outlined.
 * The grid comes from the image's `.sheet` file — this is only rendered for an
 * image that has one, because without one there is no answer to "which cell".
 */
const CellPicker = ({
  image,
  sheet,
  selected,
  disabled,
  onPick,
}: {
  image: HTMLImageElement | undefined;
  sheet: SheetFile;
  selected: Cell | undefined;
  disabled: boolean;
  onPick: (cell: Cell) => void;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const {columns, rows} = gridSize(image, sheet);
  const {width: cellW, height: cellH} = sheet.cell;
  // On-screen size of one cell.
  const cw = cellW * BASE_SCALE;
  const ch = cellH * BASE_SCALE;
  const width = columns * cw;
  const height = rows * ch;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !image) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr) {
      canvas.width = width * dpr;
    }
    if (canvas.height !== height * dpr) {
      canvas.height = height * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    // Only the part of the image the grid covers: a sheet whose size is not a
    // whole number of cells has a remainder that is not any cell.
    const sw = columns * cellW;
    const sh = rows * cellH;
    ctx.drawImage(image, 0, 0, sw, sh, 0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let k = 1; k < columns; k++) {
      ctx.beginPath();
      ctx.moveTo(k * cw, 0);
      ctx.lineTo(k * cw, height);
      ctx.stroke();
    }
    for (let k = 1; k < rows; k++) {
      ctx.beginPath();
      ctx.moveTo(0, k * ch);
      ctx.lineTo(width, k * ch);
      ctx.stroke();
    }
    const column = selected ? Math.round(selected.x / cellW) : -1;
    const row = selected ? Math.round(selected.y / cellH) : -1;
    if (column >= 0 && column < columns && row >= 0 && row < rows) {
      ctx.strokeStyle = '#0093a4';
      ctx.lineWidth = 3;
      ctx.strokeRect(column * cw + 1.5, row * ch + 1.5, cw - 3, ch - 3);
    }
  }, [image, columns, rows, cw, ch, width, height, cellW, cellH, selected]);

  if (!image) {
    return null;
  }
  const pick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const at = (offset: number, extent: number, count: number) =>
      Math.min(count - 1, Math.max(0, Math.floor((offset / extent) * count)));
    const column = at(event.clientX - rect.left, rect.width, columns);
    const row = at(event.clientY - rect.top, rect.height, rows);
    onPick({
      x: column * cellW,
      y: row * cellH,
      width: cellW,
      height: cellH,
    });
  };
  return (
    <div className={styles.cellPicker}>
      <span className={styles.cellHint}>Cell:</span>
      <div className={styles.sheetScroll}>
        <canvas
          ref={ref}
          className={styles.sheet}
          style={{width, height}}
          onClick={pick}
        />
      </div>
    </div>
  );
};

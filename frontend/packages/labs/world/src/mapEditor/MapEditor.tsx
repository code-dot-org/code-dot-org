// Editing a `.map` file.
//
// A palette of the project's actor templates, drawn as thumbnails the sandbox
// rendered, and the map canvas beside it (`MapStage`). This half is the FILE:
// parsing the document, writing it back through `onChange` so the running game
// updates, and asking the sandbox what each actor template looks like and what
// its editable properties are.
//
// The canvas and the inspector live in `MapStage`, which the `create actor in
// map` popup also uses (MAPS.md §4). What this adds is the palette and the file.

import {useEffect, useMemo, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {placementKey} from '../blockly/mapPlacements';
import {
  projectActorOptions,
  projectWorldOptions,
} from '../blockly/projectModules';
import {DEFAULT_BACKDROP_COLOR} from '../engine';
import type {ActorSchema} from '../runtime/messages';
import {projectFiles} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import styles from './mapEditor.module.css';
import {
  clampTiles,
  MAX_MAP_TILES,
  MIN_MAP_TILES,
  parseMap,
  type MapDoc,
} from './mapModel';
import {MapStage} from './MapStage';

export const MapEditor = ({
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  const {getActorInfo, hasCompiled} = useWorldRuntime();
  const {currentSources, sourcesEpoch} = useSources<MultiFileSource>();

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
  // Re-seed when the lab is handed a different document — the project
  // loading, a version restored, a start-over. `sourcesEpoch` counts exactly
  // those (SourcesContext), so this editor's own writes never trip it.
  const seenEpoch = useRef(sourcesEpoch);
  useEffect(() => {
    if (seenEpoch.current === sourcesEpoch) {
      return;
    }
    seenEpoch.current = sourcesEpoch;
    setMap(parseMap(initialContents));
  }, [sourcesEpoch, initialContents]);

  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [schemas, setSchemas] = useState<Record<string, ActorSchema>>({});
  // The picker template to PLACE; null is the stage's select mode.
  const [selected, setSelected] = useState<string | null>(null);

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

  // …and a picture of each PLACEMENT that overrides anything, because a kind's
  // picture is not a placement's: three Labels on one map say three different
  // things, and drawing them all from the kind is three identical smudges
  // (specs/UI_ACTORS.md). Keyed by content, so a placement that changed nothing
  // is not re-rendered and two that match are rendered once.
  const placements = useMemo(
    () =>
      map.actors.flatMap(actor => {
        // No key means the kind's own picture is the answer — nothing
        // overridden, or nothing but where it stands.
        const key = placementKey(actor.type, actor.properties);
        return key
          ? [{key, type: actor.type, properties: actor.properties ?? {}}]
          : [];
      }),
    [map],
  );
  // The effect depends on WHICH pictures are wanted, not on the array — the
  // array is fresh every time the document is touched, and a dragged actor
  // touches it on every frame of the drag.
  const wanted = placements
    .map(request => request.key)
    .sort()
    .join('|');
  useEffect(() => {
    // The paths are what put builders in the manifest; without them there is
    // nothing to instantiate a placement from, and the reply comes back empty.
    const paths = actorOptions.map(([, path]) => path);
    if (!hasCompiled || !worldPath || !placements.length) {
      return;
    }
    if (placements.every(request => thumbnails[request.key])) {
      return;
    }
    let alive = true;
    void infoFn.current(paths, worldPath, placements).then(info => {
      if (alive) {
        setThumbnails(prev => ({...prev, ...info.placements}));
      }
    });
    return () => {
      alive = false;
    };
    // `wanted` stands in for `placements`, which is a fresh array every time
    // the document is touched — and a dragged actor touches it on every frame
    // of the drag. What the fetch depends on is WHICH pictures are missing.
  }, [wanted, worldPath, hasCompiled, thumbnails, actorOptions, placements]);

  const commit = (next: MapDoc) => {
    setMap(next);
    onChange(JSON.stringify(next, null, 2));
  };

  /**
   * Resize the map, in tiles.
   *
   * Placements are left exactly where they are, including any that the new size
   * leaves outside. Shrinking a map is how an author trims it, and deleting
   * their work to do it — silently, on a keystroke, while the number is still
   * being typed — would be the worse mistake by far. An actor outside the
   * border is visible as such and can be dragged back in or removed.
   */
  const resize = (axis: 'width' | 'height', value: string) => {
    const tiles = clampTiles(value);
    if (tiles === undefined) {
      return; // mid-edit: an emptied field is not a size
    }
    commit({...map, size: {...map.size, [axis]: tiles}});
  };

  return (
    <div className={styles.editor}>
      <div className={styles.picker}>
        <label className={styles.sizeField}>
          <span className={styles.sizeLabel}>Width</span>
          <input
            type="number"
            min={MIN_MAP_TILES}
            max={MAX_MAP_TILES}
            step={1}
            value={map.size.width}
            disabled={isReadOnly}
            onChange={event => resize('width', event.target.value)}
          />
        </label>
        <label className={styles.sizeField}>
          <span className={styles.sizeLabel}>Height</span>
          <input
            type="number"
            min={MIN_MAP_TILES}
            max={MAX_MAP_TILES}
            step={1}
            value={map.size.height}
            disabled={isReadOnly}
            onChange={event => resize('height', event.target.value)}
          />
        </label>
        <span className={styles.sizeUnit}>tiles</span>
        {actorOptions.map(([name, path]) => (
          <button
            key={path}
            type="button"
            className={
              path === selected
                ? `${styles.actor} ${styles.selected}`
                : styles.actor
            }
            // Entering place mode clears any placed-actor selection — the
            // stage does that itself, since that selection is its state.
            onClick={() => setSelected(path === selected ? null : path)}
            aria-pressed={path === selected}
          >
            {/* THE GROUND IS THE CELL'S, not the image's, and it is the
                PICKER'S ground rather than any world's. A thumbnail is a
                faithful transparent PNG, and without something behind it a
                white-on-transparent Label over a white strip was not a faint
                cell but an empty one.

                What it is NOT is a claim about where the actor will sit: an
                `.actor` belongs to no world, a project may hold several with
                different backgrounds, and a thumbnail is made per kind. This
                is the lab's default backdrop used as a dark neutral, which
                reads for most drawings and cannot read for all of them — a
                black-lettered Label needs a light ground and will not get one.
                That is what the elected icon is for (specs/UI_ACTORS.md). */}
            <span
              className={styles.thumb}
              style={{background: DEFAULT_BACKDROP_COLOR}}
            >
              {thumbnails[path] && <img src={thumbnails[path]} alt="" />}
            </span>
            <span className={styles.name}>{name}</span>
          </button>
        ))}
      </div>
      <MapStage
        doc={map}
        onDocChange={commit}
        placing={selected}
        thumbnails={thumbnails}
        schemas={schemas}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default MapEditor;

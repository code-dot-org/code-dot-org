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

import {
  projectActorOptions,
  projectWorldOptions,
} from '../blockly/projectModules';
import type {ActorSchema} from '../runtime/messages';
import {projectFiles} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import styles from './mapEditor.module.css';
import {parseMap, type MapDoc} from './mapModel';
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

  const commit = (next: MapDoc) => {
    setMap(next);
    onChange(JSON.stringify(next, null, 2));
  };

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
            // Entering place mode clears any placed-actor selection — the
            // stage does that itself, since that selection is its state.
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

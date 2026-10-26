// Editing a `.map` file.
//
// A palette of the project's actor templates, drawn as thumbnails the sandbox
// rendered, and the map canvas beside it (`MapStage`). This half is the FILE:
// parsing the document, writing it back through `onChange` so the running game
// updates, and asking the sandbox what each actor template looks like and what
// its editable properties are.
//
// The canvas and the inspector live in `MapStage`. What this adds is the
// palette and the file.

import {IconButton, Typography} from '@mui/material';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import {activateFile, type CustomEditorProps} from '@code-dot-org/codebridge';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {requestActorDelete} from '../actors/actorDelete';
import {purposeOf, type PaletteTab} from '../actors/actorPurpose';
import {requestActorCreate} from '../actors/create/actorCreate';
import {requestActorEnhance} from '../actors/enhance/actorEnhance';
import {useAppBuilder} from '../appBuilder';
import {isBackgroundPath} from '../appearance/backgroundsFolder';
import {useProjectImages} from '../appearance/useProjectImages';
import {projectActorIcons} from '../blockly/actorIconMeta';
import {actorIconImage} from '../blockly/actorIcons';
import {cameraBlockId, cameraValue} from '../blockly/cameras';
import {buildDomainPalette} from '../blockly/domainBlocks';
import {eventChoicesIn, type EventChoice} from '../blockly/eventChoices';
import {eventsNarrowerFor, type NarrowEvents} from '../blockly/kindEvents';
import {label} from '../blockly/label';
import {placementKey} from '../blockly/mapPlacements';
import {fileIdForModule} from '../blockly/openModule';
import {
  projectActorOptions,
  projectMapActorTypes,
  projectOwnMetas,
  projectRuleMetas,
  projectRuleOptions,
  projectStyleFileOptions,
  projectWorldOptions,
} from '../blockly/projectModules';
import {setRevealer} from '../callouts/reveal';
import fields from '../formFields.module.css';
import {useScriptStep} from '../layout/TrailContext';
import {gameModuleOf} from '../mainWorld';
import {useMaybeProgression} from '../progression/progressionContext';
import type {Affordance} from '../progression/types';
import {agreedViewSize} from '../runtime/declaredSizes';
import {browserTextMetrics} from '../runtime/driver/textMetrics';
import type {ActorSchema} from '../runtime/messages';
import {
  filePath,
  projectFiles,
  projectImagePaths,
} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import {ActorPalette, type PaletteActor} from './ActorPalette';
import {fitLayout} from './docking';
import {EMPTY_HISTORY, record, redo, undo, type History} from './editHistory';
import {
  drawsItself,
  localPictures,
  withoutWornPicture,
  type LocalPicture,
} from './localPictures';
import styles from './mapEditor.module.css';
import {
  addMapCamera,
  clampTiles,
  removeMapCamera,
  renameMapCamera,
  withMapCameraTrait,
  withMapCameraValue,
  withStartingCamera,
  MAX_MAP_TILES,
  MIN_MAP_TILES,
  parseMap,
  type MapDoc,
  type WorkspaceState,
} from './mapModel';
import {MapStage, type WorldCameraEditor} from './MapStage';
import {PlaceHeading} from './PlaceHeading';
import {PlacementScriptEditor} from './PlacementScriptEditor';
import {withPlacePicture} from './placePicture';
import {MAIN_CAMERA, startingCamera} from './worldCameraCode';
import {worldCameras} from './worldCameras';
import {mapFileDocument, type MapDocumentAdapter} from './worldDocument';
import type {WorldProperty} from './worldProperties';
import {cameraTraitChoices, worldRuleProperties} from './worldRuleProperties';

/** How long after the last keystroke a placement's picture is asked for. */
const PICTURE_DEBOUNCE_MS = 150;

/** Which workspace the editor is showing instead of the map, if any. */

export interface MapEditorProps extends CustomEditorProps {
  /**
   * What the file is: a `.map`, or a `.world` holding a map beside its
   * blocks (specs/MAIN_MAP_PLAN.md). Decides how the map is read out of the
   * contents and written back, and what owns its scripts.
   */
  document?: MapDocumentAdapter;
  /**
   * What "Map script" opens when the document's map has no workspace of its
   * own — a world's is its World view.
   */
  onOpenMapScript?: () => void;
}

/** What the shelf may withhold in the map editor, each asked for by name. */
const MAP_AFFORDANCES: readonly Affordance[] = [
  'map-scripts',
  'map-layers',
  'map-enhance',
  'map-open-kind',
  'map-new-actor',
];

/**
 * `prev` with `answers` over it, or `prev` itself when they change nothing.
 *
 * What the sandbox is asked for is what the editor has not got, so an answer
 * that lacks something — a kind or a placement the sandbox cannot picture,
 * as the App's Note records cannot be — must not count as a change: a fresh
 * object asked again, and again, every few hundred milliseconds for as long
 * as the map was open, and the stage, re-rendered each time, never sat still
 * long enough to paint the place's own picture.
 */
function withAnswers<T>(
  prev: Record<string, T>,
  answers: Record<string, T> | undefined,
): Record<string, T> {
  const changed = Object.entries(answers ?? {}).filter(
    ([key, value]) => prev[key] !== value,
  );
  return changed.length ? {...prev, ...Object.fromEntries(changed)} : prev;
}

export const MapEditor = ({
  fileId,
  initialContents,
  isReadOnly,
  onChange,
  document = mapFileDocument,
  onOpenMapScript,
}: MapEditorProps) => {
  const {getActorInfo, hasCompiled} = useWorldRuntime();
  const {currentSources, sourcesEpoch, updateSources} =
    useSources<MultiFileSource>();
  // What a gated lab withholds here (specs/CURRICULUM_PLAN.md,
  // specs/KINDS_FROM_THE_MAP_PLAN.md). With no progression, or an ungated
  // one, nothing is. A withheld control is drawn disabled beside the lesson
  // that grants it, and nothing else changes: a map that has scripts or
  // layers draws and runs as it is.
  const progression = useMaybeProgression();
  // …and what App Builder leaves out altogether: layers and cameras
  // (`appBuilder`).
  const appBuilder = useAppBuilder();
  const withheld = useMemo(
    () =>
      new Set(
        MAP_AFFORDANCES.filter(
          id => !(progression?.holds({kind: 'affordance', id}) ?? true),
        ),
      ),
    [progression],
  );

  const files = useMemo(
    () => projectFiles(currentSources.source),
    [currentSources],
  );
  const actorOptions = useMemo(() => projectActorOptions(files), [files]);

  /**
   * The events an actor of a kind can start a section with, for the map
   * inspector's quick add (`blockly/eventChoices`): what a placement's own
   * script can hold, narrowed to what reaches that kind. Built when the menu
   * asks, and kept until the files change — building a palette is not
   * something to do on every edit of the map.
   */
  const eventsCache = useRef<{
    files: Record<string, string>;
    choices: EventChoice[];
    narrow: NarrowEvents;
  } | null>(null);
  const eventsFor = useCallback(
    (kind: string): EventChoice[] => {
      if (eventsCache.current?.files !== files) {
        const palette = buildDomainPalette(projectRuleMetas(files), {
          fileKind: 'placement',
          ownProperties: projectOwnMetas(files),
        });
        eventsCache.current = {
          files,
          choices: eventChoicesIn(palette.toolbox, palette.blocks),
          narrow: eventsNarrowerFor(files),
        };
      }
      const held = eventsCache.current;
      return held.narrow(held.choices, kind);
    },
    [files],
  );
  // The project's themes, for the map's own choice and for each placement's
  // (specs/STYLES_PLAN.md).
  const themeOptions = useMemo(() => projectStyleFileOptions(files), [files]);

  /**
   * The kinds with a file of their own, and what each calls itself — what
   * `Enhance ⟨Hero⟩…` and `Open ⟨Hero⟩` say and act on. A world's own actor
   * has no file to open and is not here.
   */
  const kinds = useMemo(
    () =>
      Object.fromEntries(
        actorOptions
          .filter(([, path]) => fileIdForModule(currentSources.source, path))
          .map(([name, path]) => [path, {name}]),
      ),
    [actorOptions, currentSources],
  );
  /** The Enhance checklist on a kind, asked of the lab as the file menus ask. */
  const enhanceKind = useCallback(
    (type: string) => {
      const kind = kinds[type];
      if (kind) {
        void requestActorEnhance({kind: 'actor', path: type, name: kind.name});
      }
    },
    [kinds],
  );
  /**
   * A new kind, from the Actor Creator. The world stays the tab in front,
   * and the kind that was made is the one in hand: a learner who asked from
   * the map wants to place it.
   */
  const newActor = useCallback((purpose?: PaletteTab) => {
    void requestActorCreate(purpose).then(path => {
      if (path) {
        setSelected(path);
      }
    });
  }, []);
  /** A kind's own file, made the active tab. */
  const openKind = useCallback(
    (type: string) => {
      const fileId = fileIdForModule(currentSources.source, type);
      if (fileId) {
        updateSources({
          ...currentSources,
          source: activateFile(currentSources.source, fileId),
        });
      }
    },
    [currentSources, updateSources],
  );
  /**
   * A kind taken out of the project, from the palette's Delete. The file
   * menus ask first, saying where it is used (`actors/actorDelete`).
   */
  const deleteKind = useCallback((path: string) => {
    void requestActorDelete(path).then(deleted => {
      if (deleted) {
        setSelected(null);
      }
    });
  }, []);
  const worldPath = useMemo(() => gameModuleOf(files) ?? '', [files]);

  /**
   * The project's maps, for a Viewport's `map` property, and the map each
   * Viewport on this map holds, read from the file its property names
   * (specs/VIEWPORT_PLAN.md). Parsed here rather than in the stage, which
   * knows nothing of files.
   */
  const mapChoices = useMemo(
    () =>
      Object.keys(projectMapActorTypes(files))
        .sort()
        .map(path => [label(path.split('/').pop() ?? path), path] as const),
    [files],
  );

  /** The window this map will be seen through — see `agreedViewSize`. */
  const visible = useMemo(
    () =>
      agreedViewSize(
        projectWorldOptions(files).map(([, path]) => files[`${path}.world`]),
      ),
    [files],
  );

  // Read with its docked placements in their regions, so the stage draws
  // and finds them where the game will (`docking.fitLayout`).
  const [map, setMap] = useState(() =>
    fitLayout(document.read(initialContents)),
  );
  // The file as last known — what a write is made from, so a world's blocks
  // come through a map edit untouched. A ref for writing, since several
  // commits may land in one tick, and a state beside it for what is drawn
  // from the file itself (the world's header).
  const contentsRef = useRef(initialContents);
  const [fileText, setFileText] = useState(initialContents);
  // Re-seed when the lab is handed a different document — the project
  // loading, a version restored, a start-over. `sourcesEpoch` counts exactly
  // those (SourcesContext), so this editor's own writes never trip it.
  const seenEpoch = useRef(sourcesEpoch);
  useEffect(() => {
    if (seenEpoch.current === sourcesEpoch) {
      return;
    }
    seenEpoch.current = sourcesEpoch;
    // What came before was another document's.
    setHistory(EMPTY_HISTORY);
    contentsRef.current = initialContents;
    setFileText(initialContents);
    setMap(fitLayout(document.read(initialContents)));
  }, [sourcesEpoch, initialContents, document]);

  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [schemas, setSchemas] = useState<Record<string, ActorSchema>>({});
  /** How big each kind is, for the kinds that declare a picture. */
  const [sizes, setSizes] = useState<
    Record<string, {width: number; height: number}>
  >({});
  /**
   * …and what each scales itself by, which is the other half of how big it is
   * drawn and the half a placement usually does not carry
   * (`stageGeometry.KindScales`).
   */
  const [scales, setScales] = useState<Record<string, {x: number; y: number}>>(
    {},
  );
  /**
   * …and how big particular placements are, for the ones drawn on their own
   * — a Label made wider than its kind (`ThumbnailsReadyMessage.placementSizes`).
   */
  const [placementSizes, setPlacementSizes] = useState<
    Record<string, {width: number; height: number}>
  >({});
  /**
   * Which symbol each kind elected, read out of the files. Read here rather
   * than from the registry the Blockly editor fills (`setActorIcons`), since
   * a map may be the first tab opened and the registry is empty until a
   * Blockly file has been.
   */
  const icons = useMemo(() => projectActorIcons(files), [files]);
  /** What the palette draws for a kind: its elected symbol, else its picture. */
  const pictureOf = (path: string): string | undefined =>
    actorIconImage(icons[path] ?? '') ?? thumbnails[path];
  // The picker template to PLACE; null is the stage's select mode.
  const [selected, setSelected] = useState<string | null>(null);
  /**
   * The place's picture, written beside it when it is new or different
   * (`placePicture`). Through a ref, since it is asked a while after the
   * render that made it, and an older project would undo what came since.
   */
  const latestSources = useRef(currentSources);
  latestSources.current = currentSources;
  const keepPicture = useCallback(
    (picture: string) => {
      const now = latestSources.current;
      const next = withPlacePicture(now.source, fileId, picture);
      if (next !== now.source) {
        updateSources({...now, source: next});
      }
    },
    [fileId, updateSources],
  );
  /** The kind being dragged out of the palette, while it is (`ActorPalette`). */
  const [incoming, setIncoming] = useState<string | null>(null);
  /**
   * The document as it is being edited — a field half-typed — which the stage
   * reports before committing it (`MapStage.onDocPreview`). Pictures are
   * asked for against THIS, so the placement under edit is painted while the
   * typing goes on rather than once the field is left; the committed `map` is
   * still what is written back.
   */
  const [liveMap, setLiveMap] = useState<MapDoc | null>(null);
  useEffect(() => setLiveMap(null), [map]);

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
        // The same objects when the answer adds nothing: a kind the sandbox
        // cannot picture stays missing, and a fresh object would run this
        // effect again and ask again, without end (`withAnswers`).
        setThumbnails(prev => withAnswers(prev, info.thumbnails));
        setSchemas(prev => withAnswers(prev, info.schemas));
        setSizes(prev => withAnswers(prev, info.sizes));
        setScales(prev => withAnswers(prev, info.scales));
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
  const pictured = liveMap ?? map;

  // PICTURES READ FROM THE FILES, before the sandbox is asked for anything.
  // A `define drawing` cannot set anything, so a placement's picture can be
  // had by reading the rows against the placement's own values and painting
  // them here, on this keystroke (`localPictures`). The sandbox is asked only
  // for what the reading could not finish — a drawing that reads the time or
  // a rule's live state — and for kinds that wear a picture instead.
  const measure = useMemo(() => browserTextMetrics(), []);
  const images = useProjectImages(currentSources.source);
  const imageFor = useCallback(
    (sprite: string) => {
      // A `draw image` names a picture as the engine does — bare, or with a
      // cell after a `#` — and the project's decoded images go by file name.
      const name = sprite.replace(/#.*$/, '');
      return images[name] ?? images[`${name}.png`];
    },
    [images],
  );
  // The reading depends on the files, the images and the measure and nothing
  // else, so within one set of them a key names one picture for good.
  const readings = useMemo(
    () => new Map<string, LocalPicture | null>(),
    [files, images, measure],
  );
  const local = useMemo(
    () =>
      localPictures(
        files,
        pictured,
        actorOptions.map(([, path]) => path),
        measure,
        imageFor,
        readings,
      ),
    [files, pictured, actorOptions, measure, imageFor, readings],
  );

  const placements = useMemo(
    () =>
      pictured.actors.flatMap(actor => {
        // No key means the kind's own picture is the answer — nothing
        // overridden, or nothing but where it stands. A key the reading
        // finished needs nothing from the sandbox either.
        const key = placementKey(actor.type, actor.properties);
        return key && !local.complete.has(key)
          ? [{key, type: actor.type, properties: actor.properties ?? {}}]
          : [];
      }),
    [pictured, local],
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
    // A breath after the last keystroke, so typing a word asks for one
    // picture rather than one per letter. The compile behind the request is
    // a cache hit for a map edit (`thumbnailManifest.manifestFiles`), so
    // what is being rationed is the sandbox's paint and the round trip.
    let alive = true;
    const timer = window.setTimeout(() => {
      void infoFn.current(paths, worldPath, placements).then(info => {
        if (alive) {
          // The same object when the answer adds nothing (`withAnswers`).
          setThumbnails(prev => withAnswers(prev, info.placements));
          setPlacementSizes(prev => withAnswers(prev, info.placementSizes));
        }
      });
    }, PICTURE_DEBOUNCE_MS);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // `wanted` stands in for `placements`, which is a fresh array every time
    // the document is touched — and a dragged actor touches it on every frame
    // of the drag. What the fetch depends on is WHICH pictures are missing.
  }, [wanted, worldPath, hasCompiled, thumbnails, actorOptions, placements]);

  /**
   * What the stage draws with: the reading where it finished or where the
   * sandbox has not answered, the sandbox's picture otherwise — and each
   * picture's size beside it, from the same source.
   */
  const shown = useMemo(() => {
    const pictures: Record<string, HTMLCanvasElement> = {};
    const kindSizes = {...local.sizes, ...sizes};
    const ownSizes = {...local.sizes, ...placementSizes};
    for (const [key, canvas] of Object.entries(local.pictures)) {
      if (local.complete.has(key) || !thumbnails[key]) {
        pictures[key] = canvas;
        if (key in local.sizes) {
          kindSizes[key] = local.sizes[key];
          ownSizes[key] = local.sizes[key];
        }
      }
    }
    return {pictures, sizes: kindSizes, placementSizes: ownSizes};
  }, [local, sizes, placementSizes, thumbnails]);

  // A kind that draws itself has no use for `set sprite` or `set animation`,
  // and the inspector does not offer them (`withoutWornPicture`).
  const shownSchemas = useMemo(
    () => withoutWornPicture(schemas, type => drawsItself(files, type)),
    [schemas, files],
  );

  /**
   * Undo and redo (specs/SHELL_PLAN.md, step 5): every write is a step, and
   * a run of writes from one gesture (`group`) is one. Kept while the editor
   * is open, and forgotten when the document is replaced from outside.
   */
  const [history, setHistory] = useState<History>(EMPTY_HISTORY);
  const historyRef = useRef(history);
  historyRef.current = history;
  const writeFile = (written: string, group?: string) => {
    const next = record(
      historyRef.current,
      contentsRef.current,
      written,
      Date.now(),
      group,
    );
    historyRef.current = next;
    setHistory(next);
    contentsRef.current = written;
    setFileText(written);
    onChange(written);
  };
  /** The file as a step of the history left it, put back in front. */
  const restore = (step: {contents: string; history: History} | undefined) => {
    if (!step) {
      return;
    }
    historyRef.current = step.history;
    setHistory(step.history);
    contentsRef.current = step.contents;
    setFileText(step.contents);
    setMap(fitLayout(document.read(step.contents)));
    onChange(step.contents);
  };
  const undoEdit = () => restore(undo(historyRef.current, contentsRef.current));
  const redoEdit = () =>
    restore(redo(historyRef.current, contentsRef.current, Date.now()));
  /** The project's backgrounds by file name, for a layer's two slots. */
  const backgroundChoices = useMemo(
    () =>
      projectImagePaths(currentSources.source)
        .filter(isBackgroundPath)
        .map(path => path.split('/').pop() ?? path)
        .sort(),
    [currentSources],
  );

  /** …and its pictures, for a placement's picture property. */
  const pictureChoices = useMemo(
    () =>
      projectImagePaths(currentSources.source)
        .filter(path => !isBackgroundPath(path))
        .map(path => path.split('/').pop() ?? path)
        .sort(),
    [currentSources],
  );

  const heldMaps = useMemo(() => {
    const held: Record<string, MapDoc> = {};
    for (const actor of map.actors) {
      const path = actor.properties?.showsMap?.map;
      const contents =
        typeof path === 'string' && path ? files[`${path}.map`] : undefined;
      if (contents) {
        held[actor.id] = parseMap(contents);
      }
    }
    return held;
  }, [map, files]);

  const commit = (next: MapDoc, group?: string) => {
    // A change to the layout, or to the size it divides, moves what is
    // docked; written so, the file agrees with the game.
    const fitted = fitLayout(next);
    setMap(fitted);
    writeFile(document.write(contentsRef.current, fitted), group);
  };
  // What the world's window offers besides the world's own properties
  // (`worldRuleProperties`, specs/WORLD_RULE_FIELDS_PLAN.md).
  const ruleProperties = useMemo(() => worldRuleProperties(files), [files]);

  // The world itself, for the inspector with nothing selected — only when
  // the document is one (specs/MAIN_MAP_PLAN.md).
  const worldHeader = useMemo(
    () => document.world?.read(fileText, ruleProperties),
    [document, fileText, ruleProperties],
  );
  // The world's own cameras, for the strip — from the file, which the stage
  // never sees (`worldCameras`). Absent for a `.map`, which has none.
  const worldCameraList = useMemo(
    () => (document.hasWorldCameras ? worldCameras(fileText) : []),
    [document.hasWorldCameras, fileText],
  );
  // …and what they can be told. The world's cameras are made HERE and kept
  // on its main map, never as blocks in its code (`placementCameras`); the
  // traits a camera may elect are the project's rules' camera traits. Which
  // one it starts through is the map's to say once it says it, and the
  // code's — a `look through camera` row — until then.
  const cameraChoices = useMemo(() => cameraTraitChoices(files), [files]);
  // …the main camera's too, whose traits and values are stored apart.
  const storedCamera = (id: string) =>
    id === MAIN_CAMERA
      ? map.mainCamera
      : map.cameras?.find(camera => camera.id === id);
  const worldCameraEditor: WorldCameraEditor | undefined =
    document.hasWorldCameras
      ? {
          starting: map.startingCamera
            ? (cameraBlockId(map.startingCamera) ?? MAIN_CAMERA)
            : startingCamera(fileText),
          choices: cameraChoices,
          traitsOf: id => storedCamera(id)?.traits ?? [],
          valueOf: (id, property) =>
            storedCamera(id)?.values.find(
              each => each.setter === property.setter,
            )?.value,
          add: () => {
            const made = addMapCamera(
              map,
              worldCameraList.map(camera => camera.name),
            );
            commit(made.doc);
            return made.id;
          },
          remove: id => commit(removeMapCamera(map, id)),
          rename: (id, name) => commit(renameMapCamera(map, id, name)),
          setStarting: id =>
            commit(
              withStartingCamera(
                map,
                id === MAIN_CAMERA ? MAIN_CAMERA : cameraValue(id),
              ),
            ),
          setTrait: (id, trait, elected) =>
            commit(withMapCameraTrait(map, id, trait, elected)),
          setValue: (id, property, value) =>
            commit(
              withMapCameraValue(map, id, {
                setter: property.setter,
                type: property.type,
                value,
              }),
            ),
        }
      : undefined;
  const worldInspector =
    document.world && worldHeader
      ? {
          header: worldHeader,
          title: document.world.title,
          onRename: (name: string) =>
            writeFile(document.world!.writeName(contentsRef.current, name)),
          // A rule's property is a `set` row; the world's own is a DEFAULT
          // field on the row that declares it.
          onSetDefault: (property: WorldProperty, value: string) => {
            const found =
              property.setter &&
              ruleProperties.find(each => each.setter === property.setter);
            writeFile(
              found
                ? document.world!.writeRuleValue(
                    contentsRef.current,
                    found,
                    value,
                  )
                : document.world!.writeDefault(
                    contentsRef.current,
                    property.name,
                    value,
                  ),
            );
          },
          // …and its theme, which is its main map's too: the world's `use
          // theme` row is written, and a theme the main map held of its own
          // goes, so that there is one answer and not two.
          onTheme: (path: string | undefined) => {
            // A screen's theme is its map's own key, and the game's base.
            if (document.scriptKind === 'screen') {
              commit({...map, theme: path});
              return;
            }
            const written = document.world!.writeTheme(
              contentsRef.current,
              path,
            );
            if (map.theme === undefined) {
              writeFile(written);
              return;
            }
            const next = {...map, theme: undefined};
            setMap(next);
            writeFile(document.write(written, next));
          },
          // …and a new value of the game's own, where the document holds
          // them as data (a screen).
          onAddProperty: document.world.addProperty
            ? (name: string, type: string) =>
                writeFile(
                  document.world!.addProperty!(contentsRef.current, name, type),
                )
            : undefined,
          // …and how many rules it holds, for the button that opens them.
          ruleCount: projectRuleOptions(files).length,
          // …and the color behind the background, a row in the world's code.
          onBackgroundColor: (color: string) =>
            writeFile(
              document.world!.writeBackgroundColor(contentsRef.current, color),
            ),
        }
      : undefined;

  /**
   * The third view (specs/MAP_FIRST.md, "The editor's modes"): a placement's
   * workspace, or the map's own, in the editor's place. The map document
   * stays here, so what the workspace writes lands in it through `commit`
   * as an inspector edit does. Which one is open is a step on the trail, so
   * the breadcrumb is the way back (specs/SHELL_PLAN.md); without the
   * layout, the header's own button is.
   */
  const [step, setScript, onTrail] = useScriptStep(fileId);
  // A map's are a placement's code and its own; an actor's is not one here.
  const script = step?.kind === 'code' ? null : step;
  // A REVEAL NEVER LEAVES A SCRIPT A LEARNER HAS OPEN
  // (specs/SHOW_ME_PLAN.md). While one is, the stage is not mounted to
  // answer for a selection, and this answers no: Show me then says where the
  // thing is, and rings nothing.
  const scriptOpen = script !== null;
  useEffect(() => {
    if (!scriptOpen) {
      return undefined;
    }
    setRevealer('placement', () => false);
    return () => setRevealer('placement', null);
  }, [scriptOpen]);
  const mapModule = useMemo(
    () => document.modulePath(filePath(currentSources.source, fileId) ?? ''),
    [currentSources, fileId, document],
  );
  const scripted =
    script?.kind === 'placement'
      ? (map.actors.find(actor => actor.id === script.id) ?? null)
      : null;
  const kindName = (type: string) =>
    actorOptions.find(([, path]) => path === type)?.[0] ??
    type.split('/').pop() ??
    type;
  const writeScript = (next: WorkspaceState) => {
    if (!script) {
      return;
    }
    if (script.kind === 'map') {
      commit({...map, blocks: next});
      return;
    }
    commit({
      ...map,
      actors: map.actors.map(actor =>
        actor.id === script.id ? {...actor, blocks: next} : actor,
      ),
    });
  };
  if (script && (script.kind === 'map' || scripted)) {
    return (
      <PlacementScriptEditor
        // A workspace per placement: opening another is a new one.
        key={script.kind === 'map' ? 'map' : `placement:${script.id}`}
        memoryKey={`${fileId}#${script.kind === 'map' ? 'map' : script.id}`}
        title={
          scripted
            ? `${scripted.id} (${kindName(scripted.type)})`
            : document.scriptKind === 'screen'
              ? 'Screen'
              : 'Map'
        }
        kind={scripted ? 'placement' : (document.scriptKind ?? 'map')}
        actorKind={scripted?.type}
        mapModule={mapModule}
        placements={map.actors.map(actor => actor.id)}
        contents={scripted ? scripted.blocks : map.blocks}
        onChange={writeScript}
        onBack={onTrail ? undefined : () => setScript(null)}
        isReadOnly={isReadOnly}
      />
    );
  }

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
    // Each keystroke is a write, and the typing one step.
    commit({...map, size: {...map.size, [axis]: tiles}}, `size:${axis}`);
  };

  /** The kinds, as the palette draws them, each with what it is for. */
  const paletteActors: PaletteActor[] = actorOptions.map(([name, path]) => ({
    name,
    path,
    picture: pictureOf(path),
    purpose: purposeOf(files[`${path}.actor`]),
  }));

  return (
    <div className={styles.editor}>
      <div className={styles.picker}>
        <PlaceHeading fileId={fileId} isReadOnly={isReadOnly} />
        <div className={`${styles.sizeField} ${fields.narrow}`}>
          <TextField
            name="map-width"
            label="Width"
            inputType="number"
            size="s"
            min={MIN_MAP_TILES}
            max={MAX_MAP_TILES}
            step={1}
            value={map.size.width}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              resize('width', event.target.value)
            }
          />
        </div>
        <div className={`${styles.sizeField} ${fields.narrow}`}>
          <TextField
            name="map-height"
            label="Height"
            inputType="number"
            size="s"
            min={MIN_MAP_TILES}
            max={MAX_MAP_TILES}
            step={1}
            value={map.size.height}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              resize('height', event.target.value)
            }
          />
        </div>
        <Typography
          variant="body4"
          component="span"
          className={styles.sizeUnit}
        >
          tiles
        </Typography>
        {!isReadOnly && (
          <div className={styles.history}>
            <IconButton
              size="small"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              disabled={!history.past.length}
              onClick={undoEdit}
            >
              <FontAwesomeV6Icon iconName="rotate-left" iconStyle="solid" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              disabled={!history.future.length}
              onClick={redoEdit}
            >
              <FontAwesomeV6Icon iconName="rotate-right" iconStyle="solid" />
            </IconButton>
          </div>
        )}
        {/*
          WHAT IS NOT HERE: whether the map covers what is under it, and what it
          is painted out of. Both were, beside the sizes — and neither is about
          where things are, which is what this strip is for. They are properties
          of the map, so they are in the inspector with nothing selected, where a
          reader already looks for properties (`MapInspector`, `ThemeField`).

          The width and the height stay. They are the frame you are drawing
          inside rather than a property of the finished thing, and they are
          adjusted while looking at the canvas.
        */}
      </div>
      <div className={styles.body}>
        <ActorPalette
          // A screen holds an interface, a map a game; either tab is a
          // press away.
          key={document.scriptKind === 'screen' ? 'interface' : 'game'}
          startTab={document.scriptKind === 'screen' ? 'interface' : 'game'}
          actors={paletteActors}
          selected={selected}
          // Entering place mode clears any placed-actor selection — the
          // stage does that itself, since that selection is its state.
          onSelect={setSelected}
          onOpen={openKind}
          onDelete={deleteKind}
          onNew={newActor}
          newWithheld={withheld.has('map-new-actor')}
          isReadOnly={isReadOnly}
          onDragOut={setIncoming}
        />
        <MapStage
          incoming={incoming}
          onPicture={isReadOnly ? undefined : keepPicture}
          doc={map}
          onDocChange={commit}
          onDocPreview={setLiveMap}
          placing={selected}
          thumbnails={thumbnails}
          pictures={shown.pictures}
          schemas={shownSchemas}
          themeOptions={themeOptions}
          pictureChoices={pictureChoices}
          sizes={shown.sizes}
          placementSizes={shown.placementSizes}
          scales={scales}
          isReadOnly={isReadOnly}
          visible={visible}
          onUndo={undoEdit}
          onRedo={redoEdit}
          // A Screen's placements dock; a level's do not
          // (specs/DOCKING_PLAN.md).
          canDock={(filePath(currentSources.source, fileId) ?? '').endsWith(
            '.screen',
          )}
          onEditScript={id => {
            if (id !== undefined) {
              setScript({kind: 'placement', id});
            } else if (document.hasMapScript) {
              setScript({kind: 'map'});
            } else {
              onOpenMapScript?.();
            }
          }}
          withheld={withheld}
          appBuilder={appBuilder}
          eventsFor={eventsFor}
          kinds={kinds}
          onEnhanceKind={enhanceKind}
          onOpenKind={openKind}
          mapScriptLabel={
            document.scriptKind === 'screen'
              ? 'Screen code'
              : document.hasMapScript
                ? 'Map code'
                : 'World code'
          }
          world={worldInspector}
          worldCameras={worldCameraList}
          worldCameraEditor={worldCameraEditor}
          cameraChoices={cameraChoices}
          mapChoices={mapChoices}
          heldMaps={heldMaps}
          backgroundChoices={backgroundChoices}
          backgroundImages={images}
        />
      </div>
    </div>
  );
};

export default MapEditor;

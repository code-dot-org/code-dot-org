// Scenes from section-mates' projects: the go-to-external-scene block's
// list, and running one of their scenes on this lab's engine (apps'
// SpriteLab2View, "External scenes").
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {setExternalSceneRefreshHandler} from '../blockly/externalSceneDropdown';
import type {SpriteLabEngine} from '../engine';
import {collectImageReferences} from '../imageReferences';
import {migrateScenes} from '../migrateSources';
import {setAnimationList} from '../redux/animationListSlice';
import {
  type ExternalSceneOption,
  type SceneMetadata,
  setExternalScenes,
  setScenes,
} from '../redux/spriteLab2Redux';
import store, {useAppDispatch} from '../redux/store';
import {
  collectSavedExternalKeys,
  type ExternalProject,
  fetchExternalProject,
  fetchSectionScenes,
  parseExternalSceneKey,
  toExternalSceneOptions,
} from '../scenesApi';
import type {Scene} from '../types';
import {compileWorldPrelude} from '../world';

// How long loading the lab waits for the list before using placeholders.
export const LIST_FETCH_TIMEOUT_MS = 5000;

/** Keeps a saved key the list no longer offers, so its block keeps it. */
function withUnavailable(
  options: ExternalSceneOption[],
  savedKeys: string[],
): ExternalSceneOption[] {
  const known = new Set(options.map(o => o.key));
  return [
    ...options,
    ...savedKeys
      .filter(key => !known.has(key))
      .map(key => ({key, label: `(unavailable) #${key.slice(0, 10)}`})),
  ];
}

interface ExternalSceneListOptions {
  levelId: number | string | undefined;
  scriptId: number | null | undefined;
  /** The project's scenes, whose saved keys the list must keep. */
  scenes: Scene[];
}

/**
 * Keeps the store's list of external scenes. Returns whether a workspace
 * may load: not before the list, if a saved block names one of its scenes.
 */
export function useExternalSceneList({
  levelId,
  scriptId,
  scenes,
}: ExternalSceneListOptions): boolean {
  const dispatch = useAppDispatch();
  // Read, not followed: an edit must not cancel the first fetch.
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;

  // The workspace validates saved values against the list as it loads, so
  // it waits for the list when a saved block names an external scene.
  const [listReady, setListReady] = useState(false);
  useEffect(() => {
    if (levelId === undefined) {
      return;
    }
    let cancelled = false;
    const savedKeys = collectSavedExternalKeys(scenesRef.current);
    const fetching = fetchSectionScenes(levelId, scriptId)
      .then(toExternalSceneOptions)
      .catch(error => {
        console.warn('section scenes unavailable', error);
        return [];
      });
    if (savedKeys.length === 0) {
      setListReady(true);
      // Nothing waits, so a slow answer is used whenever it lands.
      fetching.then(options => {
        if (!cancelled) {
          dispatch(setExternalScenes(options));
        }
      });
    } else {
      setListReady(false);
      const timeout = new Promise<ExternalSceneOption[]>(resolve =>
        window.setTimeout(() => resolve([]), LIST_FETCH_TIMEOUT_MS),
      );
      Promise.race([fetching, timeout]).then(options => {
        if (!cancelled) {
          dispatch(setExternalScenes(withUnavailable(options, savedKeys)));
          setListReady(true);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [levelId, scriptId, dispatch]);

  // Each open of the dropdown asks again, so scenes section-mates add while
  // the lab is open appear.
  useEffect(() => {
    if (levelId === undefined) {
      return;
    }
    setExternalSceneRefreshHandler(async () => {
      const refs = await fetchSectionScenes(levelId, scriptId);
      dispatch(
        setExternalScenes(
          withUnavailable(
            toExternalSceneOptions(refs),
            collectSavedExternalKeys(scenes),
          ),
        ),
      );
    });
    return () => setExternalSceneRefreshHandler(null);
  }, [levelId, scriptId, scenes, dispatch]);

  return listReady;
}

interface ExternalSceneRunOptions {
  engineRef: RefObject<SpriteLabEngine | null>;
  levelId: number | string | undefined;
  scriptId: number | null | undefined;
  /** This project's scene list, to restore after compiling another's. */
  sceneMetadata: SceneMetadata[];
  /** Compiles a saved workspace; its blocks must be registered. */
  compile: (scene: Scene) => string;
  /** Told of each external run, once the engine has it. */
  onRun: () => void;
}

/** Runs scenes of section-mates' projects. */
export function useExternalSceneRuns({
  engineRef,
  levelId,
  scriptId,
  sceneMetadata,
  compile,
  onRun,
}: ExternalSceneRunOptions) {
  const dispatch = useAppDispatch();

  // The external scene on stage, if one is; its project's go-to-scene
  // blocks resolve against it.
  const current = useRef<{project: ExternalProject; sceneId: string} | null>(
    null,
  );
  const lastLoaded = useRef(new Map<string, ExternalProject>());
  const [loading, setLoading] = useState(false);

  // Its dropdowns validate against the store as its blocks load, so its
  // images and scenes join the store for the compile and leave after. The
  // raw action, not the seeding thunk, which would fetch every image; and
  // the captured state goes back, so selectors see no change.
  const compileExternal = useCallback(
    (scene: Scene, project: ExternalProject) => {
      const ours = store.getState().animationList;
      const theirs = project.animations;
      dispatch(
        setAnimationList({
          orderedKeys: [
            ...ours.orderedKeys,
            ...(theirs.orderedKeys || []).filter(k => !ours.propsByKey[k]),
          ],
          propsByKey: {...(theirs.propsByKey || {}), ...ours.propsByKey},
        }),
      );
      // The project may be this one, jumped back into; ids must stay unique.
      const known = new Set(sceneMetadata.map(s => s.id));
      dispatch(
        setScenes([
          ...sceneMetadata,
          ...project.scenes
            .filter(s => !known.has(s.id))
            .map(s => ({id: s.id, name: s.name})),
        ]),
      );
      try {
        return compile(scene);
      } finally {
        dispatch(setAnimationList(ours));
        dispatch(setScenes(sceneMetadata));
      }
    },
    [dispatch, sceneMetadata, compile],
  );

  const runProjectScene = useCallback(
    (project: ExternalProject, sceneId: string) => {
      const engine = engineRef.current;
      const scene = project.scenes.find(s => s.id === sceneId);
      if (!engine || !scene) {
        engine?.cancelSceneJump();
        return;
      }
      current.current = {project, sceneId};
      // Its world keeps the size its project gave it.
      const {result, referencedImages} = collectImageReferences(() => {
        let code = '';
        try {
          code = compileExternal(scene, project);
        } catch (error) {
          console.error('Failed to compile external scene', sceneId, error);
        }
        return compileWorldPrelude(scene.world) + code;
      });
      // Saved images carry a sourceUrl; the engine loads a URL as it would
      // a data URI.
      const theirs = project.animations;
      engine.preloadAnimationsOverride = {
        orderedKeys: theirs.orderedKeys || [],
        propsByKey: Object.fromEntries(
          Object.entries(theirs.propsByKey || {}).map(([key, props]) => [
            key,
            {...props, dataURI: props.sourceUrl},
          ]),
        ),
      };
      engine.runProgram(result, referencedImages, scene.type);
      onRun();
    },
    [engineRef, compileExternal, onRun],
  );

  // Fetched afresh, as its owner may have changed it; the last copy is the
  // fallback when the fetch fails.
  const runScene = useCallback(
    async (key: string) => {
      const parsed = parseExternalSceneKey(key);
      if (!parsed || levelId === undefined) {
        engineRef.current?.cancelSceneJump();
        return;
      }
      setLoading(true);
      let project: ExternalProject | undefined;
      try {
        project = await fetchExternalProject(parsed.channel, levelId, scriptId);
        migrateScenes(project.scenes);
        lastLoaded.current.set(parsed.channel, project);
      } catch (error) {
        project = lastLoaded.current.get(parsed.channel);
        if (!project) {
          console.error('Failed to load external scene', key, error);
          engineRef.current?.cancelSceneJump();
          return;
        }
        console.warn('Using last-loaded copy of external scene', key, error);
      } finally {
        setLoading(false);
      }
      runProjectScene(project, parsed.sceneId);
    },
    [engineRef, levelId, scriptId, runProjectScene],
  );

  /** Called on a run of this project's own scene. */
  const leave = useCallback(() => {
    current.current = null;
    if (engineRef.current) {
      engineRef.current.preloadAnimationsOverride = null;
    }
  }, [engineRef]);

  return useMemo(
    () => ({loading, current, runScene, runProjectScene, leave}),
    [loading, runScene, runProjectScene, leave],
  );
}

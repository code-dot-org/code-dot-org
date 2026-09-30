// Sprite Lab's lab view: the tab shell, the Code tab's workspace, the
// scenes, and the playspace the engine draws in. Ported from apps'
// SpriteLab2View; what it does not yet carry is listed in
// docs/port-plan.md (layer 5).
import {isEqual} from 'lodash';
import {
  type FunctionComponent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {BlocklyWorkspace} from '@code-dot-org/blockly';
import type {BlocklySerialization} from '@code-dot-org/blockly';
import {useLevelProperties, useSources} from '@code-dot-org/lab/contexts';

import {isImageAdlibSet} from '../ai/images/imageAdlibs';
import {refreshSceneDropdowns} from '../blockly/blockDefinitions/goToScene';
import {compileSerializedWorkspace} from '../blockly/compile';
import {SpriteLabConnectionChecker} from '../blockly/connectionChecker';
import {refreshAnimationDropdownThumbnails} from '../blockly/imagePickerFields';
import {setImageSource} from '../blockly/imageSource';
import {levelPool, type PoolBlock} from '../blockly/pool';
import {SPRITELAB2_BLOCKS} from '../blockly/setup';
import defaultSources from '../defaultSources.json';
import {animationSourceUrl} from '../engine/animations';
import {SpriteLabEngine} from '../engine/Engine';
import {imageTypeFromCategories} from '../imageGallery';
import {
  collectImageReferences,
  removeImageReferences,
  removeImageReferencesOnWorkspace,
  renameImageReferences,
  renameImageReferencesOnWorkspace,
} from '../imageReferences';
import {defaultImageName} from '../imageRoleDefaults';
import {onTrimsUpdated} from '../imageTrim';
import {
  adlibSetForMode,
  DEFAULT_IMAGE_STYLE,
  isFreeplayMode,
  tabsForMode,
} from '../levelMode';
import {migrateBlockTypes, migrateScenes} from '../migrateSources';
import {projectImageUploader} from '../projectAssets';
import {
  allAnimationsLoaded,
  isNameUnique,
  serializeAnimationList,
  setAnimationName,
} from '../redux/animationListSlice';
import {seedAnimationList} from '../redux/animationListThunks';
import {
  resetSpriteLab2,
  setActiveTab,
  setScenes,
  type Tab,
} from '../redux/spriteLab2Redux';
import store, {useAppDispatch, useAppSelector} from '../redux/store';
import {sceneMetadataFor} from '../sceneThumbnails';
import {toolboxForSceneType} from '../sceneToolbox';
import type {Scene, SpriteLab2LevelProperties, Sources} from '../types';
import {
  compileWorldPrelude,
  DEFAULT_SCENE_GRID_SIZE,
  moveWorldCell,
  paintWorldCell,
  resizeWorld,
  sceneGridSize,
  type World,
  type WorldCell,
} from '../world';

import {isPointerClick} from './blurAfterPointerClick';
import PlayBar from './components/PlayBar';
import PlayControls from './components/PlayControls';
import TabShell from './components/TabShell';
import GenerateImagePane from './GenerateImagePane';
import {type ArrowSet, arrowSetFor} from './playBar';
import Playspace, {type PlayspaceMode} from './Playspace';
import SceneSelector from './SceneSelector';
import ScenesGallery from './ScenesGallery';
import {useExternalSceneList, useExternalSceneRuns} from './useExternalScenes';
import useSceneEditing from './useSceneEditing';
import useSceneThumbnails from './useSceneThumbnails';
import useSpriteLabWorkspace from './useSpriteLabWorkspace';
import WorldTab from './WorldTab';

import moduleStyles from './sprite-lab2-view.module.scss';

const TABS: readonly Tab[] = ['Images', 'Code', 'Play'];
// ?world-tab=true, for a level whose mode does not name the tab.
const WORLD_TABS: readonly Tab[] = ['Images', 'World', 'Code', 'Play'];
const READY_TABS: readonly Tab[] = ['Images', 'World', 'Code', 'Play'];

const DEFAULT_SCENE_SOURCE = defaultSources.source as BlocklySerialization;

const LAB_BLOCK_TYPES = SPRITELAB2_BLOCKS.map(block => block.type);

const WORKSPACE_OPTIONS = {
  trashcan: true,
  plugins: {connectionChecker: SpriteLabConnectionChecker},
};
const DEFAULT_SCENE_ID = 'scene-1';

// Between a workspace edit and the live preview's re-run.
const RUN_DEBOUNCE_MS = 400;
// How long runs wait for the project's images before going ahead without
// the ones still loading.
const IMAGE_LOAD_GRACE_MS = 10000;

// Focused controls own the game keys pressed on them.
const INTERACTIVE_CONTROLS = 'button, a, input, select, textarea';
// The keys a game typically reads; p5 listens for them on window.
const GAME_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ' ',
  'Spacebar',
]);

const START_OVER_MESSAGE =
  "This deletes your blocks and your images. You can't undo it.";

// Saved sources are migrated in place as they are read; the next save
// persists the result.
function getScenes(sources: Sources): Scene[] {
  if (sources.scenes?.length) {
    migrateScenes(sources.scenes);
    return sources.scenes;
  }
  // A project saved before scenes: its source is the one scene.
  migrateBlockTypes(sources.source);
  return [
    {
      id: DEFAULT_SCENE_ID,
      name: 'Scene 1',
      source: (sources.source ?? DEFAULT_SCENE_SOURCE) as BlocklySerialization,
    },
  ];
}

function worldFor(scene?: Scene) {
  return resizeWorld(scene?.world, DEFAULT_SCENE_GRID_SIZE);
}

const SpriteLabView: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const levelProperties = useLevelProperties<SpriteLab2LevelProperties>();
  const {
    currentSources: rawSources,
    updateSources: saveSources,
    showStartOverDialog,
    sourcesEpoch,
  } = useSources<BlocklySerialization>();
  const currentSources = rawSources as Sources;
  const channelId = useAppSelector(state => state.lab.channel?.id);

  // Apps' updateSources took an update function; this one takes the next
  // sources. The ref keeps back-to-back updates from reading stale ones.
  const sourcesRef = useRef(currentSources);
  sourcesRef.current = currentSources;
  const updateSources = useCallback(
    (update: (prev: Sources) => Sources) => {
      const next = update(sourcesRef.current);
      if (next !== sourcesRef.current) {
        sourcesRef.current = next;
        saveSources(next);
      }
    },
    [saveSources],
  );

  const activeTab = useAppSelector(state => state.spriteLab2.activeTab);
  const animationList = useAppSelector(state => state.animationList);
  const worldTabParam = useMemo(
    () =>
      new URLSearchParams(window.location.search).get('world-tab') === 'true',
    [],
  );
  // ?image-adlibs=<set> previews an adlib set without a level change;
  // ?image-free-text=true brings back the typed prompt; ?images-advanced=true
  // shows the levelbuilder's image controls.
  const imageParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const adlibSet = params.get('image-adlibs');
    return {
      adlibSet: isImageAdlibSet(adlibSet) ? adlibSet : undefined,
      freeText: params.get('image-free-text') === 'true',
      advanced: params.get('images-advanced') === 'true',
    };
  }, []);
  const tabs = useMemo(
    () =>
      tabsForMode(levelProperties.levelMode) ??
      (worldTabParam ? WORLD_TABS : TABS),
    [levelProperties.levelMode, worldTabParam],
  );
  // Play is entered from the bar under the playspace.
  const visibleTabs = useMemo(() => tabs.filter(tab => tab !== 'Play'), [tabs]);

  // Once per level: the image list, from the sources the level loaded with.
  const [imagesSeeded, setImagesSeeded] = useState(false);
  const seededLevel = useRef<unknown>(null);
  useEffect(() => {
    if (seededLevel.current === levelProperties.id) {
      return;
    }
    seededLevel.current = levelProperties.id;
    dispatch(seedAnimationList(currentSources.animations, {channelId}));
    setImagesSeeded(true);
    // Only the level identity reseeds; see the reinitialization effect.
  }, [levelProperties.id, currentSources.animations, channelId, dispatch]);

  // Start Over and restored versions replace the sources: reseed from them.
  const seededEpoch = useRef(sourcesEpoch);
  useEffect(() => {
    if (sourcesEpoch === seededEpoch.current) {
      return;
    }
    seededEpoch.current = sourcesEpoch;
    dispatch(seedAnimationList(currentSources.animations, {channelId}));
  }, [sourcesEpoch, currentSources.animations, channelId, dispatch]);

  // Runs wait for the images, as apps' engine did, but not forever; a run
  // made without some reruns once they arrive (below).
  const imagesLoaded = imagesSeeded && allAnimationsLoaded(animationList);
  const [graceOver, setGraceOver] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setGraceOver(true),
      IMAGE_LOAD_GRACE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [levelProperties.id, sourcesEpoch]);
  const imagesReady = imagesLoaded || (imagesSeeded && graceOver);

  // The pickers read the images from the store.
  useEffect(() => {
    setImageSource({
      animationList: () => store.getState().animationList,
      imageUrl: (key, props) => animationSourceUrl(key, props, channelId),
    });
    return () => setImageSource(null);
  }, [channelId]);
  useEffect(() => onTrimsUpdated(refreshAnimationDropdownThumbnails), []);

  // Image changes are saved in the serialized shape.
  useEffect(() => {
    if (!imagesSeeded) {
      return;
    }
    const animations = serializeAnimationList(animationList);
    if (!isEqual(animations, sourcesRef.current.animations)) {
      updateSources(prev => ({...prev, animations}));
    }
  }, [animationList, imagesSeeded, updateSources]);

  const scenes = useMemo(() => getScenes(currentSources), [currentSources]);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const externalListReady = useExternalSceneList({
    levelId: levelProperties.id,
    scriptId,
    scenes,
  });
  // A workspace loads once the values its dropdowns check are in the store.
  const seeded = imagesSeeded && externalListReady;

  // The Images tab mounts once, when first visited or when the page is next
  // idle after seeding, and then stays mounted behind a clip.
  const [imagesMounted, setImagesMounted] = useState(false);
  useEffect(() => {
    if (activeTab === 'Images') {
      setImagesMounted(true);
    }
  }, [activeTab]);
  useEffect(() => {
    if (!seeded || imagesMounted) {
      return;
    }
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => setImagesMounted(true), {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(() => setImagesMounted(true), 1500);
    return () => window.clearTimeout(handle);
  }, [seeded, imagesMounted]);
  const pinnedScene = levelProperties.pinnedScene;
  const pinnedSceneId = pinnedScene?.id;
  // The pinned scene is made on first load and again after Start Over.
  useEffect(() => {
    if (!pinnedScene) {
      return;
    }
    updateSources(prev => {
      if (prev.scenes?.some(s => s.id === pinnedScene.id)) {
        return prev;
      }
      const pinned: Scene = {
        id: pinnedScene.id,
        name: pinnedScene.name || 'Scene',
        type: pinnedScene.type,
        source: DEFAULT_SCENE_SOURCE,
      };
      // On a scene-less project the pin becomes the only scene.
      const existing =
        prev.scenes?.length ||
        (prev.source && !isEqual(prev.source, DEFAULT_SCENE_SOURCE))
          ? getScenes(prev)
          : [];
      return {...prev, scenes: [...existing, pinned]};
    });
  }, [pinnedScene, updateSources, sourcesEpoch]);

  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    () => pinnedSceneId ?? scenes[0].id,
  );
  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0];
  // A world is a platformer's floor plan: a story scene has none to edit.
  const enabledTabs = useMemo(
    () =>
      tabs.filter(
        tab =>
          READY_TABS.includes(tab) &&
          !(tab === 'World' && activeScene?.type === 'story'),
      ),
    [tabs, activeScene?.type],
  );
  useEffect(() => {
    if (activeTab !== 'Scenes' && !enabledTabs.includes(activeTab)) {
      dispatch(
        setActiveTab(enabledTabs.includes('Code') ? 'Code' : enabledTabs[0]),
      );
    }
  }, [activeTab, enabledTabs, dispatch]);
  useEffect(() => {
    if (pinnedSceneId) {
      if (
        activeSceneId !== pinnedSceneId &&
        scenes.some(s => s.id === pinnedSceneId)
      ) {
        setActiveSceneId(pinnedSceneId);
      }
      return;
    }
    if (!scenes.some(s => s.id === activeSceneId)) {
      setActiveSceneId(scenes[0].id);
    }
  }, [scenes, activeSceneId, pinnedSceneId]);

  const sceneMetadata = useMemo(
    () => sceneMetadataFor(scenes, animationList),
    [scenes, animationList],
  );
  useEffect(() => {
    dispatch(setScenes(sceneMetadata));
    refreshSceneDropdowns();
  }, [sceneMetadata, dispatch]);
  useEffect(
    () => () => {
      dispatch(resetSpriteLab2());
    },
    [levelProperties.id, dispatch],
  );

  const defaultPlaySceneId = pinnedSceneId ?? scenes[0]?.id ?? null;

  const sceneToolbox = useMemo(
    () =>
      toolboxForSceneType(levelProperties.toolboxDefinition, activeScene?.type),
    [levelProperties.toolboxDefinition, activeScene?.type],
  );
  const sharedBlocks = levelProperties.sharedBlocks as PoolBlock[] | undefined;
  const blockTypes = useMemo(
    () => [
      ...LAB_BLOCK_TYPES,
      ...levelPool(sharedBlocks).definitions.map(block => block.type),
    ],
    [sharedBlocks],
  );
  const workspace = useSpriteLabWorkspace(sceneToolbox, blockTypes);
  const {
    workspaceVersion,
    getCode,
    getCurrentBlocks,
    loadCode,
    subscribeToChanges,
  } = workspace;

  // The engine, once per level, drawing into the playspace.
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SpriteLabEngine | null>(null);
  const getDefaultSpriteSize = useCallback(
    () => engineRef.current?.library?.defaultSpriteSize || 100,
    [],
  );
  const [engineReady, setEngineReady] = useState(false);
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) {
      return;
    }
    let cancelled = false;
    const engine = new SpriteLabEngine({
      container,
      images: () => store.getState().animationList,
    });
    engine
      .initForLevel({
        helperLibraries: levelProperties.helperLibraries,
        // Pool entries arrive in apps' format, carrying their helper code;
        // the converter (port-plan decision 5) will type them.
        sharedBlocks: levelProperties.sharedBlocks as
          | {helperCode?: string}[]
          | undefined,
        customHelperLibrary: (levelProperties as {customHelperLibrary?: string})
          .customHelperLibrary,
      })
      .then(() => {
        if (cancelled) {
          return;
        }
        engineRef.current = engine;
        setEngineReady(true);
      });
    return () => {
      cancelled = true;
      setEngineReady(false);
      engine.destroy();
      engineRef.current = null;
    };
  }, [levelProperties]);

  // Run callbacks read the active scene through refs, so edits do not
  // churn their identities.
  const activeSceneRef = useRef(activeScene);
  activeSceneRef.current = activeScene;
  const [playingPlatformer, setPlayingPlatformer] = useState(false);

  const uploadImage = useMemo(
    () => (channelId ? projectImageUploader(channelId) : undefined),
    [channelId],
  );
  const requestThumbnail = useSceneThumbnails({
    engineRef,
    scenes,
    channelId,
    uploadImage,
    updateSources,
    getScenes,
    enabled: true,
  });

  const {
    loading: externalLoading,
    current: externalOnStage,
    runScene: runExternalScene,
    runProjectScene: runExternalProjectScene,
    leave: leaveExternal,
  } = useExternalSceneRuns({
    engineRef,
    levelId: levelProperties.id,
    scriptId,
    sceneMetadata,
    compile: useCallback(
      (scene: Scene) =>
        compileSerializedWorkspace(scene.source ?? DEFAULT_SCENE_SOURCE),
      [],
    ),
    onRun: useCallback(
      () => setPlayingPlatformer(!!engineRef.current?.isPlatformScene()),
      [],
    ),
  });

  const startRun = useCallback(
    (program: () => string, scene: Scene | undefined) => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }
      if (scene) {
        requestThumbnail(scene.id);
      }
      const sceneType = scene?.type;
      leaveExternal();
      const {result, referencedImages} = collectImageReferences(program);
      engine.runProgram(result, referencedImages, sceneType);
      setPlayingPlatformer(engine.isPlatformScene());
    },
    [requestThumbnail, leaveExternal],
  );

  // The live preview of the scene being edited.
  const runProgram = useCallback(() => {
    const scene = activeSceneRef.current;
    startRun(
      () => compileWorldPrelude(worldFor(scene)) + (getCode() ?? ''),
      scene,
    );
  }, [getCode, startRun]);

  const runTimer = useRef<number | undefined>(undefined);
  const scheduleRun = useCallback(() => {
    window.clearTimeout(runTimer.current);
    runTimer.current = window.setTimeout(runProgram, RUN_DEBOUNCE_MS);
  }, [runProgram]);
  useEffect(() => () => window.clearTimeout(runTimer.current), []);

  // A rename reaches every reference, in all scenes, the World grids and
  // the open workspace, so tidying a name never breaks the project.
  const handleRenameImage = useCallback(
    (oldName: string, newName: string): string | null => {
      if (!newName) {
        return 'Enter a name.';
      }
      const list = store.getState().animationList;
      if (!isNameUnique(newName, list)) {
        return 'That name is already used.';
      }
      const key = list.orderedKeys.find(
        k => list.propsByKey[k]?.name === oldName,
      );
      if (!key) {
        return 'Image not found.';
      }
      dispatch(setAnimationName({key, name: newName}));
      updateSources(prev => renameImageReferences(prev, oldName, newName));
      renameImageReferencesOnWorkspace(
        workspace.workspaceProps.workspaceRef.current,
        oldName,
        newName,
      );
      refreshAnimationDropdownThumbnails();
      scheduleRun();
      return null;
    },
    [
      dispatch,
      updateSources,
      workspace.workspaceProps.workspaceRef,
      scheduleRun,
    ],
  );

  const handleDeleteImage = useCallback(
    (name: string) => {
      updateSources(prev => removeImageReferences(prev, name));
      removeImageReferencesOnWorkspace(
        workspace.workspaceProps.workspaceRef.current,
        name,
      );
      refreshAnimationDropdownThumbnails();
      scheduleRun();
    },
    [updateSources, workspace.workspaceProps.workspaceRef, scheduleRun],
  );

  // The scene on stage now, through any jumps, for Restart scene.
  const currentPlayingRef = useRef<Scene | null>(null);

  // The open scene compiles from the live workspace, others from their
  // saved sources.
  const runLocalScene = useCallback(
    (scene: Scene) => {
      currentPlayingRef.current = scene;
      startRun(() => {
        let code = '';
        try {
          const live =
            scene.id === activeSceneRef.current?.id ? getCode() : null;
          code =
            live ??
            compileSerializedWorkspace(scene.source ?? DEFAULT_SCENE_SOURCE);
        } catch (error) {
          // A scene that fails to compile runs empty, rather than stopping
          // the jump.
          console.error('Failed to compile scene', scene.id, error);
        }
        return compileWorldPrelude(worldFor(scene)) + code;
      }, scene);
    },
    [getCode, startRun],
  );

  const runScene = useCallback(
    (sceneId: string | null) => {
      const scene = scenes.find(s => s.id === sceneId);
      if (!scene) {
        // A jump to an unknown scene resumes the old one.
        engineRef.current?.cancelSceneJump();
        return;
      }
      runLocalScene(scene);
    },
    [scenes, runLocalScene],
  );

  // Scene jumps navigate only while playing: in the preview a go-to-scene
  // block would pull the editor off the scene being edited.
  const isPlayingRef = useRef(activeTab === 'Play');
  isPlayingRef.current = activeTab === 'Play';
  const restartSceneRef = useRef<() => void>(() => {});
  const [jumpCover, setJumpCover] = useState(false);
  const [fadeTrigger, setFadeTrigger] = useState(0);
  const [arrowSet, setArrowSet] = useState<ArrowSet>('steer');
  useEffect(() => {
    const engine = engineRef.current;
    if (!engineReady || !engine) {
      return;
    }
    engine.onGoToScene = sceneId => {
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      if (scenes.some(s => s.id === sceneId)) {
        // Leaving Play lands on the scene that was just playing.
        setActiveSceneId(sceneId);
        runScene(sceneId);
        return;
      }
      const project = externalOnStage.current?.project;
      if (project?.scenes.some(s => s.id === sceneId)) {
        runExternalProjectScene(project, sceneId);
        return;
      }
      // An unknown scene resumes the old one.
      engine.cancelSceneJump();
    };
    engine.onGoToExternalScene = key => {
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      runExternalScene(key);
    };
    engine.onRestartScene = () => {
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      restartSceneRef.current();
    };
    engine.onSceneJumpStart = () => {
      if (isPlayingRef.current) {
        setJumpCover(true);
      }
    };
    engine.onSceneJumpLand = () => {
      setFadeTrigger(t => t + 1);
      setJumpCover(false);
    };
    engine.onSceneJumpCancel = () => setJumpCover(false);
    engine.onControlsChange = state => setArrowSet(arrowSetFor(state));
  }, [
    engineReady,
    scenes,
    runScene,
    externalOnStage,
    runExternalScene,
    runExternalProjectScene,
  ]);

  // The workspace follows the active scene; a fresh workspace is empty
  // whatever caused it.
  useEffect(() => {
    if (!seeded || !workspaceVersion) {
      return;
    }
    const source = activeScene.source ?? DEFAULT_SCENE_SOURCE;
    if (isEqual(getCurrentBlocks(), source)) {
      return;
    }
    loadCode(source);
    if (engineReady && imagesReady && activeTab !== 'Play') {
      runLocalScene(activeScene);
    }
    // The tab is read, not followed: switching tabs runs scenes below.
  }, [
    seeded,
    activeScene,
    engineReady,
    imagesReady,
    getCurrentBlocks,
    loadCode,
    runLocalScene,
    workspaceVersion,
  ]);

  // A user edit: persist it into the active scene and refresh the preview.
  const handleWorkspaceChange = useCallback(
    (source: BlocklySerialization) => {
      const sceneId = activeSceneRef.current?.id;
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s =>
          s.id === sceneId ? {...s, source} : s,
        ),
      }));
      scheduleRun();
    },
    [updateSources, scheduleRun],
  );
  useEffect(
    () => subscribeToChanges(handleWorkspaceChange, scheduleRun),
    [subscribeToChanges, handleWorkspaceChange, scheduleRun],
  );

  const sceneEditing = useSceneEditing({
    scenes,
    activeSceneId,
    setActiveSceneId,
    activeTab,
    channelId,
    updateSources,
    getScenes,
  });

  // The World tab mounts on first visit and stays mounted, clipped:
  // inserting its grid costs far more than showing it.
  const worldTabEnabled = tabs.includes('World');
  const [worldMounted, setWorldMounted] = useState(false);
  useEffect(() => {
    if (activeTab === 'World') {
      setWorldMounted(true);
    }
  }, [activeTab]);
  const activeWorld = worldFor(activeScene);

  // The palette selection lives here so it survives leaving the tab. Only
  // a choice the student made holds against the level's default.
  const [worldPaletteSelection, setWorldPaletteSelection] = useState<
    WorldCell | 'erase' | null
  >(null);
  const paletteChosenByStudent = useRef(false);
  const choosePaletteSelection = useCallback(
    (selection: WorldCell | 'erase') => {
      paletteChosenByStudent.current = true;
      setWorldPaletteSelection(selection);
    },
    [],
  );
  // The level's image of its kind: the image_role_defaults role first, else
  // the newest of the kind (new images go first in the list).
  const focusImageType = levelProperties.levelMode?.imageType;
  const imageRoleDefaults = levelProperties.imageRoleDefaults;
  const focusImageName = useMemo(() => {
    if (!focusImageType || focusImageType === 'background') {
      return undefined;
    }
    const newest = animationList.orderedKeys.find(
      key =>
        imageTypeFromCategories(animationList.propsByKey[key]?.categories) ===
        focusImageType,
    );
    return (
      defaultImageName(animationList, imageRoleDefaults, focusImageType) ??
      (newest ? animationList.propsByKey[newest]?.name : undefined)
    );
  }, [focusImageType, animationList, imageRoleDefaults]);
  useEffect(() => {
    if (!focusImageType || focusImageType === 'background') {
      return;
    }
    const names = new Set(
      animationList.orderedKeys.map(key => animationList.propsByKey[key]?.name),
    );
    const live =
      worldPaletteSelection === 'erase' ||
      (worldPaletteSelection && names.has(worldPaletteSelection.image));
    if (live && paletteChosenByStudent.current) {
      return;
    }
    const current =
      worldPaletteSelection === 'erase' ? null : worldPaletteSelection?.image;
    if ((focusImageName ?? null) === (current ?? null)) {
      return;
    }
    setWorldPaletteSelection(
      focusImageName ? {image: focusImageName, kind: focusImageType} : null,
    );
  }, [worldPaletteSelection, focusImageType, focusImageName, animationList]);

  // World edits apply against the saved sources, so rapid ones cannot
  // overwrite each other, and refresh the preview.
  const updateActiveWorld = useCallback(
    (update: (world: World) => World) => {
      const sceneId = activeSceneRef.current?.id;
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s =>
          s.id === sceneId ? {...s, world: update(worldFor(s))} : s,
        ),
      }));
      scheduleRun();
    },
    [updateSources, scheduleRun],
  );
  const handlePaintWorldCell = useCallback(
    (row: number, col: number, cell: WorldCell | null) =>
      updateActiveWorld(world => paintWorldCell(world, row, col, cell)),
    [updateActiveWorld],
  );
  const handleMoveWorldCell = useCallback(
    (row: number, col: number, cell: WorldCell) =>
      updateActiveWorld(world => moveWorldCell(world, row, col, cell)),
    [updateActiveWorld],
  );
  const placeOne = !!levelProperties.levelMode?.placeOne;
  const paletteOnlyImage =
    levelProperties.levelMode?.kind === 'world' ? focusImageName : undefined;

  // The scene Play starts from: null is the beginning.
  const [playStartSceneId, setPlayStartSceneId] = useState<string | null>(null);

  // Play (re)starts at the chosen scene; returning to Code previews the
  // scene being edited. The first run waits for the engine.
  const prevTab = useRef<Tab | null>(null);
  useEffect(() => {
    if (!engineReady || !workspaceVersion || !imagesReady) {
      return;
    }
    const previous = prevTab.current;
    prevTab.current = activeTab;
    if (previous === activeTab) {
      return;
    }
    if (activeTab === 'Play') {
      runScene(playStartSceneId ?? defaultPlaySceneId);
    } else if (activeTab === 'Code' || previous === null) {
      runScene(activeSceneId);
    }
  }, [
    activeTab,
    engineReady,
    workspaceVersion,
    imagesReady,
    runScene,
    activeSceneId,
    defaultPlaySceneId,
    playStartSceneId,
  ]);

  // Images that arrive after a run gave up on them: run the stage again.
  const ranWithoutImages = useRef(false);
  useEffect(() => {
    if (imagesReady && !imagesLoaded) {
      ranWithoutImages.current = true;
    } else if (imagesLoaded && ranWithoutImages.current) {
      ranWithoutImages.current = false;
      restartSceneRef.current();
    }
  }, [imagesReady, imagesLoaded]);

  // The game has the keyboard only in Play; elsewhere its keys go to the
  // editor. Stopping at document runs after Blockly's handlers and before
  // the sprite library's window listener.
  useEffect(() => {
    if (activeTab === 'Play') {
      return;
    }
    const swallow = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.key)) {
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', swallow);
    document.addEventListener('keyup', swallow);
    return () => {
      document.removeEventListener('keydown', swallow);
      document.removeEventListener('keyup', swallow);
    };
  }, [activeTab]);
  // A game key aimed at a focused control belongs to the control.
  useEffect(() => {
    const swallowOnControls = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (GAME_KEYS.has(e.key) && target?.closest(INTERACTIVE_CONTROLS)) {
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', swallowOnControls);
    document.addEventListener('keyup', swallowOnControls);
    return () => {
      document.removeEventListener('keydown', swallowOnControls);
      document.removeEventListener('keyup', swallowOnControls);
    };
  }, []);

  const playspaceRef = useRef<HTMLDivElement>(null);
  const focusPlayspaceRef = useRef(false);
  const handleTabChange = useCallback(
    (tab: Tab, event: MouseEvent<HTMLElement>) => {
      if (tab === 'Play') {
        setPlayStartSceneId(null);
        focusPlayspaceRef.current = !isPointerClick(event);
      }
      dispatch(setActiveTab(tab));
    },
    [dispatch],
  );
  // A play control must not keep focus, where Space would press it again:
  // a keyboard press hands focus to the playspace, a pointer press blurs.
  const handOffControlFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    if (isPointerClick(event)) {
      event.currentTarget.blur();
    } else {
      playspaceRef.current?.focus({preventScroll: true});
    }
  }, []);

  const handleRestartGame = useCallback(() => {
    setPlayStartSceneId(null);
    runScene(defaultPlaySceneId);
  }, [runScene, defaultPlaySceneId]);
  const handleRestartScene = useCallback(() => {
    const onStage = externalOnStage.current;
    if (onStage) {
      runExternalProjectScene(onStage.project, onStage.sceneId);
      return;
    }
    // By id: the scene's code may have changed since it started.
    runScene(currentPlayingRef.current?.id ?? defaultPlaySceneId);
  }, [runScene, defaultPlaySceneId, externalOnStage, runExternalProjectScene]);
  restartSceneRef.current = handleRestartScene;
  // A button restart fades as a block restart does when it lands.
  const handleRestartClick = useCallback(
    (event: MouseEvent<HTMLElement>, restart: () => void) => {
      handOffControlFocus(event);
      setFadeTrigger(trigger => trigger + 1);
      restart();
    },
    [handOffControlFocus],
  );

  // Clicking the preview opens Play on the scene being previewed.
  const handlePreviewClick = useCallback(() => {
    setPlayStartSceneId(
      activeSceneId === defaultPlaySceneId ? null : activeSceneId,
    );
    dispatch(setActiveTab('Play'));
  }, [dispatch, activeSceneId, defaultPlaySceneId]);
  const focusPlayspaceOnPlay = useRef(false);
  const handlePlayClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isPointerClick(event)) {
        event.currentTarget.blur();
      } else {
        focusPlayspaceOnPlay.current = true;
      }
      handlePreviewClick();
    },
    [handlePreviewClick],
  );
  // Stop returns to the editing tab Play was entered from.
  const [lastEditTab, setLastEditTab] = useState<Tab | null>(null);
  useEffect(() => {
    if (activeTab === 'Code' || activeTab === 'World') {
      setLastEditTab(activeTab);
    }
  }, [activeTab]);
  const stopTab =
    lastEditTab && enabledTabs.includes(lastEditTab)
      ? lastEditTab
      : enabledTabs.find(tab => tab === 'Code' || tab === 'World');
  const handleStopClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!stopTab) {
        return;
      }
      if (isPointerClick(event)) {
        event.currentTarget.blur();
      }
      dispatch(setActiveTab(stopTab));
    },
    [dispatch, stopTab],
  );

  // Code and World share the corner preview and the scene selector.
  const onSceneTab = activeTab === 'Code' || activeTab === 'World';
  const scenesEditable =
    !levelProperties.levelMode || isFreeplayMode(levelProperties.levelMode);
  const playspaceMode: PlayspaceMode =
    activeTab === 'Play' ? 'play' : onSceneTab ? 'preview' : 'hidden';

  // Hidden tabs stay mounted behind a clip, which leaves them in the tab
  // order and the accessibility tree: they are inert while hidden.
  const codeWrapperRef = useRef<HTMLDivElement>(null);
  const worldWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (codeWrapperRef.current) {
      codeWrapperRef.current.inert = activeTab !== 'Code';
    }
    if (worldWrapperRef.current) {
      worldWrapperRef.current.inert = activeTab !== 'World';
    }
  }, [activeTab, worldMounted]);

  // The game freezes while nobody can see it.
  const [documentHidden, setDocumentHidden] = useState(() => document.hidden);
  useEffect(() => {
    const onVisibility = () => setDocumentHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  useEffect(() => {
    engineRef.current?.setDrawPaused(
      playspaceMode === 'hidden' || documentHidden,
    );
  }, [playspaceMode, documentHidden, engineReady]);

  // The playspace is focusable only once Play has rendered.
  useEffect(() => {
    if (
      playspaceMode === 'play' &&
      (focusPlayspaceRef.current || focusPlayspaceOnPlay.current)
    ) {
      focusPlayspaceRef.current = false;
      focusPlayspaceOnPlay.current = false;
      playspaceRef.current?.focus({preventScroll: true});
    }
  }, [playspaceMode]);

  return (
    <div className={moduleStyles.labRow}>
      <TabShell
        activeTab={activeTab}
        onTabChange={handleTabChange}
        enabledTabs={enabledTabs}
        visibleTabs={visibleTabs}
        onClickStartOver={() =>
          showStartOverDialog('custom', START_OVER_MESSAGE)
        }
        sceneTabsExtra={
          seeded && !pinnedSceneId ? (
            <SceneSelector
              scenes={sceneMetadata}
              activeSceneId={activeSceneId}
              disabled={!onSceneTab && activeTab !== 'Scenes'}
              allowCreate={scenesEditable}
              onSelectScene={sceneEditing.selectScene}
              onCreateScene={sceneEditing.createScene}
              onManageScenes={sceneEditing.openGallery}
            />
          ) : undefined
        }
      >
        {/* Kept mounted behind a clip so the workspace survives tab
            switches. */}
        <div
          ref={codeWrapperRef}
          className={moduleStyles.codeTabWrapper}
          style={{
            clipPath: activeTab === 'Code' ? 'none' : 'inset(100%)',
            pointerEvents: activeTab === 'Code' ? 'auto' : 'none',
          }}
        >
          {seeded && (
            <BlocklyWorkspace
              key={workspace.toolboxKind ?? 'none'}
              className={moduleStyles.blocklyDiv}
              options={WORKSPACE_OPTIONS}
              {...workspace.workspaceProps}
            />
          )}
        </div>

        {/* Kept mounted behind a clip, as the Code tab is: mounting on a
            switch costs the switch its frames, and a remount loses state. */}
        {imagesMounted && (
          <div
            className={moduleStyles.codeTabWrapper}
            style={{
              clipPath: activeTab === 'Images' ? 'none' : 'inset(100%)',
              pointerEvents: activeTab === 'Images' ? 'auto' : 'none',
            }}
          >
            <div className={moduleStyles.imagesTab}>
              <GenerateImagePane
                uploadImage={uploadImage}
                onRenameImage={handleRenameImage}
                onDeleteImage={handleDeleteImage}
                lockedImageType={levelProperties.levelMode?.imageType}
                lockedImageSubject={levelProperties.levelMode?.imageSubject}
                imageRole={levelProperties.levelMode?.imageRole}
                advanced={imageParams.advanced}
                adlibSet={
                  imageParams.adlibSet ||
                  adlibSetForMode(levelProperties.levelMode)
                }
                // Words come from the adlibs unless ?image-free-text=true.
                adlibOnly={!imageParams.freeText}
                defaultStyle={DEFAULT_IMAGE_STYLE}
                paintDisabled={!isFreeplayMode(levelProperties.levelMode)}
              />
            </div>
          </div>
        )}

        {activeTab === 'Scenes' && (
          <div className={moduleStyles.codeTabWrapper}>
            <div className={moduleStyles.imagesTab}>
              <ScenesGallery
                scenes={sceneMetadata}
                activeSceneId={activeSceneId}
                editable={scenesEditable}
                onOpenScene={sceneEditing.selectScene}
                onCreateScene={sceneEditing.createScene}
                onRenameScene={sceneEditing.renameScene}
                onDeleteScene={sceneEditing.deleteScene}
                onMakeStartScene={sceneEditing.makeStartScene}
              />
            </div>
          </div>
        )}

        {worldTabEnabled && worldMounted && (
          <div
            ref={worldWrapperRef}
            className={moduleStyles.codeTabWrapper}
            style={{
              clipPath: activeTab === 'World' ? 'none' : 'inset(100%)',
              pointerEvents: activeTab === 'World' ? 'auto' : 'none',
            }}
          >
            <WorldTab
              world={activeWorld}
              sceneSize={sceneGridSize(activeWorld)}
              onPaintCell={handlePaintWorldCell}
              emptyMessage={
                visibleTabs.includes('Images')
                  ? 'Create some images on the Images tab first.'
                  : 'Go back and make your image first.'
              }
              only={paletteOnlyImage}
              onMoveCell={placeOne ? handleMoveWorldCell : undefined}
              selected={worldPaletteSelection}
              onSelect={choosePaletteSelection}
            />
          </div>
        )}

        <Playspace
          canvasContainerRef={canvasContainerRef}
          boxRef={playspaceRef}
          platformScene={playingPlatformer}
          mode={playspaceMode}
          getDefaultSpriteSize={getDefaultSpriteSize}
          controls={
            <PlayControls
              onRestartGame={
                pinnedSceneId
                  ? undefined
                  : event => handleRestartClick(event, handleRestartGame)
              }
              onRestartScene={event =>
                handleRestartClick(event, handleRestartScene)
              }
            />
          }
          playBar={
            <PlayBar
              playing={activeTab === 'Play'}
              arrows={arrowSet}
              onPlay={handlePlayClick}
              onStop={stopTab ? handleStopClick : undefined}
            />
          }
          fadeTrigger={fadeTrigger}
          covered={jumpCover}
          loading={externalLoading}
          onPreviewClick={handlePreviewClick}
        />
      </TabShell>
    </div>
  );
};

export default SpriteLabView;

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import * as BlocklyCore from 'blockly/core';
import classNames from 'classnames';
import {cloneDeep, isEqual} from 'lodash';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {AnyAction, Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {applyBlockIdOverrides} from '@cdo/apps/blockly/utils';
import {getCodeFromSerializedWorkspace} from '@cdo/apps/blockly/utils/workspace/getCode';
import {navigateToLevelId} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import {UseSourcesOutput} from '@cdo/apps/lab2/hooks/useSources';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import StartOverDialog from '@cdo/apps/lab2/views/dialogs/dsco/StartOverDialog';
// p5lab/reducers is a CommonJS bundle of all the classic Sprite Lab slices;
// pull the ones the engine and image list need by key.
import * as p5labReducersModule from '@cdo/apps/p5lab/reducers';
import {
  isNameUnique,
  revokeObjectUrlImages,
  SET_INITIAL_ANIMATION_LIST,
  setAnimationName,
  setInitialAnimationList,
} from '@cdo/apps/p5lab/redux/animationList';
import {cancelLocationSelection} from '@cdo/apps/p5lab/redux/locationPicker';
import {getSerializedAnimationList} from '@cdo/apps/p5lab/shapes';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import runState, {setIsRunning} from '@cdo/apps/redux/runState';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {addMissingBlocks} from '../addBlocks';
import {
  uploadAssetToLevel,
  uploadAssetToProject,
  UploadImageFunction,
} from '../ai/images/imageGeneration';
import useGameAudio from '../audioFeedback/useGameAudio';
import {refreshSceneDropdowns} from '../blockly/blockDefinitions/goToScene';
import {PLAY_MUSIC_BLOCK_TYPE} from '../blockly/blockDefinitions/playMusic';
import {setExternalSceneRefreshHandler} from '../blockly/externalSceneDropdown';
import {refreshAnimationDropdownThumbnails} from '../blockly/imagePickerFields';
import defaultSources from '../defaultSources.json';
import {imageTypeFromCategories} from '../imageGallery';
import {
  removeImageReferences,
  collectImageReferences,
  removeImageReferencesOnWorkspace,
  renameImageReferences,
  renameImageReferencesOnWorkspace,
} from '../imageReferences';
import {
  defaultImageName,
  defaultRole,
  imageNamedForRole,
} from '../imageRoleDefaults';
import {onTrimsUpdated} from '../imageTrim';
import {
  DEFAULT_IMAGE_STYLE,
  isFreeplayMode,
  isImageMode,
  tabsForMode,
} from '../levelMode';
import {
  migrateAnimationList,
  migrateBlockTypes,
  migrateScenes,
} from '../migrateSources';
import {
  collectSavedSongs,
  fetchMusicProjects,
  withUnavailableSongs,
} from '../musicProjects';
import {runtimeNeeds, WorkspaceSource} from '../objectives';
import {requestPicture} from '../picturePicker';
import {countImagesByType, imageCountsDelta} from '../projectCounts';
import reseedablePageConstants, {
  RESET_PAGE_CONSTANTS,
} from '../redux/reseedablePageConstants';
import spriteLab2Reducer, {
  ExternalSceneOption,
  MusicProjectOption,
  resetSpriteLab2,
  setActiveTab,
  setExternalScenes,
  setMusicProjects,
  setScenes,
  Tab,
} from '../redux/spriteLab2Redux';
import {sceneLinks} from '../sceneLinks';
import {
  collectSavedExternalKeys,
  ExternalProject,
  fetchExternalProject,
  fetchSectionScenes,
  parseExternalSceneKey,
  toExternalSceneOptions,
} from '../scenesApi';
import {sceneMetadataFor} from '../sceneThumbnails';
import {toolboxForSceneType} from '../sceneToolbox';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {
  RuntimeAnimationList,
  SceneType,
  SpriteLab2LevelProperties,
  Scene,
  Sources,
} from '../types';
import {
  compileWorldPrelude,
  DEFAULT_SCENE_GRID_SIZE,
  moveWorldCell,
  paintWorldCell,
  resizeWorld,
  sceneGridSize,
  World,
  WorldCell,
} from '../world';
import {useWorldStartPattern} from '../worldStartPattern';

import {isPointerClick} from './blurAfterPointerClick';
import EditorStrip from './components/EditorStrip';
import {Editor} from './components/EditorSwitch';
import LabShell from './components/LabShell';
import PlayBar from './components/PlayBar';
import PlayControls from './components/PlayControls';
import SceneMusicBar from './components/SceneMusicBar';
import Sheet from './components/Sheet';
import ToolButtons from './components/ToolButtons';
import GenerateImagePane from './GenerateImagePane';
import GenerateSpriteLab from './GenerateSpriteLab';
import {ArrowSet, arrowSetFor, ControlsState} from './playBar';
import Playspace, {PlayspaceMode} from './Playspace';
import ScenesGallery from './ScenesGallery';
import SceneTabs from './SceneTabs';
import SentenceScene from './sentence/SentenceScene';
import {showTtsFor} from './showTts';
import useBlocklyWorkspace, {BLOCKLY_DIV_ID} from './useBlocklyWorkspace';
import useDocumentHidden from './useDocumentHidden';
import {useObjectives, usePlayProgress} from './useObjectives';
import usePicturesSheet from './usePicturesSheet';
import useSceneEditing from './useSceneEditing';
import useSceneMusic from './useSceneMusic';
import useSceneThumbnails from './useSceneThumbnails';
import WorldTab from './WorldTab';

import moduleStyles from './sprite-lab2-view.module.scss';

const p5labReducers = p5labReducersModule as unknown as Record<string, Reducer>;

// Legacy slices the reused engine and image list read from the shared
// getStore() store. (The classic AnimationTab/Piskel slices aren't used.)
registerReducers({
  animationList: p5labReducers.animationList,
  textConsole: p5labReducers.textConsole,
  spritelabInputList: p5labReducers.spritelabInputList,
  // Read/written by the location-picker block.
  locationPicker: p5labReducers.locationPicker,
  runState,
  pageConstants: reseedablePageConstants,
  spriteLab2: spriteLab2Reducer,
});

const ENABLED_TABS: readonly Tab[] = ['Images', 'Code', 'Play'];
// The Images pane, for the hook that keeps it inert while closed.
const PICTURES_DRAWER_ID = 'spritelab2-pictures';
/** The switch's editors, in order. */
const EDITORS: Editor[] = ['Code', 'World', 'Images'];
// The Images pane's slide between the column's edge and the full width;
// the playspace fades for as long (HIDE_MS).
const PANE_SLIDE_MS = 300;
// On hover over a control a level withholds.
const LOCKED_REASON = 'Unlocks later in the lesson.';
// On hover over World while a story scene is active.
const STORY_NO_WORLD_REASON = 'A story scene has no world.';
const WORLD_TABS: readonly Tab[] = ['Images', 'World', 'Code', 'Play'];

const DEFAULT_SCENE_SOURCE = defaultSources.source;
const DEFAULT_SCENE_ID = 'scene-1';

// How long workspace injection may wait on a fetched dropdown list.
const LIST_FETCH_TIMEOUT_MS = 5000;

// Saved sources are migrated in place as they are read (see migrateSources);
// the next save persists the result.
function getScenes(sources: Sources): Scene[] {
  if (sources.scenes?.length) {
    migrateScenes(sources.scenes);
    return sources.scenes;
  }
  // Create a default scene from the project's source for projects that don't have scenes already.
  migrateBlockTypes(sources.source);
  return [
    {
      id: DEFAULT_SCENE_ID,
      name: 'Scene 1',
      source: (sources.source ??
        DEFAULT_SCENE_SOURCE) as WorkspaceSerialization,
    },
  ];
}

// Debounce between a workspace edit and the live-preview re-run.
const RUN_DEBOUNCE_MS = 400;

// Sprites come from the Images tab, so a new project starts with no
// animations.
const EMPTY_ANIMATION_LIST = {orderedKeys: [], propsByKey: {}};

// Focused controls own the game keys pressed on them (see the
// swallowOnControls effect).
const INTERACTIVE_CONTROLS = 'button, a, input, select, textarea';

// The keys a game typically reads (p5 listens for them on window).
const GAME_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ' ',
  'Spacebar',
]);

// Levelbuilder edit modes (start, toolbox, exemplar) run without a project
// channel; generated images upload to the level's starter assets instead.
const isLevelEditMode =
  !!getAppOptionsEditBlocks() || !!getAppOptionsEditingExemplar();
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

// The shared dialog's own copy names only the blocks.
const START_OVER_MESSAGE =
  "This deletes your blocks and your images. You can't undo it.";
const START_OVER_RETURNS_MESSAGE = `${START_OVER_MESSAGE} You'll start again from the first level.`;

interface SpriteLab2ViewProps {
  levelProperties: SpriteLab2LevelProperties;
  currentSources: Sources;
  updateSources: UseSourcesOutput<Sources>['updateSources'];
  patchSources: UseSourcesOutput<Sources>['patchSources'];
  channelId?: string;
  hasEdited: boolean;
  startOver: () => void;
  isEditable: boolean;
  // Used for keying effects off of sources reinitializing.
  sourcesReinitializedCount: number;
}

const SpriteLab2View: React.FunctionComponent<SpriteLab2ViewProps> = ({
  levelProperties,
  currentSources,
  updateSources,
  patchSources,
  channelId,
  hasEdited,
  startOver,
  isEditable,
  sourcesReinitializedCount,
}) => {
  const {theme} = useTheme();
  const dispatch = useAppDispatch();

  const activeTab = useAppSelector(state => state.spriteLab2.activeTab);
  // World-tab experiment flag, for a level whose mode does not name the tab.
  const worldTabParamEnabled = useMemo(
    () => queryParams('world-tab') === 'true',
    []
  );
  // The image dialog defaults to the student form; this shows the full
  // internal one. Level edit modes author starter images, which needs the
  // naming controls.
  const imagesAdvanced =
    useMemo(() => queryParams('images-advanced') === 'true', []) ||
    isLevelEditMode;
  // The mode decides the tab set, and an image level's is empty: its panel
  // replaces the shell. A level with no mode, or one whose authored kind is
  // not a kind we know, falls back to the lab defaults.
  const tabs = useMemo(() => {
    return (
      tabsForMode(levelProperties.levelMode) ??
      (worldTabParamEnabled ? WORLD_TABS : ENABLED_TABS)
    );
  }, [levelProperties.levelMode, worldTabParamEnabled]);
  const worldTabEnabled = tabs.includes('World');
  // Playfield size for a world this level creates. An existing world keeps
  // the size its grid already holds unless it can grow into this one without
  // dropping a placement (see resizeWorld) — the project's world is shared
  // across the levels that open its channel, so the data decides.
  const seedSceneSize = DEFAULT_SCENE_GRID_SIZE;
  const worldFor = useCallback(
    (scene?: Scene) => resizeWorld(scene?.world, seedSceneSize),
    [seedSceneSize]
  );
  // A level's mode opens it on the first tab the mode names (display order is
  // fixed, so that order is free to carry the start tab).
  useEffect(() => {
    if (levelProperties.levelMode && tabs.length) {
      dispatch(setActiveTab(tabs[0]));
    }
    // Only the level identity should re-trigger the start tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelProperties.id, dispatch]);
  // The slice's initial tab is 'Code'; a level hiding Code (an images-only
  // level, say) needs the selection steered onto a tab that exists. A mode
  // with no tabs at all renders no shell, so leave the selection alone.
  useEffect(() => {
    if (tabs.length && activeTab !== 'Scenes' && !tabs.includes(activeTab)) {
      dispatch(setActiveTab(tabs.includes('Code') ? 'Code' : tabs[0]));
    }
  }, [tabs, activeTab, dispatch]);
  // The world editor mounts at its first opening: inserting its grid is
  // costly (the consent script's autoblocker walks every added node).
  const [worldMounted, setWorldMounted] = useState(false);
  useEffect(() => {
    if (activeTab === 'World') {
      setWorldMounted(true);
    }
  }, [activeTab]);
  // The preview's column, which the code keeps clear of.
  const [previewWidth, setPreviewWidth] = useState(0);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  // The project is shared by every level of the lesson, so Start Over sends
  // the student back to its first level to remake it. A level outside a
  // lesson has no first level to go to.
  const firstLevelId = useAppSelector(
    state => getCurrentLevels(state)?.[0]?.id as string | undefined
  );
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const isRunning = useAppSelector(state => state.runState.isRunning);
  const hasRun = useAppSelector(state => state.spriteLab2.hasRun);
  const blocklySettings = useBlocklySettings();
  const themeSetting = useThemeSetting('spritelab');
  // Seed the page constants the animationList logic + engine read (we bypass
  // StudioApp.init) and the AichatContextManager the aiGateway calls read.
  useEffect(() => {
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.FLOW_LAB,
      currentLevelId: currentLevelId ? parseInt(currentLevelId, 10) : null,
      scriptId: scriptId ?? null,
      channelId,
    });
    dispatch(
      setPageConstants({
        isBlockly: true,
        isShareView: false,
        channelId,
      })
    );
    return () => {
      dispatch({type: RESET_PAGE_CONSTANTS});
    };
  }, [dispatch, channelId, currentLevelId, scriptId]);

  // Blocks rendered before an image finished trimming show the untrimmed
  // thumbnail; refresh the costume dropdowns as trims land.
  useEffect(() => onTrimsUpdated(refreshAnimationDropdownThumbnails), []);

  // Sources as of level load: seeding and engine creation are once-per-level
  // (the container remounts this view per level, after sources load).
  const initialSources = useRef(currentSources).current;

  const uploadImage: UploadImageFunction | undefined = useMemo(() => {
    if (channelId) {
      return (filename, data, mediaType) =>
        uploadAssetToProject(channelId, filename, data, mediaType);
    }
    if (isLevelEditMode) {
      const levelName = levelProperties.name;
      return (filename, data, mediaType) =>
        uploadAssetToLevel(levelName, filename, data, mediaType);
    }
    return undefined;
  }, [channelId, levelProperties.name]);

  const engineRef = useRef<SpriteLab2Engine | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [animationsSeeded, setAnimationsSeeded] = useState(false);
  // Jump transition: the cover blanks the playspace while the target loads;
  // fadeTrigger increments on landing to play the fade-from-black.
  const [jumpCover, setJumpCover] = useState(false);
  const [fadeTrigger, setFadeTrigger] = useState(0);
  const [showStartOver, setShowStartOver] = useState(false);

  // The project's pictures, in a sheet over the workspace.
  const picturesOffered = tabs.includes('Images');
  const pictures = usePicturesSheet({
    offered: picturesOffered,
    ready: animationsSeeded,
  });

  const scenes = useMemo(() => getScenes(currentSources), [currentSources]);

  // Create the pinned scene on first load, and again after
  // Start Over (the reinit count in the deps). On a scene-less project the
  // pin becomes the only scene — materializing the synthesized default too
  // would leave a stray "Scene 1" in every level sharing the project.
  // A toolbox has no scenes to pin. Cleared at the one read of the
  // property, so every downstream consumer sees no pin.
  const pinnedScene = isToolboxMode ? undefined : levelProperties.pinnedScene;
  const pinnedSceneId = pinnedScene?.id;
  const pinnedSceneName = pinnedScene?.name;
  const pinnedSceneType = pinnedScene?.type;
  useEffect(() => {
    if (!pinnedSceneId) {
      return;
    }
    updateSources(prev => {
      if (prev.scenes?.some(s => s.id === pinnedSceneId)) {
        return prev;
      }
      const pinned: Scene = {
        id: pinnedSceneId,
        name: pinnedSceneName || 'Scene',
        type: pinnedSceneType,
        source: DEFAULT_SCENE_SOURCE,
      };
      const existing =
        prev.scenes?.length ||
        (prev.source && !isEqual(prev.source, DEFAULT_SCENE_SOURCE))
          ? getScenes(prev)
          : [];
      return {...prev, scenes: [...existing, pinned]};
    });
  }, [
    pinnedSceneId,
    pinnedSceneName,
    pinnedSceneType,
    updateSources,
    sourcesReinitializedCount,
  ]);

  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    () => pinnedSceneId ?? scenes[0].id
  );
  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0];
  const activeSceneType = activeScene?.type;
  // A world is a platformer's floor plan, so a story scene has nothing to
  // place in one. An untyped scene keeps the tab.
  const enabledTabs = useMemo(
    () =>
      activeSceneType === 'story' ? tabs.filter(tab => tab !== 'World') : tabs,
    [tabs, activeSceneType]
  );
  // What the level withholds is disabled rather than missing, so free play
  // holds no surprises later.
  const editorsShown = tabs.includes('Code') || enabledTabs.includes('World');
  const disabledEditors = useMemo<Partial<Record<Editor, string>>>(
    () => ({
      ...(picturesOffered ? {} : {Images: LOCKED_REASON}),
      ...(tabs.includes('Code') ? {} : {Code: LOCKED_REASON}),
      ...(enabledTabs.includes('World')
        ? {}
        : {
            World: tabs.includes('World')
              ? STORY_NO_WORLD_REASON
              : LOCKED_REASON,
          }),
    }),
    [tabs, enabledTabs, picturesOffered]
  );
  // ?preview=right puts the preview column at the right.
  const previewSide = useMemo<'left' | 'right'>(
    () => (queryParams('preview') === 'right' ? 'right' : 'left'),
    []
  );
  // The scene row sits under the workspace; ?bar=top puts it above.
  const barAtBottom = useMemo(() => queryParams('bar') !== 'top', []);
  // Images is open while its tab is: the hook's open state drives the
  // pane's inertness and its mount.
  const setPicturesOpen = pictures.setOpen;
  useEffect(() => {
    setPicturesOpen(activeTab === 'Images');
  }, [activeTab, setPicturesOpen]);
  // The pane slides in from the column's edge to the full width as it
  // opens, fading in, and back as it closes, then parks: parked → docked
  // (at the edge, no transition) → full, and full → docked → parked. It is
  // moved by a transform, so it holds its full size throughout and its
  // contents lay out once, at that size. The column's last width is the
  // edge, since the playspace reports none while hidden.
  const picturesActive = activeTab === 'Images';
  const [picturesStage, setPicturesStage] = useState<
    'parked' | 'docked' | 'full'
  >('parked');
  const columnEdgeRef = useRef(0);
  useEffect(() => {
    if (previewWidth > 0) {
      columnEdgeRef.current = previewWidth;
    }
  }, [previewWidth]);
  useEffect(() => {
    if (picturesActive) {
      setPicturesStage(stage => (stage === 'parked' ? 'docked' : 'full'));
    } else {
      setPicturesStage(stage => (stage === 'full' ? 'docked' : stage));
    }
  }, [picturesActive]);
  // Docked on the way in: let the browser take the docked position, so the
  // slide starts from it rather than from parked.
  const picturesPaneRef = pictures.sheetRef;
  useLayoutEffect(() => {
    if (picturesActive && picturesStage === 'docked') {
      void picturesPaneRef.current?.getBoundingClientRect();
      setPicturesStage('full');
    }
  }, [picturesActive, picturesStage, picturesPaneRef]);
  const picturesSliding =
    picturesStage === 'full' || (picturesStage === 'docked' && !picturesActive);
  const picturesDocked = picturesStage === 'docked';
  const picturesStyle: React.CSSProperties | undefined =
    picturesStage === 'parked'
      ? undefined
      : {
          transform: picturesDocked
            ? `translateX(${columnEdgeRef.current}px)`
            : 'none',
          opacity: picturesDocked ? 0 : 1,
          // The contents ease in over the arrival's second half, and out
          // over the departure's first.
          transition: picturesSliding
            ? `transform ${PANE_SLIDE_MS}ms ease, opacity ${
                PANE_SLIDE_MS / 2
              }ms ease ${picturesActive ? PANE_SLIDE_MS / 2 : 0}ms`
            : undefined,
        };
  // The resource panel's buttons sit at the scene row's end and the panel
  // is gone, giving the lab its width; ?resources=panel brings it back.
  const resourcesInBar = useMemo(
    () => queryParams('resources') !== 'panel',
    []
  );
  // The chosen picture sits at the right of the strips; ?jumbo=left puts
  // it at the left.
  const jumboSide = useMemo<'left' | 'right'>(
    () => (queryParams('jumbo') === 'left' ? 'left' : 'right'),
    []
  );
  // ?editors=stripleft: the switch at the workspace bar's start.
  const editorsAtStart = useMemo(
    () => queryParams('editors') === 'stripleft',
    []
  );
  // A Preview bar across the stage column's top; ?preview-bar=false drops it.
  const previewBarShown = useMemo(
    () => queryParams('preview-bar') !== 'false',
    []
  );
  // The room the editors keep clear of the column, on its side.
  const clearOfPreview =
    previewSide === 'left' ? {left: previewWidth} : {right: previewWidth};
  // The workspace does not notice its container changing size.
  useEffect(() => {
    const workspace = Blockly.getMainWorkspace?.() as
      | BlocklyCore.WorkspaceSvg
      | undefined;
    if (workspace) {
      Blockly.svgResize(workspace);
    }
  }, [previewWidth, editorsShown]);
  useEffect(() => {
    if (activeTab === 'World' && !enabledTabs.includes('World')) {
      dispatch(
        setActiveTab(enabledTabs.includes('Code') ? 'Code' : enabledTabs[0])
      );
    }
  }, [activeTab, enabledTabs, dispatch]);
  const sceneToolbox = useMemo(
    () =>
      toolboxForSceneType(levelProperties.toolboxDefinition, activeSceneType),
    [levelProperties.toolboxDefinition, activeSceneType]
  );
  // Blockly fixes a workspace's toolbox kind at injection, so reaching a
  // toolbox of the other kind takes a new workspace. Same-kind changes swap
  // in place instead, below.
  const [injectedToolbox, setInjectedToolbox] = useState(sceneToolbox);
  useEffect(() => {
    setInjectedToolbox(previous =>
      previous?.kind === sceneToolbox?.kind ? previous : sceneToolbox
    );
  }, [sceneToolbox]);
  const activeWorld = worldFor(activeScene);
  const activeSceneSize = sceneGridSize(activeWorld);
  // The project's images, for guide steps waiting on some being made.
  const animationList = useAppSelector(state => state.animationList);

  const sceneMetadata = useMemo(
    () => sceneMetadataFor(scenes, animationList),
    [scenes, animationList]
  );

  // Keep activeSceneId pointing at a real scene: locked to the pin once the
  // ensure effect lands it, otherwise reset to the first scene when the
  // active one disappears (e.g. code cleared via start over).
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

  // Premade world, when the level authors one.
  useWorldStartPattern({
    pattern: levelProperties.worldStartPattern,
    channelId,
    pinnedSceneId,
    enabled: animationsSeeded,
    animations: animationList,
    spriteRole: defaultRole(levelProperties.imageRoleDefaults, 'sprite'),
    updateSources,
  });

  // Where Play begins with no explicit start scene: the pinned scene on a
  // pinned-scene level (the first scene may belong to another level sharing
  // the project), otherwise the first scene.
  const defaultPlaySceneId = pinnedSceneId ?? scenes[0]?.id ?? null;

  // From load-time sources, not the store: the redux list seeds a tick
  // after mount, so its first value would snapshot as empty.
  const baselineImages = useMemo(
    () =>
      countImagesByType(
        initialSources.animations ?? {orderedKeys: [], propsByKey: {}}
      ),
    [initialSources]
  );
  // The level's checklist.
  const playing = activeTab === 'Play' && isRunning;
  const needs = useMemo(
    () => runtimeNeeds(levelProperties.objectives),
    [levelProperties.objectives]
  );
  const playProgress = usePlayProgress(playing, needs);
  const {onPlayerProgress, onSceneLanded} = playProgress;
  const objectiveImages = useMemo(
    () => imageCountsDelta(countImagesByType(animationList), baselineImages),
    [animationList, baselineImages]
  );
  // The World grid a "changed" check compares against: the pinned scene's
  // world as the level opened, from the same load-time sources as the image
  // baseline.
  const baselineGrid = useMemo(
    () =>
      getScenes(initialSources).find(scene => scene.id === pinnedSceneId)?.world
        ?.grid,
    [initialSources, pinnedSceneId]
  );
  const objectiveRoles = useMemo(() => {
    const roles = new Set<string>();
    levelProperties.objectives?.items?.forEach(({check}) => {
      if ('role' in check && check.role) {
        roles.add(check.role);
      }
    });
    return [...roles];
  }, [levelProperties.objectives]);
  const imageForRole = useMemo(
    () =>
      Object.fromEntries(
        objectiveRoles.map(role => [
          role,
          // World cells and touched sprites are sprite images.
          imageNamedForRole(animationList, 'sprite', role),
        ])
      ),
    [objectiveRoles, animationList]
  );
  const objectives = useObjectives({
    objectives: levelProperties.objectives,
    images: objectiveImages,
    grid: activeWorld.grid,
    baselineGrid,
    imageForRole,
    source: activeScene.source as WorkspaceSource | undefined,
    activeTab,
    everPlayed: playProgress.everPlayed,
    runtime: playProgress.runtime,
  });

  // The World palette selection lives here so it survives leaving the tab
  // (WorldTab unmounts when hidden).
  const [worldPaletteSelection, setWorldPaletteSelection] = useState<
    WorldCell | 'erase' | null
  >(null);
  // Only a choice the student made holds against the level default; a
  // default picked from an incomplete list gives way once the list fills in.
  const paletteChosenByStudent = useRef(false);
  const choosePaletteSelection = useCallback(
    (selection: WorldCell | 'erase') => {
      paletteChosenByStudent.current = true;
      setWorldPaletteSelection(selection);
    },
    []
  );
  // The world palette's New square: a placeable picture, selected once
  // made.
  const handleNewWorldPicture = useCallback(() => {
    requestPicture({
      onPicked: (name, imageType) => {
        if (imageType !== 'background') {
          choosePaletteSelection({
            image: name,
            kind: imageType === 'block' ? 'block' : 'sprite',
          });
        }
      },
    });
  }, [choosePaletteSelection]);

  // Preselect the level's image of its imageType: the image_role_defaults role,
  // else the newest. Backgrounds are excluded, a world cell being a sprite or
  // a block; a selection whose image is gone counts as none.
  const focusImageType = levelProperties.levelMode?.imageType;
  const imageRoleDefaults = levelProperties.imageRoleDefaults;
  // The level's image of its kind: the image_role_defaults role first, else
  // the newest of the kind (orderedKeys is newest-first: Sprite Lab prepends
  // new animations).
  const focusImageName = useMemo(() => {
    if (!focusImageType || focusImageType === 'background') {
      return undefined;
    }
    const newest = animationList.orderedKeys.find(
      key =>
        imageTypeFromCategories(animationList.propsByKey[key]?.categories) ===
        focusImageType
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
      animationList.orderedKeys.map(key => animationList.propsByKey[key]?.name)
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
      focusImageName ? {image: focusImageName, kind: focusImageType} : null
    );
  }, [worldPaletteSelection, focusImageType, focusImageName, animationList]);

  // Store scenes in redux for Blockly dropdowns and AI prompt.
  // TODO: does this need to live in redux?
  useEffect(() => {
    dispatch(setScenes(sceneMetadata));
    // Go-to-scene blocks draw the pictures from that store.
    refreshSceneDropdowns();
  }, [sceneMetadata, dispatch]);

  // Cleanup on level switch.
  useEffect(() => {
    return () => {
      dispatch(resetSpriteLab2());
      dispatch(cancelLocationSelection() as AnyAction);
    };
  }, [levelProperties.id, dispatch]);

  // Seed the redux animation list from a sources animations value.
  const seedAnimationList = useCallback(
    (animations: Sources['animations']) => {
      // Deep-cloned: the legacy thunk normalizes its argument IN PLACE, and
      // this object belongs to the sources state. The clone is also what the
      // migration rewrites; the next save persists the result.
      const seeded = cloneDeep(animations || EMPTY_ANIMATION_LIST);
      migrateAnimationList(seeded);
      // Replacing the list frees the outgoing images' Blobs (the seed
      // carries no pixel data; images reload from their sources).
      revokeObjectUrlImages(getStore().getState().animationList);
      dispatch(
        setInitialAnimationList(
          seeded,
          // No v3 migration; the engine never runs the legacy share path.
          undefined as unknown as object,
          true /* isSpriteLab */
        )
      );
    },
    [dispatch]
  );

  // Set when the seeding effect fetched the songs itself (saved blocks
  // needed them before the workspace), so they are not fetched twice.
  const musicSeededRef = useRef(false);

  // Seed the animation list BEFORE the workspace injects: dropdown fields
  // validate saved values against the store at block-load time — hence the
  // animationsSeeded gate on useBlocklyWorkspace, not just dispatch ordering.
  // Once per level: React Fast Refresh re-runs this effect, and re-seeding
  // from the load-time list would revert every image made since.
  const seededLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (seededLevelRef.current === levelProperties.id) {
      return;
    }
    seededLevelRef.current = levelProperties.id;
    let canceled = false;
    seedAnimationList(initialSources.animations);
    // Workspace injection only waits on a fetched list (section scenes, the
    // user's songs) when saved blocks hold values from it; the gated path
    // times out into placeholder options so a hung API can't blank the lab.
    const savedExternalKeys = collectSavedExternalKeys(
      getScenes(initialSources)
    );
    const savedSongs = collectSavedSongs(getScenes(initialSources));
    const withTimeout = <T,>(fetching: Promise<T>): Promise<T> =>
      Promise.race([
        fetching,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), LIST_FETCH_TIMEOUT_MS)
        ),
      ]);
    const externalOptions = async (
      timed: boolean
    ): Promise<ExternalSceneOption[]> => {
      try {
        const fetching = fetchSectionScenes(levelProperties.id, scriptId);
        const refs = await (timed ? withTimeout(fetching) : fetching);
        return toExternalSceneOptions(refs);
      } catch (e) {
        console.warn('section scenes unavailable', e);
        return [];
      }
    };
    const musicOptions = async (): Promise<MusicProjectOption[]> => {
      try {
        return await withTimeout(fetchMusicProjects());
      } catch (e) {
        console.warn('music projects unavailable', e);
        return [];
      }
    };
    if (savedExternalKeys.length === 0 && savedSongs.length === 0) {
      setAnimationsSeeded(true);
      // Nothing waits on this list, so a slow response is simply used
      // whenever it lands instead of being discarded at the timeout.
      externalOptions(false).then(options => {
        if (!canceled) {
          dispatch(setExternalScenes(options));
        }
      });
    } else {
      musicSeededRef.current = true;
      Promise.all([externalOptions(true), musicOptions()]).then(
        ([external, music]) => {
          if (canceled) {
            return;
          }
          const known = new Set(external.map(o => o.key));
          savedExternalKeys.forEach(key => {
            if (!known.has(key)) {
              external.push({
                key,
                label: `(unavailable) #${key.slice(0, 10)}`,
              });
            }
          });
          dispatch(setExternalScenes(external));
          dispatch(setMusicProjects(withUnavailableSongs(music, savedSongs)));
          setAnimationsSeeded(true);
        }
      );
    }
    return () => {
      canceled = true;
    };
    // Re-seeds only when the level changes (seedAnimationList is stable,
    // initialSources is a ref-captured constant).
  }, [
    levelProperties.id,
    scriptId,
    dispatch,
    initialSources,
    seedAnimationList,
  ]);

  // What's on stage right now — updated by every run, including scene jumps —
  // so "Restart scene" (and the reseed watcher below) can re-run it.
  const currentPlayingRef = useRef<
    | {kind: 'local'; scene: Scene}
    | {kind: 'external'; project: ExternalProject; sceneId: string}
    | null
  >(null);

  // Re-run the stage once a reseeded animation list finishes loading. The
  // reseed-triggered run happens immediately, but reseeded entries carry
  // only a sourceUrl (dataURIs load async) and the engine can't draw
  // unloaded images (costume/background commands no-op on unknown names —
  // a blank playspace until the next run). Thumbnails self-heal without
  // this: GenerateImagePane re-trims on every list change. Kept in a ref
  // (not effect cleanup): the reseed effect's deps churn on every animation
  // write, which would cancel a pending watcher mid-load.
  const cancelRerunWatchRef = useRef<() => void>();
  // Latest restart-scene handler, for the watcher's async callback.
  const restartSceneRef = useRef<() => void>(() => {});
  useEffect(() => () => cancelRerunWatchRef.current?.(), []);
  const rerunWhenAnimationsLoaded = useCallback(() => {
    cancelRerunWatchRef.current?.();
    const store = getStore();
    const allLoaded = () => {
      const list = store.getState().animationList;
      return list.orderedKeys.every(
        (key: string) => list.propsByKey[key]?.loadedFromSource
      );
    };
    if (allLoaded()) {
      // The reseed-triggered run has everything it needs.
      return;
    }
    const finish = () => {
      cancel();
      restartSceneRef.current();
    };
    const unsubscribe = store.subscribe(() => allLoaded() && finish());
    // Give up quietly if a load never completes; the playspace stays stale,
    // no worse than not watching.
    const timer = window.setTimeout(() => cancel(), 10000);
    const cancel = () => {
      unsubscribe();
      clearTimeout(timer);
      if (cancelRerunWatchRef.current === cancel) {
        cancelRerunWatchRef.current = undefined;
      }
    };
    cancelRerunWatchRef.current = cancel;
  }, []);

  // Reseed the animation list on reinitialization. The template carries no
  // animations, so Start Over drops the images.
  const seededReinitCountRef = useRef(0);
  useEffect(() => {
    if (sourcesReinitializedCount === seededReinitCountRef.current) {
      return;
    }
    seededReinitCountRef.current = sourcesReinitializedCount;
    seedAnimationList(currentSources.animations);
    // The stage's scene belongs to the pre-reset sources; restart-scene
    // falls back to the first scene.
    currentPlayingRef.current = null;
    rerunWhenAnimationsLoaded();
  }, [
    sourcesReinitializedCount,
    currentSources.animations,
    seedAnimationList,
    rerunWhenAnimationsLoaded,
  ]);

  // Instantiate the engine once per level. No legacy default-sprite library:
  // images come from the Images tab, so p5 preload completes immediately.
  useEffect(() => {
    if (isToolboxMode || isImageMode(levelProperties.levelMode)) {
      // Neither has a stage: toolbox editing puts the toolbox in the
      // workspace, and an image level is the image panel. With no engine the
      // run machinery no-ops, and no stray canvas mounts.
      return;
    }
    let canceled = false;
    const savedAnimations = initialSources.animations || EMPTY_ANIMATION_LIST;

    const setup = async () => {
      const engine = new SpriteLab2Engine(savedAnimations);
      await engine.initForLevel(levelProperties);
      if (canceled) {
        engine.destroy();
        return;
      }
      engineRef.current = engine;
      setEngineReady(true);
    };

    setup();

    return () => {
      canceled = true;
      setEngineReady(false);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [levelProperties, initialSources]);

  // Persist Images-tab changes back to sources in the serialized shape.
  useEffect(() => {
    // Serialize from the LIVE store, not this commit's snapshot: this effect
    // runs after compileExternalScene's synchronous merge-and-restore, and a
    // snapshot save would leak the classmate's costumes into sources.
    patchSources({
      animations: getSerializedAnimationList(
        getStore().getState().animationList
      ),
    });
  }, [animationList, patchSources]);

  const {
    workspaceVersion,
    getCode,
    getCurrentBlocks,
    getToolboxDefinition,
    loadCode,
    subscribeToChanges,
    refreshToolbox,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useBlocklyWorkspace({
    enabled: animationsSeeded,
    toolboxDefinition: injectedToolbox,
    sharedBlocks: levelProperties.sharedBlocks,
    theme,
  });

  const WorkspaceAlert = useLevelEditMode<SpriteLab2LevelProperties>(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        if (mode === 'toolbox') {
          // The workspace holds the toolbox laid out as blocks; serialize it
          // back into the level's toolbox definition.
          const toolboxDefinition = getToolboxDefinition();
          return toolboxDefinition
            ? {toolbox_definition: toolboxDefinition}
            : {};
        }
        const sources = cloneDeep(currentSources);
        if (mode === 'start' && Blockly.blockIdOverrides) {
          // Apply Block ID overrides for top-level sources and all scenes.
          [
            sources.source as WorkspaceSerialization | undefined,
            ...(sources.scenes ?? []).map(scene => scene.source),
          ].forEach(source => {
            if (source) {
              applyBlockIdOverrides(source, Blockly.blockIdOverrides);
            }
          });
        }
        return {
          [mode === 'start' ? 'start_sources' : 'exemplar_sources']: sources,
        };
      },
      [currentSources, getToolboxDefinition]
    )
  );

  // The active scene's world, by ref: run callbacks read it at call time,
  // so world edits don't churn their identities.
  const activeWorldRef = useRef<World | undefined>(undefined);
  const activeSceneTypeRef = useRef<SceneType | undefined>(undefined);
  const activeSceneIdRef = useRef<string | undefined>(undefined);
  const activeSceneRef = useRef<Scene | undefined>(undefined);
  // Whether the scene the engine is running is a platformer, asked of the
  // engine wherever a run starts: the live preview, Play's start scene, and
  // each go-to-scene jump.
  const [playingPlatformer, setPlayingPlatformer] = useState(false);
  useEffect(() => {
    activeWorldRef.current = worldFor(activeScene);
    activeSceneTypeRef.current = activeScene?.type;
    activeSceneIdRef.current = activeScene?.id;
    activeSceneRef.current = activeScene;
  }, [activeScene, worldFor]);

  const requestThumbnail = useSceneThumbnails({
    engineRef,
    scenes,
    channelId,
    uploadImage,
    updateSources,
    getScenes,
    enabled: !isToolboxMode,
  });

  // Run the current program as the live preview (cheap: the engine reuses p5).
  const runProgram = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    dispatch(setIsRunning(true));
    const {result: program, referencedImages} = collectImageReferences(
      () => compileWorldPrelude(activeWorldRef.current) + (getCode() ?? '')
    );
    if (activeSceneIdRef.current) {
      requestThumbnail(activeSceneIdRef.current);
    }
    if (activeSceneRef.current) {
      currentPlayingRef.current = {
        kind: 'local',
        scene: activeSceneRef.current,
      };
    }
    engine.runProgram(program, referencedImages, activeSceneTypeRef.current);
    setPlayingPlatformer(engine.isPlatformScene());
  }, [dispatch, getCode, requestThumbnail]);

  // Debounce re-runs so we don't restart the program on every keystroke/drag.
  const runTimer = useRef<number>();
  const scheduleRun = useCallback(() => {
    if (runTimer.current) {
      window.clearTimeout(runTimer.current);
    }
    runTimer.current = window.setTimeout(runProgram, RUN_DEBOUNCE_MS);
  }, [runProgram]);

  // Run one scene: the open scene compiles from the live workspace, others
  // headless from saved sources. Cover/fade comes from the engine's jump
  // callbacks, not here — editor/tab switches don't fade.
  const runLocalScene = useCallback(
    (scene: Scene) => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }
      // Running a local scene leaves any external-project context behind.
      currentExternalProjectRef.current = null;
      engine.preloadAnimationsOverride = null;
      currentPlayingRef.current = {kind: 'local', scene};
      const {result: program, referencedImages} = collectImageReferences(() => {
        const prelude = compileWorldPrelude(worldFor(scene));
        let code = '';
        try {
          const live = scene.id === activeSceneId ? getCode() : null;
          code =
            live ??
            getCodeFromSerializedWorkspace(
              scene.source ?? DEFAULT_SCENE_SOURCE
            );
        } catch (e) {
          // A scene that fails to compile shouldn't kill the jump
          // entirely; run it as an empty scene.
          console.error('Failed to compile scene', scene.id, e);
        }
        return prelude + code;
      });
      dispatch(setIsRunning(true));
      requestThumbnail(scene.id);
      engine.runProgram(program, referencedImages, scene.type);
      setPlayingPlatformer(engine.isPlatformScene());
    },
    [dispatch, activeSceneId, getCode, worldFor, requestThumbnail]
  );

  const runScene = useCallback(
    (sceneId: string | null) => {
      const scene = scenes.find(s => s.id === sceneId);
      if (!scene) {
        // If a jump triggered this, resume the old scene instead of leaving
        // it frozen.
        engineRef.current?.cancelSceneJump();
        return;
      }
      runLocalScene(scene);
    },
    [scenes, runLocalScene]
  );

  // --- External scenes (cross-project jumps) ---
  const externalProjectsRef = useRef(new Map<string, ExternalProject>());
  // One preload list per fetched project, kept for as long as the project
  // is: the engine tells one project's list from another's by object
  // reference, so a project must hand it the same list object every jump.
  const externalPreloadListsRef = useRef(
    new WeakMap<ExternalProject, RuntimeAnimationList>()
  );
  // The external project whose scene is currently running; its own go-to-scene
  // blocks resolve against this.
  const currentExternalProjectRef = useRef<ExternalProject | null>(null);
  const [externalLoading, setExternalLoading] = useState(false);

  // The external scene's dropdowns validate against the redux lists at
  // block-load time, so merge its animations/scenes in for the synchronous
  // compile and restore after. RAW action, not the thunk — the thunk
  // re-fetches every image per dispatch (a fetch storm across jumps) — and
  // restoring the captured state object keeps selectors reference-equal.
  const compileExternalScene = useCallback(
    (scene: Scene, project: ExternalProject) => {
      const currentAnimations = getStore().getState().animationList;
      const theirs = project.animations;
      const merged = {
        orderedKeys: [
          ...currentAnimations.orderedKeys,
          ...(theirs.orderedKeys || []).filter(
            (k: string) => !currentAnimations.propsByKey[k]
          ),
        ],
        propsByKey: {
          ...(theirs.propsByKey || {}),
          ...currentAnimations.propsByKey,
        },
      };
      const currentSceneMetadata = sceneMetadata;
      dispatch({type: SET_INITIAL_ANIMATION_LIST, animationList: merged});
      // Dedupe: the external project can be the user's own (a jump back into
      // this project), and duplicate ids break the selector's list rendering.
      const knownSceneIds = new Set(currentSceneMetadata.map(s => s.id));
      dispatch(
        setScenes([
          ...currentSceneMetadata,
          ...project.scenes
            .filter(s => !knownSceneIds.has(s.id))
            .map(s => ({id: s.id, name: s.name})),
        ])
      );
      try {
        return getCodeFromSerializedWorkspace(
          scene.source ?? DEFAULT_SCENE_SOURCE
        );
      } finally {
        dispatch({
          type: SET_INITIAL_ANIMATION_LIST,
          animationList: currentAnimations,
        });
        dispatch(setScenes(currentSceneMetadata));
      }
    },
    [dispatch, sceneMetadata]
  );

  const runExternalProjectScene = useCallback(
    (project: ExternalProject, sceneId: string) => {
      const engine = engineRef.current;
      const scene = project.scenes.find(s => s.id === sceneId);
      if (!engine || !scene) {
        engineRef.current?.cancelSceneJump();
        return;
      }
      currentExternalProjectRef.current = project;
      currentPlayingRef.current = {kind: 'external', project, sceneId};
      // An external scene runs at the playfield size ITS project authored —
      // reshaping it to this level's size would resize every cell under a
      // layout built for the other one.
      const {result: program, referencedImages} = collectImageReferences(() => {
        const prelude = compileWorldPrelude(scene.world);
        let code = '';
        try {
          code = compileExternalScene(scene, project);
        } catch (e) {
          console.error('Failed to compile external scene', sceneId, e);
        }
        return prelude + code;
      });
      // Preload the external project's images. Their saved animations carry
      // sourceUrl (dataURI is stripped on save); p5.loadImage takes URLs too.
      let preloadList = externalPreloadListsRef.current.get(project);
      if (!preloadList) {
        const theirs = project.animations;
        preloadList = {
          orderedKeys: theirs.orderedKeys || [],
          propsByKey: Object.fromEntries(
            Object.entries(theirs.propsByKey || {}).map(([key, props]) => [
              key,
              {...props, dataURI: props.sourceUrl},
            ])
          ),
        };
        externalPreloadListsRef.current.set(project, preloadList);
      }
      engine.preloadAnimationsOverride = preloadList;
      dispatch(setIsRunning(true));
      engine.runProgram(program, referencedImages, scene.type);
      setPlayingPlatformer(engine.isPlatformScene());
    },
    [dispatch, compileExternalScene]
  );

  // Fetch the classmate's project fresh (their scenes may have changed);
  // the last good copy is only a fetch-failure fallback.
  const runExternalScene = useCallback(
    async (key: string) => {
      const parsed = parseExternalSceneKey(key);
      if (!parsed) {
        engineRef.current?.cancelSceneJump();
        return;
      }
      setExternalLoading(true);
      let project: ExternalProject | undefined;
      try {
        project = await fetchExternalProject(
          parsed.channel,
          levelProperties.id,
          scriptId
        );
        migrateScenes(project.scenes);
        externalProjectsRef.current.set(parsed.channel, project);
      } catch (e) {
        project = externalProjectsRef.current.get(parsed.channel);
        if (!project) {
          console.error('Failed to load external scene', key, e);
          engineRef.current?.cancelSceneJump();
          return;
        }
        console.warn('Using last-loaded copy of external scene', key, e);
      } finally {
        setExternalLoading(false);
      }
      runExternalProjectScene(project, parsed.sceneId);
    },
    [runExternalProjectScene, levelProperties.id, scriptId]
  );

  // The external dropdown re-fetches the section list on every open, so
  // scenes classmates add while this lab is open show up.
  useEffect(() => {
    setExternalSceneRefreshHandler(async () => {
      const refs = await fetchSectionScenes(levelProperties.id, scriptId);
      const options = toExternalSceneOptions(refs);
      const known = new Set(options.map(o => o.key));
      collectSavedExternalKeys(scenes).forEach(key => {
        if (!known.has(key)) {
          options.push({key, label: `(unavailable) #${key.slice(0, 10)}`});
        }
      });
      dispatch(setExternalScenes(options));
    });
    return () => setExternalSceneRefreshHandler(null);
  }, [levelProperties.id, scriptId, dispatch, scenes]);

  // Scene jumps should only navigate while playing. In preview (Code tab) a
  // goToScene block would otherwise pull the preview off the scene being edited.
  // The handlers below are wired once, so they read the live mode through a ref.
  const isPlayingRef = useRef(activeTab === 'Play');
  useEffect(() => {
    isPlayingRef.current = activeTab === 'Play';
  }, [activeTab]);

  // The play-music block's songs, fetched once per level. The flyout
  // usually renders first: it is redrawn with them, and a block placed
  // meanwhile, holding no song, is given the newest.
  const musicProjects = useAppSelector(state => state.spriteLab2.musicProjects);
  useEffect(() => {
    if (musicSeededRef.current) {
      return;
    }
    let canceled = false;
    fetchMusicProjects()
      .then(projects => {
        if (canceled) {
          return;
        }
        dispatch(setMusicProjects(projects));
        refreshToolbox();
        const newest = projects.find(p => !p.unavailable);
        const workspace = Blockly.getMainWorkspace();
        if (newest && workspace) {
          workspace
            .getBlocksByType(PLAY_MUSIC_BLOCK_TYPE, false)
            .forEach(block => {
              if (!block.getFieldValue('SONG')) {
                block.setFieldValue(newest.channel, 'SONG');
              }
            });
        }
      })
      .catch(e => console.warn('music projects unavailable', e));
    return () => {
      canceled = true;
    };
  }, [levelProperties.id, dispatch, refreshToolbox]);

  // A scene shows the blocks its type is for. refreshToolbox declines a
  // definition of the other kind; that case re-injects instead.
  useEffect(() => {
    if (animationsSeeded && sceneToolbox) {
      refreshToolbox(sceneToolbox);
    }
  }, [animationsSeeded, sceneToolbox, workspaceVersion, refreshToolbox]);

  const {nowPlaying, playMusic} = useSceneMusic(
    activeTab === 'Play',
    musicProjects
  );

  // A sheet over the editors and the stage: All scenes.
  const stageCovered = activeTab === 'Scenes';
  // Hidden content stays in the tab order and the accessibility tree:
  // inert while hidden, via refs (React 18's JSX has no inert attribute).
  // worldMounted: the world's wrapper can first render after the last change.
  const stageRef = useRef<HTMLDivElement>(null);
  const codeWrapperRef = useRef<HTMLDivElement>(null);
  const worldWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.inert = stageCovered;
    }
    if (codeWrapperRef.current) {
      codeWrapperRef.current.inert = activeTab !== 'Code';
    }
    if (worldWrapperRef.current) {
      worldWrapperRef.current.inert = activeTab !== 'World';
    }
  }, [stageCovered, activeTab, worldMounted]);

  // The scene Play (re)starts from: null means the beginning (the first
  // scene). Clicking a preview sets it to the previewed scene; entering Play
  // from the tab button or "Restart game" clears it.
  const [playStartSceneId, setPlayStartSceneId] = useState<string | null>(null);
  // The arrow buttons the running scene wants, as the engine reports it.
  // No controls until the engine says which the running scene wants.
  const [arrowSet, setArrowSet] = useState<ArrowSet>('none');

  // p5 listens for keys on window, so a game reading arrows/space would eat
  // them while the student edits blocks. Give the game the keyboard only in
  // Play: stopping the event at document runs after Blockly's own handlers
  // (on descendants) and before p5's window listener.
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

  // A game key aimed at a focused control belongs to the control: activate
  // it, don't also jump. Stopping at document keeps the event from p5's
  // window listener; the control's default activation is unaffected.
  useEffect(() => {
    const swallowOnControls = (e: KeyboardEvent) => {
      if (!GAME_KEYS.has(e.key)) {
        return;
      }
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(INTERACTIVE_CONTROLS)) {
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

  // Wire the scene-jump blocks; reassigned whenever the callbacks' inputs change.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engineReady || !engine) {
      return;
    }
    engine.onGoToScene = (sceneId: string) => {
      // Previewing: don't navigate; resume the scene being edited.
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      onSceneLanded(sceneId);
      if (scenes.some(s => s.id === sceneId)) {
        // Follow the jump in the editor too: leaving Play lands on the
        // scene that was just playing.
        setActiveSceneId(sceneId);
        runScene(sceneId);
        return;
      }
      const external = currentExternalProjectRef.current;
      if (external && external.scenes.some(s => s.id === sceneId)) {
        runExternalProjectScene(external, sceneId);
        return;
      }
      // Unknown scene id: resume the old scene rather than staying frozen.
      engine.cancelSceneJump();
    };
    engine.onGoToExternalScene = (key: string) => {
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      runExternalScene(key);
    };
    // By ref: the restart handler is declared below this effect, and it is
    // also what the Play tab's button calls.
    engine.onRestartScene = () => {
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      restartSceneRef.current?.();
    };
    // Cover on jump start, fade on landing — but not while previewing, where
    // the jump is canceled (above) and the cover would just flash.
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
    engine.onPlayMusic = playMusic;
    engine.onPlayerProgress = onPlayerProgress;
    engine.onControlsChange = (state: ControlsState) =>
      setArrowSet(arrowSetFor(state));
  }, [
    engineReady,
    playMusic,
    onPlayerProgress,
    onSceneLanded,
    scenes,
    runScene,
    runExternalScene,
    runExternalProjectScene,
  ]);

  // Start the live preview once the engine is ready.
  useEffect(() => {
    if (engineReady) {
      runProgram();
    }
  }, [engineReady, runProgram]);

  // Tab semantics: Play (re)starts at the chosen start scene
  // (or the beginning); returning to Code resumes previewing the scene being
  // edited. Skip the initial mount — the engine-ready effect handles the
  // first run.
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (!engineReady || prevTab === activeTab) {
      return;
    }
    if (activeTab === 'Play') {
      runScene(playStartSceneId ?? defaultPlaySceneId);
    } else if (activeTab === 'Code' || activeTab === 'World') {
      // Only when the stage shows something else: after Play, or after a
      // jump or an external scene. Code, World and Images share one
      // preview, so moving between them leaves it running.
      const playing = currentPlayingRef.current;
      const previewingActive =
        playing?.kind === 'local' && playing.scene.id === activeSceneId;
      if (prevTab === 'Play' || !previewingActive) {
        runScene(activeSceneId);
      }
    }
    // playStartSceneId is set in the same batch as the tab change; the
    // prevTab guard keeps its later changes from re-running the scene.
  }, [
    activeTab,
    engineReady,
    runScene,
    activeSceneId,
    defaultPlaySceneId,
    playStartSceneId,
  ]);

  // Save workspace code to the active scene.
  const writeActiveSceneSource = useCallback(
    (source: WorkspaceSerialization) => {
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s =>
          s.id === activeSceneId ? {...s, source} : s
        ),
      }));
    },
    [updateSources, activeSceneId]
  );

  // Change the active scene's world against the saved sources, so rapid
  // edits cannot overwrite each other, and refresh the preview. Editing the
  // resized world is what persists its size.
  const updateActiveWorld = useCallback(
    (update: (world: World) => World) => {
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s =>
          s.id === activeSceneId ? {...s, world: update(worldFor(s))} : s
        ),
      }));
      scheduleRun();
    },
    [updateSources, activeSceneId, scheduleRun, worldFor]
  );
  const handlePaintWorldCell = useCallback(
    (row: number, col: number, cell: WorldCell | null) =>
      updateActiveWorld(world => paintWorldCell(world, row, col, cell)),
    [updateActiveWorld]
  );

  // A world level about one kind of image offers the palette only the
  // level's image of that kind.
  const placeOne = !!levelProperties.levelMode?.placeOne;
  const paletteOnlyImage =
    levelProperties.levelMode?.kind === 'world' ? focusImageName : undefined;
  const handleMoveWorldCell = useCallback(
    (row: number, col: number, cell: WorldCell) =>
      updateActiveWorld(world => moveWorldCell(world, row, col, cell)),
    [updateActiveWorld]
  );

  // Rename an image and cascade through every reference — blocks in all
  // scenes, World grids, and the live workspace — so tidying a name never
  // breaks the project.
  const handleRenameImage = useCallback(
    (oldName: string, newName: string): string | null => {
      if (!newName) {
        return 'Enter a name.';
      }
      const list = getStore().getState().animationList;
      if (!isNameUnique(newName, list.propsByKey)) {
        return 'That name is already used.';
      }
      const key = list.orderedKeys.find(
        (k: string) => list.propsByKey[k]?.name === oldName
      );
      if (!key) {
        return 'Image not found.';
      }
      dispatch(setAnimationName(key, newName) as unknown as AnyAction);
      updateSources(prev => renameImageReferences(prev, oldName, newName));
      renameImageReferencesOnWorkspace(
        Blockly.getMainWorkspace(),
        oldName,
        newName
      );
      refreshAnimationDropdownThumbnails();
      scheduleRun();
      return null;
    },
    [dispatch, updateSources, scheduleRun]
  );

  const handleDeleteImage = useCallback(
    (name: string) => {
      updateSources(prev => removeImageReferences(prev, name));
      removeImageReferencesOnWorkspace(Blockly.getMainWorkspace(), name);
      refreshAnimationDropdownThumbnails();
      scheduleRun();
    },
    [updateSources, scheduleRun]
  );

  // A user edit: the workspace already displays this content; persist it
  // and refresh the preview. In toolbox mode the workspace IS the document
  // (levelbuilder Save serializes it directly), so there is nothing to do.
  const handleWorkspaceChange = useCallback(
    (source: WorkspaceSerialization) => {
      if (isToolboxMode) {
        return;
      }
      writeActiveSceneSource(source);
      // Keep the live preview in sync with the edited code.
      scheduleRun();
    },
    [writeActiveSceneSource, scheduleRun]
  );

  // Deliver user edits into the save/preview pipeline; intermediate field
  // edits (which don't serialize) just re-run the preview.
  useEffect(
    () => subscribeToChanges(handleWorkspaceChange, scheduleRun),
    [subscribeToChanges, handleWorkspaceChange, scheduleRun]
  );

  // Update the workspace when its content source changes. In toolbox mode
  // the workspace holds the toolbox itself, loaded once per sources
  // generation (so Start Over reloads it); after that the workspace alone
  // is the document, and the scene machinery below — which would seed the
  // student default program — never touches it. In program mode the
  // workspace follows the active scene and re-runs the preview.
  // Sources generation and workspace the toolbox was last loaded into.
  const toolboxLoadedForRef = useRef('');
  // Loads of a scene's code into the workspace.
  const sceneLoadsRef = useRef(0);
  // The key of the last added-blocks pass (see addLevelBlocks).
  const addedBlocksForRef = useRef('');
  // Set when Start Over leaves for the first level: the level being left and
  // the reinitialization count before its reset. The pass skips that reset,
  // or the fresh project would open with this level's blocks in it. A level
  // change ends it, consumed or not.
  const leavingResetRef = useRef<{level: number; reinitBefore: number}>();
  useEffect(() => {
    leavingResetRef.current = undefined;
  }, [levelProperties.id]);
  // The level's added blocks join the pinned scene once it is on screen:
  // once per level, load, sources generation and workspace. A level reached
  // in page loads nothing, so arriving runs it; a load puts the view back
  // wherever the workspace was, so a load runs it too and brings the
  // level's outline back on screen.
  const addLevelBlocks = useCallback(() => {
    if (
      !animationsSeeded ||
      isToolboxMode ||
      !levelProperties.addBlocks ||
      activeScene.id !== pinnedSceneId
    ) {
      return;
    }
    const key = [
      levelProperties.id,
      sourcesReinitializedCount,
      workspaceVersion,
      sceneLoadsRef.current,
    ].join(':');
    if (addedBlocksForRef.current === key) {
      return;
    }
    addedBlocksForRef.current = key;
    const leavingReset = leavingResetRef.current;
    if (
      leavingReset &&
      leavingReset.level === levelProperties.id &&
      sourcesReinitializedCount > leavingReset.reinitBefore
    ) {
      leavingResetRef.current = undefined;
      return;
    }
    const workspace = Blockly.getMainWorkspace() as BlocklyCore.WorkspaceSvg;
    addMissingBlocks(workspace, levelProperties.addBlocks);
  }, [
    animationsSeeded,
    levelProperties.id,
    levelProperties.addBlocks,
    activeScene.id,
    pinnedSceneId,
    sourcesReinitializedCount,
    workspaceVersion,
  ]);
  useEffect(() => {
    if (!animationsSeeded) {
      return;
    }
    if (isToolboxMode) {
      const loadedFor = `${sourcesReinitializedCount}:${workspaceVersion}`;
      if (toolboxLoadedForRef.current !== loadedFor) {
        toolboxLoadedForRef.current = loadedFor;
        // Toolbox edit sources always carry the object form (the
        // container builds them from the toolbox definition).
        loadCode((currentSources.source ?? {}) as WorkspaceSerialization);
      }
      return;
    }
    const source = activeScene.source ?? DEFAULT_SCENE_SOURCE;
    if (isEqual(getCurrentBlocks(), source)) {
      return;
    }
    sceneLoadsRef.current++;
    loadCode(source);
    runLocalScene(activeScene);
    // After the load, so the blocks sit below what the workspace holds.
    addLevelBlocks();
  }, [
    addLevelBlocks,
    animationsSeeded,
    activeScene,
    currentSources.source,
    getCurrentBlocks,
    loadCode,
    runLocalScene,
    sourcesReinitializedCount,
    // A re-injected workspace is empty, whatever caused it.
    workspaceVersion,
  ]);
  useEffect(() => {
    addLevelBlocks();
  }, [addLevelBlocks]);

  const sceneEditing = useSceneEditing({
    scenes,
    activeSceneId,
    setActiveSceneId,
    activeTab,
    channelId,
    updateSources,
    getScenes,
  });

  // Set once the audio hook below exists; the handler is defined first.
  const unlockGameAudioRef = useRef<() => void>(() => undefined);
  const handleEditorChange = useCallback(
    (editor: Editor) => dispatch(setActiveTab(editor)),
    [dispatch]
  );

  // A play control must not leave focus parked on the clicked button, where
  // Space — also a game key — would re-activate it on every press. Keyboard
  // activations hand focus to the playspace; pointer activations blur to
  // the page instead — a silent focus on the playspace would still grow a
  // ring at the player's first keypress, because the browser promotes the
  // focused element to :focus-visible on keyboard use.
  const playspaceRef = useRef<HTMLDivElement>(null);
  const handOffControlFocus = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isPointerClick(event)) {
        event.currentTarget.blur();
      } else {
        playspaceRef.current?.focus({preventScroll: true});
      }
    },
    []
  );

  const handleRestartGame = useCallback(() => {
    setPlayStartSceneId(null);
    runScene(defaultPlaySceneId);
  }, [runScene, defaultPlaySceneId]);

  // Re-run whatever scene is on stage right now (through any jumps).
  const handleRestartScene = useCallback(() => {
    const current = currentPlayingRef.current;
    if (!current) {
      runScene(defaultPlaySceneId);
    } else if (current.kind === 'local') {
      // Re-resolve by id: the scene's code may have been edited since.
      runScene(current.scene.id);
    } else {
      runExternalProjectScene(current.project, current.sceneId);
    }
  }, [runScene, defaultPlaySceneId, runExternalProjectScene]);
  restartSceneRef.current = handleRestartScene;

  // A restart from a block rides the scene-jump cover and fades when the new
  // run lands. A button press has no jump to land, so it asks for the same
  // fade itself — restarting should look the same however it was asked for.
  const handleRestartClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, restart: () => void) => {
      handOffControlFocus(event);
      setFadeTrigger(trigger => trigger + 1);
      restart();
    },
    [handOffControlFocus]
  );

  const links = useMemo(() => sceneLinks(scenes), [scenes]);

  // Entering Play from the start scene (null) or the previewed scene; the
  // first scene IS the beginning, so it plays as the start.
  const playFrom = useCallback(
    (startSceneId: string | null) => {
      setPlayStartSceneId(startSceneId);
      unlockGameAudioRef.current();
      dispatch(setActiveTab('Play'));
    },
    [dispatch]
  );
  const handlePreviewClick = useCallback(
    () => playFrom(activeSceneId === defaultPlaySceneId ? null : activeSceneId),
    [playFrom, activeSceneId, defaultPlaySceneId]
  );
  // Focus must not stay on a play button (see handOffControlFocus), and
  // the playspace is only focusable once Play has rendered, so a keyboard
  // activation's hand-off waits for the tab (below).
  const focusPlayspaceOnPlayRef = useRef(false);
  const handOffPlayFocus = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isPointerClick(event)) {
        event.currentTarget.blur();
      } else {
        focusPlayspaceOnPlayRef.current = true;
      }
    },
    []
  );
  const handlePlayClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      handOffPlayFocus(event);
      handlePreviewClick();
    },
    [handOffPlayFocus, handlePreviewClick]
  );
  const handlePlayGame = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      handOffPlayFocus(event);
      playFrom(null);
    },
    [handOffPlayFocus, playFrom]
  );
  useEffect(() => {
    if (activeTab === 'Play' && focusPlayspaceOnPlayRef.current) {
      focusPlayspaceOnPlayRef.current = false;
      playspaceRef.current?.focus({preventScroll: true});
    }
  }, [activeTab]);
  // Stop returns to the editing tab Play was entered from, or the level's
  // first one; a level that is only Play has no Stop.
  const [lastEditTab, setLastEditTab] = useState<Tab | null>(null);
  useEffect(() => {
    if (
      activeTab === 'Code' ||
      activeTab === 'World' ||
      activeTab === 'Images'
    ) {
      setLastEditTab(activeTab);
    }
  }, [activeTab]);
  const stopTab =
    lastEditTab && tabs.includes(lastEditTab)
      ? lastEditTab
      : tabs.find(tab => tab === 'Code' || tab === 'World');
  // The Play button that replaces Stop keeps a keyboard user's focus; a
  // pointer click blurs, as every play control does.
  const handleStopClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (stopTab) {
        if (isPointerClick(event)) {
          event.currentTarget.blur();
        }
        dispatch(setActiveTab(stopTab));
      }
    },
    [dispatch, stopTab]
  );

  // Only freeplay adds, renames, reorders or deletes scenes; a level with no
  // mode is unconstrained.
  const scenesEditable =
    !levelProperties.levelMode || isFreeplayMode(levelProperties.levelMode);
  // The stage: the preview beside Code and World and beside All scenes,
  // centered to play; Images takes the whole width.
  const playspaceMode: PlayspaceMode =
    activeTab === 'Play'
      ? 'play'
      : activeTab === 'Code' || activeTab === 'World' || activeTab === 'Scenes'
      ? 'preview'
      : 'hidden';

  const documentHidden = useDocumentHidden();
  // Freeze the game while nobody can see it: a hidden document stops
  // drawing on its own, but its timers would jump forward on return.
  useEffect(() => {
    engineRef.current?.setDrawPaused(
      playspaceMode === 'hidden' || stageCovered || documentHidden
    );
    // engineReady: pause an engine that appears while the stage is covered.
  }, [playspaceMode, stageCovered, documentHidden, engineReady]);

  // A typed scene says so up front; a scene made before scene types counts
  // once the engine runs it as a platformer.
  const hasPlatformScene =
    useMemo(() => scenes.some(scene => scene.type === 'platform'), [scenes]) ||
    playingPlatformer;
  const gameAudio = useGameAudio(engineRef, {
    hasPlatformScene,
    // A hidden document has already stopped the engine feeding it.
    playing: engineReady && playspaceMode === 'play' && !documentHidden,
  });
  unlockGameAudioRef.current = gameAudio.unlock;

  // Sizes the location-picker's hover ghost like the sprite the program would
  // create (helper libraries can change the default per run).
  const getDefaultSpriteSize = useCallback(
    () => engineRef.current?.library?.defaultSpriteSize || 100,
    []
  );

  const imagePaneProps = {
    uploadImage,
    onRenameImage: handleRenameImage,
    onDeleteImage: handleDeleteImage,
    lockedImageType: levelProperties.levelMode?.imageType,
    lockedImageSubject: levelProperties.levelMode?.imageSubject,
    imageRole: levelProperties.levelMode?.imageRole,
    advanced: imagesAdvanced,
    defaultStyle: DEFAULT_IMAGE_STYLE,
    // Freeplay hands back the paint tools.
    paintDisabled: !isFreeplayMode(levelProperties.levelMode),
    pickRequest: pictures.pickRequest,
    onImageCreated: pictures.onImageCreated,
    onPickCancel: pictures.onPickCancel,
  };

  return (
    <div className={moduleStyles.labRow}>
      {showStartOver && isEditable && (
        <StartOverDialog
          onConfirm={() => {
            const leaving = !!firstLevelId && firstLevelId !== currentLevelId;
            if (leaving) {
              leavingResetRef.current = {
                level: levelProperties.id,
                reinitBefore: sourcesReinitializedCount,
              };
            }
            startOver();
            setShowStartOver(false);
            if (leaving) {
              dispatch(navigateToLevelId(firstLevelId));
            }
          }}
          onCancel={() => setShowStartOver(false)}
          type="custom"
          message={
            firstLevelId ? START_OVER_RETURNS_MESSAGE : START_OVER_MESSAGE
          }
        />
      )}
      {!resourcesInBar && (
        <>
          <ResourcePanel
            levelProperties={levelProperties}
            isRunning={isRunning}
            hasRun={hasRun}
            hasEdited={hasEdited}
            settings={[...blocklySettings, themeSetting, ...gameAudio.settings]}
            className={classNames(
              !levelProperties.levelMode && moduleStyles.instructionsArea,
              !!levelProperties.levelMode && moduleStyles.resourceSidebar
            )}
            sidebarOnly={!!levelProperties.levelMode}
            footerButtons={
              isEditable && (
                <IconButtonWithTooltip
                  id="start-over"
                  label="Start Over"
                  icon={{iconName: 'refresh', iconStyle: 'solid'}}
                  variant="text"
                  color="tertiary"
                  tooltipDirection="onRight"
                  onClick={() => setShowStartOver(true)}
                  theme={theme}
                  size="small"
                />
              )
            }
          />
          <div className={moduleStyles.divider} />
        </>
      )}
      {isImageMode(levelProperties.levelMode) ? (
        // The sentence scene is the whole lab: its panel is the Guide,
        // instructions included.
        <div className={moduleStyles.imageLevelArea}>
          <SentenceScene
            imageType={levelProperties.levelMode?.imageType ?? 'sprite'}
            imageSubject={levelProperties.levelMode?.imageSubject}
            sentenceId={levelProperties.levelMode?.sentence}
            defaultStyle={DEFAULT_IMAGE_STYLE}
            imageRole={levelProperties.levelMode?.imageRole}
            uploadImage={uploadImage}
            instructions={
              objectives.active
                ? objectives.title
                : levelProperties.longInstructions
            }
            showTts={showTtsFor(levelProperties)}
          />
        </div>
      ) : (
        <LabShell
          barAtBottom={barAtBottom}
          rightExtra={
            <>
              {activeTab === 'Play' && nowPlaying && (
                <SceneMusicBar
                  title={nowPlaying.title}
                  loading={nowPlaying.loading}
                />
              )}
              {resourcesInBar && (
                <ToolButtons
                  levelId={levelProperties.id}
                  appName={levelProperties.appName}
                  theme={theme}
                  settings={[
                    ...blocklySettings,
                    themeSetting,
                    ...gameAudio.settings,
                  ]}
                  onStartOver={
                    isEditable ? () => setShowStartOver(true) : undefined
                  }
                />
              )}
            </>
          }
          sceneTabs={
            // A toolbox has no scenes: New scene would put the student default
            // into the saved toolbox.
            animationsSeeded && !isToolboxMode ? (
              <SceneTabs
                scenes={
                  pinnedSceneId &&
                  levelProperties.levelMode?.sceneTabs !== 'all'
                    ? sceneMetadata.filter(scene => scene.id === pinnedSceneId)
                    : sceneMetadata
                }
                activeSceneId={activeSceneId}
                galleryOpen={activeTab === 'Scenes'}
                disabled={activeTab === 'Play'}
                locked={!!pinnedSceneId}
                lockedReason={LOCKED_REASON}
                allowCreate={scenesEditable || !!pinnedSceneId}
                onSelectScene={sceneEditing.selectScene}
                onCreateScene={sceneEditing.createScene}
                onManageScenes={sceneEditing.openGallery}
              />
            ) : undefined
          }
        >
          {WorkspaceAlert}
          <div ref={stageRef} className={moduleStyles.stage}>
            {editorsShown &&
              (activeTab === 'World' ||
                activeTab === 'Code' ||
                activeTab === 'Images') && (
                <EditorStrip
                  editor={activeTab}
                  onChange={handleEditorChange}
                  editors={EDITORS}
                  disabledEditors={disabledEditors}
                  switchAtStart={editorsAtStart}
                  history={
                    activeTab === 'Code'
                      ? {canUndo, canRedo, undo, redo}
                      : undefined
                  }
                  style={clearOfPreview}
                />
              )}
            {/* Kept mounted (clipped) so the workspace survives tab switches;
          gated on animationsSeeded (see the seed effect). */}
            <div
              ref={codeWrapperRef}
              className={classNames(
                moduleStyles.codeTabWrapper,
                editorsShown && moduleStyles.underEditorStrip
              )}
              style={{
                clipPath: activeTab === 'Code' ? 'none' : 'inset(100%)',
                pointerEvents: activeTab === 'Code' ? 'auto' : 'none',
                // The code keeps clear of the preview's column.
                ...clearOfPreview,
              }}
            >
              {animationsSeeded && (
                <div id={BLOCKLY_DIV_ID} className={moduleStyles.blocklyDiv} />
              )}
            </div>

            {/* Kept mounted like the workspace: inserting the grid is the
          costly part. */}
            {/* Images: kept mounted, and off to the right rather than
            clipped while another editor shows, where a pick's dialog can
            still open inside it. */}
            {pictures.mounted && (
              <div
                ref={pictures.sheetRef}
                id={PICTURES_DRAWER_ID}
                role="region"
                aria-label="Images"
                className={classNames(
                  moduleStyles.codeTabWrapper,
                  moduleStyles.picturesEditor,
                  editorsShown && moduleStyles.underEditorStrip,
                  picturesStage === 'parked' &&
                    moduleStyles.picturesEditorParked
                )}
                style={picturesStyle}
                onTransitionEnd={event => {
                  if (
                    event.target === event.currentTarget &&
                    event.propertyName === 'transform' &&
                    !picturesActive
                  ) {
                    setPicturesStage('parked');
                  }
                }}
              >
                <GenerateImagePane {...imagePaneProps} jumboSide={jumboSide} />
              </div>
            )}
            {worldTabEnabled && worldMounted && (
              <div
                ref={worldWrapperRef}
                className={classNames(
                  moduleStyles.codeTabWrapper,
                  editorsShown && moduleStyles.underEditorStrip
                )}
                style={{
                  clipPath: activeTab === 'World' ? 'none' : 'inset(100%)',
                  pointerEvents: activeTab === 'World' ? 'auto' : 'none',
                  ...clearOfPreview,
                }}
              >
                <WorldTab
                  world={activeWorld}
                  sceneSize={activeSceneSize}
                  onPaintCell={handlePaintWorldCell}
                  emptyMessage={
                    picturesOffered
                      ? 'Make some pictures first.'
                      : 'Go back and make your image first.'
                  }
                  only={paletteOnlyImage}
                  onMoveCell={placeOne ? handleMoveWorldCell : undefined}
                  selected={worldPaletteSelection}
                  onSelect={choosePaletteSelection}
                  onNewPicture={
                    picturesOffered ? handleNewWorldPicture : undefined
                  }
                />
              </div>
            )}

            {/* Always mounted so the engine keeps running; animates between
          the preview beside the editors and the centered play view. */}
            <Playspace
              boxRef={playspaceRef}
              platformScene={playingPlatformer}
              mode={playspaceMode}
              columnHeader={
                previewBarShown ? <EditorStrip title="Preview" /> : undefined
              }
              onPreviewWidth={setPreviewWidth}
              side={previewSide}
              controls={
                <PlayControls
                  // On a pinned-scene level the game IS the one scene, so no
                  // whole-game restart.
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
                  onPlayGame={handlePlayGame}
                  playGameDisabled={!!pinnedSceneId}
                  playGameReason={LOCKED_REASON}
                  playSceneHidden={
                    !pinnedSceneId && activeScene.id === scenes[0].id
                  }
                />
              }
              below={
                levelProperties.levelMode ? (
                  <GenerateSpriteLab
                    docked
                    levelMode={levelProperties.levelMode}
                    instructions={levelProperties.longInstructions}
                    objectives={objectives}
                    levelProperties={levelProperties}
                  />
                ) : undefined
              }
              fadeTrigger={fadeTrigger}
              covered={jumpCover}
              loading={externalLoading}
              getDefaultSpriteSize={getDefaultSpriteSize}
              onPreviewClick={handlePreviewClick}
            />
          </div>

          {activeTab === 'Scenes' && (
            <Sheet
              title="All scenes"
              onDone={() => sceneEditing.selectScene(activeScene.id)}
            >
              <ScenesGallery
                scenes={sceneMetadata}
                activeSceneId={activeSceneId}
                editable={scenesEditable}
                links={links}
                onPlayGame={handlePlayGame}
                onOpenScene={sceneEditing.selectScene}
                onCreateScene={sceneEditing.createScene}
                onRenameScene={sceneEditing.renameScene}
                onDeleteScene={sceneEditing.deleteScene}
                onMakeStartScene={sceneEditing.makeStartScene}
              />
            </Sheet>
          )}
        </LabShell>
      )}
    </div>
  );
};

export default SpriteLab2View;

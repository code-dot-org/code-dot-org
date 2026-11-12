import {useTheme} from '@code-dot-org/component-library/common/contexts';
import * as BlocklyCore from 'blockly/core';
import classNames from 'classnames';
import {cloneDeep, isEqual} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual} from 'react-redux';
import {AnyAction, Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {applyBlockIdOverrides} from '@cdo/apps/blockly/utils';
import {navigateToLevelId} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevel,
  getCurrentLevels,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import {UseSourcesOutput} from '@cdo/apps/lab2/hooks/useSources';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {setIsStandaloneCollapsed} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import HeaderActionButton from '@cdo/apps/lab2/views/components/HeaderActionButton';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import StartOverDialog from '@cdo/apps/lab2/views/dialogs/dsco/StartOverDialog';
import {useLevelProperties} from '@cdo/apps/lab2/views/LevelPropertiesWrapper';
// p5lab/reducers is a CommonJS bundle of all the classic Sprite Lab slices;
// pull the ones the engine and image list need by key.
import * as p5labReducersModule from '@cdo/apps/p5lab/reducers';
import {
  revokeObjectUrlImages,
  setInitialAnimationList,
} from '@cdo/apps/p5lab/redux/animationList';
import {cancelLocationSelection} from '@cdo/apps/p5lab/redux/locationPicker';
import {getSerializedAnimationList} from '@cdo/apps/p5lab/shapes';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import runState, {setIsRunning} from '@cdo/apps/redux/runState';
import {isTargetEditable} from '@cdo/apps/util/isTargetEditable';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  AiChatClientTypes,
  LevelStatus,
  SpritelabAskAiRefusals,
} from '@cdo/generated-scripts/sharedConstants';

import {ownsTop} from '../addBlocks';
import {ImageSource, isImageSource} from '../ai/images/imageCache';
import {
  uploadAssetToLevel,
  uploadAssetToProject,
  UploadImageFunction,
} from '../ai/images/imageGeneration';
import useGameAudio from '../audioFeedback/useGameAudio';
import {
  catalogEntries,
  heldBackBlockTypes,
  newBlockTypes,
} from '../blockCatalog';
import {ownToolboxTypes} from '../blockLocks';
import {
  refreshSceneDropdowns,
  setSceneMenuActiveId,
  withSceneMenuActive,
} from '../blockly/blockDefinitions/goToScene';
import {PLAY_MUSIC_BLOCK_TYPE} from '../blockly/blockDefinitions/playMusic';
import {endKeyboardNavigation} from '../blockly/endKeyboardNavigation';
import {refreshAnimationDropdownThumbnails} from '../blockly/imagePickerFields';
import {codeFromSavedScene} from '../blockly/savedSceneCode';
import {withoutAiBlocks} from '../blockly/toolbox/aiBlocks';
import {activeCallout, calloutSelector} from '../callouts';
import defaultSources from '../defaultSources.json';
import {categoriesForType, imageTypeFromCategories} from '../imageGallery';
import {
  removeImageReferences,
  collectImageReferences,
  removeImageReferencesOnWorkspace,
} from '../imageReferences';
import {
  defaultImageName,
  defaultRole,
  imagesNamedForRole,
  imagesNamedInRole,
} from '../imageRoleDefaults';
import {onTrimsUpdated} from '../imageTrim';
import {
  editsWorld,
  generationLimitForMode,
  imageSourceForMode,
  isFreeplayMode,
  isOneImageMode,
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
import {objectiveChecks, runtimeNeeds, WorkspaceSource} from '../objectives';
import {packSources} from '../packedWorld';
import {
  countImagesByType,
  generatedOnLevel,
  ImageCounts,
  imageCountsDelta,
} from '../projectCounts';
import reseedablePageConstants, {
  RESET_PAGE_CONSTANTS,
} from '../redux/reseedablePageConstants';
import spriteLab2Reducer, {
  clearAskAi,
  MusicProjectOption,
  resetSpriteLab2,
  setActiveTab,
  setMusicProjects,
  setScenes,
  Tab,
} from '../redux/spriteLab2Redux';
import {sceneMetadataFor} from '../sceneThumbnails';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {SpriteLab2LevelProperties, Scene, Sources} from '../types';
import {
  compileWorldPrelude,
  DEFAULT_SCENE_GRID_SIZE,
  paintWorldCell,
  resizeWorld,
  sceneGridSize,
  World,
  WorldCell,
} from '../world';
import {useWorldStartPattern} from '../worldStartPattern';

import BlockCatalogDialog from './BlockCatalogDialog';
import {isPointerClick} from './blurAfterPointerClick';
import AskAiIndicator from './components/AskAiIndicator';
import Callout from './components/Callout';
import EditorStrip, {EditHistory} from './components/EditorStrip';
import {Editor} from './components/EditorSwitch';
import LabShell from './components/LabShell';
import RunButtons, {ArrowCross} from './components/PlayBar';
import PlayControls from './components/PlayControls';
import PromptBar from './components/PromptBar';
import {sceneDropdownButtonId} from './components/SceneDropdown';
import WorkspaceSceneBar from './components/WorkspaceSceneBar';
import DiscoverBlocksButton, {
  DISCOVER_BLOCKS_BUTTON_ID,
} from './DiscoverBlocksButton';
import FreeplayIntroDialog from './FreeplayIntroDialog';
import ImagesTab from './images/ImagesTab';
import {createNamedAnimation} from './imageSave';
import {ArrowSet, arrowSetFor, ControlsState} from './playBar';
import Playspace, {PlayspaceMode} from './Playspace';
import ScenesDialog from './ScenesDialog';
import useBlocklyWorkspace, {BLOCKLY_DIV_ID} from './useBlocklyWorkspace';
import useDocumentHidden from './useDocumentHidden';
import {useFlyoutDots} from './useFlyoutDots';
import useLevelBlocks from './useLevelBlocks';
import {useObjectives, usePlayProgress} from './useObjectives';
import usePicturesSheet from './usePicturesSheet';
import useSceneEditing from './useSceneEditing';
import useSceneMusic from './useSceneMusic';
import useSceneThumbnails from './useSceneThumbnails';
import useTabFade from './useTabFade';
import WorldTab from './WorldTab';

import moduleStyles from './sprite-lab2-view.module.scss';

const p5labReducers = p5labReducersModule as unknown as Record<string, Reducer>;

// Legacy slices the reused engine and image list read from the shared
// getStore() store. (The classic AnimationTab/Piskel slices aren't used.)
registerReducers({
  animationList: p5labReducers.animationList,
  textConsole: p5labReducers.textConsole,
  // Read/written by the location-picker block.
  locationPicker: p5labReducers.locationPicker,
  runState,
  pageConstants: reseedablePageConstants,
  spriteLab2: spriteLab2Reducer,
});

const ENABLED_TABS: readonly Tab[] = ['Images', 'Code', 'Play'];
// The Images pane, for the hook that keeps it inert while closed.
const PICTURES_DRAWER_ID = 'spritelab2-pictures';
// The editor switch's order.
const EDITORS: Editor[] = ['Images', 'World', 'Code'];
// The preview column's share of the browser's width: beside a 280 px panel
// at a 1280 px window this leaves the workspace about 720 px, free play's
// widest toolbox block and widest stack side by side.
const PREVIEW_SHARE = 0.22;
// On hover over a control a level withholds.
const LOCKED_REASON = 'Unlocks later in the lesson.';

// ?image-source=live|cached overrides the level's, and
// ?image-cache-url= reads another tree (a local one, or a version under
// review), for internal testing.
function getImageSourceParam(): ImageSource | undefined {
  const value = queryParams('image-source');
  return isImageSource(value) ? value : undefined;
}

function getImageCacheUrlParam(): string | undefined {
  const value = queryParams('image-cache-url');
  if (typeof value !== 'string' || !value) {
    return undefined;
  }
  return value.endsWith('/') ? value : `${value}/`;
}

const DEFAULT_SCENE_SOURCE = defaultSources.source;
const DEFAULT_PANE_WIDTH = 280;
const DEFAULT_SCENE_ID = 'scene-1';
const NO_IMAGES: ImageCounts = {sprite: 0, background: 0, block: 0};

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
// Start Over on a level outside a lesson resets only that level. A level
// with no project (no_project) has no saved work of the student's to lose.
const START_OVER_RESETS_LEVEL_MESSAGE =
  'This puts the level back the way it started.';
const START_OVER_LEAVES_MESSAGE = "You'll start again from the first level.";

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
  const imageSourceParam = useMemo(getImageSourceParam, []);
  const imageCacheUrlParam = useMemo(getImageCacheUrlParam, []);
  // The advanced image settings, for authors; level edit modes have them.
  const imagesAdvanced =
    useMemo(() => queryParams('images-advanced') === 'true', []) ||
    isLevelEditMode;
  // The mode decides the tab set, and an image level's is empty: its panel
  // replaces the shell. A level with no mode, or one whose authored kind is
  // not a kind we know, falls back to the lab defaults.
  const tabs = useMemo(
    () => tabsForMode(levelProperties.levelMode) ?? ENABLED_TABS,
    [levelProperties.levelMode]
  );
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
    if (tabs.length && !tabs.includes(activeTab)) {
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
  // the student back to the lesson's first level to remake it; a level
  // outside a lesson has no first level to go to and resets itself in place.
  // A level with no project (no_project) is not editable but is offered
  // Start Over all the same, since it also leaves for the first level.
  const projectless = levelProperties.usesProjects === false;
  const startOverOffered = isEditable || projectless;
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
  // The new-block catalog: the unit's new blocks stay out of the toolbox
  // until the student adds them from the dialog. Off in the levelbuilder's
  // edit modes, whose saves would carry its flags into every student's
  // start sources.
  const catalogOn = !!levelProperties.blockCatalog && !isLevelEditMode;
  // The catalog's blocks are the ones no earlier level of the lesson
  // required (blockCatalog.ts); outside a lesson there are none.
  const {levelPropertiesMap} = useLevelProperties();
  // getCurrentLevels returns a new list every time it is called. shallowEqual
  // compares the ids one by one, so this value only changes when the lesson's
  // levels do. Without it, every render would rebuild the toolbox.
  const lessonLevelIds = useAppSelector(
    state =>
      (getCurrentLevels(state) as {id: string | number}[] | undefined)?.map(
        level => String(level.id)
      ),
    shallowEqual
  );
  const earlierLevels = useMemo(() => {
    const currentLevelIndex =
      lessonLevelIds?.indexOf(String(levelProperties.id)) ?? -1;
    return currentLevelIndex < 0
      ? undefined
      : (lessonLevelIds ?? [])
          .slice(0, currentLevelIndex)
          .map(id => levelPropertiesMap[id] as SpriteLab2LevelProperties)
          .filter(Boolean);
  }, [lessonLevelIds, levelPropertiesMap, levelProperties.id]);
  const catalog = useMemo(
    () =>
      catalogOn && earlierLevels
        ? catalogEntries(newBlockTypes(levelProperties, earlierLevels))
        : [],
    [catalogOn, earlierLevels, levelProperties]
  );
  const chosenBlocks = currentSources.chosenBlocks;
  const chosenBlockSet = useMemo(
    () => new Set(chosenBlocks ?? []),
    [chosenBlocks]
  );
  // Catalog blocks the student has yet to add.
  const heldBackBlocks = useMemo(
    () => heldBackBlockTypes(catalog, chosenBlocks),
    [catalog, chosenBlocks]
  );
  const inAiPilot = useAppSelector(
    state =>
      state.currentUser.spritelabAskAiRefusal !==
      SpritelabAskAiRefusals.NOT_IN_PILOT
  );
  const [showBlockCatalog, setShowBlockCatalog] = useState(false);
  const [showFreeplayIntro, setShowFreeplayIntro] = useState(false);
  // An arrow at Discover blocks, from when the intro closes until the
  // catalog opens.
  const [showCatalogArrow, setShowCatalogArrow] = useState(false);
  // The intro counts as seen only once closed, so a reload while it is open
  // shows it again.
  const closeFreeplayIntro = useCallback(() => {
    setShowFreeplayIntro(false);
    setShowCatalogArrow(true);
    if (!currentSources.freeplayIntroSeen) {
      patchSources({freeplayIntroSeen: true});
    }
  }, [currentSources.freeplayIntroSeen, patchSources]);
  const addCatalogBlock = useCallback(
    (type: string) => {
      if (!chosenBlockSet.has(type)) {
        patchSources({chosenBlocks: [...chosenBlockSet, type]});
      }
    },
    [chosenBlockSet, patchSources]
  );

  // The project's pictures, in a sheet over the workspace.
  const picturesOffered = tabs.includes('Images');
  const pictures = usePicturesSheet({ready: animationsSeeded});

  const scenes = useMemo(() => getScenes(currentSources), [currentSources]);

  // Create the pinned scene on first load, and again after Start Over (the
  // reinit count is in the deps). On a project with no scenes the pinned
  // scene becomes the only one: materializing the synthesized default scene
  // too would leave a stray "Scene 1" in every level sharing the project.
  // A pin whose id is the default scene's adopts that scene however it was
  // saved. Toolbox mode has no scenes to pin, so the property is cleared at
  // this one read and everything below sees no pin.
  const pinnedScene = isToolboxMode ? undefined : levelProperties.pinnedScene;
  const pinnedSceneId = pinnedScene?.id;
  const pinnedSceneName = pinnedScene?.name;
  const pinnedSceneSource = pinnedScene?.source;
  const extraScene = isToolboxMode ? undefined : levelProperties.extraScene;
  useEffect(() => {
    if (!pinnedSceneId) {
      return;
    }
    updateSources(prev => {
      const existing =
        prev.scenes?.length ||
        (prev.source && !isEqual(prev.source, DEFAULT_SCENE_SOURCE))
          ? getScenes(prev)
          : [];
      const wanted = [
        {
          id: pinnedSceneId,
          name: pinnedSceneName || 'Scene',
          source: pinnedSceneSource,
        },
        ...(extraScene ? [extraScene] : []),
      ].filter(scene => !existing.some(s => s.id === scene.id));
      if (!wanted.length) {
        return prev;
      }
      const added: Scene[] = wanted.map(scene => ({
        id: scene.id,
        name: scene.name,
        source: scene.source ?? DEFAULT_SCENE_SOURCE,
      }));
      return {...prev, scenes: [...existing, ...added]};
    });
  }, [
    pinnedSceneId,
    pinnedSceneName,
    pinnedSceneSource,
    extraScene,
    updateSources,
    sourcesReinitializedCount,
  ]);

  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    () => pinnedSceneId ?? scenes[0].id
  );
  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0];
  const enabledTabs = tabs;
  // Any editor tab shows the editor strip, with the other editors dimmed, so
  // the student can see where they are.
  const editorsShown = tabs.some(
    tab => tab === 'Images' || tab === 'Code' || tab === 'World'
  );
  // An editor the level withholds is shown disabled rather than left out, so
  // nothing new appears in free play.
  const disabledEditors = useMemo<Editor[]>(
    () => [
      ...(picturesOffered ? [] : (['Images'] as Editor[])),
      ...(tabs.includes('Code') ? [] : (['Code'] as Editor[])),
      ...(enabledTabs.includes('World') ? [] : (['World'] as Editor[])),
    ],
    [tabs, enabledTabs, picturesOffered]
  );
  // hideNonInstructionTabs: the instructions panel shows only its
  // instructions tab on this lab.
  const panelLevelProperties = useMemo(
    () => ({...levelProperties, hideNonInstructionTabs: true}),
    [levelProperties]
  );
  // Images is open while its tab is: the hook's open state drives the
  // pane's inertness and its mount.
  const setPicturesOpen = pictures.setOpen;
  useEffect(() => {
    setPicturesOpen(activeTab === 'Images');
  }, [activeTab, setPicturesOpen]);
  // The right-hand inset the editors leave empty for the preview column.
  const clearOfPreview = {right: previewWidth};
  // The Images tab's pane column, headed AI, at the right, is as wide as
  // the preview column is or would be, which the playspace reports whether
  // or not its preview shows.
  const [previewColumnWidth, setPreviewColumnWidth] = useState(0);
  const paneWidthPx = previewColumnWidth || DEFAULT_PANE_WIDTH;
  const clearOfPane = {right: paneWidthPx};
  // Free play keeps the instructions out of the way: the panel starts
  // collapsed to its tab, which expands it again. The view stays mounted
  // from level to level, so the level's id is a dependency too.
  const freeplayLevel = isFreeplayMode(levelProperties.levelMode);
  const instructionsCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  useEffect(() => {
    dispatch(setIsStandaloneCollapsed(freeplayLevel));
    // Another lab's view may follow in the same page.
    return () => {
      dispatch(setIsStandaloneCollapsed(false));
    };
  }, [freeplayLevel, levelProperties.id, dispatch]);
  // The workspace does not notice its container changing size.
  useEffect(() => {
    const workspace = Blockly.getMainWorkspace?.() as
      | BlocklyCore.WorkspaceSvg
      | undefined;
    if (workspace) {
      Blockly.svgResize(workspace);
    }
  }, [previewWidth, editorsShown, instructionsCollapsed]);
  useEffect(() => {
    if (activeTab === 'World' && !enabledTabs.includes('World')) {
      dispatch(
        setActiveTab(enabledTabs.includes('Code') ? 'Code' : enabledTabs[0])
      );
    }
  }, [activeTab, enabledTabs, dispatch]);
  const authoredToolbox = levelProperties.toolboxDefinition;
  const sceneToolbox = useMemo(
    () =>
      authoredToolbox && !inAiPilot
        ? withoutAiBlocks(authoredToolbox)
        : authoredToolbox,
    [authoredToolbox, inAiPilot]
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
  // Memoized: a scene with no saved world gets an empty one, and a fresh
  // grid every render would re-run the objectives effect without end.
  const activeSceneWorld = activeScene?.world;
  const activeWorld = useMemo(
    () => resizeWorld(activeSceneWorld, seedSceneSize),
    [activeSceneWorld, seedSceneSize]
  );
  const activeSceneSize = sceneGridSize(activeWorld);
  // The project's images, for guide steps waiting on some being made.
  const animationList = useAppSelector(state => state.animationList);

  const sceneMetadata = useMemo(
    () => sceneMetadataFor(scenes, animationList),
    [scenes, animationList]
  );

  // The scenes the student may open on this level: on a pinned level the
  // pin and, when the level says so, its extra scene; otherwise every
  // scene.
  const openableSceneIds = useMemo(
    () =>
      pinnedSceneId
        ? [
            pinnedSceneId,
            ...(extraScene?.editable ? [extraScene.id] : []),
          ].filter(id => scenes.some(s => s.id === id))
        : scenes.map(s => s.id),
    [pinnedSceneId, extraScene, scenes]
  );
  // Keep activeSceneId pointing at a real scene: locked to the pin's scenes
  // once the ensure effect lands them, otherwise reset to the first scene
  // when the active one disappears (e.g. code cleared via start over).
  useEffect(() => {
    if (pinnedSceneId) {
      if (
        !openableSceneIds.includes(activeSceneId ?? '') &&
        scenes.some(s => s.id === pinnedSceneId)
      ) {
        setActiveSceneId(pinnedSceneId);
      }
      return;
    }
    if (!scenes.some(s => s.id === activeSceneId)) {
      setActiveSceneId(scenes[0].id);
    }
  }, [scenes, activeSceneId, pinnedSceneId, openableSceneIds]);

  // Premade world, when the level authors one.
  const paintedWorld = useWorldStartPattern({
    pattern: levelProperties.worldStartPattern,
    pinnedSceneId,
    enabled: animationsSeeded,
    animations: animationList,
    spriteRole: defaultRole(levelProperties.imageRoleDefaults, 'sprite'),
    roles: levelProperties.worldStartRoles,
    updateSources,
  });
  // The extra scene's premade world, painted by the same rules.
  useWorldStartPattern({
    pattern: extraScene?.worldStartPattern,
    pinnedSceneId: extraScene?.id,
    enabled: animationsSeeded,
    animations: animationList,
    spriteRole: defaultRole(levelProperties.imageRoleDefaults, 'sprite'),
    roles: extraScene?.worldStartRoles,
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
  // The images made on this level, by type. A level that makes one image
  // for a role also counts that image when it was made on an earlier
  // visit. A student who comes back changes that image in place, so no new
  // image would ever be counted, and the level's image steps could not be
  // ticked.
  const levelImageType = levelProperties.levelMode?.imageType;
  const levelImageRole = levelProperties.levelMode?.imageRole;
  const objectiveImages = useMemo(() => {
    // No image is counted until this level's image list has loaded. Until
    // then the store still holds the previous level's images, and a step
    // they completed would stay completed.
    if (!animationsSeeded) {
      return NO_IMAGES;
    }
    const made = imageCountsDelta(
      countImagesByType(animationList),
      baselineImages
    );
    const roleImageExists =
      !!levelImageType &&
      imagesNamedForRole(animationList, levelImageType, levelImageRole).length >
        0;
    return roleImageExists
      ? {...made, [levelImageType]: Math.max(made[levelImageType], 1)}
      : made;
  }, [
    animationsSeeded,
    animationList,
    baselineImages,
    levelImageType,
    levelImageRole,
  ]);
  // The World grid a "changed" check compares against: the pinned scene's
  // world as the level opened, from the same load-time sources as the image
  // baseline, with the level's premade world painted in.
  const baselineGrid = useMemo(
    () =>
      paintedWorld?.grid ??
      getScenes(initialSources).find(scene => scene.id === pinnedSceneId)?.world
        ?.grid,
    [paintedWorld, initialSources, pinnedSceneId]
  );
  const objectiveRoles = useMemo(() => {
    const roles = new Set<string>();
    objectiveChecks(levelProperties.objectives).forEach(check => {
      if ('role' in check && check.role) {
        roles.add(check.role);
      }
    });
    return [...roles];
  }, [levelProperties.objectives]);
  const imagesForRole = useMemo(
    () =>
      Object.fromEntries(
        objectiveRoles.map(role => [
          role,
          // World cells hold sprites and blocks alike.
          imagesNamedInRole(animationList, role),
        ])
      ),
    [objectiveRoles, animationList]
  );
  const imageNames = useMemo(
    () =>
      new Set(
        animationList.orderedKeys.map(
          key => animationList.propsByKey[key]?.name
        )
      ),
    [animationList]
  );
  // The level's starter images join the project once, by name or role: a
  // starter stays out when the student has their own image in its role.
  // Several starters may share a role (a set of blocks), so a sibling
  // starter in the role does not keep the others out.
  useEffect(() => {
    const starters = levelProperties.starterImages;
    if (
      !starters?.length ||
      !animationsSeeded ||
      !isEditable ||
      isLevelEditMode
    ) {
      return;
    }
    const starterNames = new Set(starters.map(starter => starter.name));
    starters.forEach(starter => {
      const inRole =
        !!starter.role &&
        imagesNamedForRole(animationList, starter.imageType, starter.role).some(
          name => !starterNames.has(name)
        );
      if (inRole || imageNames.has(starter.name)) {
        return;
      }
      const {name, imageType, role, src, ...frames} = starter;
      createNamedAnimation(dispatch, name, {
        sourceUrl: src,
        sourceSize: frames.frameSize,
        ...frames,
        categories: categoriesForType(imageType),
        ...(role && {role}),
      });
    });
  }, [
    levelProperties.starterImages,
    animationsSeeded,
    isEditable,
    animationList,
    imageNames,
    dispatch,
  ]);
  // The AI-made images that count as made on this level, and whether one
  // has been rated (see generatedOnLevel).
  const {generated, rated} = useMemo(
    () =>
      generatedOnLevel(
        animationList,
        new Set(
          Object.values(initialSources.animations?.propsByKey ?? {}).map(
            props => props.name
          )
        ),
        new Set(
          levelImageType
            ? imagesNamedForRole(animationList, levelImageType, levelImageRole)
            : []
        )
      ),
    [animationList, initialSources, levelImageType, levelImageRole]
  );
  const sceneSources = useMemo(
    () =>
      Object.fromEntries(
        scenes.map(scene => [
          scene.id,
          scene.source as WorkspaceSource | undefined,
        ])
      ),
    [scenes]
  );
  // The student completed this level on an earlier visit. This is the
  // level's saved status, the same one that colors its bubble in the
  // header. On the way to another level the store's current level changes
  // before this view is replaced, so the status is read only while the
  // current level is still this one.
  const completedBefore = useAppSelector(
    state =>
      String(state.progress.currentLevelId) === String(levelProperties.id) &&
      getCurrentLevel(state)?.status === LevelStatus.perfect
  );
  const objectives = useObjectives({
    objectives: levelProperties.objectives,
    images: objectiveImages,
    grid: activeWorld.grid,
    baselineGrid,
    imagesForRole,
    source: activeScene.source as WorkspaceSource | undefined,
    sceneSources,
    editingSceneId: activeScene.id,
    everPlayed: playProgress.everPlayed,
    generated,
    rated,
    runtime: playProgress.runtime,
    completedBefore,
  });

  // The callout arrow at a tab, shown while the level's condition holds.
  const callout = activeCallout(levelProperties.callouts, {
    done: objectives.earned,
    tab: activeTab,
    scene: activeScene.id,
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
  // The World palette preselects the level's image of its imageType. A
  // background is never preselected, since a world cell holds a sprite or a
  // block. A selection whose image has since been deleted counts as none.
  const focusImageType = levelProperties.levelMode?.imageType;
  const focusImageRole = levelProperties.levelMode?.imageRole;
  const imageRoleDefaults = levelProperties.imageRoleDefaults;
  const paletteRoles = levelProperties.levelMode?.paletteRoles;
  // The palette's starting selection. On a level about one kind of image:
  // the image made on this level (its imageRole) first, then the
  // image_role_defaults image for that role, else the newest image of the
  // kind (orderedKeys is newest-first, since Sprite Lab prepends new
  // animations). On a world level with palette roles and no kind: the first
  // image of the first role, so the role the level lists first is what the
  // student places first.
  const focusImage = useMemo<WorldCell | undefined>(() => {
    if (focusImageType === 'background') {
      return undefined;
    }
    if (focusImageType) {
      const newest = animationList.orderedKeys.find(
        key =>
          imageTypeFromCategories(animationList.propsByKey[key]?.categories) ===
          focusImageType
      );
      const name =
        imagesNamedForRole(animationList, focusImageType, focusImageRole)[0] ??
        defaultImageName(animationList, imageRoleDefaults, focusImageType) ??
        (newest ? animationList.propsByKey[newest]?.name : undefined);
      return name ? {image: name, kind: focusImageType} : undefined;
    }
    for (const role of paletteRoles ?? []) {
      for (const kind of ['sprite', 'block'] as const) {
        const name = imagesNamedForRole(animationList, kind, role)[0];
        if (name) {
          return {image: name, kind};
        }
      }
    }
    return undefined;
  }, [
    focusImageType,
    focusImageRole,
    paletteRoles,
    animationList,
    imageRoleDefaults,
  ]);
  const focusImageName = focusImage?.image;
  useEffect(() => {
    if (focusImageType === 'background') {
      return;
    }
    if (!focusImageType && !paletteRoles?.length) {
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
    if ((focusImage?.image ?? null) === (current ?? null)) {
      return;
    }
    setWorldPaletteSelection(focusImage ?? null);
  }, [
    worldPaletteSelection,
    focusImageType,
    focusImage,
    paletteRoles,
    animationList,
  ]);

  // Store scenes in redux for Blockly dropdowns and AI prompt.
  // TODO: does this need to live in redux?
  useEffect(() => {
    dispatch(setScenes(sceneMetadata));
    // Go-to-scene blocks draw the pictures from that store.
    refreshSceneDropdowns();
  }, [sceneMetadata, dispatch]);
  useEffect(() => {
    setSceneMenuActiveId(activeSceneId);
    refreshSceneDropdowns();
  }, [activeSceneId]);

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
    // Workspace injection only waits on the user's songs when saved blocks
    // hold one; the gated path times out into placeholder options so a hung
    // API can't blank the lab.
    const savedSongs = collectSavedSongs(getScenes(initialSources));
    const withTimeout = <T,>(fetching: Promise<T>): Promise<T> =>
      Promise.race([
        fetching,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), LIST_FETCH_TIMEOUT_MS)
        ),
      ]);
    const musicOptions = async (): Promise<MusicProjectOption[]> => {
      try {
        return await withTimeout(fetchMusicProjects());
      } catch (e) {
        console.warn('music projects unavailable', e);
        return [];
      }
    };
    if (savedSongs.length === 0) {
      setAnimationsSeeded(true);
    } else {
      musicSeededRef.current = true;
      musicOptions().then(music => {
        if (canceled) {
          return;
        }
        dispatch(setMusicProjects(withUnavailableSongs(music, savedSongs)));
        setAnimationsSeeded(true);
      });
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
  const currentPlayingRef = useRef<{kind: 'local'; scene: Scene} | null>(null);

  // Re-run the stage once a reseeded animation list finishes loading. The
  // reseed-triggered run happens immediately, but reseeded entries carry
  // only a sourceUrl (dataURIs load async) and the engine can't draw
  // unloaded images (costume/background commands no-op on unknown names —
  // a blank playspace until the next run). Kept in a ref (not effect
  // cleanup): the reseed effect's deps churn on every animation
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
    if (isToolboxMode) {
      // Toolbox mode has no stage: the toolbox being edited takes the
      // workspace. With no engine the run machinery does nothing and no
      // stray canvas mounts.
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

  // Persist Images-tab changes back to sources in the serialized shape,
  // serialized from the live store.
  const writeAnimations = useCallback(
    (forceSave?: boolean) =>
      patchSources(
        {
          animations: getSerializedAnimationList(
            getStore().getState().animationList
          ),
        },
        forceSave
      ),
    [patchSources]
  );
  useEffect(() => {
    writeAnimations();
  }, [animationList, writeAnimations]);
  // A picture that just became an image is worth a save of its own.
  const saveImagesNow = useCallback(
    () => writeAnimations(true),
    [writeAnimations]
  );

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
    hiddenBlockTypes: heldBackBlocks,
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
        // A level with no project keeps its worlds packed in the level file.
        const saved =
          mode === 'start' && projectless ? packSources(sources) : sources;
        return {
          [mode === 'start' ? 'start_sources' : 'exemplar_sources']: saved,
        };
      },
      [currentSources, getToolboxDefinition, projectless]
    )
  );

  // The active scene's world, by ref: run callbacks read it at call time,
  // so world edits don't churn their identities.
  const activeWorldRef = useRef<World | undefined>(undefined);
  const activeSceneIdRef = useRef<string | undefined>(undefined);
  const activeSceneRef = useRef<Scene | undefined>(undefined);
  useEffect(() => {
    activeWorldRef.current = activeWorld;
    activeSceneIdRef.current = activeScene?.id;
    activeSceneRef.current = activeScene;
  }, [activeScene, activeWorld]);

  const requestThumbnail = useSceneThumbnails({
    engineRef,
    scenes,
    channelId,
    uploadImage,
    updateSources,
    getScenes,
    enabled: !isToolboxMode,
  });

  // Run the current program as the live preview (cheap: the engine reuses
  // p5), held on its first frame.
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
    engine.runProgram(program, referencedImages, {holdFirstFrame: true});
  }, [dispatch, getCode, requestThumbnail]);

  const activePrompt = useAppSelector(state => state.spriteLab2.prompt);
  const askAiStatus = useAppSelector(state => state.spriteLab2.askAi);
  const handleAskAiExpired = useCallback(
    () => dispatch(clearAskAi()),
    [dispatch]
  );

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
      currentPlayingRef.current = {kind: 'local', scene};
      const {result: program, referencedImages} = collectImageReferences(() => {
        const prelude = compileWorldPrelude(worldFor(scene));
        let code = '';
        try {
          const live = scene.id === activeSceneId ? getCode() : null;
          code =
            live ??
            withSceneMenuActive(scene.id, () =>
              codeFromSavedScene(scene.source ?? DEFAULT_SCENE_SOURCE)
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
      engine.runProgram(program, referencedImages);
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
  }, [
    animationsSeeded,
    sceneToolbox,
    heldBackBlocks,
    workspaceVersion,
    refreshToolbox,
  ]);

  // A level without a catalog closes it and drops its arrow.
  useEffect(() => {
    if (!catalog.length) {
      setShowBlockCatalog(false);
      setShowCatalogArrow(false);
    }
  }, [catalog.length]);

  // The free play intro opens the first time the student reaches a level that
  // asks for it. Off in edit modes, whose saves would carry its flag into
  // start sources.
  useEffect(() => {
    setShowFreeplayIntro(
      !!levelProperties.freeplayIntro &&
        isEditable &&
        !isLevelEditMode &&
        animationsSeeded &&
        !currentSources.freeplayIntroSeen
    );
  }, [
    levelProperties.freeplayIntro,
    isEditable,
    animationsSeeded,
    currentSources.freeplayIntroSeen,
  ]);

  const {playMusic} = useSceneMusic(activeTab === 'Play', musicProjects);

  // All scenes: a dialog over the editors and the stage, opening on a new
  // scene's name when asked for one.
  const [scenesDialog, setScenesDialog] = useState<{
    creating: boolean;
  } | null>(null);
  const stageCovered = !!scenesDialog;
  // Hidden content stays in the tab order and the accessibility tree:
  // inert while hidden, via refs (React 18's JSX has no inert attribute).
  // worldMounted: the world's wrapper can first render after the last change.
  const stageRef = useRef<HTMLDivElement>(null);
  const codeWrapperRef = useRef<HTMLDivElement>(null);
  const worldWrapperRef = useRef<HTMLDivElement | null>(null);
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
  // Closing All scenes can leave focus nowhere: its opener in the scene
  // menu unmounted with the menu, or the bar's button let go of focus on
  // its click. The scene menu's trigger takes it. This runs after the
  // inert effect above on purpose: until that effect releases the stage,
  // the trigger refuses focus.
  const scenesWereOpenRef = useRef(false);
  useEffect(() => {
    if (
      scenesWereOpenRef.current &&
      !scenesDialog &&
      document.activeElement === document.body
    ) {
      document.getElementById(sceneDropdownButtonId())?.focus();
    }
    scenesWereOpenRef.current = !!scenesDialog;
  }, [scenesDialog]);

  const fade = useTabFade(activeTab, {
    Code: codeWrapperRef,
    World: worldWrapperRef,
    Images: pictures.sheetRef,
  });

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
  // it, don't also jump. Any key typed into a text field, such as the prompt's
  // answer, is the field's alone. Stopping at document keeps the event from
  // p5's window listener; the control's default action is unaffected.
  useEffect(() => {
    const swallowOnControls = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (
        isTargetEditable(e.target) ||
        (GAME_KEYS.has(e.key) && target?.closest(INTERACTIVE_CONTROLS))
      ) {
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
        // Follow the jump in the editor too, so leaving Play lands on the
        // scene that was just playing. A pinned level edits one scene only;
        // moving its editor would be undone at once, re-running the pinned
        // scene under the game.
        if (!pinnedSceneId) {
          setActiveSceneId(sceneId);
        }
        runScene(sceneId);
        return;
      }
      // Unknown scene id: resume the old scene rather than staying frozen.
      engine.cancelSceneJump();
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
    pinnedSceneId,
    runScene,
  ]);

  // Start the live preview once the engine is ready. A level that opens on
  // the Play tab starts the game instead, and the preview holds its first
  // frame. Read through a ref so later scene edits do not restart the game.
  const openingRef = useRef({
    onPlay: activeTab === 'Play',
    runScene,
    sceneId: defaultPlaySceneId,
  });
  openingRef.current = {
    onPlay: activeTab === 'Play',
    runScene,
    sceneId: defaultPlaySceneId,
  };
  useEffect(() => {
    if (!engineReady) {
      return;
    }
    const opening = openingRef.current;
    if (opening.onPlay) {
      opening.runScene(opening.sceneId);
    } else {
      runProgram();
    }
    // inAiPilot reruns this once the user loads; earlier runs refuse AI blocks.
  }, [engineReady, runProgram, inAiPilot]);
  // The premade world is painted once the engine is ready and the images it
  // names exist. A level that opened on Play restarts the game with it.
  useEffect(() => {
    const opening = openingRef.current;
    if (engineReady && paintedWorld && opening.onPlay) {
      opening.runScene(opening.sceneId);
    }
  }, [engineReady, paintedWorld]);

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
      // Only when the stage is showing something else: after Play or after
      // a jump. Code, World and Images share one preview, so moving between
      // them leaves it as it is. The preview is the held first frame, not a
      // game Play left running.
      const playing = currentPlayingRef.current;
      const previewingActive =
        playing?.kind === 'local' && playing.scene.id === activeSceneId;
      if (prevTab === 'Play' || !previewingActive) {
        runProgram();
      }
    }
    // playStartSceneId is set in the same batch as the tab change; the
    // prevTab guard keeps its later changes from re-running the scene.
  }, [
    activeTab,
    engineReady,
    runScene,
    runProgram,
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
  // The images a scene keeps at least one of: those in the roles the level
  // names (world_keeps_roles). A later level's step can need the player to
  // reach one, and that level may not show the World tab.
  const worldKeepsRoles = levelProperties.worldKeepsRoles;
  const worldKeeps = useMemo(
    () =>
      new Map(
        // The property is edited as JSON, so it may not be a list.
        (Array.isArray(worldKeepsRoles) ? worldKeepsRoles : []).flatMap(role =>
          imagesNamedInRole(animationList, role).map(
            (name): [string, string] => [name, role]
          )
        )
      ),
    [worldKeepsRoles, animationList]
  );
  const handlePaintWorldCell = useCallback(
    (row: number, col: number, cell: WorldCell | null) =>
      updateActiveWorld(world =>
        paintWorldCell(world, row, col, cell, worldKeeps)
      ),
    [updateActiveWorld, worldKeeps]
  );

  // A world level about one kind of image offers the palette only the
  // level's image of that kind.
  const paletteOnly = useMemo(() => {
    if (paletteRoles) {
      return animationList.orderedKeys
        .map(key => animationList.propsByKey[key])
        .filter(props => props?.role && paletteRoles.includes(props.role))
        .map(props => props.name);
    }
    if (editsWorld(levelProperties.levelMode) && focusImageName) {
      return [focusImageName];
    }
    return undefined;
  }, [paletteRoles, animationList, levelProperties.levelMode, focusImageName]);
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
  // The level's added blocks, their outlines and their lock.
  const {addLevelBlocks, sceneLoadsRef, leavingResetRef} = useLevelBlocks({
    ready: animationsSeeded && !isToolboxMode,
    editing: isLevelEditMode,
    levelId: levelProperties.id,
    addBlocks: levelProperties.addBlocks,
    pinnedSceneId,
    activeSceneId: activeScene.id,
    objectives: levelProperties.objectives,
    sourcesReinitializedCount,
    workspaceVersion,
  });
  const ownTypes = useMemo(
    () =>
      ownToolboxTypes(levelProperties.toolboxDefinition, earlierLevels ?? []),
    [earlierLevels, levelProperties.toolboxDefinition]
  );
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
    // On a level that asks, blocks built on an earlier level cannot be
    // deleted, in any scene the level opens. A scene the level makes starts
    // with blocks the student cannot get back from this level's toolbox.
    // The blocks under a stack this level added stay deletable, and so do
    // the toolbox blocks no earlier level required.
    loadCode(source, {
      lock: !isLevelEditMode && !!levelProperties.lockEarlierBlocks,
      isOwn: block =>
        ownsTop(levelProperties.addBlocks ?? [], block.getRootBlock()) ||
        ownTypes.has(block.type),
    });
    runLocalScene(activeScene);
    // After the load, so the blocks sit below what the workspace holds.
    addLevelBlocks();
  }, [
    addLevelBlocks,
    sceneLoadsRef,
    animationsSeeded,
    levelProperties.addBlocks,
    levelProperties.lockEarlierBlocks,
    ownTypes,
    activeScene,
    currentSources.source,
    getCurrentBlocks,
    loadCode,
    levelProperties.levelMode,
    runLocalScene,
    sourcesReinitializedCount,
    // A re-injected workspace is empty, whatever caused it.
    workspaceVersion,
  ]);
  // After the effect that loads, so that a commit which loads runs one
  // pass, for the load.
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
  // The Images tab's drawing, while there is one, for the strip's undo
  // and redo.
  const [drawingHistory, setDrawingHistory] = useState<EditHistory | null>(
    null
  );
  // A level that checks for a rating keeps the rating strip up until a
  // thumb is given.
  const ratingRequired = objectiveChecks(levelProperties.objectives).some(
    check => check.kind === 'rated'
  );
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
  // Same hand-off for the prompt, whose controls unmount once answered.
  const handlePromptAnswer = useCallback(
    (variableName: string, value: string, fromKeyboard: boolean) => {
      engineRef.current?.onPromptAnswer(variableName, value);
      if (fromKeyboard) {
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
    } else {
      // Re-resolve by id: the scene's code may have been edited since.
      runScene(current.scene.id);
    }
  }, [runScene, defaultPlaySceneId]);
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
  // A pinned level's one Play plays the game from its scene, whichever
  // scene is open.
  const handlePreviewClick = useCallback(
    () =>
      playFrom(
        pinnedSceneId || activeSceneId === defaultPlaySceneId
          ? null
          : activeSceneId
      ),
    [playFrom, pinnedSceneId, activeSceneId, defaultPlaySceneId]
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

  // Dots beside the catalog blocks the project has not used yet.
  const getMainWorkspace = useCallback(
    () => Blockly.getMainWorkspace() as BlocklyCore.WorkspaceSvg | null,
    []
  );
  useFlyoutDots({
    enabled: catalogOn,
    added: chosenBlockSet,
    scenes,
    workspaceVersion,
    getWorkspace: getMainWorkspace,
  });

  // Only freeplay adds, renames, reorders or deletes scenes; a level with no
  // mode is unconstrained.
  const scenesEditable =
    !levelProperties.levelMode || isFreeplayMode(levelProperties.levelMode);
  // The stage: the preview beside Code and World, centered to play; Images
  // takes the whole width.
  const playspaceMode: PlayspaceMode =
    activeTab === 'Play'
      ? 'play'
      : activeTab === 'Code' || activeTab === 'World'
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

  const gameAudio = useGameAudio(engineRef, {
    hasPlatformScene: true,
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

  // Generations on this level so far, for a level that limits them.
  const [generationCount, setGenerationCount] = useState(0);
  useEffect(() => setGenerationCount(0), [levelProperties.id]);
  const countGeneration = useCallback(
    () => setGenerationCount(count => count + 1),
    []
  );
  const oneImage = isOneImageMode(levelProperties.levelMode);
  const generationLimit = generationLimitForMode(levelProperties.levelMode);
  const generationsLeft =
    generationLimit === undefined
      ? undefined
      : generationLimit - generationCount;
  // Where the level names no image type, any image counts as its own.
  const ownImageMade = levelImageType
    ? objectiveImages[levelImageType] >= 1
    : Object.values(objectiveImages).some(count => count >= 1);
  // A toolbox has no scenes: New scene would put the student default into
  // the saved toolbox.
  const scenesOffered = animationsSeeded && !isToolboxMode;
  // The scene controls for the scene row or the workspace bar. A pinned
  // level shows only its own scene.
  const sceneControls = {
    scenes: sceneMetadata.filter(scene => openableSceneIds.includes(scene.id)),
    activeSceneId,
    locked: !!pinnedSceneId,
    lockedReason: LOCKED_REASON,
    allowCreate: scenesEditable || !!pinnedSceneId,
    onSelectScene: sceneEditing.selectScene,
    onNewScene: () => setScenesDialog({creating: true}),
    onManageScenes: () => setScenesDialog({creating: false}),
  };
  const catalogOffered = catalog.length > 0 && isEditable;
  const openBlockCatalog = () => {
    setShowBlockCatalog(true);
    setShowCatalogArrow(false);
  };

  return (
    <div className={moduleStyles.labRow}>
      {scenesDialog && (
        <ScenesDialog
          scenes={sceneMetadata}
          editable={scenesEditable}
          creating={scenesDialog.creating}
          onCreateScene={sceneEditing.createScene}
          onRenameScene={sceneEditing.renameScene}
          onDeleteScene={sceneEditing.deleteScene}
          onMakeStartScene={sceneEditing.makeStartScene}
          onClose={() => setScenesDialog(null)}
        />
      )}
      {showStartOver && startOverOffered && (
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
            projectless
              ? firstLevelId
                ? START_OVER_LEAVES_MESSAGE
                : START_OVER_RESETS_LEVEL_MESSAGE
              : firstLevelId
              ? START_OVER_RETURNS_MESSAGE
              : START_OVER_MESSAGE
          }
        />
      )}
      {callout && !isLevelEditMode && (
        <Callout
          selector={calloutSelector(callout)}
          direction={callout.direction}
          fallback={
            callout.fallback && {
              selector: calloutSelector(callout.fallback),
              direction: callout.fallback.direction,
            }
          }
        />
      )}
      {showCatalogArrow && catalogOffered && (
        <Callout selector={`#${DISCOVER_BLOCKS_BUTTON_ID}`} direction="down" />
      )}
      {showBlockCatalog && (
        <BlockCatalogDialog
          entries={catalog}
          chosen={chosenBlockSet}
          onAdd={addCatalogBlock}
          onClose={() => setShowBlockCatalog(false)}
        />
      )}
      {showFreeplayIntro && (
        <FreeplayIntroDialog onClose={closeFreeplayIntro} />
      )}
      {/* The last level's Finish, in the page header as well. */}
      {levelProperties.useSecondaryFinishButton && (
        <HeaderActionButton
          buttonColor="success"
          onClick={() => dispatch(continueOrFinishLesson())}
        >
          I'm finished
        </HeaderActionButton>
      )}
      <ResourcePanel
        levelProperties={panelLevelProperties}
        isRunning={isRunning}
        hasRun={hasRun}
        hasEdited={hasEdited}
        settings={[...blocklySettings, themeSetting, ...gameAudio.settings]}
        className={classNames(
          moduleStyles.instructionsColumn,
          instructionsCollapsed && moduleStyles.instructionsCollapsed
        )}
        collapsible={freeplayLevel || undefined}
        // The objectives checklist, and the Continue button it enables,
        // render inside the instructions panel.
        objectives={objectives.active ? objectives : undefined}
        hideContinueIfDisabled
        continueButtonColor="success"
        footerButtons={
          startOverOffered && (
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
      <LabShell alert={WorkspaceAlert}>
        <div ref={stageRef} className={moduleStyles.stage}>
          {scenesOffered &&
            editorsShown &&
            (activeTab === 'Code' || activeTab === 'World') && (
              <WorkspaceSceneBar
                {...sceneControls}
                startExtra={
                  activeTab === 'Code' &&
                  catalogOffered && (
                    <DiscoverBlocksButton
                      remaining={heldBackBlocks.size}
                      className={moduleStyles.barButton}
                      onClick={openBlockCatalog}
                    />
                  )
                }
                style={clearOfPreview}
              />
            )}
          {editorsShown &&
            (activeTab === 'World' ||
              activeTab === 'Code' ||
              activeTab === 'Images') && (
              <EditorStrip
                editor={activeTab}
                onChange={handleEditorChange}
                editors={EDITORS}
                disabledEditors={disabledEditors}
                switchAtStart
                history={
                  activeTab === 'Code'
                    ? {canUndo, canRedo, undo, redo}
                    : activeTab === 'Images'
                    ? drawingHistory ?? undefined
                    : undefined
                }
                style={activeTab === 'Images' ? clearOfPane : clearOfPreview}
              />
            )}
          {/* Kept mounted (clipped) so the workspace survives tab switches;
          gated on animationsSeeded (see the seed effect). */}
          <div
            ref={codeWrapperRef}
            className={classNames(
              moduleStyles.codeTabWrapper,
              editorsShown && moduleStyles.underEditorStrip,
              moduleStyles.aboveWorkspaceSceneBar
            )}
            style={{
              clipPath: activeTab === 'Code' ? 'none' : 'inset(100%)',
              pointerEvents: activeTab === 'Code' ? 'auto' : 'none',
              // The code keeps clear of the preview's column.
              ...clearOfPreview,
            }}
          >
            {animationsSeeded && (
              <div
                id={BLOCKLY_DIV_ID}
                className={moduleStyles.blocklyDiv}
                onPointerDownCapture={endKeyboardNavigation}
              />
            )}
          </div>

          {/* Kept mounted like the workspace: inserting the grid is the
          costly part. */}
          {/* Images: kept mounted, and off to the right rather than clipped
            while another editor shows. It covers the preview too. */}
          {pictures.mounted && (
            <div
              ref={fade.ref('Images')}
              id={PICTURES_DRAWER_ID}
              role="region"
              aria-label="Images"
              className={classNames(
                moduleStyles.codeTabWrapper,
                moduleStyles.picturesEditor,
                activeTab !== 'Images' && moduleStyles.picturesEditorParked
              )}
            >
              <ImagesTab
                uploadImage={uploadImage}
                onDeleteImage={handleDeleteImage}
                lockedImageType={levelProperties.levelMode?.imageType}
                lockedImageSubject={levelProperties.levelMode?.imageSubject}
                imageRole={levelProperties.levelMode?.imageRole}
                ownImageMade={ownImageMade}
                oneImage={oneImage}
                learning={levelProperties.levelMode?.learning}
                levelId={levelProperties.id}
                generationsLeft={generationsLeft}
                onGenerate={countGeneration}
                editingOffered={!oneImage}
                noNewImages={levelProperties.levelMode?.noNewImages}
                noDeletingImages={levelProperties.levelMode?.noDeletingImages}
                limitedPaintTools={levelProperties.levelMode?.limitedPaintTools}
                imageKinds={levelProperties.levelMode?.imageKinds}
                paneWidth={paneWidthPx}
                onImageLanded={saveImagesNow}
                active={activeTab === 'Images'}
                advancedOffered={imagesAdvanced}
                onDrawingHistory={setDrawingHistory}
                ratingRequired={ratingRequired}
                imageSource={
                  imageSourceParam ||
                  imageSourceForMode(levelProperties.levelMode)
                }
                imageCacheUrl={imageCacheUrlParam}
              />
            </div>
          )}
          {worldTabEnabled && worldMounted && (
            <div
              ref={fade.ref('World')}
              className={classNames(
                moduleStyles.codeTabWrapper,
                editorsShown && moduleStyles.underEditorStrip,
                moduleStyles.aboveWorkspaceSceneBar
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
                  picturesOffered && !levelProperties.levelMode?.noNewImages
                    ? 'Make some pictures first.'
                    : 'Go back and make your image first.'
                }
                only={paletteOnly}
                kept={worldKeeps}
                selected={worldPaletteSelection}
                onSelect={choosePaletteSelection}
              />
            </div>
          )}

          {/* Always mounted so the engine keeps running; animates between
          the preview beside the editors and the centered play view. */}
          <Playspace
            boxRef={playspaceRef}
            mode={playspaceMode}
            columnHeader={<EditorStrip title="Preview" />}
            onPreviewWidth={setPreviewWidth}
            onColumnWidth={setPreviewColumnWidth}
            side="right"
            columnShare={PREVIEW_SHARE}
            controls={
              <PlayControls
                // On a pinned-scene level the game is that one scene, so there
                // is no whole-game restart.
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
            prompt={
              <PromptBar
                prompt={activePrompt}
                onAnswer={handlePromptAnswer}
                disabled={playspaceMode !== 'play' || jumpCover}
              />
            }
            bottomBar={
              <>
                <div className={moduleStyles.playBarButtons}>
                  <RunButtons
                    playing={activeTab === 'Play'}
                    onPlay={handlePlayClick}
                    onStop={stopTab ? handleStopClick : undefined}
                    // A level pinned to one scene has one Run, for that scene.
                    onPlayGame={pinnedSceneId ? undefined : handlePlayGame}
                    playSceneHidden={activeScene.id === scenes[0].id}
                  />
                </div>
                <AskAiIndicator
                  status={askAiStatus}
                  onFailureExpired={handleAskAiExpired}
                />
              </>
            }
            arrows={
              <ArrowCross arrows={arrowSet} disabled={activeTab !== 'Play'} />
            }
            fadeTrigger={fadeTrigger}
            covered={jumpCover}
            getDefaultSpriteSize={getDefaultSpriteSize}
            onPreviewClick={handlePreviewClick}
          />
        </div>
      </LabShell>
    </div>
  );
};

export default SpriteLab2View;

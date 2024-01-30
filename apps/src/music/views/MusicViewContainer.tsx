// WIP: functional rewrite of MusicView

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {
  MusicState,
  addOrderedFunctions,
  addPlaybackEvents,
  clearOrderedFunctions,
  clearPlaybackEvents,
  clearSelectedBlockId,
  getCurrentlyPlayingBlockIds,
  selectBlockId,
  setCurrentPlayheadPosition,
  setIsPlaying,
  setShowInstructions,
  setUndoStatus,
} from '../redux/musicRedux';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {DEFAULT_LIBRARY} from '../constants';
import {
  LabState,
  isReadOnlyWorkspace,
  setIsLoading,
  setPageError,
} from '@cdo/apps/lab2/lab2Redux';
import {AnalyticsContext} from '../context';
import KeyHandler from './KeyHandler';
import appConfig, {getBlockMode} from '../appConfig';
import Callouts from './Callouts';
import MusicLabView from './MusicLabView';
import {MusicLevelData} from '../types';
import {loadLibrary} from '../utils/Loader';
import MusicLibrary from '../player/MusicLibrary';
import {setUpBlocklyForMusicLab} from '../blockly/setup';
import {Abstract} from 'blockly/core/events/events_abstract';
import {Selected} from 'blockly/core/events/events_selected';
import MusicProgramExecutor, {
  UpdatePlaybackData,
} from '../MusicProgramExecutor';
import {currentLevelIndex} from '@cdo/apps/code-studio/progressReduxSelectors';

interface PlayerContainerProps {
  inIncubator: boolean;
}

const useTypedSelector: TypedUseSelectorHook<{
  music: MusicState;
  lab: LabState & {
    levelProperties?: {
      levelData?: MusicLevelData;
    };
  };
}> = useSelector;

const MusicViewContainer: React.FunctionComponent<PlayerContainerProps> = ({
  inIncubator,
}) => {
  const dispatch = useAppDispatch();
  const analyticsReporter = useContext(AnalyticsContext);
  const updatePlaybackData: UpdatePlaybackData = useCallback(
    (type, events, orderedFunctions, lastMeasure) => {
      if (type === 'replace') {
        dispatch(clearPlaybackEvents());
        dispatch(clearOrderedFunctions());
      }

      dispatch(addPlaybackEvents({events, lastMeasure}));
      dispatch(addOrderedFunctions({orderedFunctions}));
    },
    [dispatch]
  );

  // Main executor unit
  const executorRef = useRef<MusicProgramExecutor>(
    new MusicProgramExecutor(updatePlaybackData, analyticsReporter)
  );

  // SELECTORS

  const startingPlayheadPosition = useTypedSelector(
    state => state.music.startingPlayheadPosition
  );
  const isPlaying = useTypedSelector(state => state.music.isPlaying);
  const readOnlyWorkspace = useSelector(isReadOnlyWorkspace);
  const currentlyPlayingBlockIds = useSelector(getCurrentlyPlayingBlockIds);
  const levelIndex = useSelector(currentLevelIndex);
  const toolbox = useTypedSelector(
    state => state.lab.levelProperties?.levelData?.toolbox
  );
  const levelDataText = useTypedSelector(
    state => state.lab.levelProperties?.levelData?.text
  );
  const longInstructions = useTypedSelector(
    state => state.lab.levelProperties?.longInstructions
  );
  const levelStartSources = useTypedSelector(
    state => state.lab.levelProperties?.levelData?.startSources
  );
  const initialSources = useTypedSelector(state => state.lab.initialSources);
  // Read the library name first from level data, or from the project
  const libraryName = useTypedSelector(state => {
    let libraryName =
      state.lab.levelProperties?.levelData?.library || DEFAULT_LIBRARY;
    if (!libraryName && state.lab.initialSources?.labConfig?.music) {
      libraryName = state.lab.initialSources.labConfig.music.library as string;
    }
    return libraryName;
  });
  const levelSounds = useTypedSelector(
    state => state.lab.levelProperties?.levelData?.sounds
  );
  const [currentLibraryName, setCurrentLibraryName] = useState<string | null>(
    null
  );
  const selectedBlockId = useTypedSelector(
    state => state.music.selectedBlockId
  );

  const startSources = useMemo(() => {
    if (!inIncubator && levelStartSources) {
      return levelStartSources;
    } else {
      const startSourcesFilename = 'startSources' + getBlockMode();
      return require(`@cdo/static/music/${startSourcesFilename}.json`);
    }
  }, [inIncubator, levelStartSources]);

  // CALLBACKS

  const playSong = useCallback(() => {
    executorRef.current.playSong(startingPlayheadPosition);

    dispatch(setIsPlaying(true));
    dispatch(setCurrentPlayheadPosition(startingPlayheadPosition));
    dispatch(clearSelectedBlockId());
  }, [dispatch, startingPlayheadPosition]);

  const stopSong = useCallback(() => {
    if (!isPlaying) {
      return;
    }

    executorRef.current.stopSong();

    dispatch(setIsPlaying(false));
    dispatch(setCurrentPlayheadPosition(startingPlayheadPosition));
  }, [dispatch, isPlaying, startingPlayheadPosition]);

  const playTrigger = useCallback(
    (id: string) => {
      if (!isPlaying) {
        return;
      }
      if (analyticsReporter) {
        analyticsReporter.onButtonClicked('trigger', {id});
      }
      executorRef.current.playTrigger(id);
    },
    [isPlaying, analyticsReporter]
  );

  const setPlaying = useCallback(
    (play: boolean) => {
      if (play) {
        playSong();
        analyticsReporter?.onButtonClicked('play');
      } else {
        stopSong();
      }
    },
    [playSong, stopSong, analyticsReporter]
  );

  const togglePlaying = useCallback(() => {
    setPlaying(!isPlaying);
  }, [setPlaying, isPlaying]);

  const getCurrentPlayheadPosition = useCallback(
    () => executorRef.current.getCurrentPlayheadPosition(),
    [executorRef]
  );

  const updateHighlightedBlocks = useCallback(() => {
    executorRef.current.updateHighlightedBlocks(currentlyPlayingBlockIds);
  }, [executorRef, currentlyPlayingBlockIds]);

  const clearCode = useCallback(() => {
    executorRef.current.loadCode(startSources);
    setPlaying(false);
  }, [executorRef, setPlaying, startSources]);

  const onBlockSpaceChange = useCallback(
    (e: Abstract) => {
      // A drag event can leave the blocks in a temporarily unusable state,
      // e.g. when a disabled variable is dragged into a slot, it can still
      // be disabled.
      // A subsequent non-drag event should arrive and the blocks will be
      // usable then.
      // It's possible that other events should similarly be ignored here.
      if (e.type === Blockly.Events.BLOCK_DRAG) {
        executorRef.current.cancelPreviews();
        return;
      }

      // Prevent a rapid cycle of workspace resizing from occurring when
      // dragging a block near the bottom of the workspace.
      if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
        return;
      }

      // Update undo status when blocks change.
      dispatch(
        setUndoStatus({
          canUndo: executorRef.current.canUndo(),
          canRedo: executorRef.current.canRedo(),
        })
      );

      executorRef.current.onWorkspaceChange(isPlaying);

      if (e.type === Blockly.Events.SELECTED) {
        const newElementId = (e as Selected).newElementId;
        if (!isPlaying && newElementId && newElementId !== selectedBlockId) {
          dispatch(selectBlockId(newElementId));
        }
      }
    },
    [dispatch, isPlaying, selectedBlockId]
  );

  const fetchLibrary = useCallback(
    async (libraryName: string) => {
      dispatch(setIsLoading(true));
      try {
        const library = await loadLibrary(libraryName);
        MusicLibrary.setCurrent(library);
        setCurrentLibraryName(libraryName);
        executorRef.current.updateConfiguration(
          libraryName,
          library.getBPM(),
          library.getKey()
        );
        dispatch(setIsLoading(false));
        return library;
      } catch (error) {
        dispatch(
          setPageError({
            errorMessage: 'Error loading library',
            error: error as Error,
            details: {libraryName},
          })
        );
        return null;
      }
    },
    [dispatch, setCurrentLibraryName]
  );

  // EFFECTS

  // Setup blockly if in Incubator
  useEffect(() => {
    if (inIncubator) {
      setUpBlocklyForMusicLab();
    }
  }, [inIncubator]);

  // Load the library whenever level data changes.
  useEffect(() => {
    if (currentLibraryName === libraryName) {
      // Already loaded this library, no need to load again.
      return;
    }
    fetchLibrary(libraryName);
  }, [libraryName, fetchLibrary, currentLibraryName]);

  // Update allowed sounds whenever they change.
  useEffect(() => {
    if (levelSounds) {
      MusicLibrary.getInstance()?.setAllowedSounds(levelSounds);
    }
  }, [levelSounds]);

  // Init the workspace on mount, or whenever level data changes. Destroy before re-initializing.
  useEffect(() => {
    executorRef.current.onLevelChange(
      'blockly-div',
      onBlockSpaceChange,
      readOnlyWorkspace,
      toolbox
    );
    const executor = executorRef.current;
    return () => executor.destroy();
  }, [levelIndex, executorRef, onBlockSpaceChange, readOnlyWorkspace, toolbox]);

  // Show/hide instructions based on level data.
  useEffect(() => {
    dispatch(setShowInstructions(!!levelDataText || !!longInstructions));
  }, [levelDataText, longInstructions, dispatch]);

  // Reload code whenever initial or start sources change.
  useEffect(() => {
    let codeToLoad = startSources;
    if (initialSources?.source) {
      codeToLoad = JSON.parse(initialSources.source);
    }
    executorRef.current.loadCode(codeToLoad);
  }, [initialSources, startSources]);

  return (
    <>
      <KeyHandler
        togglePlaying={togglePlaying}
        playTrigger={playTrigger}
        uiShortcutsEnabled={
          appConfig.getValue('ui-keyboard-shortcuts-enabled') === 'true'
        }
      />
      <Callouts />
      {/* <MusicLabView
        setPlaying={setPlaying}
        playTrigger={executorRef.current.playTrigger}
        hasTrigger={executorRef.current.hasTrigger}
        undo={executorRef.current.undo}
        redo={executorRef.current.redo}
        clearCode={clearCode}
      /> */}
    </>
  );
};

export default MusicViewContainer;

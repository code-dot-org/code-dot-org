// Top-level Java Lab view under Lab2.
//
// Replaces the orchestration role of Javalab.js + loadJavalab.js. The legacy
// page-load pipeline (StudioApp.init -> Javalab.prototype.init) is gone;
// instead, this functional component is mounted by Lab2Wrapper with
// levelProperties + initialSources already loaded, and it wires those into
// the existing javalab redux slices and the existing connected leaf
// components (JavalabView, JavalabEditor, etc., which are unchanged).
//
// Caveats:
// - state.pageConstants is "set-once": dispatching setPageConstants a second
//   time with a *different* value throws. For first-page-load this is fine.
//   No-reload navigation between Java Lab levels that DIFFER in any of the
//   page-constants fields (e.g., isSubmittable, recaptchaSiteKey, channelId)
//   will throw and surface a page error. Follow-up: refactor legacy
//   connected components to read these fields from state.lab.levelProperties
//   / state.lab.channel instead.
// - No backpack support yet; BackpackAPIContext is set to null. If a
//   level relies on the backpack, follow-up is required.
// - Code-review / commit-code flow currently no-ops; the lab2 project
//   system handles versioning, but the existing CommitDialog plumbing
//   was tied to project.save and is not wired here.

import {Theme} from '@code-dot-org/component-library/common/contexts';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Provider} from 'react-redux';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {LabProps, ProjectSources} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {UserLevelInteractions} from '@cdo/generated-scripts/sharedConstants';

import {CsaViewMode, ExecutionType, InputMessageType} from '../constants';
import JavabuilderConnection from '../JavabuilderConnection';
import JavalabView from '../JavalabView';
import NeighborhoodVisualizationColumn from '../neighborhood/NeighborhoodVisualizationColumn';
import javalabConsole, {
  appendOutputLog,
  appendNewlineToConsoleLog,
  appendMarkdownLog,
  closePhotoPrompter,
  openPhotoPrompter,
} from '../redux/consoleRedux';
import javalabEditor, {
  setHasCompilationError,
  getSources,
  getValidation,
} from '../redux/editorRedux';
import javalab, {
  setIsRunning,
  setIsTesting,
  setHasRunOrTestedCode,
  setIsJavabuilderConnecting,
  setIsCaptchaDialogOpen,
} from '../redux/javalabRedux';
import javalabView, {setDisplayTheme} from '../redux/viewRedux';
import Theater from '../theater/Theater';
import TheaterVisualizationColumn from '../theater/TheaterVisualizationColumn';

import {JavalabLevelProperties} from './types';
import useJavalabSources from './useJavalabSources';

// Module-scoped guard so reducer registration only happens once per page
// even if JavaLab2View remounts (e.g., across no-reload level navigation).
let reducersRegistered = false;
function registerJavalabReducersOnce() {
  if (reducersRegistered) return;
  registerReducers({javalab, javalabConsole, javalabView, javalabEditor});
  reducersRegistered = true;
}

// Same idea for pageConstants: dispatch once per page load. See file-level
// caveat. We track which keys we've already published so a remount with
// the same values is a no-op.
let pageConstantsPublished = false;
function publishPageConstantsOnce(
  props: Parameters<typeof setPageConstants>[0]
) {
  if (pageConstantsPublished) return;
  getStore().dispatch(setPageConstants(props));
  pageConstantsPublished = true;
}

// Translate lab2's Theme context into the legacy DisplayTheme string used by
// JavalabView's CodeMirror styling. DisplayTheme is a plain JS object whose
// values are typed as `string`; viewRedux's setDisplayTheme expects the
// narrower `'light' | 'dark'` literal union, so we narrow here.
function themeToDisplayTheme(theme: Theme | undefined): 'light' | 'dark' {
  return theme === 'Dark' ? 'dark' : 'light';
}

interface MiniAppHandle {
  instance: Neighborhood | Theater | null;
  visualization: React.ReactNode;
}

const JavaLab2View: React.FunctionComponent<
  LabProps<JavalabLevelProperties, ProjectSources>
> = ({levelProperties, initialSources, channel}) => {
  const dispatch = useAppDispatch();
  const javabuilderRef = useRef<JavabuilderConnection | null>(null);
  const miniAppRef = useRef<Neighborhood | Theater | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const isStartMode = !!getAppOptionsEditBlocks();
  const isEditingExemplar = getAppOptionsEditingExemplar();
  const isViewingExemplar = getAppOptionsViewingExemplar();

  // TODO(javalab-lab2): wire to lab2's theme context. For now default to Light;
  // the user's persisted DisplayTheme is restored from local storage by
  // setDisplayTheme inside viewRedux via UserPreferences.
  const theme: Theme | undefined = undefined;
  const csaViewMode = levelProperties.csaViewMode || CsaViewMode.CONSOLE;
  const levelId = levelProperties.id;

  // Register reducers and seed pageConstants before child components mount.
  registerJavalabReducersOnce();
  publishPageConstantsOnce({
    channelId: channel?.id,
    isProjectLevel: !!levelProperties.isProjectLevel,
    isEditingStartSources: isStartMode,
    isCodeReviewing: false,
    isViewingOwnProject: true,
    isResponsive: true,
    isSubmittable: !!levelProperties.submittable,
    isSubmitted: false,
    recaptchaSiteKey: levelProperties.recaptchaSiteKey,
    serverLevelId: levelId,
    hasContainedLevels:
      !!levelProperties.containedLevelNames &&
      levelProperties.containedLevelNames.length > 0,
    isReadOnlyWorkspace: false,
    isProjectTemplateLevel: !!levelProperties.isProjectTemplateLevel,
  });

  // Mirror the lab2 theme into the legacy viewRedux so JavalabView/
  // CodeMirror styling tracks the theme picker. setDisplayTheme is typed
  // by viewRedux.ts as ThunkAction<void, JavalabViewState, ...>, which
  // doesn't match the global AppDispatch; use the raw store dispatch.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getStore().dispatch(setDisplayTheme(themeToDisplayTheme(theme)) as any);
  }, [theme]);

  // Sources, validation, level metadata.
  useJavalabSources({
    levelProperties,
    initialSources,
    isStartMode,
    isReadOnlyWorkspace: false,
    hasOpenCodeReview: false,
  });

  // Fetch CSRF token once for project_commits & override-source POSTs.
  useEffect(() => {
    let cancelled = false;
    fetch('/project_commits/get_token').then(response => {
      if (!cancelled) {
        setCsrfToken(response.headers.get('csrf-token'));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Body class flags used by legacy CSS to pin the editor pane.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('pin_bottom');
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove('pin_bottom');
    };
  }, []);

  // Console / mini-app message bridges.
  const onOutputMessage = useCallback(
    (message: string) => {
      if (message.includes('Compilation error')) {
        dispatch(setHasCompilationError(true));
      } else if (message.includes('Compiled')) {
        dispatch(setHasCompilationError(false));
      }
      dispatch(appendOutputLog(message));
    },
    [dispatch]
  );
  const onNewlineMessage = useCallback(() => {
    dispatch(appendNewlineToConsoleLog());
  }, [dispatch]);
  const onMarkdownMessage = useCallback(
    (message: string) => {
      dispatch(appendMarkdownLog(message));
    },
    [dispatch]
  );
  const setIsRunningDispatch = useCallback(
    (running: boolean) => {
      dispatch(setIsRunning(running));
    },
    [dispatch]
  );
  const setIsTestingDispatch = useCallback(
    (testing: boolean) => {
      dispatch(setIsTesting(testing));
    },
    [dispatch]
  );
  const onPhotoPrompterFileSelected = useCallback((photo: unknown) => {
    const miniApp = miniAppRef.current as
      | (Theater & {onPhotoPrompterFileSelected?: (p: unknown) => void})
      | null;
    miniApp?.onPhotoPrompterFileSelected?.(photo);
  }, []);
  const onJavabuilderMessage = useCallback(
    (messageType: string, message: unknown) => {
      javabuilderRef.current?.sendMessage(
        JSON.stringify({messageType, message})
      );
    },
    []
  );

  // (Re)instantiate the mini-app whenever csaViewMode or level changes.
  const miniAppHandle: MiniAppHandle = useMemo(() => {
    // The visualization component is what places the mini-app's host DOM
    // (e.g., #svgMaze) in the document. The actual mini-app object is
    // constructed below in a useEffect so it can read those nodes after
    // React commits.
    switch (csaViewMode) {
      case CsaViewMode.NEIGHBORHOOD:
        return {
          instance: null,
          visualization: <NeighborhoodVisualizationColumn />,
        };
      case CsaViewMode.THEATER:
        return {instance: null, visualization: <TheaterVisualizationColumn />};
      default:
        return {instance: null, visualization: null};
    }
  }, [csaViewMode]);

  useEffect(() => {
    let miniApp: Neighborhood | Theater | null = null;
    if (csaViewMode === CsaViewMode.NEIGHBORHOOD) {
      const neighborhood = new Neighborhood(
        onOutputMessage,
        onNewlineMessage,
        setIsRunningDispatch,
        onOutputMessage
      );
      // After this effect runs, the visualization column has already
      // committed its DOM; afterInject can read #svgMaze directly.
      const noop = () => {
        /* no audio in Java Lab */
      };
      neighborhood.afterInject(
        levelProperties,
        {},
        {skinId: 'neighborhood', level: levelProperties, skin: {}},
        noop,
        noop,
        noop,
        () => {
          /* no test-result hook in lab2 path */
        }
      );
      miniApp = neighborhood;
    } else if (csaViewMode === CsaViewMode.THEATER) {
      miniApp = new Theater(
        onOutputMessage,
        onNewlineMessage,
        (prompt: string) => dispatch(openPhotoPrompter(prompt)),
        () => dispatch(closePhotoPrompter()),
        onJavabuilderMessage
      );
    }
    miniAppRef.current = miniApp;
    return () => {
      miniApp?.onStop?.();
      miniAppRef.current = null;
    };
    // Re-create on csaViewMode change OR level change (mini-apps hold
    // per-level state like the maze grid).
  }, [
    csaViewMode,
    levelId,
    levelProperties,
    dispatch,
    onOutputMessage,
    onNewlineMessage,
    setIsRunningDispatch,
    onJavabuilderMessage,
  ]);

  // Run / Test / Stop handlers.
  const executeJavabuilder = useCallback(
    async (
      executionType: (typeof ExecutionType)[keyof typeof ExecutionType]
    ) => {
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      // Ensure any pending edits are saved before Javabuilder fetches sources.
      await projectManager?.flushSave();

      dispatch(setHasRunOrTestedCode(true));
      dispatch(setIsJavabuilderConnecting(true));

      // Clear any prior connection.
      javabuilderRef.current?.closeConnection();

      const options: {useNeighborhood?: boolean} = {};
      if (csaViewMode === CsaViewMode.NEIGHBORHOOD) {
        options.useNeighborhood = true;
      }

      const state = getStore().getState();
      const channelId = projectManager?.getChannelId();
      // "has been edited" maps to "a save has happened for this channel".
      // Under lab2, the existence of a saved channel implies edits occurred,
      // since brand-new channels are created lazily on first save.
      const hasBeenEdited = !!channelId;

      // JavabuilderConnection is a JS file; passing the extra projectState
      // arg requires going through `any` until that file is converted.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connection = new (JavabuilderConnection as any)(
        onOutputMessage,
        miniAppRef.current,
        levelId,
        options,
        onNewlineMessage,
        setIsRunningDispatch,
        setIsTestingDispatch,
        executionType,
        csaViewMode,
        state.currentUser,
        onMarkdownMessage,
        csrfToken,
        () => {
          /* onValidationPassed handled inline below */
        },
        () => {
          /* onValidationFailed handled inline below */
        },
        () => dispatch(setIsJavabuilderConnecting(false)),
        () => dispatch(setIsCaptchaDialogOpen(true)),
        {channelId, hasBeenEdited}
      );
      javabuilderRef.current = connection;

      if (isEditingExemplar || isViewingExemplar) {
        const overrideSources = getSources(state);
        connection.connectJavabuilderWithOverrideSources(overrideSources);
      } else if (isStartMode && executionType === ExecutionType.TEST) {
        const overrideValidation = getValidation(state);
        connection.connectJavabuilderWithOverrideValidation(overrideValidation);
      } else {
        connection.connectJavabuilder();
      }
    },
    [
      csaViewMode,
      csrfToken,
      dispatch,
      isEditingExemplar,
      isStartMode,
      isViewingExemplar,
      levelId,
      onMarkdownMessage,
      onNewlineMessage,
      onOutputMessage,
      setIsRunningDispatch,
      setIsTestingDispatch,
    ]
  );

  const onRun = useCallback(() => {
    miniAppRef.current?.reset?.();
    logUserLevelInteraction({
      levelId,
      scriptId: undefined,
      interaction: UserLevelInteractions.click_run,
    });
    executeJavabuilder(ExecutionType.RUN);
  }, [executeJavabuilder, levelId]);

  const onTest = useCallback(() => {
    const validation = levelProperties.validation;
    const validated = !!validation && Object.keys(validation).length > 0;
    logUserLevelInteraction({
      levelId,
      scriptId: undefined,
      interaction: UserLevelInteractions.click_validate,
    });
    analyticsReporter.sendEvent(EVENTS.JAVALAB_TEST_BUTTON_CLICK, {
      levelId,
      validated,
    });
    executeJavabuilder(ExecutionType.TEST);
  }, [executeJavabuilder, levelId, levelProperties.validation]);

  const onStop = useCallback(() => {
    miniAppRef.current?.onStop?.();
    javabuilderRef.current?.closeConnection();
  }, []);

  const onInputMessage = useCallback(
    (message: unknown) => {
      onJavabuilderMessage(InputMessageType.SYSTEM_IN, message);
    },
    [onJavabuilderMessage]
  );

  // Default "continue" behavior: mark the level passing and navigate.
  // TODO(javalab-lab2): wire to lab2 progress / submit flow proper.
  const onContinue = useCallback((_submit: boolean) => {
    // Intentionally minimal for first pass.
  }, []);

  // Code-review commit hook intentionally a no-op for first pass.
  const onCommitCode = useCallback((_notes: string, onSuccess: () => void) => {
    onSuccess();
  }, []);

  const handleClearPuzzle = useCallback(() => {
    // Reset to start sources. Matches Javalab.afterClearPuzzle.
    const start = levelProperties.startSources;
    if (start) {
      dispatch({
        type: 'javalabEditor/setAllSourcesAndFileMetadata',
        payload: {sources: start, isEditingStartSources: isStartMode},
      });
    }
  }, [dispatch, isStartMode, levelProperties.startSources]);

  // Lifecycle: tear down WebSocket + mini-app between levels (no-reload nav).
  useLifecycleNotifier(
    LifecycleEvent.LevelLoadStarted,
    useCallback(() => {
      javabuilderRef.current?.closeConnection();
      miniAppRef.current?.onStop?.();
      dispatch(setIsRunning(false));
      dispatch(setIsTesting(false));
    }, [dispatch])
  );

  // Close the WebSocket on unmount.
  useEffect(() => {
    return () => {
      javabuilderRef.current?.closeConnection();
    };
  }, []);

  return (
    <Provider store={getStore()}>
      <BackpackAPIContext.Provider value={null}>
        <JavalabView
          onMount={() => undefined}
          onRun={onRun}
          onStop={onStop}
          onTest={onTest}
          onContinue={onContinue}
          onCommitCode={onCommitCode}
          onInputMessage={onInputMessage}
          visualization={miniAppHandle.visualization as object | undefined}
          viewMode={csaViewMode}
          isProjectTemplateLevel={!!levelProperties.isProjectTemplateLevel}
          handleClearPuzzle={handleClearPuzzle}
          onPhotoPrompterFileSelected={onPhotoPrompterFileSelected}
        />
      </BackpackAPIContext.Provider>
    </Provider>
  );
};

export default JavaLab2View;

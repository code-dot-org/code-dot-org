import {Button, Typography} from '@mui/material';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useAppSelector} from '@code-dot-org/codebridge';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {isDevelopmentEnvironment} from '@code-dot-org/core';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';
import {labActions, predictLevelActions} from '@code-dot-org/lab/redux';

import {DEFAULT_START_HTML_FILE} from '../constants';
import {useDebug} from '../debug/DebugContext';

import {
  IframeMessage,
  PreviewViewMode,
  type PreviewViewModeType,
} from './constants';
import {generateContentSecurityPolicyForPreview} from './contentSecurityPolicy';
import styles from './htmlPreview.module.css';
import {HTMLPreviewHeader} from './HTMLPreviewHeader';
import {getPreviewUrl, PARENT_ORIGIN_PARAM} from './previewConfig';
import {
  addToHistory,
  canNavigateBack as historyCanGoBack,
  canNavigateForward as historyCanGoForward,
  EMPTY_HISTORY,
  navigate as navigateInHistory,
  type PreviewHistory,
} from './previewHistory';
import stateStyles from './previewStates.module.css';
import {
  filterSourceForPreview,
  getPreviewFiles,
  type PreviewFiles,
} from './projectFiles';
import {allowUserScripts} from './scriptPolicy';

// The lab-side half of the preview (legacy apps/src/weblab2/htmlPreview/
// HTMLPreview.tsx, reduced). It renders an iframe pointed at the preview page on
// its own origin and posts the project down; the preview page owns the service
// worker that serves those files to the student's page.
//
// This side never runs student code — that is the whole point of the split.

// Levelbuilder's start mode, where a curriculum author edits the level's start
// code and must be able to run it. Base stubs this to false everywhere
// (see labs/base getInitialSources.ts, SourcesContext.tsx) because the frontend
// does not read appOptions yet; named here so it is greppable when base wires
// it up, and because legacy's rule is not complete without it.
const isStartMode = false;

/**
 * Renders the project in an iframe on the preview origin, keeping it in sync as
 * the student edits.
 */
export const HTMLPreview = () => {
  const {currentSources} = useSources<MultiFileSource>();
  // blockNetwork is toggled in the debug panel's network pane; we enforce it.
  const {
    addConsoleLog,
    addNetworkRequest,
    addNetworkResponse,
    blockNetwork,
    clear: clearDebugPanel,
  } = useDebug();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  // Which page the preview is showing, and how it is framed.
  const [currentFile, setCurrentFile] = useState(DEFAULT_START_HTML_FILE);
  const [viewMode, setViewMode] = useState<PreviewViewModeType>(
    PreviewViewMode.DESKTOP,
  );
  // Stopping tears the iframe down entirely, so a runaway page stops running.
  const [isStopped, setIsStopped] = useState(false);
  // The preview cannot serve the project without its worker. Say so: the
  // alternative is a preview that silently shows whatever else the preview
  // origin serves, which is far harder to diagnose than an error.
  const [isServiceWorkerUnavailable, setIsServiceWorkerUnavailable] =
    useState(false);
  // Element inspection runs on the preview origin; we only own the toggle.
  const [inspectorEnabled, setInspectorEnabled] = useState(false);

  // Where the student has been in the preview; see previewHistory.ts.
  const [history, setHistory] = useState<PreviewHistory>(EMPTY_HISTORY);

  const recordNavigation = useCallback(
    (filePath: string) =>
      setHistory(previous => addToHistory(previous, filePath)),
    [],
  );

  // On a predict level the student commits to an answer *before* seeing what the
  // page does, so their scripts stay off until the prediction is submitted.
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel,
  );
  const hasSubmittedPredictResponse = useAppSelector(
    predictLevelActions.isPredictResponseSubmitted,
  );
  const allowScripts = allowUserScripts({
    isPredictLevel: Boolean(isPredictLevel),
    hasSubmittedPredictResponse,
    isStartMode,
  });

  // Hold the project back until the level has finished loading. Without this the
  // preview serves the page while levelProperties is still undefined — which
  // reads as "not a predict level", so the student's scripts run once before the
  // gate above can apply, showing them the outcome they were meant to predict.
  // Legacy holds the same way, via its LEVEL_LOADING message.
  const isLabLoading = useAppSelector(labActions.isLabLoading);

  const previewUrl = getPreviewUrl();
  const previewOrigin = useMemo(
    () =>
      previewUrl ? new URL(previewUrl, window.location.href).origin : null,
    [previewUrl],
  );

  // The exact src, with our origin attached so the preview knows who to trust.
  const iframeSrc = useMemo(() => {
    if (!previewUrl) {
      return null;
    }
    const resolved = new URL(previewUrl, window.location.href);
    resolved.searchParams.set(PARENT_ORIGIN_PARAM, window.location.origin);
    return resolved.toString();
  }, [previewUrl]);

  // Only the parts of the project the preview cares about, so switching tabs or
  // opening a folder does not re-render the page.
  const files: PreviewFiles = useMemo(() => {
    const filtered = filterSourceForPreview(currentSources.source);
    return filtered ? getPreviewFiles(filtered) : {};
  }, [currentSources.source]);

  const contentSecurityPolicy = useMemo(
    () =>
      previewOrigin
        ? generateContentSecurityPolicyForPreview({
            codeStudioUrl: window.location.origin,
            scriptsAllowed: allowScripts,
            previewOrigin,
          })
        : '',
    [previewOrigin, allowScripts],
  );

  // Listen to the preview: readiness, plus everything the student's page
  // reported (console output, errors, CSP violations, network activity), which
  // the debug panel displays.
  useEffect(() => {
    if (!previewOrigin) {
      return;
    }
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== previewOrigin) {
        return;
      }
      const data = event.data ?? {};
      switch (data.type) {
        case IframeMessage.IFRAME_READY:
          setIsReady(true);
          break;
        case IframeMessage.SERVICE_WORKER_UNAVAILABLE:
          setIsServiceWorkerUnavailable(true);
          break;
        case IframeMessage.CHANGE_FILE_URL_BAR:
          if (data.filePath) {
            setCurrentFile(data.filePath);
            recordNavigation(data.filePath);
          }
          break;
        case IframeMessage.CONSOLE_LOG:
          addConsoleLog(data.level, data.args ?? []);
          break;
        case IframeMessage.NETWORK_REQUEST:
          if (data.requestData?.id) {
            addNetworkRequest(data.requestData.id, data.requestData);
          }
          break;
        case IframeMessage.NETWORK_RESPONSE:
          if (data.responseData?.id) {
            addNetworkResponse(data.responseData.id, data.responseData);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [
    previewOrigin,
    addConsoleLog,
    addNetworkRequest,
    addNetworkResponse,
    recordNavigation,
  ]);

  // Send the project once the preview is up, and on every edit after that.
  useEffect(() => {
    if (!isReady || !previewOrigin || isLabLoading) {
      return;
    }
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: IframeMessage.SET_SOURCE,
        files,
        startFile: DEFAULT_START_HTML_FILE,
        contentSecurityPolicy,
      },
      previewOrigin,
    );
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessage.SET_BLOCK_NETWORK, blockNetwork},
      previewOrigin,
    );
  }, [
    isReady,
    previewOrigin,
    files,
    contentSecurityPolicy,
    blockNetwork,
    isLabLoading,
  ]);

  // Push the inspector toggle down. Also re-sent whenever the preview reports
  // ready again: a stop-and-reload replaces the preview page, which comes back
  // with the inspector off.
  useEffect(() => {
    if (!isReady || !previewOrigin) {
      return;
    }
    iframeRef.current?.contentWindow?.postMessage(
      {type: IframeMessage.SET_INSPECTOR_ENABLED, enabled: inspectorEnabled},
      previewOrigin,
    );
  }, [isReady, previewOrigin, inspectorEnabled]);

  const post = (message: unknown) => {
    if (previewOrigin) {
      iframeRef.current?.contentWindow?.postMessage(message, previewOrigin);
    }
  };

  // Walk the history without appending: the entry is already there, and the
  // preview's report of the page it serves is absorbed by addToHistory's guard.
  const navigateHistory = (delta: number) => {
    const moved = navigateInHistory(history, delta);
    if (!moved) {
      return;
    }
    setHistory(moved.history);
    setCurrentFile(moved.filePath);
    post({type: IframeMessage.CHANGE_FILE_URL_BAR, filePath: moved.filePath});
  };

  const header = (
    <HTMLPreviewHeader
      currentFile={currentFile}
      onNavigate={filePath => {
        setCurrentFile(filePath);
        recordNavigation(filePath);
        post({type: IframeMessage.CHANGE_FILE_URL_BAR, filePath});
      }}
      canNavigateBack={historyCanGoBack(history)}
      canNavigateForward={historyCanGoForward(history)}
      onNavigateBack={() => navigateHistory(-1)}
      onNavigateForward={() => navigateHistory(1)}
      onRefresh={() => {
        // The page is about to run again, so what the last run logged and
        // requested is stale (legacy clears both here too).
        clearDebugPanel();
        if (isStopped) {
          // Reloading after a stop rebuilds the iframe; sources are re-sent
          // once it reports ready again.
          setIsStopped(false);
          setIsReady(false);
        } else {
          post({type: IframeMessage.REFRESH});
        }
      }}
      onStop={() => {
        setIsStopped(true);
        setIsReady(false);
      }}
      isStopEnabled={!isStopped}
      viewMode={viewMode}
      setViewMode={setViewMode}
      inspectorEnabled={inspectorEnabled}
      setInspectorEnabled={setInspectorEnabled}
    />
  );

  if (!iframeSrc) {
    return (
      <div className={styles.notConfigured}>
        No preview origin is configured. Student pages run on their own origin
        so they cannot reach this page&apos;s session — pass one with{' '}
        <code>?web-preview=…</code> (see the README).
      </div>
    );
  }

  // The wrapper is always present and only its class changes: moving the iframe
  // in the DOM would remount it, reloading the student's page on every toggle.
  const frame = (
    <div
      className={
        viewMode === PreviewViewMode.MOBILE
          ? stateStyles.mobileWrapper
          : stateStyles.desktopWrapper
      }
    >
      <div
        className={
          viewMode === PreviewViewMode.MOBILE ? stateStyles.mobileFrame : ''
        }
      >
        <iframe
          ref={iframeRef}
          className={styles.frame}
          title="Page preview"
          src={iframeSrc}
        />
      </div>
    </div>
  );

  return (
    <>
      {header}
      {isServiceWorkerUnavailable ? (
        <div className={stateStyles.state}>
          <Typography variant="h4" component="p" className={stateStyles.title}>
            Preview unavailable
          </Typography>
          <Typography variant="body3">
            The preview could not start, so your pages cannot be shown. Try
            reloading the page.
          </Typography>
          {isDevelopmentEnvironment() && (
            // Developer-only: the cause is almost always a stale service worker
            // on the preview origin, which a student can do nothing about.
            <Typography variant="body3">
              The preview&apos;s service worker did not start. Unregistering it
              for the preview origin and reloading usually clears this.
            </Typography>
          )}
        </div>
      ) : isStopped ? (
        <div className={stateStyles.state}>
          <Typography variant="h4" component="p" className={stateStyles.title}>
            Preview stopped
          </Typography>
          <Typography variant="body3">
            You stopped the preview. Review your code, then reload to run it
            again.
          </Typography>
          <Button
            variant="outlined"
            color="tertiary"
            size="small"
            startIcon={<FontAwesomeV6Icon iconName="sync" iconStyle="solid" />}
            onClick={() => {
              setIsStopped(false);
              setIsReady(false);
            }}
          >
            Reload preview
          </Button>
        </div>
      ) : (
        frame
      )}
    </>
  );
};

export default HTMLPreview;

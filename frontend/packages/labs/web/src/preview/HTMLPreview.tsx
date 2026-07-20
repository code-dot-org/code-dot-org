import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

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
import stateStyles from './previewStates.module.css';
import {
  filterSourceForPreview,
  getPreviewFiles,
  type PreviewFiles,
} from './projectFiles';

// The lab-side half of the preview (legacy apps/src/weblab2/htmlPreview/
// HTMLPreview.tsx, reduced). It renders an iframe pointed at the preview page on
// its own origin and posts the project down; the preview page owns the service
// worker that serves those files to the student's page.
//
// This side never runs student code — that is the whole point of the split.

export interface HTMLPreviewProps {
  /** False on predict levels, where student scripts must not run. */
  allowScripts?: boolean;
  /** Block requests leaving the project (reported in the debug panel). */
  blockNetwork?: boolean;
}

/**
 * Renders the project in an iframe on the preview origin, keeping it in sync as
 * the student edits.
 */
export const HTMLPreview = ({
  allowScripts = true,
  blockNetwork = true,
}: HTMLPreviewProps) => {
  const {currentSources} = useSources<MultiFileSource>();
  const {addConsoleLog, addNetworkRequest, addNetworkResponse} = useDebug();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  // Which page the preview is showing, and how it is framed.
  const [currentFile, setCurrentFile] = useState(DEFAULT_START_HTML_FILE);
  const [viewMode, setViewMode] = useState<PreviewViewModeType>(
    PreviewViewMode.DESKTOP,
  );
  // Stopping tears the iframe down entirely, so a runaway page stops running.
  const [isStopped, setIsStopped] = useState(false);

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
        case IframeMessage.CHANGE_FILE_URL_BAR:
          if (data.filePath) {
            setCurrentFile(data.filePath);
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
  }, [previewOrigin, addConsoleLog, addNetworkRequest, addNetworkResponse]);

  // Send the project once the preview is up, and on every edit after that.
  useEffect(() => {
    if (!isReady || !previewOrigin) {
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
  }, [isReady, previewOrigin, files, contentSecurityPolicy, blockNetwork]);

  const post = (message: unknown) => {
    if (previewOrigin) {
      iframeRef.current?.contentWindow?.postMessage(message, previewOrigin);
    }
  };

  const header = (
    <HTMLPreviewHeader
      currentFile={currentFile}
      onNavigate={filePath => {
        setCurrentFile(filePath);
        post({type: IframeMessage.CHANGE_FILE_URL_BAR, filePath});
      }}
      onRefresh={() => {
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
      {isStopped ? (
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

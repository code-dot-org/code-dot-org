import {IconButton, Tooltip} from '@mui/material';
import {useEffect, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';

import {PreviewViewMode, type PreviewViewModeType} from './constants';
import styles from './htmlPreviewHeader.module.css';

// The preview's chrome: which page is showing, refresh, stop, and the
// desktop/mobile viewport toggle. Ported from
// apps/src/weblab2/htmlPreview/HTMLPreviewHeader.tsx — legacy's back/forward
// history buttons are deferred with the navigation history they operate on.

export interface HTMLPreviewHeaderProps {
  /** The project-relative path currently displayed (e.g. `index.html`). */
  currentFile: string;
  /** Navigate the preview to a path the student typed. */
  onNavigate: (filePath: string) => void;
  onRefresh: () => void;
  onStop: () => void;
  isStopEnabled: boolean;
  /** Whether there is anywhere to go in the preview's page history. */
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  viewMode: PreviewViewModeType;
  setViewMode: (viewMode: PreviewViewModeType) => void;
  /** Whether hover/Tab element inspection is running in the preview. */
  inspectorEnabled: boolean;
  setInspectorEnabled: (enabled: boolean) => void;
  /** The debug panel is toggled from here, as in legacy. */
  isDebugPanelOpen: boolean;
  setIsDebugPanelOpen: (isOpen: boolean) => void;
  /** Blows the preview up to fill the viewport. */
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const HTMLPreviewHeader = ({
  currentFile,
  onNavigate,
  onRefresh,
  onStop,
  isStopEnabled,
  canNavigateBack,
  canNavigateForward,
  onNavigateBack,
  onNavigateForward,
  viewMode,
  setViewMode,
  inspectorEnabled,
  setInspectorEnabled,
  isDebugPanelOpen,
  setIsDebugPanelOpen,
  isFullScreen,
  onToggleFullScreen,
}: HTMLPreviewHeaderProps) => {
  const [value, setValue] = useState(currentFile);

  // Follow the preview when it navigates itself (a link click, or the service
  // worker reporting the page it served), without fighting the student's typing.
  useEffect(() => setValue(currentFile), [currentFile]);

  return (
    <div
      className={
        isFullScreen
          ? `${styles.header} ${styles.fullScreenHeader}`
          : styles.header
      }
    >
      <IconButton
        variant="text"
        color="tertiary"
        size="extraSmall"
        disabled={!canNavigateBack}
        onClick={onNavigateBack}
        aria-label="Navigate back"
        type="button"
      >
        <FontAwesomeV6Icon iconName="chevron-left" />
      </IconButton>
      <IconButton
        variant="text"
        color="tertiary"
        size="extraSmall"
        disabled={!canNavigateForward}
        onClick={onNavigateForward}
        aria-label="Navigate forward"
        type="button"
      >
        <FontAwesomeV6Icon iconName="chevron-right" />
      </IconButton>

      <form
        className={styles.urlBar}
        onSubmit={event => {
          event.preventDefault();
          onNavigate(value.trim());
        }}
      >
        <input
          className={styles.urlInput}
          name="url-input"
          aria-label="Address bar"
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        <IconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          onClick={onRefresh}
          aria-label="Refresh"
          type="button"
        >
          <FontAwesomeV6Icon iconName="refresh" />
        </IconButton>
      </form>

      <span className={styles.actions}>
        <Tooltip id="stop-preview" title="Stop preview" placement="bottom">
          {/* Wrapper span so the tooltip still shows when the button is disabled. */}
          <span>
            <IconButton
              variant="outlined"
              color="error"
              size="extraSmall"
              disabled={!isStopEnabled}
              onClick={onStop}
              aria-label="Stop Preview"
              type="button"
            >
              <FontAwesomeV6Icon iconName="circle-stop" iconStyle="solid" />
            </IconButton>
          </span>
        </Tooltip>

        <SegmentedButtons
          size="xs"
          type="iconOnly"
          selectedButtonValue={viewMode}
          onChange={value => setViewMode(value as PreviewViewModeType)}
          buttons={[
            {
              value: PreviewViewMode.DESKTOP,
              ariaLabel: 'Desktop View',
              icon: {iconName: 'desktop', iconStyle: 'solid', title: 'Desktop'},
            },
            {
              value: PreviewViewMode.MOBILE,
              ariaLabel: 'Mobile View',
              icon: {iconName: 'mobile', iconStyle: 'solid', title: 'Mobile'},
            },
          ]}
        />

        <Tooltip
          id="toggle-debug-panel"
          title={isDebugPanelOpen ? 'Close debug panel' : 'Open debug panel'}
          placement="bottom"
        >
          <IconButton
            variant="outlined"
            color="tertiary"
            size="extraSmall"
            className={isDebugPanelOpen ? styles.activeToggleButton : undefined}
            onClick={() => setIsDebugPanelOpen(!isDebugPanelOpen)}
            aria-label={
              isDebugPanelOpen ? 'Close debug panel' : 'Open debug panel'
            }
            aria-pressed={isDebugPanelOpen}
            type="button"
          >
            <FontAwesomeV6Icon iconName="bug" />
          </IconButton>
        </Tooltip>

        <Tooltip
          id="toggle-inspector"
          title={inspectorEnabled ? 'Stop inspecting' : 'Inspect elements'}
          placement="bottom"
        >
          <IconButton
            variant="outlined"
            color="tertiary"
            size="extraSmall"
            className={inspectorEnabled ? styles.activeToggleButton : undefined}
            onClick={() => setInspectorEnabled(!inspectorEnabled)}
            aria-label={
              inspectorEnabled ? 'Stop inspecting' : 'Inspect elements'
            }
            aria-pressed={inspectorEnabled}
            type="button"
          >
            <FontAwesomeV6Icon iconName="arrow-pointer" />
          </IconButton>
        </Tooltip>

        <IconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          onClick={onToggleFullScreen}
          aria-label={isFullScreen ? 'Minimize preview' : 'Maximize preview'}
          aria-pressed={isFullScreen}
          type="button"
        >
          <FontAwesomeV6Icon iconName={isFullScreen ? 'compress' : 'expand'} />
        </IconButton>
      </span>
    </div>
  );
};

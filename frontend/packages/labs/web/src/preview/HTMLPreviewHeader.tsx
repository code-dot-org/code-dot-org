import {IconButton} from '@mui/material';
import {useEffect, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

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
  viewMode: PreviewViewModeType;
  setViewMode: (viewMode: PreviewViewModeType) => void;
  /** Whether hover/Tab element inspection is running in the preview. */
  inspectorEnabled: boolean;
  setInspectorEnabled: (enabled: boolean) => void;
}

export const HTMLPreviewHeader = ({
  currentFile,
  onNavigate,
  onRefresh,
  onStop,
  isStopEnabled,
  viewMode,
  setViewMode,
  inspectorEnabled,
  setInspectorEnabled,
}: HTMLPreviewHeaderProps) => {
  const [value, setValue] = useState(currentFile);

  // Follow the preview when it navigates itself (a link click, or the service
  // worker reporting the page it served), without fighting the student's typing.
  useEffect(() => setValue(currentFile), [currentFile]);

  return (
    <div className={styles.header}>
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
        <WithTooltip
          tooltipProps={{
            tooltipId: 'toggle-inspector',
            direction: 'onBottom',
            size: 'xs',
            text: inspectorEnabled ? 'Stop inspecting' : 'Inspect elements',
          }}
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
        </WithTooltip>

        <WithTooltip
          tooltipProps={{
            tooltipId: 'preview-view-mode',
            direction: 'onBottom',
            size: 'xs',
            text: viewMode === PreviewViewMode.DESKTOP ? 'Mobile' : 'Desktop',
          }}
        >
          <IconButton
            variant="text"
            color="tertiary"
            size="extraSmall"
            aria-label={
              viewMode === PreviewViewMode.DESKTOP
                ? 'Switch to mobile view'
                : 'Switch to desktop view'
            }
            aria-pressed={viewMode === PreviewViewMode.MOBILE}
            onClick={() =>
              setViewMode(
                viewMode === PreviewViewMode.DESKTOP
                  ? PreviewViewMode.MOBILE
                  : PreviewViewMode.DESKTOP,
              )
            }
            type="button"
          >
            <FontAwesomeV6Icon
              iconName={
                viewMode === PreviewViewMode.DESKTOP
                  ? 'mobile-screen'
                  : 'desktop'
              }
            />
          </IconButton>
        </WithTooltip>

        <WithTooltip
          tooltipProps={{
            tooltipId: 'stop-preview',
            direction: 'onBottom',
            size: 'xs',
            text: 'Stop preview',
          }}
        >
          <IconButton
            variant="outlined"
            color="error"
            size="extraSmall"
            disabled={!isStopEnabled}
            onClick={onStop}
            aria-label="Stop Preview"
            type="button"
          >
            <FontAwesomeV6Icon iconName="square" iconStyle="solid" />
          </IconButton>
        </WithTooltip>
      </span>
    </div>
  );
};

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, ChangeEvent, useCallback, useRef} from 'react';

import {AutocompleteInput} from '@cdo/apps/templates/autocompleteInput/AutocompleteInput';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import weblab2I18n from '@cdo/apps/weblab2/locale';

import {setDebugPanelOpen} from '../weblab2Redux';

import {PreviewViewMode} from './constants';

import moduleStyles from './styles/html-preview-header.module.scss';
interface HTMLPreviewHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onRefresh: () => void;
  onToggleFullScreen: () => void;
  previewViewMode: PreviewViewMode;
  setPreviewViewMode: (previewViewMode: PreviewViewMode) => void;
  onStopPreview: () => void;
  isStopEnabled: boolean;
  fetchFileSearchOptions: (value: string) => Promise<string[]>;
}

export const HTMLPreviewHeader: React.FC<HTMLPreviewHeaderProps> = ({
  value,
  onChange,
  onSubmit,
  canNavigateBack,
  canNavigateForward,
  onNavigateBack,
  onNavigateForward,
  onRefresh,
  onToggleFullScreen,
  previewViewMode,
  setPreviewViewMode,
  onStopPreview,
  isStopEnabled,
  fetchFileSearchOptions,
}) => {
  const isFullScreenView = useAppSelector(state => state.lab.isFullScreenView);
  const isShareView = useAppSelector(state => state.lab.isShareView);
  const debugPanelOpen = useAppSelector(state => state.weblab2.debugPanelOpen);
  const dispatch = useAppDispatch();

  // Supports our preview page "navigation" feature so the autocomplete suggestions
  // are only shown for user input and not for programmatic changes to the URL bar.
  const lastInputEventValue = useRef<string | null>(null);

  // Clear out the last input event value (user-initiated) when the value prop changes programmatically.
  useEffect(() => {
    if (lastInputEventValue.current !== value) {
      lastInputEventValue.current = null;
    }
  }, [value]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      lastInputEventValue.current = event.target.value;
      onChange(event.target.value);
    },
    [onChange]
  );

  const suggestionsDisabled = useCallback(
    (searchValue: string) => lastInputEventValue.current !== searchValue,
    []
  );

  const handleFetchOptions = useCallback(
    async (searchValue: string) => {
      if (suggestionsDisabled(searchValue)) {
        return [];
      }
      return fetchFileSearchOptions(searchValue);
    },
    [fetchFileSearchOptions, suggestionsDisabled]
  );

  const previewViewModeButtonsProps: SegmentedButtonsProps = {
    color: 'strong',
    buttons: [
      {
        ariaLabel: weblab2I18n.desktopView(),
        icon: {
          iconName: 'desktop',
          iconStyle: 'solid',
          title: weblab2I18n.desktop(),
        },
        value: PreviewViewMode.DESKTOP,
      },
      {
        ariaLabel: weblab2I18n.mobileView(),
        icon: {
          iconName: 'mobile',
          iconStyle: 'solid',
          title: weblab2I18n.mobile(),
        },
        value: PreviewViewMode.MOBILE,
      },
    ],
    size: 'xs',
    selectedButtonValue: previewViewMode,
    type: 'iconOnly',
    onChange: previewViewMode =>
      setPreviewViewMode(previewViewMode as PreviewViewMode),
  };

  return (
    <div
      className={classNames(
        moduleStyles.previewHeaderContainer,
        isFullScreenView && moduleStyles.fullScreenPreviewHeaderContainer
      )}
    >
      <div className={moduleStyles.urlBarContent}>
        <div className={moduleStyles.navButtonsWrapper}>
          <MuiIconButton
            variant="text"
            color="tertiary"
            size="extraSmall"
            disabled={!canNavigateBack}
            className={moduleStyles.iconButton}
            onClick={onNavigateBack}
            aria-label={weblab2I18n.navigateBack()}
            type="button"
          >
            <FontAwesomeV6Icon iconName="chevron-left" />
          </MuiIconButton>
          <MuiIconButton
            variant="text"
            color="tertiary"
            size="extraSmall"
            disabled={!canNavigateForward}
            className={moduleStyles.iconButton}
            onClick={onNavigateForward}
            aria-label={weblab2I18n.navigateForward()}
            type="button"
          >
            <FontAwesomeV6Icon iconName="chevron-right" />
          </MuiIconButton>
        </div>
        <AutocompleteInput
          id="html-preview-url-listbox"
          name="url-input"
          size="s"
          className={moduleStyles.urlBarInput}
          onChange={handleInputChange}
          onSubmit={onSubmit}
          hideIcon
          compactOptions
          focusInputOnSelect={false}
          value={value}
          fetchOptions={handleFetchOptions}
          placeholder=""
          aria-label={weblab2I18n.addressBar()}
        />
        <MuiIconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          className={moduleStyles.iconButton}
          onClick={onRefresh}
          aria-label={weblab2I18n.refresh()}
          type="button"
        >
          <FontAwesomeV6Icon iconName="refresh" />
        </MuiIconButton>
      </div>
      <WithTooltip
        tooltipProps={{
          tooltipId: 'stop-preview',
          direction: 'onBottom',
          size: 'xs',
          text: 'Stop preview',
        }}
      >
        <MuiIconButton
          variant="outlined"
          color="error"
          size="extraSmall"
          disabled={!isStopEnabled}
          className={moduleStyles.iconButton}
          onClick={onStopPreview}
          aria-label="Stop Preview"
          type="button"
        >
          <FontAwesomeV6Icon iconName="circle-stop" />
        </MuiIconButton>
      </WithTooltip>
      <SegmentedButtons
        className={moduleStyles.previewViewModeButtons}
        {...previewViewModeButtonsProps}
      />

      {!isShareView && (
        // Hide debug panel toggle and full screen toggle buttons in share view.
        <>
          <WithTooltip
            tooltipProps={{
              tooltipId: 'toggle-debug-panel',
              direction: 'onBottom',
              size: 'xs',
              text: debugPanelOpen ? 'Close debug panel' : 'Open debug panel',
            }}
          >
            <MuiIconButton
              variant="outlined"
              color="tertiary"
              size="extraSmall"
              className={
                debugPanelOpen ? moduleStyles.closeDebugPanelButton : undefined
              }
              onClick={() => dispatch(setDebugPanelOpen(!debugPanelOpen))}
              aria-label={
                debugPanelOpen ? 'Close debug panel' : 'Open debug panel'
              }
              type="button"
            >
              <FontAwesomeV6Icon iconName="bug" />
            </MuiIconButton>
          </WithTooltip>
          <ToggleFullScreenButton
            isFullScreenView={isFullScreenView}
            onToggleFullScreen={onToggleFullScreen}
          />
        </>
      )}
    </div>
  );
};

interface ToggleFullScreenButtonProps {
  isFullScreenView: boolean | undefined;
  onToggleFullScreen: () => void;
}

const ToggleFullScreenButton: React.FC<ToggleFullScreenButtonProps> = ({
  isFullScreenView,
  onToggleFullScreen,
}) => {
  return (
    <MuiIconButton
      variant="text"
      color="tertiary"
      size="extraSmall"
      onClick={onToggleFullScreen}
      aria-label={
        isFullScreenView
          ? weblab2I18n.minimizePreview()
          : weblab2I18n.maximizePreview()
      }
      type="button"
    >
      <FontAwesomeV6Icon iconName={isFullScreenView ? 'compress' : 'expand'} />
    </MuiIconButton>
  );
};

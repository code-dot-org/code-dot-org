import Button from '@code-dot-org/component-library/button';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import weblab2I18n from '@cdo/apps/weblab2/locale';

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
}) => {
  const isFullScreenView = useAppSelector(state => state.lab.isFullScreenView);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    }
  };
  const previewViewModeButtonsProps: SegmentedButtonsProps = {
    color: 'strong',
    buttons: [
      {
        label: weblab2I18n.desktop(),
        value: PreviewViewMode.DESKTOP,
        iconLeft: {
          iconName: 'desktop',
          iconStyle: 'solid',
        },
      },
      {
        label: weblab2I18n.mobile(),
        value: PreviewViewMode.MOBILE,
        iconLeft: {
          iconName: 'mobile',
          iconStyle: 'solid',
        },
      },
    ],
    size: 'xs',
    selectedButtonValue: previewViewMode,
    onChange: previewViewMode =>
      setPreviewViewMode(previewViewMode as PreviewViewMode),
  };

  return (
    <div className={moduleStyles.previewHeaderContainer}>
      <div className={moduleStyles.urlBarContent}>
        <div className={moduleStyles.navButtonsWrapper}>
          <Button
            onClick={onNavigateBack}
            aria-label={weblab2I18n.navigateBack()}
            size="xs"
            type="tertiary"
            color="gray"
            isIconOnly={true}
            icon={{iconName: 'chevron-left'}}
            disabled={!canNavigateBack}
            className={moduleStyles.iconButton}
          />
          <Button
            onClick={onNavigateForward}
            aria-label={weblab2I18n.navigateForward()}
            size="xs"
            type="tertiary"
            color="gray"
            isIconOnly={true}
            icon={{iconName: 'chevron-right'}}
            disabled={!canNavigateForward}
            className={moduleStyles.iconButton}
          />
        </div>
        <TextField
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          value={value}
          name={'url-input'}
          size={'s'}
          className={moduleStyles.urlBarInput}
        />
        <Button
          onClick={onRefresh}
          aria-label={weblab2I18n.refresh()}
          size="xs"
          type="tertiary"
          color="gray"
          isIconOnly={true}
          icon={{iconName: 'refresh'}}
          className={moduleStyles.iconButton}
        />
      </div>
      <SegmentedButtons
        className={moduleStyles.previewViewModeButtons}
        {...previewViewModeButtonsProps}
      />
      <ToggleFullScreenButton
        isFullScreenView={isFullScreenView}
        onToggleFullScreen={onToggleFullScreen}
      />
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
    <Button
      onClick={onToggleFullScreen}
      aria-label={
        isFullScreenView
          ? weblab2I18n.minimizePreview()
          : weblab2I18n.maximizePreview()
      }
      size="xs"
      type="tertiary"
      color="gray"
      isIconOnly={true}
      icon={{iconName: isFullScreenView ? 'compress' : 'expand'}}
    />
  );
};

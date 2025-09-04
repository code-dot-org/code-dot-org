import Button from '@code-dot-org/component-library/button';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React from 'react';

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
  previewViewMode,
  setPreviewViewMode,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    }
  };
  const previewViewModeButtonsProps: SegmentedButtonsProps = {
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
        <div
          className={classNames(
            moduleStyles.urlButtonsWrapper,
            moduleStyles.navButtonsWrapper
          )}
        >
          <Button
            onClick={onNavigateBack}
            aria-label={weblab2I18n.navigateBack()}
            size="xs"
            type="tertiary"
            color="gray"
            isIconOnly={true}
            icon={{iconName: 'chevron-left'}}
            className={moduleStyles.urlButton}
            disabled={!canNavigateBack}
          />
          <Button
            onClick={onNavigateForward}
            aria-label={weblab2I18n.navigateForward()}
            size="xs"
            type="tertiary"
            color="gray"
            isIconOnly={true}
            icon={{iconName: 'chevron-right'}}
            className={moduleStyles.urlButton}
            disabled={!canNavigateForward}
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
        <div
          className={classNames(
            moduleStyles.urlButtonsWrapper,
            moduleStyles.refreshButtonWrapper
          )}
        >
          <Button
            onClick={onRefresh}
            aria-label={weblab2I18n.refresh()}
            size="xs"
            type="tertiary"
            color="gray"
            isIconOnly={true}
            icon={{iconName: 'refresh'}}
            className={moduleStyles.urlButton}
          />
        </div>
      </div>
      <SegmentedButtons
        {...previewViewModeButtonsProps}
        className={moduleStyles.customSegmentedButtons}
      />
    </div>
  );
};

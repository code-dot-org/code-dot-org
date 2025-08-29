import Button from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React from 'react';

import weblab2I18n from '@cdo/apps/weblab2/locale';

import moduleStyles from './styles/url-bar.module.scss';

interface UrlBarProps {
  value: string;
  onChange: (value: string) => void;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onRefresh: () => void;
}

export const UrlBar: React.FC<UrlBarProps> = ({
  value,
  onChange,
  canNavigateBack,
  canNavigateForward,
  onNavigateBack,
  onNavigateForward,
  onRefresh,
}) => {
  return (
    <div className={moduleStyles.urlBarContainer}>
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
    </div>
  );
};

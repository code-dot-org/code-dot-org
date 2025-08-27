import Button from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './styles/url-bar.module.scss';

interface UrlBarProps {
  value: string;
  onChange: (value: string) => void;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
}

export const UrlBar: React.FC<UrlBarProps> = ({
  value,
  onChange,
  canNavigateBack,
  canNavigateForward,
  onNavigateBack,
  onNavigateForward,
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
            aria-label="Navigate back"
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
            aria-label="Navigate forward"
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
            onClick={() => {}}
            aria-label="Refresh"
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

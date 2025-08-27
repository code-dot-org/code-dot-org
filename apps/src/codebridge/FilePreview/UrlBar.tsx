import Button from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './styles/url-bar.module.scss';

interface UrlBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const UrlBar: React.FC<UrlBarProps> = ({value, onChange}) => {
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
            onClick={() => {}}
            aria-label="Navigate back"
            size="xs"
            type="tertiary"
            color="gray"
            isIconOnly={true}
            icon={{iconName: 'chevron-left'}}
            className={moduleStyles.urlButton}
          />
          <Button
            onClick={() => {}}
            aria-label="Navigate forward"
            size="xs"
            type="tertiary"
            color="gray"
            isIconOnly={true}
            icon={{iconName: 'chevron-right'}}
            className={moduleStyles.urlButton}
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

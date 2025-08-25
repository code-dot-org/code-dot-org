import Button from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import React from 'react';

import moduleStyles from './styles/url-bar.module.scss';

interface UrlBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const UrlBar: React.FC<UrlBarProps> = ({value, onChange}) => {
  return (
    <div className={moduleStyles.urlBarContainer}>
      <span className={moduleStyles.spacer} />
      <div className={moduleStyles.navigationButtons}>
        <Button
          onClick={() => {}}
          aria-label="Navigate back"
          size="xs"
          type="tertiary"
          isIconOnly={true}
          icon={{iconName: 'chevron-left'}}
          className={moduleStyles.navButton}
        />
        <Button
          onClick={() => {}}
          aria-label="Navigate forward"
          size="xs"
          type="tertiary"
          isIconOnly={true}
          icon={{iconName: 'chevron-right'}}
          className={moduleStyles.navButton}
        />
      </div>
      <TextField
        onChange={e => onChange(e.target.value)}
        value={value}
        name={'url-input'}
        size={'s'}
        className={moduleStyles.urlBarInput}
      />
    </div>
  );
};

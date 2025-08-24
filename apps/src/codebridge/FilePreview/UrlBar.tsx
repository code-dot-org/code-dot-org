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

import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useCallback, useEffect, useId, useState} from 'react';

import styles from './element-toolbar.module.scss';

interface AltTextRowProps {
  value: string;
  onChange: (next: string) => void;
}

// Commit-on-blur text input for the image's alt attribute. Local state
// while focused keeps undo snapshots from being pushed for every
// keystroke (patchNodeData calls pushSnapshot).
export default function AltTextRow({value, onChange}: AltTextRowProps) {
  const labelId = useId();
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value);
    }
  }, [value, isFocused]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (inputValue !== value) {
      onChange(inputValue);
    }
  }, [inputValue, value, onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        (event.target as HTMLInputElement).blur();
      }
    },
    []
  );

  return (
    <div className={styles.section} role="group" aria-labelledby={labelId}>
      <Typography
        id={labelId}
        variant="overline3"
        className={styles.sectionTitle}
      >
        Alt text
      </Typography>
      <TextField
        name="alt-text"
        aria-labelledby={labelId}
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        size="s"
        className={styles.altTextField}
      />
    </div>
  );
}

import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface TextEntryProps {
  onSubmit: (text: string) => void;
}

/** The field over the game for a program with "when text entered": Enter
    or Send hands the text to the program and clears the field. Key events
    stop here, so typing never steers the player. */
const TextEntry: React.FunctionComponent<TextEntryProps> = ({onSubmit}) => {
  const [value, setValue] = useState('');
  const stop = (event: React.KeyboardEvent) => event.stopPropagation();
  return (
    <form
      className={moduleStyles.textEntryForm}
      onSubmit={event => {
        event.preventDefault();
        const text = value.trim();
        if (text) {
          onSubmit(text);
          setValue('');
        }
      }}
    >
      <input
        type="text"
        className={moduleStyles.textEntryInput}
        value={value}
        placeholder="Type something, then press Enter"
        aria-label="Text to send to the game"
        autoComplete="off"
        onChange={event => setValue(event.target.value)}
        onKeyDown={stop}
        onKeyUp={stop}
        onKeyPress={stop}
      />
      <MuiButton type="submit" variant="contained" color="primary" size="small">
        Send
      </MuiButton>
    </form>
  );
};

export default TextEntry;

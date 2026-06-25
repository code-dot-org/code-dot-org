import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import moduleStyles from './photo-prompter-button.module.scss';

interface PhotoPrompterButtonProps {
  /** Prompt describing the photo to capture, e.g. "Take a photo of a tree". */
  promptText: string;
  /** Called with the file the user selected. */
  onPhotoSelected: (file: File) => void;
}

// Button overlaid on the theater background that opens the OS photo picker.
// Shown while a running program is waiting on a photo. It takes focus when it
// appears so keyboard and screen-reader users land on it immediately.
const PhotoPrompterButton: React.FunctionComponent<
  PhotoPrompterButtonProps
> = ({promptText, onPhotoSelected}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoSelected(file);
    }
  };

  return (
    <div className={moduleStyles.container}>
      <MuiButton
        ref={buttonRef}
        variant="contained"
        color="secondary"
        size="medium"
        type="button"
        aria-label={promptText}
        onClick={() => inputRef.current?.click()}
        startIcon={
          <FontAwesomeV6Icon iconStyle="solid" iconName="camera" aria-hidden />
        }
      >
        {promptText}
      </MuiButton>
      <input
        ref={inputRef}
        aria-label={promptText}
        className={moduleStyles.hiddenInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onInputChange}
      />
    </div>
  );
};

export default PhotoPrompterButton;

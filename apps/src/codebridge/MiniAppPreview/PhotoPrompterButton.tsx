import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';

import moduleStyles from './photo-prompter-button.module.scss';

interface PhotoPrompterButtonProps {
  promptText: string;
  onPhotoSelected: (file: File) => void;
}

// Button overlaid on the theater background that opens the OS photo picker.
// Shown while a running program is waiting on a photo. It takes focus when it
// appears so keyboard and screen-reader users land on it immediately.
const PhotoPrompterButton: React.FunctionComponent<
  PhotoPrompterButtonProps
> = ({promptText, onPhotoSelected}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoSelected(file);
    }
  };
  const [openFileInput, FileInput] = useHiddenFileInput(
    onInputChange,
    'image/*',
    false,
    'environment'
  );

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  const promptLabel = promptText || 'Select a photo';

  return (
    <div className={moduleStyles.container}>
      <MuiButton
        ref={buttonRef}
        variant="contained"
        color="secondary"
        size="medium"
        type="button"
        aria-label={promptLabel}
        onClick={openFileInput}
        startIcon={
          <FontAwesomeV6Icon iconStyle="solid" iconName="camera" aria-hidden />
        }
      >
        {promptLabel}
      </MuiButton>
      <FileInput />
    </div>
  );
};

export default PhotoPrompterButton;

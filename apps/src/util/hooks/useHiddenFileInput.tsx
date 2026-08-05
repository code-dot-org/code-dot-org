import React, {ChangeEvent, useCallback, useRef} from 'react';

/**
 * Hook that creates a hidden file input element and returns
 * 1) a function to open it and 2) the input element itself.
 *
 * @param onChange change handler to call when a file is selected
 * @param accept optional; file types to accept
 * @param multiple optional; whether to allow multiple files
 * @returns function to open file input, and input component
 */
export default function useHiddenFileInput(
  onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  accept?: string,
  multiple?: boolean,
  capture?: boolean | 'user' | 'environment'
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const openFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const FileInput = useCallback(
    () => (
      <input
        type="file"
        id="file-input"
        ref={inputRef}
        style={{display: 'none'}}
        onChange={event => onChangeRef.current(event)}
        accept={accept}
        multiple={multiple}
        capture={capture}
        onClick={event => {
          event.stopPropagation();
        }}
      />
    ),
    [accept, multiple, capture]
  );

  return [openFileInput, FileInput] as const;
}

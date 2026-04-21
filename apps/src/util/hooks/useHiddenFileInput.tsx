import React, {ChangeEvent, useRef} from 'react';

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
  multiple?: boolean
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openFileInput = () => {
    if (inputRef.current) {
      inputRef.current.click();
      inputRef.current.value = '';
    }
  };

  const FileInput = () => (
    <input
      type="file"
      id="file-input"
      ref={inputRef}
      style={{display: 'none'}}
      onChange={onChange}
      accept={accept}
      multiple={multiple}
      onClick={event => {
        event.stopPropagation();
      }}
    />
  );

  return [openFileInput, FileInput] as const;
}

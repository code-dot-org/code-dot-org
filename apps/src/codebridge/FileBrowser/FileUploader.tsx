import React, {useCallback, useRef} from 'react';

type FileUploaderProps = {
  children?: React.ReactNode;
  callback: (filename: string, contents: string) => void;
  errorCallback: (error: DOMException) => void;
};

const bufferToString = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  return bytes.reduce((string, byte) => string + String.fromCharCode(byte), '');
};

export const FileUploader = React.memo(
  ({children, callback, errorCallback}: FileUploaderProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const changeHandler = useCallback(() => {
      const file = inputRef.current?.files?.[0];
      if (file) {
        const reader = new FileReader();
        if (file.type.match(/^text/)) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }

        reader.onload = () => {
          if (!reader.result) {
            callback(file.name, '');
          } else {
            const result =
              typeof reader.result === 'string'
                ? reader.result
                : bufferToString(reader.result);
            callback(file.name, result as string);
          }
        };
        reader.onerror = () => {
          if (reader.error) {
            errorCallback(reader.error);
          }
        };
      }
    }, [callback, errorCallback]);

    return (
      <div
        onClick={e => {
          e.stopPropagation();

          inputRef.current?.click();
        }}
      >
        <input
          type="file"
          style={{display: 'none'}}
          onChange={changeHandler}
          ref={inputRef}
        />
        {children}
      </div>
    );
  }
);

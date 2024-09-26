import React, {useRef} from 'react';

type FileUploaderProps = {
  children?: React.ReactNode;
  callback: (filename: string, contents: string) => void;
  errorCallback: (error: DOMException) => void;
};

export const FileUploader = React.memo(
  ({children, callback, errorCallback}: FileUploaderProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div
        onClick={e => {
          e.stopPropagation();
          console.log('CLICKED ON : ', e);
          inputRef.current?.click();
        }}
      >
        <input
          type="file"
          style={{display: 'none'}}
          onChange={e => {
            const file = inputRef.current?.files?.[0];
            if (file) {
              console.log('uploaded file', file);
              console.log(file.name);
              const reader = new FileReader();
              if (file.type.match(/^text/)) {
                reader.readAsText(file);
              } else {
                reader.readAsBinaryString(file);
              }

              reader.onload = () => {
                if (!reader.result) {
                  callback(file.name, '');
                } else {
                  console.log('GOT RESULT :', typeof reader.result);

                  callback(file.name, reader.result as string);
                }
              };
              reader.onerror = () => {
                if (reader.error) {
                  errorCallback(reader.error);
                }
              };
            }
          }}
          ref={inputRef}
        />
        {children}
      </div>
    );
  }
);

import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import React, {useCallback, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

type FileUploaderProps = {
  children?: React.ReactNode;
  callback: (filename: string, contents: string) => void;
  errorCallback: (error: string) => void;
  validMimeTypes?: string[];
};

const bufferToString = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  return bytes.reduce((string, byte) => string + String.fromCharCode(byte), '');
};

const defaultAllowedMimeRegexes = [
  'image/',
  'text/',
  'audio/',
  'video/',
  'application/json',
  'application/ld+json',
  'application/pdf',
  'application/rtf',
];

const isValidMimeType = (
  mimeType: string,
  allowedMimeRegexes: string[] = defaultAllowedMimeRegexes
) => {
  return Boolean(
    allowedMimeRegexes.find(regex => new RegExp(regex).exec(mimeType))?.length
  );
};

export const FileUploader = React.memo(
  ({children, callback, errorCallback, validMimeTypes}: FileUploaderProps) => {
    const appName = useAppSelector(state => state.lab.levelProperties?.appName);
    const inputRef = useRef<HTMLInputElement>(null);

    const changeHandler = useCallback(() => {
      const file = inputRef.current?.files?.[0];
      if (file) {
        if (!isValidMimeType(file.type, validMimeTypes)) {
          sendCodebridgeAnalyticsEvent(
            EVENTS.CODEBRIDGE_UPLOAD_UNACCEPTED_FILE,
            appName,
            {name: file.name, type: file.type}
          );
          errorCallback(`Cannot upload files of type ${file.type}`);
          return;
        }
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
            sendCodebridgeAnalyticsEvent(
              EVENTS.CODEBRIDGE_UPLOAD_FAILED,
              appName,
              {error: reader.error.message}
            );
            errorCallback(reader.error.message);
          }
        };
      }
    }, [appName, callback, errorCallback, validMimeTypes]);

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

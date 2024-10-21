import React, {useCallback, useMemo, useRef} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

export const enum analyticsEvents {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  UPLOAD_UNACCEPTED_FILE = 'UPLOAD_UNACCEPTED_FILE',
}

type FileUploaderProps = {
  children?: React.ReactNode;
  callback: (
    filename: string,
    contents: string,
    callbackArgs?: unknown
  ) => void;
  errorCallback: (error: string, callbackArgs?: unknown) => void;
  multiple?: boolean;
  validMimeTypes?: string[];
  sendAnalyticsEvent?: (
    eventName: analyticsEvents,
    payload: Record<string, string>
  ) => void;
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

/**
 * Checks if a given MIME type is valid based on a list of allowed MIME types.
 *
 * @param mimeType - The MIME type to check.
 * @param allowedMimeRegexes - An optional array of regular expressions representing allowed MIME types.
 *                             If not provided, the default allowed MIME types are used.
 *
 * @returns True if the MIME type is valid, false otherwise.
 */
const isValidMimeType = (
  mimeType: string,
  allowedMimeRegexes: string[] = defaultAllowedMimeRegexes
) => {
  return Boolean(
    allowedMimeRegexes.find(regex => new RegExp(regex).exec(mimeType))?.length
  );
};

/**
 * A custom hook that provides functionality for file uploads,
 * including validation, reading, and handling callbacks.
 *
 * @param props An object containing configuration options for the hook.
 *
 * @property props.callback - A function to be called with file information upon successful upload.
 *                      This function receives the file name, the file content as a string, and any optional callback arguments.
 * @property props.errorCallback - A function to be called with an error message if the upload fails.
 * @property props.validMimeTypes - An optional array of strings representing the allowed MIME types for uploaded files.
 *                                  If not provided, the hook will validate against the internal defaultMimeTypes array
 * @property props.sendAnalyticsEvent - An optional function that will be called with analytics data. It will generated analytics events for
                                        analyticsEvents.UPLOAD_UNACCEPTED_FILE and analyticsEvents.UPLOAD_FAILED. Map them to your own analytics events
                                        The second argument will be a record with more info, as Record<string, string>
                                        If not provided, then no analytics will be tracked
 *
 * @returns An object containing the following properties:
 *
 * @property returns.startFileUpload - A function to initiate the file upload process.
 *                                    Optionally accepts additional arguments to be passed to the `callback` and `errorCallback` functions.
 * @property returns.FileUploaderComponent - A React component that renders a hidden file input element.
 *                                    This component is used to handle the file upload, and it is interacted with by calling `startFileUpload`.
 */
export const useFileUploader = ({
  callback,
  errorCallback,
  validMimeTypes,
  sendAnalyticsEvent = () => {},
  multiple = true,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const callbackArgs = useRef<unknown>();

  const changeHandler = useCallback(() => {
    Array.from(inputRef.current?.files || []).forEach(file => {
      if (!isValidMimeType(file.type, validMimeTypes)) {
        sendAnalyticsEvent(analyticsEvents.UPLOAD_UNACCEPTED_FILE, {
          name: file.name,
          type: file.type,
        });
        errorCallback(
          codebridgeI18n.invalidFileUpload({fileType: file.type}),
          callbackArgs.current
        );
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
          callback(file.name, '', callbackArgs.current);
        } else {
          const result =
            typeof reader.result === 'string'
              ? reader.result
              : bufferToString(reader.result);

          callback(file.name, result as string, callbackArgs.current);
        }
      };
      reader.onerror = () => {
        if (reader.error) {
          sendAnalyticsEvent(analyticsEvents.UPLOAD_FAILED, {
            error: reader.error.message,
          });
          errorCallback(reader.error.message, callbackArgs.current);
        }
      };
    });
  }, [callback, errorCallback, validMimeTypes, sendAnalyticsEvent]);

  return useMemo(
    () => ({
      startFileUpload: (newCallbackArgs?: unknown) => {
        callbackArgs.current = newCallbackArgs;
        inputRef.current?.click();
      },
      FileUploaderComponent: () => (
        <input
          type="file"
          style={{display: 'none'}}
          onChange={changeHandler}
          ref={inputRef}
          multiple={multiple}
        />
      ),
    }),
    [changeHandler, inputRef, multiple]
  );
};

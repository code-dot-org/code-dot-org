import React, {useCallback, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import UploadsDisabledModal from '@cdo/apps/sharedComponents/UploadsDisabledModal';
import HttpClient from '@cdo/apps/util/HttpClient';
import {WEBLAB2_IMAGE_FILE_TYPES} from '@cdo/apps/weblab2/constants';

export const enum analyticsEvents {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  UPLOAD_SUCCEEDED = 'UPLOAD_SUCCEEDED',
  UPLOAD_UNACCEPTED_FILE = 'UPLOAD_UNACCEPTED_FILE',
}

export type FileUploaderProps = {
  children?: React.ReactNode;
  callback: (
    filename: string,
    contents: string,
    uploadUrl?: string,
    callbackArgs?: unknown,
    flagged?: boolean
  ) => void;
  errorCallback: (error: string, callbackArgs?: unknown) => void;
  uploadExternalFile: (file: File) => Promise<string>;
  validateFileName?: (fileName: string) => string | undefined;
  multiple?: boolean;
  validMimeTypes?: string[];
  sendAnalyticsEvent?: (
    eventName: analyticsEvents,
    payload: Record<string, string>
  ) => void;
  appName?: string;
  isBlockedAbuse?: boolean;
  onImageFlagged?: (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
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

const moderateImage = async (
  file: File,
  ext: string,
  appName?: string
): Promise<'ok' | 'flagged' | 'skipped'> => {
  if (appName !== 'weblab2' || !WEBLAB2_IMAGE_FILE_TYPES.includes(ext)) {
    return 'skipped';
  }
  const response = await HttpClient.post(`/v3/images/moderate`, file, true, {
    'Content-Type': file.type || 'application/octet-stream',
  });
  if (!response.ok) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Error with image moderation');
    return 'skipped';
  }
  const json = await response.json();
  if (json?.rating !== 'everyone' && json?.rating !== 'unknown') {
    return 'flagged';
  }
  return 'ok';
};
/**
 * A custom hook that provides functionality for file uploads,
 * including validation, reading, uploading to S3 for non-text files, and handling callbacks.
 *
 * @param props An object containing configuration options for the hook.
 *
 * @property props.callback - A function to be called with file information upon successful upload.
 *                      This function receives the file name, the file content as a string, and any optional callback arguments.
 * @property props.errorCallback - A function to be called with an error message if the upload fails.
 * @property props.validMimeTypes - An optional array of strings representing the allowed MIME types for uploaded files.
 *                                  If not provided, the hook will validate against the internal defaultMimeTypes array
 * @property props.uploadExternalFile - Required so that we can upload non-text files to S3.
 * @property props.sendAnalyticsEvent - An optional function that will be called with analytics data. It will generated analytics events for
                                        analyticsEvents.UPLOAD_UNACCEPTED_FILE, analyticsEvents.UPLOAD_FAILED, and analyticsEvents.UPLOAD_SUCCEEDED.
                                        Map them to your own analytics events. The second argument will be a record with more info, as Record<string, string>
                                        If the function is not provided, then no analytics will be tracked
 * @property props.multiple - Optionally disable multiple file uploads. Defaults to true.
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
  uploadExternalFile,
  validateFileName = () => undefined,
  sendAnalyticsEvent = () => {},
  multiple = true,
  appName,
  onImageFlagged,
  isBlockedAbuse,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const callbackArgs = useRef<unknown>();
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const changeHandler = useCallback(() => {
    const handleError = (error: Error) => {
      sendAnalyticsEvent(analyticsEvents.UPLOAD_FAILED, {
        error: error.message,
      });
      errorCallback(error.message, callbackArgs.current);
    };

    Array.from(inputRef.current?.files || []).forEach(async file => {
      const fileNameErrorMessage = validateFileName(file.name);
      if (fileNameErrorMessage) {
        errorCallback(fileNameErrorMessage, callbackArgs.current);
        return;
      }

      if (!isValidMimeType(file.type, validMimeTypes)) {
        sendAnalyticsEvent(analyticsEvents.UPLOAD_UNACCEPTED_FILE, {
          name: file.name,
          type: file.type,
        });
        const [, fileType] = file.name.split('.');
        errorCallback(
          codebridgeI18n.invalidFileType({fileType: file.type || fileType}),
          callbackArgs.current
        );
        return;
      }

      if (file.type.match(/^text/)) {
        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = () => {
          if (!reader.result) {
            callback(file.name, '', undefined, callbackArgs.current);
          } else {
            const result =
              typeof reader.result === 'string'
                ? reader.result
                : bufferToString(reader.result);
            sendAnalyticsEvent(analyticsEvents.UPLOAD_SUCCEEDED, {
              name: file.name,
              type: file.type,
            });
            callback(
              file.name,
              result as string,
              undefined,
              callbackArgs.current
            );
          }
        };

        reader.onerror = () => {
          if (reader.error) {
            handleError(reader.error);
          }
        };
      } else {
        try {
          if (onImageFlagged) {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const moderationStatus = await moderateImage(file, ext, appName);
            if (moderationStatus === 'flagged') {
              const uploadFunction = async () => {
                const url = await uploadExternalFile(file);
                sendAnalyticsEvent(analyticsEvents.UPLOAD_SUCCEEDED, {
                  name: file.name,
                  type: file.type,
                });
                callback(file.name, '', url, callbackArgs.current, true);
              };
              // FlagedImageModal will be shown to the user and user can choose to upload the image or not.
              onImageFlagged(file, ext, uploadFunction);
              return;
            }
          }

          // For non-text files that are not moderated (eg, files uploaded in start mode by levelbuilders)
          // and images that are deemed safe, upload directly to assets.
          const url = await uploadExternalFile(file);
          sendAnalyticsEvent(analyticsEvents.UPLOAD_SUCCEEDED, {
            name: file.name,
            type: file.type,
          });
          callback(file.name, '', url, callbackArgs.current);
        } catch (error) {
          if (error instanceof Error) {
            handleError(error);
          }
        }
      }
    });
  }, [
    sendAnalyticsEvent,
    errorCallback,
    validateFileName,
    validMimeTypes,
    callback,
    uploadExternalFile,
    appName,
    onImageFlagged,
  ]);

  const BlockedModal = useCallback(() => {
    return showBlockedModal ? (
      <UploadsDisabledModal onClose={() => setShowBlockedModal(false)} />
    ) : null;
  }, [showBlockedModal]);

  return useMemo(
    () => ({
      startFileUpload: (newCallbackArgs?: unknown) => {
        callbackArgs.current = newCallbackArgs;

        if (isBlockedAbuse) {
          setShowBlockedModal(true);
          return;
        }

        inputRef.current?.click();
      },
      FileUploaderComponent: () => (
        <>
          <input
            type="file"
            style={{display: 'none'}}
            onChange={changeHandler}
            ref={inputRef}
            multiple={multiple}
          />
          <BlockedModal />
        </>
      ),
    }),
    [changeHandler, inputRef, multiple, isBlockedAbuse, BlockedModal]
  );
};

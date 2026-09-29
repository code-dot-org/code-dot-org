// Bringing a file of your own into the project.
//
// A text file is read into contents; anything else goes to the assets backend
// and is referenced by URL, scoped to the project's channel. The size is
// checked BEFORE anything is read or sent, so an oversized file costs a message
// rather than a round trip that fails with a status code.
//
// A HOOK, because there are two ways in now. The file browser's header has had
// one since uploads existed; a lab that offers its own way around its files
// wants the same act somewhere else — World Lab puts "Upload…" on the folder
// menu for pictures and sounds, which is also how it can put the file in the
// folder that gives it its meaning rather than at the root.

import {useCallback} from 'react';

import {DashboardApiClient} from '@code-dot-org/core/api';
import type {FolderId} from '@code-dot-org/core/api';
import {labActions, useAppSelector} from '@code-dot-org/lab/redux';

import {languageForFileName} from '../config';
import {DEFAULT_FOLDER_ID} from '../constants';
import {useCodebridgeConfig} from '../contexts/CodebridgeConfigContext';
import {tooLarge, type TooLarge} from '../uploadLimit';
import {getFileExtension} from '../utils/multiFileSource';

import {useFileOperations} from './useFileOperations';

export interface FileUpload {
  /** Whether uploading is possible at all: the lab allows it, and this is not
   * a read-only workspace. */
  enabled: boolean;
  /** What a file input's `accept` should be. */
  accept: string;
  /**
   * Take a chosen file into the project.
   *
   * Resolves with a REFUSAL when the file was turned away before anything was
   * read or sent — a caller shows it — and undefined when it landed (or failed
   * in a way already logged).
   */
  upload: (file: File, folderId?: FolderId) => Promise<TooLarge | undefined>;
}

export const useFileUpload = (): FileUpload => {
  const ops = useFileOperations();
  const config = useCodebridgeConfig();
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);
  // The channel scopes an asset to this project. The api client is the
  // app-wide singleton (no `ApiClientProvider` dependency — this renders fine
  // in the bare shell tests).
  const channelId = useAppSelector(state => state.lab.channel?.id);

  const upload = useCallback(
    async (file: File, folderId: FolderId = DEFAULT_FOLDER_ID) => {
      const oversized = tooLarge(file, config.maxUploadBytes);
      if (oversized) {
        return oversized;
      }
      const language = languageForFileName(config, file.name);
      try {
        if (file.type.startsWith('text/')) {
          ops.newFile({
            fileName: file.name,
            language,
            folderId,
            contents: await file.text(),
          });
          return undefined;
        }
        if (!channelId) {
          return undefined;
        }
        const ext = getFileExtension(file.name);
        const filename = `${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;
        const {url} = await DashboardApiClient.assets.upload({
          channelId,
          filename,
          data: file,
        });
        ops.newExternalFile({
          fileName: file.name,
          language,
          folderId,
          url,
          mimeType: file.type,
        });
      } catch (error) {
        console.error('File upload failed', error);
      }
      return undefined;
    },
    [ops, config, channelId],
  );

  return {
    enabled: !isReadOnly && (config.validMimeTypes?.length ?? 0) > 0,
    accept: (config.validMimeTypes ?? []).join(','),
    upload,
  };
};

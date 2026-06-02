import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {uniqueFileName} from '@codebridge/utils/uniqueFileName';

import {updateStagedFileFilename} from '@cdo/apps/aichat/redux';
import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types/assets';
import {setAndSaveSource} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {createNewFolderHelper} from '@cdo/apps/lab2/utils/multiFileSourceEditUtils';
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

export const AI_TUTOR_UPLOADS_FOLDER = 'aitutor_uploads';

/**
 * After a successful AI Tutor chat upload, add image to the project's sources
 * under a top-level folder named aitutor_uploads, without opening
 * the file in the editor. Duplicate filenames are renamed with a numeric suffix
 * (e.g. photo_1.png) so existing entries are never overwritten.
 * Chat uploads use a cleaned-up version of the original filename in the assets bucket.
 * Only project-sourced uploads are synced; level starter assets are left alone.
 */
export const syncAiTutorAssetToProject =
  (asset: ChatAsset, assetUrl: string) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    if (asset.source !== AssetSource.PROJECT) return;
    if (asset.filename.endsWith('.pdf')) return;

    const source = getState().lab2Project.projectSources?.source as
      | MultiFileSource
      | undefined;
    if (!source) return;

    let updatedSource = source;

    // Find or create the uploads folder at the project root.
    let targetFolder = Object.values(updatedSource.folders).find(
      f =>
        f.name === AI_TUTOR_UPLOADS_FOLDER && f.parentId === DEFAULT_FOLDER_ID
    );

    if (!targetFolder) {
      updatedSource = createNewFolderHelper(
        updatedSource,
        AI_TUTOR_UPLOADS_FOLDER,
        DEFAULT_FOLDER_ID
      );
      targetFolder = Object.values(updatedSource.folders).find(
        f =>
          f.name === AI_TUTOR_UPLOADS_FOLDER && f.parentId === DEFAULT_FOLDER_ID
      );
      if (!targetFolder) return;
    }

    const folderId = targetFolder.id;

    const existingNames = Object.values(updatedSource.files)
      .filter(f => f.folderId === folderId)
      .map(f => f.name);
    const filename = uniqueFileName(asset.filename, existingNames);

    const fileId = getNextFileId(Object.values(updatedSource.files));
    updatedSource = {
      ...updatedSource,
      files: {
        ...updatedSource.files,
        [fileId]: {
          id: fileId,
          name: filename,
          contents: '',
          folderId,
          url: assetUrl,
        },
      },
    };

    // If the filename was deduplicated, update the staged file so that
    // onAssetRemoved receives the correct name when the user removes it.
    if (filename !== asset.filename) {
      const stagedFiles = getState().aichat.stagedFiles;
      const stagedFile = [...stagedFiles]
        .reverse()
        .find(f => f.asset.filename === asset.filename);
      if (stagedFile) {
        dispatch(updateStagedFileFilename({key: stagedFile.key, filename}));
      }
    }

    dispatch(setAndSaveSource(updatedSource));
  };

/**
 * Remove an image that was previously synced by syncAiTutorAssetToProject.
 * No-ops if the file or folder doesn't exist in sources.
 */
export const removeAiTutorAssetFromProject =
  (asset: ChatAsset) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    if (asset.source !== AssetSource.PROJECT) return;

    const source = getState().lab2Project.projectSources?.source as
      | MultiFileSource
      | undefined;
    if (!source) return;

    const targetFolder = Object.values(source.folders).find(
      f =>
        f.name === AI_TUTOR_UPLOADS_FOLDER && f.parentId === DEFAULT_FOLDER_ID
    );
    if (!targetFolder) return;

    const existingFile = Object.values(source.files).find(
      f => f.name === asset.filename && f.folderId === targetFolder.id
    );
    if (!existingFile) return;

    const remainingFiles = {...source.files};
    delete remainingFiles[existingFile.id];

    // If no files remain in the uploads folder, remove it too.
    const folderStillUsed = Object.values(remainingFiles).some(
      f => f.folderId === targetFolder.id
    );
    const remainingFolders = folderStillUsed
      ? source.folders
      : Object.fromEntries(
          Object.entries(source.folders).filter(
            ([id]) => id !== targetFolder.id
          )
        );

    const updatedSource: MultiFileSource = {
      ...source,
      files: remainingFiles,
      folders: remainingFolders,
      openFiles: (source.openFiles ?? []).filter(id => id !== existingFile.id),
    };

    dispatch(setAndSaveSource(updatedSource));
  };

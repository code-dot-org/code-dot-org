import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types/assets';
import {
  createNewFileThunk,
  createNewFolderThunk,
  saveFileThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

export const AI_TUTOR_UPLOADS_FOLDER = 'AI_Tutor_Uploaded_Images';

/**
 * After a successful AI Tutor chat upload, add image to the project's sources.
 *
 * The file is placed in a top-level folder named AI_TUTOR_UPLOADS_FOLDER.
 * Duplicate filenames within that folder replace the existing project file entry for now.
 * Chat uploads reuse the original filename in the assets bucket, so re-uploads
 * overwrite in place.
 * TODO: Consider unique asset keys (e.g. UUID) if we need separate copies per upload instead of replacing.
 * Only project-sourced uploads are synced; level starter assets are left alone.
 */
export const syncAiTutorAssetToProject =
  (asset: ChatAsset, assetUrl: string) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    if (asset.source !== AssetSource.PROJECT) return;

    const source = getState().lab2Project.projectSources?.source as
      | MultiFileSource
      | undefined;
    if (!source) return;

    // Find or create the uploads folder at the project root.
    const existingFolder = Object.values(source.folders).find(
      f =>
        f.name === AI_TUTOR_UPLOADS_FOLDER && f.parentId === DEFAULT_FOLDER_ID
    );

    if (!existingFolder) {
      dispatch(
        createNewFolderThunk({
          folderName: AI_TUTOR_UPLOADS_FOLDER,
          parentId: DEFAULT_FOLDER_ID,
        })
      );
    }

    // Re-read state after potential folder creation.
    const updatedSource = getState().lab2Project.projectSources?.source as
      | MultiFileSource
      | undefined;
    if (!updatedSource) return;

    const targetFolder = Object.values(updatedSource.folders).find(
      f =>
        f.name === AI_TUTOR_UPLOADS_FOLDER && f.parentId === DEFAULT_FOLDER_ID
    );
    if (!targetFolder) return;

    const existingFile = Object.values(updatedSource.files).find(
      f => f.name === asset.filename && f.folderId === targetFolder.id
    );

    if (existingFile) {
      dispatch(
        saveFileThunk({
          fileId: existingFile.id,
          contents: '',
          url: assetUrl,
        })
      );
      return;
    }

    dispatch(
      createNewFileThunk({
        fileName: asset.filename,
        folderId: targetFolder.id,
        url: assetUrl,
      })
    );
  };

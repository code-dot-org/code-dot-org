import {getFolderPath} from '@codebridge/utils';
import {useCallback} from 'react';

import {useSharedAiTutorResponseSchemaSettings} from '@cdo/apps/aiTutor/hooks/useSharedAiTutorResponseSchemaSettings';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  acceptRejectAnswerTypes,
  acceptRejectFileTypes,
  aiTutorResponseJsonSchema,
} from '../helpers/aiTutorStructuredResponseHelper';
import {setAiFilePathToPreview} from '../weblab2Redux';

export const useAiTutorResponseSchemaSettings = (
  source: MultiFileSource | undefined,
  isWidgetView?: boolean
) => {
  const dispatch = useAppDispatch();

  const onAiTutorVersionLoaded = useCallback(
    (mergedSource: MultiFileSource, aiTutorVersionFiles: ProjectFile[]) => {
      const firstHtmlFile = aiTutorVersionFiles.find(file =>
        file.name.endsWith('.html')
      );
      if (!firstHtmlFile) {
        return;
      }
      const folderPath = getFolderPath(
        firstHtmlFile.folderId,
        mergedSource.folders
      ).substring(1);
      const filePath =
        folderPath === ''
          ? firstHtmlFile.name
          : folderPath + '/' + firstHtmlFile.name;
      dispatch(setAiFilePathToPreview({path: filePath, timestamp: Date.now()}));
    },
    [dispatch]
  );

  return useSharedAiTutorResponseSchemaSettings({
    source,
    isWidgetView,
    jsonSchema: aiTutorResponseJsonSchema,
    acceptRejectAnswerTypes,
    acceptRejectFileTypes,
    onAiTutorVersionLoaded,
  });
};

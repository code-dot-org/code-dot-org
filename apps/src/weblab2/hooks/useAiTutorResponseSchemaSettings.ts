import {getFolderPath} from '@codebridge/utils';
import {useMemo} from 'react';

import {ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {
  setProjectSourceBeforeAiTutorVersion,
  setSource,
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  acceptRejectJsonSchema,
  copyCodeJsonSchema,
  formatAcceptRejectResponse,
  formatExplanationResponse,
  getMergedAiTutorCodeWithSource,
} from '../helpers/aiTutorStructuredResponseHelper';
import {setAiFilePathToPreview, setAiTutorVersionFiles} from '../redux';

/**
 * Custom hook that provides AI tutor response schema settings based on the current
 * AI tutor mode and experimental flags. Handles the complete flow of processing
 * AI tutor responses including accept/reject functionality.
 */
export const useAiTutorResponseSchemaSettings = (
  aiTutorMode: string | undefined,
  source: MultiFileSource | undefined
): ResponseSchemaSettings | undefined => {
  const dispatch = useAppDispatch();

  return useMemo(() => {
    if (
      experiments.isEnabledAllowingQueryString(
        experiments.WEBLAB2_ACCEPT_REJECT
      ) &&
      ['produce', 'designer'].includes(aiTutorMode || '')
    ) {
      return {
        jsonSchema: acceptRejectJsonSchema,
        responseCallback: (response: string) => {
          const jsonResponse = JSON.parse(response);
          console.log('AI Tutor response (in jsonSchema callback):', {
            jsonResponse,
          });
          const formattedResponse = formatAcceptRejectResponse(jsonResponse);
          console.log('formattedResponse', formattedResponse);
          dispatch(setViewingAiTutorVersion(true));
          // When viewing AI Tutor version, store current sources as projectSourceBeforeAiTutorVersion.
          // Workspace will be read-only until user clicks "accept" or "reject".

          // If user clicks "reject", go back to projectSourceBeforeAiTutorVersion.
          // If user clicks "accept":
          // - force save a version for projectSourceBeforeAiTutorVersion. Check with product/design about this. TODO.
          // - force save an AI version for AI tutor version with description 'AI Save'. TODO.
          // - workspace is now editable.
          // - sources are updated with the newor updated AI files, but AI flags removed.
          const aiTutorVersionFiles: ProjectFile[] = [];
          const mergedSourceVersion = getMergedAiTutorCodeWithSource(
            formattedResponse.code,
            source as MultiFileSource,
            aiTutorVersionFiles
          ) as MultiFileSource;
          console.log('mergedSourceVersion', mergedSourceVersion);
          console.log('source', source);
          console.log('aiTutorVersionFiles', aiTutorVersionFiles);
          // If no AI-updated files, return explanation.
          if (aiTutorVersionFiles.length === 0) {
            return formattedResponse.explanation;
          }
          dispatch(setAiTutorVersionFiles(aiTutorVersionFiles));
          dispatch(setProjectSourceBeforeAiTutorVersion(source));
          // Set the preview to first AI-updated html file, if it exists.
          const firstAiUpdatedHtmlFile = aiTutorVersionFiles.find(
            file => file.language === 'html'
          );
          if (firstAiUpdatedHtmlFile) {
            mergedSourceVersion.files[firstAiUpdatedHtmlFile.id] = {
              ...firstAiUpdatedHtmlFile,
              active: true,
            };
            mergedSourceVersion.openFiles = [firstAiUpdatedHtmlFile.id];
            const folderPath = getFolderPath(
              firstAiUpdatedHtmlFile.folderId,
              mergedSourceVersion.folders
            ).substring(1);
            const filePath =
              folderPath === ''
                ? firstAiUpdatedHtmlFile.name
                : folderPath + '/' + firstAiUpdatedHtmlFile.name;
            dispatch(setAiFilePathToPreview(filePath));
          } else {
            const fileToActivate = aiTutorVersionFiles[0];
            mergedSourceVersion.files[fileToActivate.id] = {
              ...fileToActivate,
              active: true,
            };
            mergedSourceVersion.openFiles = [fileToActivate.id];
          }

          dispatch(setSource(mergedSourceVersion));
          return formattedResponse.explanation;
        },
      };
    } else {
      return {
        jsonSchema: copyCodeJsonSchema,
        responseCallback: (response: string) => {
          const jsonResponse = JSON.parse(response);
          console.log('🤖: Tutor response (in jsonSchema callback):', {
            jsonResponse,
          });
          return formatExplanationResponse(jsonResponse.answer);
        },
      };
    }
  }, [aiTutorMode, dispatch, source]);
};

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
  formatCopyPasteResponse,
  getMergedAiTutorCodeWithSource,
} from '../helpers/aiTutorStructuredResponseHelper';
import {setAiFilePathToPreview, setAiTutorVersionFiles} from '../weblab2Redux';

/**
 * Custom hook that provides AI tutor response schema settings based on the current
 * AI tutor mode and experimental flags. Handles the complete flow of processing
 * AI tutor responses including accept/reject functionality.
 */
export const useAiTutorResponseSchemaSettings = (
  source: MultiFileSource | undefined
): ResponseSchemaSettings | undefined => {
  const dispatch = useAppDispatch();

  return useMemo(() => {
    if (
      experiments.isEnabledAllowingQueryString(
        experiments.WEBLAB2_ACCEPT_REJECT
      )
    ) {
      return {
        jsonSchema: acceptRejectJsonSchema,
        responseCallback: (response: string) => {
          const jsonResponse = JSON.parse(response);
          console.log('🤖: AI Tutor response (in jsonSchema callback):', {
            jsonResponse,
          });
          const formattedResponse = formatAcceptRejectResponse(
            jsonResponse.answer
          );
          const answerType = formattedResponse.answerType;
          if (answerType !== 'Build HTML' && answerType !== 'Build CSS') {
            return formatCopyPasteResponse(jsonResponse.answer);
          }
          dispatch(setViewingAiTutorVersion(true));
          // When viewing AI Tutor version, store current sources as projectSourceBeforeAiTutorVersion.
          // Workspace will be read-only until user clicks "accept" or "reject".

          // If user clicks "reject", go back to projectSourceBeforeAiTutorVersion.
          // If user clicks "accept":
          // - force save a version for projectSourceBeforeAiTutorVersion. Check with product/design about this. TODO.
          // - force save an AI version for AI tutor version with description 'AI Save'. TODO.
          // - workspace is now editable.
          // - sources are updated with the newer updated AI files, but AI flags removed.
          const aiTutorVersionFiles: ProjectFile[] = [];
          const mergedSourceVersion = getMergedAiTutorCodeWithSource(
            formattedResponse.code,
            source as MultiFileSource,
            aiTutorVersionFiles
          ) as MultiFileSource;
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
            // Get other AI file ids (excluding firstAiUpdatedHtmlFile).
            const otherAiFileIds = aiTutorVersionFiles
              .filter(file => file.id !== firstAiUpdatedHtmlFile.id)
              .map(file => file.id);

            // Get all AI file ids for deduplication.
            const allAiFileIds = new Set([
              firstAiUpdatedHtmlFile.id,
              ...otherAiFileIds,
            ]);

            // Filter existing openFiles to remove any that will be added from AI files.
            const existingOpenFilesFiltered = (
              mergedSourceVersion.openFiles || []
            ).filter(id => !allAiFileIds.has(id));

            // Update openFiles: AI HTML file first, then other AI files, then existing open files.
            mergedSourceVersion.openFiles = [
              firstAiUpdatedHtmlFile.id,
              ...otherAiFileIds,
              ...existingOpenFilesFiltered,
            ];
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
          return formatCopyPasteResponse(jsonResponse.answer);
        },
      };
    }
  }, [dispatch, source]);
};

import {getFolderPath} from '@codebridge/utils';
import {useMemo} from 'react';

import {ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {
  setProjectSourceBeforeAiTutorVersion,
  setSource,
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  acceptRejectAnswerTypes,
  aiTutorResponseJsonSchema,
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
    return {
      jsonSchema: aiTutorResponseJsonSchema,
      responseCallback: (response: string) => {
        const jsonResponse = JSON.parse(response);
        console.log('🤖: AI Tutor response (in jsonSchema callback):', {
          jsonResponse,
        });
        const formattedResponse = formatAcceptRejectResponse(
          jsonResponse.answer
        );
        const answerType = formattedResponse.answerType;
        if (!acceptRejectAnswerTypes.includes(answerType)) {
          return formatCopyPasteResponse(jsonResponse.answer);
        }
        sendLab2AnalyticsEvent(EVENTS.AI_TUTOR_GENERATED_CODE, {
          answerType,
        });
        dispatch(setViewingAiTutorVersion(true));
        // When viewing AI Tutor version, store current sources as projectSourceBeforeAiTutorVersion.
        // Workspace will be read-only until user clicks "accept" or "reject".

        // If user clicks "reject", go back to projectSourceBeforeAiTutorVersion.
        // If user clicks "accept":
        // - force save a version for projectSourceBeforeAiTutorVersion (if there were any updates since the last saved version).
        // - force save an AI version for AI tutor version with commit message 'AI***SAVE' + required user description.
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
        dispatch(setSource(mergedSourceVersion));

        // Set the preview path to the first AI-updated HTML file, if it exists.
        const firstHtmlFile = aiTutorVersionFiles.find(file => {
          return file.name.endsWith('.html');
        });
        if (firstHtmlFile) {
          const folderPath = getFolderPath(
            firstHtmlFile.folderId,
            mergedSourceVersion.folders
          ).substring(1);
          const filePath =
            folderPath === ''
              ? firstHtmlFile.name
              : folderPath + '/' + firstHtmlFile.name;
          dispatch(
            setAiFilePathToPreview({path: filePath, timestamp: Date.now()})
          );
        }
        return formattedResponse.explanation;
      },
    };
  }, [dispatch, source]);
};

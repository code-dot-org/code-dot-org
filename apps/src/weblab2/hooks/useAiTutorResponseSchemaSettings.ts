import {getFolderPath} from '@codebridge/utils';
import {useCallback, useMemo} from 'react';

import {ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {formatCopyPasteResponse} from '@cdo/apps/aiTutor/helpers/aiTutorResponseHelpers';
import {
  setProjectSourceBeforeAiTutorVersion,
  setSource,
  setViewingAiTutorVersion,
  setAiTutorVersionFiles,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  acceptRejectAnswerTypes,
  AiTutorAcceptRejectResponse,
  aiTutorResponseJsonSchema,
  formatAcceptRejectResponse,
  getMergedAiTutorCodeWithSource,
  isAcceptRejectCodeFileTypes,
} from '../helpers/aiTutorStructuredResponseHelper';
import {setAiFilePathToPreview} from '../weblab2Redux';

const parseAnswer = (response: unknown) =>
  (response as {answer: AiTutorAcceptRejectResponse}).answer;

/**
 * Whether a response is eligible for the accept/reject flow, where the model's
 * code is loaded into the project for the student to keep or discard. Anything
 * else -- prose, unsupported file types, the widget view -- is presented as code
 * to copy by hand.
 *
 * Display and effect must agree on this, or the transcript would explain an
 * accept/reject that never started (or vice versa), so both call this.
 */
const usesAcceptRejectFlow = (
  formatted: ReturnType<typeof formatAcceptRejectResponse>,
  isWidgetView?: boolean
) =>
  !isWidgetView &&
  acceptRejectAnswerTypes.includes(formatted.answerType) &&
  isAcceptRejectCodeFileTypes(formatted.code);

/**
 * Custom hook that provides AI tutor response schema settings based on the current
 * AI tutor mode and experimental flags. Handles the complete flow of processing
 * AI tutor responses including accept/reject functionality.
 */
export const useAiTutorResponseSchemaSettings = (
  source: MultiFileSource | undefined,
  isWidgetView?: boolean
): ResponseSchemaSettings | undefined => {
  const dispatch = useAppDispatch();

  // Deliberately independent of `source`: this runs for every message in the
  // transcript on every render, and `source` changes as the student types.
  const formatForDisplay = useCallback(
    (response: unknown) => {
      const answer = parseAnswer(response);
      const formatted = formatAcceptRejectResponse(answer);
      return usesAcceptRejectFlow(formatted, isWidgetView)
        ? formatted.explanation
        : formatCopyPasteResponse(answer);
    },
    [isWidgetView]
  );

  const onResponse = useCallback(
    (response: unknown) => {
      const answer = parseAnswer(response);
      const formatted = formatAcceptRejectResponse(answer);
      if (!usesAcceptRejectFlow(formatted, isWidgetView)) {
        return;
      }

      sendLab2AnalyticsEvent(EVENTS.AI_TUTOR_GENERATED_CODE, {
        answerType: formatted.answerType,
      });
      const aiTutorVersionFiles: ProjectFile[] = [];
      const mergedSourceVersion = getMergedAiTutorCodeWithSource(
        formatted.code,
        source as MultiFileSource,
        aiTutorVersionFiles
      ) as MultiFileSource;
      // If no AI-updated files, there is nothing to review.
      if (aiTutorVersionFiles.length === 0) {
        return;
      }

      // When viewing AI Tutor version, store current sources as projectSourceBeforeAiTutorVersion.
      // Workspace will be read-only until user clicks "accept" or "reject".

      // If user clicks "reject", go back to projectSourceBeforeAiTutorVersion.
      // If user clicks "accept":
      // - force save a version for projectSourceBeforeAiTutorVersion (if there were any updates since the last saved version).
      // - force save an AI version for AI tutor version with commit message 'AI***SAVE' + required user description.
      // - workspace is now editable.
      // - sources are updated with the newer updated AI files, but AI flags removed.
      dispatch(setViewingAiTutorVersion(true));
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
    },
    [dispatch, source, isWidgetView]
  );

  return useMemo(
    () => ({
      jsonSchema: aiTutorResponseJsonSchema,
      formatForDisplay,
      onResponse,
    }),
    [formatForDisplay, onResponse]
  );
};

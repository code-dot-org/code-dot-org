import {useCallback, useMemo} from 'react';

import {JsonObjectSchema, ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {
  AiTutorAcceptRejectResponse,
  formatAcceptRejectResponse,
  formatCopyPasteResponse,
  getMergedAiTutorCodeWithSource,
} from '@cdo/apps/aiTutor/helpers/aiTutorResponseHelpers';
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

interface AiTutorResponseSchemaSettingsOptions {
  source: MultiFileSource | undefined;
  isWidgetView?: boolean;
  jsonSchema: JsonObjectSchema;
  // Answer types whose code is loaded into the project for review.
  acceptRejectAnswerTypes: string[];
  // File extensions, without the dot, that may be loaded for review.
  acceptRejectFileTypes: string[];
  onAiTutorVersionLoaded?: (
    mergedSource: MultiFileSource,
    aiTutorVersionFiles: ProjectFile[]
  ) => void;
}

const parseAnswer = (response: unknown) =>
  (response as {answer: AiTutorAcceptRejectResponse}).answer;

/**
 * Build answers load the tutor's code into the project for the student to
 * accept or reject. Other answers show their code to copy and paste.
 */
export const useAiTutorResponseSchemaSettings = ({
  source,
  isWidgetView,
  jsonSchema,
  acceptRejectAnswerTypes,
  acceptRejectFileTypes,
  onAiTutorVersionLoaded,
}: AiTutorResponseSchemaSettingsOptions): ResponseSchemaSettings => {
  const dispatch = useAppDispatch();

  const usesAcceptRejectFlow = useCallback(
    (formatted: ReturnType<typeof formatAcceptRejectResponse>) =>
      !isWidgetView &&
      acceptRejectAnswerTypes.includes(formatted.answerType) &&
      formatted.code.every(file => {
        const fileType = file.name.split('.').pop();
        return !fileType || acceptRejectFileTypes.includes(fileType);
      }),
    [isWidgetView, acceptRejectAnswerTypes, acceptRejectFileTypes]
  );

  // Leave `source` out: this runs on every chat message, and `source` changes
  // with each keystroke.
  const formatForDisplay = useCallback(
    (response: unknown) => {
      const answer = parseAnswer(response);
      const formatted = formatAcceptRejectResponse(answer);
      return usesAcceptRejectFlow(formatted)
        ? formatted.explanation
        : formatCopyPasteResponse(answer);
    },
    [usesAcceptRejectFlow]
  );

  const onResponse = useCallback(
    (response: unknown) => {
      const formatted = formatAcceptRejectResponse(parseAnswer(response));
      if (!usesAcceptRejectFlow(formatted)) {
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
      );
      if (aiTutorVersionFiles.length === 0) {
        return;
      }

      // The editor stays read-only until the student accepts or rejects.
      dispatch(setViewingAiTutorVersion(true));
      dispatch(setAiTutorVersionFiles(aiTutorVersionFiles));
      dispatch(setProjectSourceBeforeAiTutorVersion(source));
      dispatch(setSource(mergedSourceVersion));
      onAiTutorVersionLoaded?.(mergedSourceVersion, aiTutorVersionFiles);
    },
    [dispatch, source, usesAcceptRejectFlow, onAiTutorVersionLoaded]
  );

  return useMemo(
    () => ({jsonSchema, formatForDisplay, onResponse}),
    [jsonSchema, formatForDisplay, onResponse]
  );
};

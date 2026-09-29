import {useMemo} from 'react';

import {ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {
  AiTutorCopyPasteResponse,
  formatCopyPasteResponse,
} from '@cdo/apps/aiTutor/helpers/aiTutorResponseHelpers';

import {aiTutorResponseJsonSchema} from '../helpers/aiTutorStructuredResponseHelper';

/**
 * Custom hook that provides AI tutor response schema settings for Python Lab.
 * Python Lab uses copy-paste only (no accept/reject flow), so a response only
 * ever needs formatting -- there is nothing to do when one arrives.
 */
export const useAiTutorResponseSchemaSettings = (): ResponseSchemaSettings => {
  return useMemo(() => {
    return {
      jsonSchema: aiTutorResponseJsonSchema,
      formatForDisplay: (response: unknown) => {
        const jsonResponse = response as {answer: AiTutorCopyPasteResponse};
        return formatCopyPasteResponse(jsonResponse.answer);
      },
    };
  }, []);
};

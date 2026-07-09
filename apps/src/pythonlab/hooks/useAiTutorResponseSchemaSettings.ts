import {useMemo} from 'react';

import {ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {
  AiTutorCopyPasteResponse,
  formatCopyPasteResponse,
} from '@cdo/apps/aiTutor/helpers/aiTutorResponseHelpers';

import {aiTutorResponseJsonSchema} from '../helpers/aiTutorStructuredResponseHelper';

/**
 * Custom hook that provides AI tutor response schema settings for Python Lab.
 * Python Lab uses copy-paste only (no accept/reject flow).
 */
export const useAiTutorResponseSchemaSettings = (): ResponseSchemaSettings => {
  return useMemo(() => {
    return {
      jsonSchema: aiTutorResponseJsonSchema,
      // Only ever invoked with the already-parsed jsonSchema response --
      // submitChatContents parses it once, upstream of this callback.
      jsonSchemaResponseCallback: (response: unknown) => {
        const jsonResponse = response as {answer: AiTutorCopyPasteResponse};
        console.log('🤖: AI Tutor response (in jsonSchema callback):', {
          jsonResponse,
        });
        return formatCopyPasteResponse(jsonResponse.answer);
      },
    };
  }, []);
};

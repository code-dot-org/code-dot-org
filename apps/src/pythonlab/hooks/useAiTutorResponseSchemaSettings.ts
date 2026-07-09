import {useMemo} from 'react';

import {ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {formatCopyPasteResponse} from '@cdo/apps/aiTutor/helpers/aiTutorResponseHelpers';

import {aiTutorResponseJsonSchema} from '../helpers/aiTutorStructuredResponseHelper';

/**
 * Custom hook that provides AI tutor response schema settings for Python Lab.
 * Python Lab uses copy-paste only (no accept/reject flow).
 */
export const useAiTutorResponseSchemaSettings = (): ResponseSchemaSettings => {
  return useMemo(() => {
    return {
      jsonSchema: aiTutorResponseJsonSchema,
      // response is already parsed on the gateway path; the legacy Rails-job
      // path still hands over a raw JSON string that we parse ourselves.
      responseCallback: (response: unknown) => {
        try {
          const jsonResponse =
            typeof response === 'string' ? JSON.parse(response) : response;
          console.log('🤖: AI Tutor response (in jsonSchema callback):', {
            jsonResponse,
          });
          return formatCopyPasteResponse(jsonResponse.answer);
        } catch {
          return typeof response === 'string' ? response : String(response);
        }
      },
    };
  }, []);
};

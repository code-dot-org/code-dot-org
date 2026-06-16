import {useMemo} from 'react';

import {ResponseSchemaSettings} from '@cdo/apps/aichat/types';

import {
  aiTutorResponseJsonSchema,
  formatCopyPasteResponse,
} from '../helpers/aiTutorStructuredResponseHelper';

/**
 * Custom hook that provides AI tutor response schema settings for Python Lab.
 * Python Lab uses copy-paste only (no accept/reject flow).
 */
export const useAiTutorResponseSchemaSettings = (): ResponseSchemaSettings => {
  return useMemo(() => {
    return {
      jsonSchema: aiTutorResponseJsonSchema,
      responseCallback: (response: string) => {
        const jsonResponse = JSON.parse(response);
        console.log('🤖: AI Tutor response (in jsonSchema callback):', {
          jsonResponse,
        });
        return formatCopyPasteResponse(jsonResponse.answer);
      },
    };
  }, []);
};

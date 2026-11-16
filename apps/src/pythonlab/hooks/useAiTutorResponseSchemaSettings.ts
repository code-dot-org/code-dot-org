import {useSharedAiTutorResponseSchemaSettings} from '@cdo/apps/aiTutor/hooks/useSharedAiTutorResponseSchemaSettings';
import {MultiFileSource} from '@cdo/apps/lab2/types';

import {
  acceptRejectAnswerTypes,
  acceptRejectFileTypes,
  aiTutorResponseJsonSchema,
} from '../helpers/aiTutorStructuredResponseHelper';

export const useAiTutorResponseSchemaSettings = (
  source: MultiFileSource | undefined,
  isWidgetView?: boolean
) =>
  useSharedAiTutorResponseSchemaSettings({
    source,
    isWidgetView,
    jsonSchema: aiTutorResponseJsonSchema,
    acceptRejectAnswerTypes,
    acceptRejectFileTypes,
  });

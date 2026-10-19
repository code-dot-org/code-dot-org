import {useEffect} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

// The AI gateway's access-token request demands an AichatContext. Each
// page calls this hook once with whichever scope identifier(s) it has —
// lesson id at the lesson scope, unit (script) id at the unit scope.
// The server admits CURRICULUM_GENERATOR for levelbuilders only,
// regardless of which fields are populated.

export interface AichatContextScope {
  lessonId?: number;
  scriptId?: number;
}

export function useAichatContext({lessonId, scriptId}: AichatContextScope) {
  useEffect(() => {
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.CURRICULUM_GENERATOR,
      currentLevelId: null,
      scriptId: scriptId ?? null,
      channelId: undefined,
      lessonId: lessonId ?? undefined,
    });
  }, [lessonId, scriptId]);
}

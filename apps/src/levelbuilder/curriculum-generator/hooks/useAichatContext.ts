import {useEffect} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

// The AI gateway's access-token request demands an AichatContext; the
// generator pages aren't inside an aichat lab but reuse the same
// generateText path, so they borrow the AI_CHAT_LAB context to pass
// the access check. Each page calls this hook once with whichever
// scope identifier(s) it has — lesson id at the lesson scope, unit
// (script) id at the unit scope. Levelbuilders pass the check
// unconditionally regardless of which fields are populated.

export interface AichatContextScope {
  lessonId?: number;
  scriptId?: number;
}

export function useAichatContext({lessonId, scriptId}: AichatContextScope) {
  useEffect(() => {
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.AI_CHAT_LAB,
      currentLevelId: null,
      scriptId: scriptId ?? null,
      channelId: undefined,
      lessonId: lessonId ?? undefined,
    });
  }, [lessonId, scriptId]);
}

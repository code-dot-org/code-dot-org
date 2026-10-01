import {ValueOf} from '@cdo/apps/types/utils';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiRequestExecutionStatus} from '@cdo/generated-scripts/sharedConstants';

import {
  AichatContext,
  CompletedChatMessage,
  ModelParameters,
  PendingChatMessage,
} from '../../../types';

const ROOT_URL = '/aichat_requests';

export async function createAichatRequest(
  newMessage: PendingChatMessage,
  storedMessages: CompletedChatMessage[],
  modelParameters: ModelParameters,
  aichatContext: AichatContext
): Promise<number> {
  const payload = {
    newMessage,
    storedMessages,
    modelParameters,
    aichatContext,
  };

  const response = await HttpClient.post(
    `${ROOT_URL}`,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  const {requestId} = (await response.json()) as {requestId: number};
  return requestId;
}

/**
 * Reports this turn's outcome onto the AichatRequest row, which analytics
 * exports join against. Dashboard records it as the client's own account: event
 * integrity checks the worker's signature, never these columns.
 */
export async function updateAichatRequest(
  requestId: number,
  status: ValueOf<typeof AiRequestExecutionStatus>,
  response?: string
) {
  await HttpClient.put(
    `${ROOT_URL}/${requestId}`,
    JSON.stringify({execution_status: status, response}),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
}

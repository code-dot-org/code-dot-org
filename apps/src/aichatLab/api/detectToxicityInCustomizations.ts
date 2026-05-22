import HttpClient from '@cdo/apps/util/HttpClient';

import {AiCustomizations, DetectToxicityResponse} from '../types';
import {extractFieldsToCheckForToxicity} from '../utils';

const PATH = '/aichat/find_toxicity';

/**
 * Detects toxicity in the provided AI customizations by invoking the toxicity detection endpoint.
 * Returns a {@link DetectToxicityResponse}.
 */
export async function detectToxicityInCustomizations(
  aiCustomizations: AiCustomizations,
  levelId: number | null
): Promise<DetectToxicityResponse> {
  const response = await HttpClient.post(
    PATH,
    JSON.stringify({
      ...extractFieldsToCheckForToxicity(aiCustomizations),
      levelId,
    }),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  return (await response.json()) as DetectToxicityResponse;
}

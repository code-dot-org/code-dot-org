import {DashboardApiClient, ensureCsrfToken} from '@code-dot-org/core/api';

import {HocPersonalizationResponseSchema} from '@/lib/schemas';
import type {HocPersonalizationResponse} from '@/lib/types';

const {transport} = DashboardApiClient;

/** PATCH /api/hour/certificates/:session_id with write-once semantics. */
export async function personalizeHocCertificate(
  sessionId: string,
  name: string,
): Promise<HocPersonalizationResponse> {
  await ensureCsrfToken(transport);
  const raw = await transport.request<unknown>({
    body: {name},
    method: 'PATCH',
    url: `/api/hour/certificates/${encodeURIComponent(sessionId)}`,
  });

  return HocPersonalizationResponseSchema.parse(raw);
}

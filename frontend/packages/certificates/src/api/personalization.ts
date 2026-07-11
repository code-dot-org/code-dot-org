import {z} from 'zod';

import {DashboardApiClient, ensureCsrfToken} from '@code-dot-org/core/api';

const {transport} = DashboardApiClient;

const HocPersonalizationResponseSchema = z.object({
  certificate_sent: z.boolean().optional(),
  name: z.string().nullish(),
});
type HocPersonalizationResponse = z.infer<
  typeof HocPersonalizationResponseSchema
>;

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

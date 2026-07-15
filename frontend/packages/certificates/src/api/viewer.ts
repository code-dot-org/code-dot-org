import {z} from 'zod';

import {DashboardApiClient} from '@code-dot-org/core/api';

export const ShareTargetSchema = z.enum(['facebook', 'x', 'linkedin']);
export type ShareTarget = z.infer<typeof ShareTargetSchema>;

// API v1 fields are additive during rolling deploys. Zod strips unknown keys.
export const CertificateViewerSchema = z.object({
  allowedShareTargets: z.array(ShareTargetSchema),
  canBulkPrint: z.boolean(),
  certificateName: z.string().nullish(),
});
export type CertificateViewer = z.infer<typeof CertificateViewerSchema>;

const {transport} = DashboardApiClient;

export async function fetchCertificateViewer(): Promise<CertificateViewer> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    url: '/api/v1/certificates/viewer',
  });

  return CertificateViewerSchema.parse(raw);
}

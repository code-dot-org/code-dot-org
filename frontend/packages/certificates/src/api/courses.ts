import {z} from 'zod';

import {DashboardApiClient} from '@code-dot-org/core/api';

// API v1 fields are additive during rolling deploys. Zod strips unknown keys.
export const CertificateCourseSchema = z.object({
  courseKind: z.enum(['hoc', 'pl', 'accelerated', 'other']),
  durationHours: z.number().nullish(),
  localizedTitle: z.string(),
  prefilledTitle: z.boolean(),
  resolution: z.enum(['matched', 'hour_of_code_fallback']),
  templateFilename: z.string(),
  unitGroupTitle: z.string().nullish(),
});

export type CertificateCourse = z.infer<typeof CertificateCourseSchema>;

const {transport} = DashboardApiClient;

export async function fetchCertificateCourse(
  course: string,
  locale: string,
): Promise<CertificateCourse> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    query: {locale},
    url: `/api/v1/certificates/courses/${encodeURIComponent(course)}`,
  });

  return CertificateCourseSchema.parse(raw);
}

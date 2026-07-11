import {z} from 'zod';

import {DashboardApiClient} from '@code-dot-org/core/api';

export const CertificateRecommendationSchema = z.object({
  actionLabel: z.string(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  path: z.string(),
  title: z.string(),
});

export const CertificateCompletionEntrySchema = z.object({
  courseName: z.string(),
  coursePath: z.string(),
});

const completionFields = {
  certificates: z.array(CertificateCompletionEntrySchema),
  recommendations: z.array(CertificateRecommendationSchema),
};

// API v1 fields are additive during rolling deploys. Zod strips unknown keys.
export const CertificateCompletionSchema = z.discriminatedUnion('courseKind', [
  z.object({...completionFields, courseKind: z.literal('hour_of_code')}),
  z.object({
    ...completionFields,
    courseKind: z.literal('professional_learning_k5'),
  }),
  z.object({
    ...completionFields,
    courseKind: z.literal('professional_learning_6_12'),
  }),
  z.object({...completionFields, courseKind: z.literal('other')}),
]);

export type CertificateCompletion = z.infer<typeof CertificateCompletionSchema>;
export type CertificateCompletionEntry = z.infer<
  typeof CertificateCompletionEntrySchema
>;
export type CertificateRecommendation = z.infer<
  typeof CertificateRecommendationSchema
>;

const {transport} = DashboardApiClient;

export async function fetchCertificateCompletion(
  encodedCourse?: string,
): Promise<CertificateCompletion> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    query: {course: encodedCourse},
    url: '/api/v1/certificates/completion',
  });

  return CertificateCompletionSchema.parse(raw);
}

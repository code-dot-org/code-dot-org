import type {z} from 'zod';

import type {
  AssignableCourseSuggestionSchema,
  CertificateCongratsEntrySchema,
  CertificateCongratsResponseSchema,
  CertificateCourseInfoSchema,
  CertificateUserInfoSchema,
  HocPersonalizationResponseSchema,
} from '@/lib/schemas';

export interface CertificateParams {
  course: string;
  donor?: string;
  name?: string;
}

export type CertificateCourseInfo = z.infer<typeof CertificateCourseInfoSchema>;

export type CertificateCongratsEntry = z.infer<
  typeof CertificateCongratsEntrySchema
>;

export type AssignableCourseSuggestion = z.infer<
  typeof AssignableCourseSuggestionSchema
>;

export type CertificateCongratsResponse = z.infer<
  typeof CertificateCongratsResponseSchema
>;

export type CertificateUserInfo = z.infer<typeof CertificateUserInfoSchema>;

export type HocPersonalizationResponse = z.infer<
  typeof HocPersonalizationResponseSchema
>;

import {DashboardApiClient} from '@code-dot-org/core/api';

import {
  CertificateCongratsResponseSchema,
  CertificateCourseInfoSchema,
  CertificateUserInfoSchema,
  HocPersonalizationResponseSchema,
} from './schemas';
import type {
  CertificateCongratsResponse,
  CertificateCourseInfo,
  CertificateUserInfo,
  HocPersonalizationResponse,
} from './types';

const {transport} = DashboardApiClient;

/** GET /api/v1/certificates/course_info/:locale/:course */
export async function fetchCourseInfo(
  locale: string,
  course: string,
): Promise<CertificateCourseInfo> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    url: `/api/v1/certificates/course_info/${encodeURIComponent(
      locale,
    )}/${encodeURIComponent(course)}`,
  });

  return CertificateCourseInfoSchema.parse(raw);
}

/** GET /api/v1/certificates/congrats?s=<base64 course> */
export async function fetchCongrats(
  encodedCourse?: string,
): Promise<CertificateCongratsResponse> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    query: {s: encodedCourse},
    url: '/api/v1/certificates/congrats',
  });

  return CertificateCongratsResponseSchema.parse(raw);
}

/** GET /api/v1/certificates/user_info */
export async function fetchCertificateUserInfo(): Promise<CertificateUserInfo> {
  const raw = await transport.request<unknown>({
    method: 'GET',
    url: '/api/v1/certificates/user_info',
  });

  return CertificateUserInfoSchema.parse(raw);
}

/** PATCH /api/hour/certificates/:session_id — write-once server semantics. */
export async function personalizeHocCertificate(
  sessionId: string,
  name: string,
  csrfToken: string,
): Promise<HocPersonalizationResponse> {
  const raw = await transport.request<unknown>({
    body: {name},
    headers: {'X-CSRF-Token': csrfToken},
    method: 'PATCH',
    url: `/api/hour/certificates/${encodeURIComponent(sessionId)}`,
  });

  return HocPersonalizationResponseSchema.parse(raw);
}

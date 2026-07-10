import {z} from 'zod';

// Response shapes for the certificate JSON APIs. The server contracts live in
// dashboard/app/controllers/api/v1/certificates_controller.rb and
// dashboard/app/serializers/api/v1/congrats_serializer.rb.

export const CertificateCourseInfoSchema = z.object({
  courseType: z.enum(['hoc', 'pl', 'accelerated', 'other']),
  durationHours: z.number().nullish(),
  localizedTitle: z.string(),
  prefilledTitle: z.boolean(),
  templateFilename: z.string(),
  unitGroupTitle: z.string().nullish(),
});

export const CertificateCongratsEntrySchema = z.object({
  courseName: z.string(),
  coursePath: z.string(),
  courseTitle: z.string(),
});

export const AssignableCourseSuggestionSchema = z.object({
  course_version_path: z.string().nullish(),
  description: z.string().nullish(),
  display_name: z.string(),
  image: z.string().nullish(),
  key: z.string().optional(),
});

export const CertificateCongratsResponseSchema = z.object({
  assignableCourseSuggestions: z
    .array(AssignableCourseSuggestionSchema)
    .nullish(),
  certificates: z.array(CertificateCongratsEntrySchema),
  csrfToken: z.string(),
  isHocTutorial: z.boolean(),
  isK5PlCourse: z.boolean().nullish(),
  isPlCourse: z.boolean(),
  nextCourseDescription: z.string().nullish(),
  nextCourseScriptName: z.string().nullish(),
  nextCourseTitle: z.string().nullish(),
  sections: z.array(z.unknown()).nullish(),
  under13: z.boolean(),
  userName: z.string().nullish(),
  userType: z.enum(['teacher', 'student']).nullish(),
});

export const CertificateUserInfoSchema = z.object({
  csrfToken: z.string(),
  under13: z.boolean(),
  userName: z.string().nullish(),
  userType: z.enum(['teacher', 'student']).nullish(),
});

// PATCH /api/hour/certificates/:session_id — write-once HOC personalization
// (dashboard/engines/hoc_legacy). The client only consumes these two fields.
export const HocPersonalizationResponseSchema = z.object({
  certificate_sent: z.boolean().optional(),
  name: z.string().nullish(),
});

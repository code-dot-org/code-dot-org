import {z} from 'zod';

export const AssignmentCourseVersionUnitSchema = z.object({
  id: z.number(),
  name: z.string(),
  path: z.string(),
  lessonExtrasAvailable: z.boolean(),
  position: z.number().optional(),
});

export const AssignmentCourseVersionUnitsSchema = z.record(
  z.string(),
  AssignmentCourseVersionUnitSchema,
);

export const AssignmentCourseVersionSchema = z.object({
  id: z.number(),
  key: z.string(),
  versionYear: z.string(),
  contentRootId: z.number(),
  name: z.string(),
  path: z.string(),
  type: z.string(),
  isStable: z.boolean(),
  isRecommended: z.boolean(),
  localeCodes: z.array(z.string()),
  locales: z.array(z.string()),
  units: AssignmentCourseVersionUnitsSchema,
});

export const AssignmentCourseVersionsSchema = z.record(
  z.string(),
  AssignmentCourseVersionSchema,
);

export const AssignmentCourseOfferingSchema = z.object({
  courseVersions: AssignmentCourseVersionsSchema,
});

export const AssignmentCourseOfferingsSchema = z.array(
  AssignmentCourseOfferingSchema,
);

export const AvailableParticipantTypesSchema = z.object({
  availableParticipantTypes: z.array(z.string()),
});

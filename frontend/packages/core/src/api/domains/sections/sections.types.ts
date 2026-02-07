import {z} from 'zod';

import {
  AssignmentCourseVersionUnitSchema,
  AssignmentCourseVersionUnitsSchema,
  AssignmentCourseVersionSchema,
  AssignmentCourseVersionsSchema,
  AssignmentCourseOfferingSchema,
  AssignmentCourseOfferingsSchema,
  AvailableParticipantTypesSchema,
  SectionSchema,
} from './sections.schemata';

export type AssignmentCourseVersionUnit = z.infer<
  typeof AssignmentCourseVersionUnitSchema
>;
export type AssignmentCourseVersionUnits = z.infer<
  typeof AssignmentCourseVersionUnitsSchema
>;
export type AssignmentCourseVersion = z.infer<
  typeof AssignmentCourseVersionSchema
>;
export type AssignmentCourseVersions = z.infer<
  typeof AssignmentCourseVersionsSchema
>;
export type AssignmentCourseOffering = z.infer<
  typeof AssignmentCourseOfferingSchema
>;
export type AssignmentCourseOfferings = z.infer<
  typeof AssignmentCourseOfferingsSchema
>;
export type AvailableParticipantTypes = z.infer<
  typeof AvailableParticipantTypesSchema
>;
export type Section = z.infer<typeof SectionSchema>;

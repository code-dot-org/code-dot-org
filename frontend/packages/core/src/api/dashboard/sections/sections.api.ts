import {z} from 'zod';

import type {Transport} from '../../transports/types';
import {
  AssignmentCourseOfferingsSchema,
  AvailableParticipantTypesSchema,
  SectionSchema,
  SectionListSummarySchema,
} from './sections.schemata';

export function createSectionsApi(transport: Transport) {
  return {
    /**
     * GET /api/section?section_id=:sectionId
     */
    async getSection(params: {sectionId: number}) {
      const {sectionId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/api/section?section_id=${sectionId}`,
      });

      return SectionSchema.parse(raw);
    },

    /**
     * GET /api/v1/sections — the caller's instructed sections
     * (`summarize_without_students`).
     */
    async listSections() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/sections',
      });

      return z.array(SectionListSummarySchema).parse(raw);
    },

    /**
     * GET /dashboardapi/sections/valid_course_offerings
     */
    async getValidCourseOfferings() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/dashboardapi/sections/valid_course_offerings',
      });

      return AssignmentCourseOfferingsSchema.parse(raw);
    },

    /**
     * GET /dashboardapi/sections/available_participant_types
     */
    async getAvailableParticipantTypes() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/dashboardapi/sections/available_participant_types',
      });

      return AvailableParticipantTypesSchema.parse(raw);
    },
  };
}

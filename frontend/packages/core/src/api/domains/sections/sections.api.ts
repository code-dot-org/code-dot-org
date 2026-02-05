import type {Transport} from '../../transports/types';
import {
  AssignmentCourseOfferingsSchema,
  AvailableParticipantTypesSchema,
} from './sections.schemata';

export function createSectionsApi(transport: Transport) {
  return {
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

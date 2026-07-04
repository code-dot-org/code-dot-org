import type {Transport} from '../../transports/types';
import {
  AssignmentCourseOfferingsSchema,
  AvailableParticipantTypesSchema,
  SectionSchema,
  TeacherDashboardSectionsResponseSchema,
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

    /**
     * GET /api/v1/teacher_dashboard/sections
     */
    async getTeacherDashboardSections() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/teacher_dashboard/sections',
      });

      return TeacherDashboardSectionsResponseSchema.parse(raw);
    },
  };
}

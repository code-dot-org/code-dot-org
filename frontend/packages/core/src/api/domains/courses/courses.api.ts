import type {Transport} from '../../transports/types';
import {LessonSchema, UnitShortSummarySchema} from './courses.schemata';

export function createCoursesApi(transport: Transport) {
  return {
    /**
     * GET /api/v1/courses/:name/units/:unitPosition/short_summary
     */
    async getCourseUnitSummary(params: {name: string; unitPosition: number}) {
      const {name, unitPosition} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/api/v1/courses/${name}/units/${unitPosition}/short_summary`,
      });

      return UnitShortSummarySchema.parse(raw);
    },

    /**
     * GET /api/v1/courses/:name/units/:unitPosition/lessons/:lessonPosition
     */
    async getCourseUnitLesson(params: {
      name: string;
      unitPosition: number;
      lessonPosition: number;
    }) {
      const {name, unitPosition, lessonPosition} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/api/v1/courses/${name}/units/${unitPosition}/lessons/${lessonPosition}`,
      });

      return LessonSchema.parse(raw);
    },
  };
}

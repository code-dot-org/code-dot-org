import type {Transport} from '../../transports/types';
import {LevelPropertiesMapSchema} from '../levels';

export function createLessonsApi(transport: Transport) {
  return {
    /**
     * GET /s/:scriptNameOrId/lessons/:lessonPosition/level_properties
     */
    async getLessonLevelProperties(params: {
      scriptNameOrId: string | number;
      lessonPosition: number;
    }) {
      const {scriptNameOrId, lessonPosition} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/s/${scriptNameOrId}/lessons/${lessonPosition}/level_properties`,
      });

      return LevelPropertiesMapSchema.parse(raw);
    },

    /**
     * GET /lessons/:lessonId/level_properties
     */
    async getLessonLevelPropertiesById(params: {lessonId: number}) {
      const {lessonId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/lessons/${lessonId}/level_properties`,
      });

      return LevelPropertiesMapSchema.parse(raw);
    },
  };
}

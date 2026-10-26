import type {Transport} from '../../transports/types';
import {
  HiddenLessonsResponseSchema,
  LockStatusResponseSchema,
  UserProgressResponseSchema,
} from './progress.schemata';
import type {LockStatusUpdate} from './progress.types';

export function createProgressApi(transport: Transport) {
  return {
    /**
     * GET /api/user_progress/:script
     *
     * `userId` asks for a student's progress as their teacher; the server
     * answers 403 unless the signed-in user is that student or their teacher.
     */
    async getUserProgress(params: {
      scriptName: string;
      userId?: string | number;
    }) {
      const {scriptName, userId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/api/user_progress/${encodeURIComponent(scriptName)}`,
        query: {user_id: userId || undefined},
      });

      return UserProgressResponseSchema.parse(raw);
    },

    /** GET /s/:script/hidden_lessons */
    async getHiddenLessons(params: {scriptName: string}) {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/s/${encodeURIComponent(params.scriptName)}/hidden_lessons`,
      });
      return HiddenLessonsResponseSchema.parse(raw);
    },

    /**
     * POST /s/:script/toggle_hidden
     *
     * Hides or shows a lesson for a section; without a lessonId, the whole
     * unit. The server calls a lesson a stage here.
     */
    async toggleHidden(params: {
      scriptName: string;
      sectionId: number | string;
      lessonId?: number | string;
      hidden: boolean;
    }) {
      const {scriptName, sectionId, lessonId, hidden} = params;
      await transport.request({
        method: 'POST',
        url: `/s/${encodeURIComponent(scriptName)}/toggle_hidden`,
        body: {
          section_id: sectionId,
          hidden,
          ...(lessonId !== undefined && {stage_id: lessonId}),
        },
      });
    },

    /** GET /api/lock_status: every instructed section, not one unit. */
    async getLockStatus() {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/lock_status',
      });
      return LockStatusResponseSchema.parse(raw);
    },

    /** POST /api/lock_status */
    async updateLockStatus(params: {updates: LockStatusUpdate[]}) {
      await transport.request({
        method: 'POST',
        url: '/api/lock_status',
        body: {updates: params.updates},
      });
    },
  };
}

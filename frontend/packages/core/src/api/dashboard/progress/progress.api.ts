import type {Transport} from '../../transports/types';
import {UserProgressResponseSchema} from './progress.schemata';

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
  };
}

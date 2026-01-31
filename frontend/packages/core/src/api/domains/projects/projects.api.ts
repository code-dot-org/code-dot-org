import type {Transport} from '../../transports/types';
import {ProjectChannelForLevelSchema} from './projects.schemata';

export function createProjectsApi(transport: Transport) {
  return {
    /**
     * GET /projects/[script/:scriptId/]level/:levelId[/user/:userId]
     */
    async getChannelForLevel(params: {
      levelId: number;
      scriptId?: number;
      userId?: number;
    }) {
      const {levelId, scriptId, userId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/projects/${scriptId ? `script/${scriptId}` : ''}level/${levelId}${userId ? `/user/${userId}` : ''}`,
      });

      return ProjectChannelForLevelSchema.parse(raw);
    },
  };
}

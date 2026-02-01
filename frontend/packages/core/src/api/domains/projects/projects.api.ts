import type {Transport} from '../../transports/types';
import {
  ExtraLinksProjectDataSchema,
  ProjectChannelForLevelSchema,
} from './projects.schemata';

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

    /**
     * POST /project_commits
     */
    async updateCommit(params: {
      channelId: number;
      versionId: string;
      comment: string;
    }) {
      const {channelId, versionId, comment} = params;

      return transport.request<unknown>({
        method: 'POST',
        url: '/project_commits',
        body: {
          storage_id: channelId,
          version_id: versionId,
          comment: comment,
        },
      });
    },

    /**
     * GET /projects/:channelId/extra_links
     */
    async getExtraLinksData(params: {channelId: string}) {
      const {channelId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/projects/${channelId}/extra_links`,
      });

      return ExtraLinksProjectDataSchema.parse(raw);
    },
  };
}

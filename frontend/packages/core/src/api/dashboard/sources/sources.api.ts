import type {Transport} from '../../transports/types';
import {
  ProjectSourcesSchema,
  ProjectVersionListSchema,
  SourcesRestoreResponseSchema,
  SourcesUpdateResponseSchema,
} from './sources.schemata';
import type {ProjectSourcesAny, SaveSourceOptions} from './sources.types';

/** Default source file name */
export const SOURCE_FILE = 'main.json';

export function createSourcesApi(transport: Transport) {
  return {
    /**
     * GET /v3/sources/:channelId/:sourceFile
     */
    async get(params: {
      channelId: string;
      versionId?: string;
      sourceFile?: string;
    }): Promise<{
      sources: ProjectSourcesAny;
      versionId: string;
    }> {
      const {channelId, versionId, sourceFile = SOURCE_FILE} = params;
      const resp = await transport.requestWithMeta<unknown>({
        method: 'GET',
        url: `/v3/sources/${channelId}/${sourceFile}${versionId ? `?version=${versionId}` : ''}`,
      });

      // Pull out the S3 version id
      const newVersionId =
        versionId || resp.meta.headers['S3-Version-Id'] || 'unknown';

      return {
        sources: ProjectSourcesSchema.parse(resp.data),
        versionId: newVersionId,
      };
    },

    /**
     * GET /v3/sources/:channelId/:sourceFile/versions[?with_comments=true]
     */
    async getVersionList(params: {
      channelId: string;
      sourceFile?: string;
      includeComments?: boolean;
    }) {
      const {
        channelId,
        sourceFile = SOURCE_FILE,
        includeComments = false,
      } = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/v3/sources/${channelId}/${sourceFile}/versions${includeComments ? '?with_comments=true' : ''}`,
      });

      return ProjectVersionListSchema.parse(raw);
    },

    /**
     * PUT /v3/sources/:channelId/:sourceFile[?<options>]
     */
    async update(params: {
      channelId: string;
      sourceFile?: string;
      sources: ProjectSourcesAny;
      options?: SaveSourceOptions;
    }) {
      const {channelId, sourceFile = SOURCE_FILE, sources, options} = params;

      // Validate sources
      const validatedSources = ProjectSourcesSchema.parse(sources);

      const query = options
        ? new URLSearchParams(
            Object.entries(options).reduce<Record<string, string>>(
              (params, [key, value]) => {
                if (value !== undefined) {
                  params[key] = String(value);
                }
                return params;
              },
              {},
            ),
          ).toString()
        : '';

      const raw = await transport.request<unknown>({
        method: 'PUT',
        url: `/v3/sources/${channelId}/${sourceFile}${query ? `?${query}` : ''}`,
        body: validatedSources,
      });

      return SourcesUpdateResponseSchema.parse(raw);
    },

    /**
     * PUT /v3/sources/:channelId/restore?version=:versionId
     */
    async restore(params: {channelId: string; versionId: string}) {
      const {channelId, versionId} = params;

      const raw = await transport.request<unknown>({
        method: 'PUT',
        url: `/v3/sources/${channelId}/restore?version=${versionId}`,
      });

      return SourcesRestoreResponseSchema.parse(raw);
    },
  };
}

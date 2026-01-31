import type {Transport} from '../../transports/types';
import {
  ProjectSourcesSchema,
  ProjectVersionListSchema,
} from './sources.schemata';
import type {ProjectSources, SaveSourceOptions} from './sources.types';

/** Default source file name */
export const SOURCE_FILE = 'main.json';

export function createSourcesApi(transport: Transport) {
  return {
    /**
     * GET /v3/sources/:channelId/:sourceFile
     */
    async get(params: {channelId: string; sourceFile?: string}) {
      const {channelId, sourceFile = SOURCE_FILE} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/v3/sources/${channelId}/${sourceFile}`,
      });

      return ProjectSourcesSchema.parse(raw);
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
     * PUT /v3/sources/:channelId[?<options>]
     */
    async update(params: {
      channelId: string;
      sources: ProjectSources;
      options?: SaveSourceOptions;
    }) {
      const {channelId, sources, options} = params;

      // Validate sources
      const validatedSources = ProjectSourcesSchema.parse(sources);

      const raw = await transport.request<unknown>({
        method: 'PUT',
        url: `/v3/sources/${channelId}${options ? `?${new URLSearchParams(options as Record<string, string>).toString()}` : ''}`,
        body: validatedSources,
      });

      // TODO: validate response
      return raw;
    },
  };
}

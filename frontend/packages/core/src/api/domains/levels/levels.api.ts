import type {Transport} from '../../transports/types';
import {getLevelKindSchema} from './levels.kinds';
import type {LevelPropertiesMap, LevelProperties} from './levels.types';
import {LevelPropertiesMapSchema} from './levels.schemata';

export function createLevelsApi(transport: Transport) {
  return {
    /**
     * GET /levels/:levelId/level_properties
     * GET /projects/:standaloneProjectType/level_properties
     * GET /s/:scriptName/lessons/:lessonPosition/level_properties
     */
    async getLevelProperties(params: {
      levelId?: number;
      standaloneProjectType?: string;
      scriptName?: string;
      lessonPosition?: number;
    }): Promise<LevelPropertiesMap> {
      const {levelId, standaloneProjectType, scriptName, lessonPosition} =
        params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: standaloneProjectType
          ? `/projects/${standaloneProjectType}/level_properties`
          : scriptName && lessonPosition
            ? `/s/${scriptName}/lessons/${lessonPosition}/level_properties`
            : levelId
              ? `/levels/${levelId}/level_properties`
              : '',
      });

      // Transform 'true'/'false' into actual boolean values
      Object.values(raw as LevelPropertiesMap).forEach(base => {
        const simple = base as unknown as Record<string, string | boolean>;
        Object.entries(simple).forEach(([key, value]) => {
          if (value === 'true') {
            simple[key] = true;
          } else if (value === 'false') {
            simple[key] = false;
          }
        });
      });

      // 1) validate base (and discover kind)
      const map = LevelPropertiesMapSchema.parse(raw);

      Object.entries(raw as LevelPropertiesMap).forEach(([key, base]) => {
        // 2) validate extension if registered
        const extSchema = getLevelKindSchema(base.appName);
        if (extSchema) {
          // If the app kind is registered, it is validated as well
          // 3) parse extension and merge
          const ext = extSchema.parse(base) as unknown as LevelProperties;

          // Merge (prefer extension fields if overlap)
          map[key] = {...map[key], ...ext};
        }
      });

      return map;
    },
  };
}

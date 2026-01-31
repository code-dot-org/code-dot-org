import type {Transport} from '../../transports/types';
import {getLevelKindSchema} from './levels.kinds';
import {LevelPropertiesBaseSchema} from './levels.schemata';
import type {LevelProperties} from './levels.types';

export function createLevelsApi(transport: Transport) {
  return {
    /**
     * GET /levels/:id/level_properties
     */
    async getLevelProperties<
      T extends Record<string, unknown> = Record<string, unknown>,
    >({id}: {id: number}): Promise<LevelProperties<T>> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/levels/${id}/level_properties`,
      });

      // 1) validate base (and discover kind)
      const base = LevelPropertiesBaseSchema.parse(raw);

      // 2) validate extension if registered
      const extSchema = getLevelKindSchema(base.appName);
      if (!extSchema) {
        // If the app kind is not registered, it is not validated past the base
        // properties.
        return base as LevelProperties<T>;
      }

      // 3) parse extension and merge
      const ext = extSchema.parse(raw) as T;

      // Merge (prefer extension fields if overlap)
      return {...base, ...ext};
    },
  };
}

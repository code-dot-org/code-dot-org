import type {KyInstance} from 'ky';
import type {LevelPropertiesRequest, LevelPropertiesResponse} from './types';

export * from './types';

export default {
  /** GET /levels/:levelId/level_properties */
  getLevelProperties:
    (http: KyInstance) =>
    ({levelId}: LevelPropertiesRequest) => {
      return http
        .get(`levels/${levelId}/level_properties`)
        .json<LevelPropertiesResponse>();
    },
};

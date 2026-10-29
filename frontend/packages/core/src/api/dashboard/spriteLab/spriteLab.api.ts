// Sprite Lab's cross-project scene endpoints; see SpriteLab2Controller. The
// server answers only within a script, for a Sprite Lab level.

import type {Transport} from '../../transports/types';
import {
  ExternalScenesResponseSchema,
  SectionScenesResponseSchema,
} from './spriteLab.schemata';

export function createSpriteLabApi(transport: Transport) {
  return {
    /**
     * GET /sprite_lab2/section_scenes
     *
     * The scenes in section-mates' projects for this level, excluding the
     * caller's own.
     */
    async getSectionScenes(params: {
      levelId: number | string;
      scriptId: number | string;
    }) {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/sprite_lab2/section_scenes',
        query: {level_id: params.levelId, script_id: params.scriptId},
      });
      return SectionScenesResponseSchema.parse(raw).scenes;
    },

    /**
     * GET /sprite_lab2/external_scenes
     *
     * One section-mate's project for this level: its scenes, animations and
     * owner's name.
     */
    async getExternalScenes(params: {
      channel: string;
      levelId: number | string;
      scriptId?: number | string | null;
    }) {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/sprite_lab2/external_scenes',
        query: {
          channel: params.channel,
          level_id: params.levelId,
          script_id: params.scriptId ?? '',
        },
      });
      return ExternalScenesResponseSchema.parse(raw);
    },
  };
}

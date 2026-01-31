import type {Transport} from '../../transports/types';
import {
  AbuseScoreSchema,
  ChannelSchema,
  IsTeacherOfProjectOwnerSchema,
  SharingDisabledSchema,
} from './channels.schemata';
import type {Channel} from './channels.types';

export function createChannelsApi(transport: Transport) {
  return {
    /**
     * GET /v3/channels/:channelId
     */
    async get(params: {channelId: string}) {
      const {channelId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/v3/channels/${channelId}`,
      });

      return ChannelSchema.parse(raw);
    },

    /**
     * POST /v3/channels/:channel.id
     */
    async update(params: {channel: Channel}) {
      const {channel} = params;

      const validatedChannel = ChannelSchema.parse(channel);

      const raw = await transport.request<unknown>({
        method: 'POST',
        url: `/v3/channels/${channel.id}`,
        body: validatedChannel,
      });

      // TODO: validate response
      return raw;
    },

    /**
     * POST /v3/channels/:channel.id/publish/:channel.projectType
     */
    async publish(params: {channel: Channel}) {
      const {channel} = params;

      const raw = await transport.request<unknown>({
        method: 'POST',
        url: `/v3/channels/${channel.id}/publish/${channel.projectType}`,
      });

      // TODO: validate response
      return raw;
    },

    /**
     * POST /v3/channels/:channel.id/unpublish
     */
    async unpublish(params: {channel: Channel}) {
      const {channel} = params;

      const raw = await transport.request<unknown>({
        method: 'POST',
        url: `/v3/channels/${channel.id}/unpublish`,
      });

      // TODO: validate response
      return raw;
    },

    /**
     * GET /v3/channels/:channelId/abuse
     */
    async fetchAbuseScore(params: {channelId: string}) {
      const {channelId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/v3/channels/${channelId}/abuse`,
      });

      return AbuseScoreSchema.parse(raw).abuse_score;
    },

    /**
     * GET /v3/channels/:channelId/sharing_disabled
     */
    async fetchSharingDisabled(params: {channelId: string}) {
      const {channelId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/v3/channels/${channelId}/sharing_disabled`,
      });

      return SharingDisabledSchema.parse(raw).sharing_disabled;
    },

    /**
     * GET /v3/channels/:channelId/is_teacher_of_project_owner
     */
    async fetchIsTeacherOfProjectOwner(params: {channelId: string}) {
      const {channelId} = params;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/v3/channels/${channelId}/is_teacher_of_project_owner`,
      });

      return IsTeacherOfProjectOwnerSchema.parse(raw)
        .is_teacher_of_project_owner;
    },
  };
}

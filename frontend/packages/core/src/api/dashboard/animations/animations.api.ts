// A project's animations: the images Sprite Lab and Game Lab keep under
// /v3/animations, one PNG per image key. Reading one goes through the media
// API with the URL the project saved; this module holds the writes.

import type {Transport} from '../../transports/types';

/** The path an animation is stored at. Slashes in the key are kept. */
export function animationUrl(channelId: string, key: string): string {
  const path = encodeURIComponent(key).replace(/%2F/g, '/');
  return `/v3/animations/${channelId}/${path}.png`;
}

export function createAnimationsApi(transport: Transport) {
  return {
    /** DELETE /v3/animations/:channelId/:key.png. */
    async remove(params: {channelId: string; key: string}): Promise<void> {
      await transport.request<unknown>({
        method: 'DELETE',
        url: animationUrl(params.channelId, params.key),
      });
    },
  };
}

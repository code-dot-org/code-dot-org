// The assets API — uploads and deletes a project's binary files (images, audio),
// which the source model references by URL (`ProjectFile.url`) rather than
// inlining. Mirrors the code.org Assets API the legacy Codebridge uploader used
// (`/v3/assets/:channelId/:filename`). The upload body is `FormData` so the
// transport (which JSON-encodes plain bodies) carries the bytes intact; the demo
// serves it from an MSW mock, production from the real backend.

import type {Transport} from '../../transports/types';

/** The path an asset is stored at and referenced by. */
export function assetUrl(channelId: string, filename: string): string {
  return `/v3/assets/${channelId}/${filename}`;
}

export function createAssetsApi(transport: Transport) {
  return {
    /**
     * PUT /v3/assets/:channelId/:filename — store `data` and return its URL.
     * The caller supplies a unique `filename` (e.g. `<uuid>.png`).
     */
    async upload(params: {
      channelId: string;
      filename: string;
      data: Blob;
    }): Promise<{url: string}> {
      const {channelId, filename, data} = params;
      const body = new FormData();
      body.append('file', data, filename);
      const url = assetUrl(channelId, filename);
      await transport.request<unknown>({method: 'PUT', url, body});
      return {url};
    },

    /** DELETE /v3/assets/:channelId/:filename. */
    async remove(params: {channelId: string; filename: string}): Promise<void> {
      const {channelId, filename} = params;
      await transport.request<unknown>({
        method: 'DELETE',
        url: assetUrl(channelId, filename),
      });
    },
  };
}

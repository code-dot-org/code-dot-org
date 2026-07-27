import {http, HttpResponse} from 'msw';

import {readResource, writeResource, clearResource} from './scenarioStore';

// In-memory asset store for the standalone demo (no real assets backend). An
// uploaded file is base64-encoded into the scenario store keyed by its path, and
// served back on GET — enough for the editor's `<img>` and, later, World Lab's
// forwarding of the bytes into the preview sandbox.

const key = (channelId: string, filename: string) =>
  `asset:${channelId}:${filename}`;

interface StoredAsset {
  base64: string;
  contentType: string;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const assetsHandlers = [
  // PUT /v3/assets/:channelId/:filename — store the uploaded file.
  http.put('*/v3/assets/:channelId/:filename', async ({params, request}) => {
    const {channelId, filename} = params as {
      channelId: string;
      filename: string;
    };
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return new HttpResponse('missing file', {status: 400});
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    writeResource<StoredAsset>(key(channelId, filename), {
      base64: toBase64(bytes),
      contentType: file.type || 'application/octet-stream',
    });
    return HttpResponse.json({filename}, {status: 200});
  }),

  // GET /v3/assets/:channelId/:filename — serve a stored asset's bytes.
  http.get('*/v3/assets/:channelId/:filename', ({params}) => {
    const {channelId, filename} = params as {
      channelId: string;
      filename: string;
    };
    const stored = readResource<StoredAsset>(key(channelId, filename));
    if (!stored) {
      return new HttpResponse('not found', {status: 404});
    }
    const bytes = fromBase64(stored.base64);
    return new HttpResponse(bytes, {
      status: 200,
      headers: {'Content-Type': stored.contentType},
    });
  }),

  // DELETE /v3/assets/:channelId/:filename.
  http.delete('*/v3/assets/:channelId/:filename', ({params}) => {
    const {channelId, filename} = params as {
      channelId: string;
      filename: string;
    };
    clearResource(key(channelId, filename));
    return new HttpResponse(null, {status: 204});
  }),
];

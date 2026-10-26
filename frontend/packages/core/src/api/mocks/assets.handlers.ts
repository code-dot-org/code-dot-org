import {http, HttpResponse} from 'msw';

import {clearAsset, readAsset, writeAsset} from './assetStore';

// Asset store for the standalone demo (no real assets backend). An uploaded
// file is kept as a Blob and served back on GET — enough for the editor's
// `<img>` and for World Lab's forwarding of the bytes into the preview
// sandbox.
//
// IN INDEXEDDB rather than beside the other mock state, which is a size
// question and nothing else (`assetStore`): the scenario store is
// `sessionStorage`, whose whole budget for an origin is about five megabytes,
// and a picture a model drew is a megabyte and a half on its own.

const key = (channelId: string, filename: string) =>
  `asset:${channelId}:${filename}`;

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
    await writeAsset(key(channelId, filename), {
      // The Blob itself, not base64 of it: a browser stores one natively, and
      // the encoding was costing a third of the size for nothing.
      blob: file,
      contentType: file.type || 'application/octet-stream',
    });
    return HttpResponse.json({filename}, {status: 200});
  }),

  // GET /v3/assets/:channelId/:filename — serve a stored asset's bytes.
  http.get('*/v3/assets/:channelId/:filename', async ({params}) => {
    const {channelId, filename} = params as {
      channelId: string;
      filename: string;
    };
    const stored = await readAsset(key(channelId, filename));
    if (!stored) {
      return new HttpResponse('not found', {status: 404});
    }
    return new HttpResponse(stored.blob, {
      status: 200,
      headers: {'Content-Type': stored.contentType},
    });
  }),

  // DELETE /v3/assets/:channelId/:filename.
  http.delete('*/v3/assets/:channelId/:filename', async ({params}) => {
    const {channelId, filename} = params as {
      channelId: string;
      filename: string;
    };
    await clearAsset(key(channelId, filename));
    return new HttpResponse(null, {status: 204});
  }),
];

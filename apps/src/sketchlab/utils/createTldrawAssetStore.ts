import {TLAsset, TLAssetStore} from 'tldraw';

import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import HttpClient from '@cdo/apps/util/HttpClient';

const MIME_TO_EXT: Record<string, string> = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
  'image/jfif': 'jfif',
  'application/octet-stream': 'bin',
};

// TODO: also handle deleting images.
export function createTldrawAssetStore(
  channelId: string,
  levelName: string
): TLAssetStore {
  return {
    async upload(asset: TLAsset, file: File) {
      console.log({asset, file});
      const extension =
        MIME_TO_EXT[file.type] ?? file.name.split('.').pop() ?? 'bin';
      // asset.id is prefixed with "asset:", e.g. "asset:some-uuid"
      const assetId = asset.id.replace(/^asset:/, '');
      const filenameWithExtension = `${assetId}.${extension}`;

      const isStarterAssetOrExemplar = !!(
        getIsStartMode() || getAppOptionsEditingExemplar()
      );

      if (isStarterAssetOrExemplar) {
        const uploadUrl = `/level_starter_assets/${encodeURIComponent(
          levelName
        )}/uuid/${filenameWithExtension}`;
        const bodyData = new FormData();
        bodyData.append('files[]', file);
        await HttpClient.post(uploadUrl, bodyData, true);
        return {src: uploadUrl};
      } else {
        const uploadUrl = `/v3/assets/${channelId}/${filenameWithExtension}`;
        await HttpClient.put(uploadUrl, file);
        console.log(`Uploaded asset to ${uploadUrl}`);
        return {src: uploadUrl};
      }
    },

    resolve(asset: TLAsset) {
      return asset.props.src ?? null;
    },
  };
}

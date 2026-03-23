import {TLAsset, TLAssetId, TLAssetStore, TLStoreSnapshot} from 'tldraw';

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

export function createTldrawAssetStore(
  channelId: string,
  levelName: string,
  initialSnapshot?: TLStoreSnapshot
): TLAssetStore {
  // Maps assetId -> uploaded src URL so remove() can find the right URL without
  // needing access to the editor. Pre-populated from the snapshot so assets
  // uploaded in previous sessions are covered.
  const srcByAssetId = new Map<TLAssetId, string>();
  if (initialSnapshot) {
    for (const record of Object.values(initialSnapshot.store)) {
      const r = record as {
        typeName?: string;
        id?: TLAssetId;
        props?: {src?: string};
      };
      if (r.typeName === 'asset' && r.id && r.props?.src) {
        srcByAssetId.set(r.id, r.props.src);
      }
    }
  }

  return {
    async upload(asset: TLAsset, file: File) {
      const extension =
        MIME_TO_EXT[file.type] ?? file.name.split('.').pop() ?? 'bin';
      const filename = `${asset.id.replace(/^asset:/, '')}.${extension}`;

      const isStarterAssetOrExemplar = !!(
        getIsStartMode() || getAppOptionsEditingExemplar()
      );

      if (isStarterAssetOrExemplar) {
        const uploadUrl = `/level_starter_assets/${encodeURIComponent(
          levelName
        )}/uuid/${filename}`;
        const bodyData = new FormData();
        bodyData.append('files[]', file);
        await HttpClient.post(uploadUrl, bodyData, true);
        srcByAssetId.set(asset.id, uploadUrl);
        return {src: uploadUrl};
      } else {
        const uploadUrl = `/v3/assets/${channelId}/${filename}`;
        await HttpClient.put(uploadUrl, file);
        srcByAssetId.set(asset.id, uploadUrl);
        return {src: uploadUrl};
      }
    },

    resolve(asset: TLAsset) {
      return asset.props.src ?? null;
    },

    // TODO: this may never be called. Images aren't deleted immediately when a user removes them from the
    // editor, so tldraw can do 'undo'. How can we ensure we clean up old assets effectively?
    async remove(assetIds: TLAssetId[]) {
      for (const assetId of assetIds) {
        const src = srcByAssetId.get(assetId);
        // Only delete student-owned assets (/v3/assets/...). Level starter
        // assets (/level_starter_assets/...) are shared and must not be deleted.
        if (src?.startsWith('/v3/assets/')) {
          await HttpClient.delete(src, true);
          srcByAssetId.delete(assetId);
        }
      }
    },
  };
}

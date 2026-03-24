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

  // Maps assetId -> blob URL for assets whose upload is still in-flight.
  // resolve() returns the blob URL so the image renders immediately without
  // waiting for the server-side PUT to complete. Blob URLs live for the page
  // session and are freed automatically on unload, so no explicit revocation
  // is needed. This is relevant when converting from Excalidraw,
  // which can require multiple uploads and can result in a delay before the new URLs work.
  const blobUrlByAssetId = new Map<TLAssetId, string>();
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
    console.log({srcByAssetId});
  }

  return {
    upload(asset: TLAsset, file: File) {
      const extension =
        MIME_TO_EXT[file.type] ?? file.name.split('.').pop() ?? 'bin';
      const filename = `${asset.id.replace(/^asset:/, '')}.${extension}`;

      const isStarterAssetOrExemplar = !!(
        getIsStartMode() || getAppOptionsEditingExemplar()
      );

      // Compute the final URL immediately so we can return it to tldraw right
      // away. Tldraw will update the asset's src in the store synchronously,
      // meaning the next snapshot save will already include the correct URL
      // even if the user navigates away before the upload finishes.
      const uploadUrl = isStarterAssetOrExemplar
        ? `/level_starter_assets/${encodeURIComponent(
            levelName
          )}/uuid/${filename}`
        : `/v3/assets/${channelId}/${filename}`;

      srcByAssetId.set(asset.id, uploadUrl);

      // Create a blob URL so resolve() can return something immediately while
      // the upload is in-flight.
      blobUrlByAssetId.set(asset.id, URL.createObjectURL(file));

      // Fire the upload in the background without awaiting it. The browser
      // will keep the in-flight request alive even if the component unmounts.
      if (isStarterAssetOrExemplar) {
        const bodyData = new FormData();
        bodyData.append('files[]', file);
        HttpClient.post(uploadUrl, bodyData, true).catch(err => {
          console.error('Error uploading starter asset:', err);
        });
      } else {
        HttpClient.put(uploadUrl, file).catch(err => {
          console.error('Error uploading asset:', err);
        });
      }

      return Promise.resolve({src: uploadUrl});
    },

    resolve(asset: TLAsset) {
      // Return the blob URL while the upload is still in-flight so the image
      // renders immediately without waiting for the server PUT to complete.
      // Falls back to the stored server URL once the blob URL is no longer
      // available (e.g. after a page refresh).
      return (
        blobUrlByAssetId.get(asset.id as TLAssetId) ?? asset.props.src ?? null
      );
    },

    // TODO: this may never be called. Images aren't deleted immediately when a user removes them from the
    // editor, so tldraw can do 'undo'. How can we ensure we clean up old assets effectively?
    async remove(assetIds: TLAssetId[]) {
      console.log('Removing assets with IDs:', assetIds);
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

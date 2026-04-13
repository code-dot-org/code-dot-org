import {type FilePart} from 'ai';
import {
  extension as mimeToExtension,
  lookup as extensionToMime,
} from 'mime-types';

import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

/**
 * Converts a media type (MIME type) to a file extension.
 *
 * @param mediaType - The MIME type string, e.g. "image/png"
 * @param accepts - The set of media types this call site expects. If mediaType
 *   is not in this list, an error is thrown.
 */
function convertMediaTypeToExtension(
  mediaType: string,
  accepts: string[]
): string {
  if (!accepts.includes(mediaType)) {
    throw new Error(
      `Unsupported media type: "${mediaType}". Expected one of: ${accepts.join(
        ', '
      )}`
    );
  }
  const extension = mimeToExtension(mediaType);
  if (!extension) {
    throw new Error(
      `No file extension mapping found for media type: "${mediaType}"`
    );
  }
  return extension;
}

/**
 * Converts a ChatAsset to a FilePart by downloading the asset binary data.
 */
export async function assetToFilePart(
  asset: ChatAsset,
  buildAssetUrl: (asset: ChatAsset) => string
): Promise<FilePart> {
  const assetUrl = buildAssetUrl(asset);
  const response = await fetch(assetUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const extension = asset.filename.toLowerCase().split('.').pop() || '';

  const mediaType =
    response.headers.get('content-type') ||
    extensionToMime(extension) ||
    'application/octet-stream';

  return {
    type: 'file',
    data: base64,
    filename: asset.filename,
    mediaType,
  };
}

/**
 * Uploads a browser File to the user's project and returns a ChatAsset.
 */
export async function generatedFileToAsset(
  file: File,
  buildAssetUrl: (asset: ChatAsset) => string,
  accepts: string[]
): Promise<ChatAsset> {
  const extension = convertMediaTypeToExtension(file.type, accepts);
  const filename = `generated-file-${createUuid()}.${extension}`;
  const asset: ChatAsset = {
    filename,
    source: AssetSource.PROJECT,
  };
  const assetUrl = buildAssetUrl(asset);
  const fileBuffer = new Uint8Array(await file.arrayBuffer());

  await HttpClient.put(assetUrl, fileBuffer, true, {
    'Content-Type': file.type,
  });

  return asset;
}

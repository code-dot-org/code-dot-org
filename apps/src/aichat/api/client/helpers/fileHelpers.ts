import {type FilePart, type GeneratedFile} from 'ai';

import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types';
import HttpClient from '@cdo/apps/util/HttpClient';

const extensionMap: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  // PDF
  pdf: 'application/pdf',
};

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
    extensionMap[extension] ||
    'application/octet-stream';

  return {
    type: 'file',
    data: base64,
    filename: asset.filename,
    mediaType,
  };
}

/**
 * Converts a model generated file to a ChatAsset by uploading the file's contents to the user's project.
 */
export async function generatedFileToAsset(
  file: GeneratedFile,
  buildAssetUrl: (asset: ChatAsset) => string
): Promise<ChatAsset> {
  const extension = file.mediaType.split('/')[1];
  const filename = `generated-file-${Date.now()}.${extension}`;
  const asset: ChatAsset = {
    filename,
    source: AssetSource.PROJECT,
  };
  const assetUrl = buildAssetUrl(asset);

  // Upload file contents to assetUrl
  const arrayBuffer = file.uint8Array.buffer.slice(
    file.uint8Array.byteOffset,
    file.uint8Array.byteOffset + file.uint8Array.byteLength
  ) as ArrayBuffer;
  await HttpClient.put(assetUrl, arrayBuffer, true, {
    'Content-Type': file.mediaType,
  });

  return asset;
}

import {type FilePart, type GeneratedFile} from 'ai';

import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';

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
  const {filename, fileBuffer} = prepareGeneratedFile(file);
  const asset: ChatAsset = {
    filename,
    source: AssetSource.PROJECT,
  };
  const assetUrl = buildAssetUrl(asset);

  // Upload file contents to assetUrl
  await HttpClient.put(assetUrl, fileBuffer, true, {
    'Content-Type': file.mediaType,
  });

  return asset;
}

interface PreparedFile {
  filename: string;
  fileBuffer: Uint8Array<ArrayBuffer>;
  mediaType: string;
  extension: string;
}

/**
 * Extracts the buffer and derives filename/extension from a model-generated file.
 */
export function prepareGeneratedFile(file: GeneratedFile): PreparedFile {
  const fileBuffer = file.uint8Array.slice();
  const extension = file.mediaType.split('/')[1];
  const filename = `generated-file-${createUuid()}.${extension}`;
  return {filename, fileBuffer, mediaType: file.mediaType, extension};
}

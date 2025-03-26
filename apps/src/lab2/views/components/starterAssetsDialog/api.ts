import HttpClient from '@cdo/apps/util/HttpClient';

import {AssetData} from './types';

interface StarterAssetsResponse {
  starter_assets: AssetData[];
}

const BASE_PATH = '/level_starter_assets';

function getPath(levelName: string) {
  return `${BASE_PATH}/${levelName}`;
}

export async function fetchLevelAssets(
  levelName: string,
  abortSignal?: AbortSignal
) {
  const {value} = await HttpClient.fetchJson<StarterAssetsResponse>(
    getPath(levelName),
    {signal: abortSignal}
  );
  return value.starter_assets;
}

export async function uploadFile(file: File, levelName: string) {
  const bodyData = new FormData();
  bodyData.append('files[]', file);

  const response = await HttpClient.post(getPath(levelName), bodyData, true);
  return (await response.json()) as AssetData;
}

export async function deleteFile(filename: string, levelName: string) {
  return HttpClient.delete(getFileUrl(filename, levelName));
}

export function getFileUrl(filename: string, levelName: string) {
  return `${getPath(levelName)}/${filename}`;
}

import HttpClient from '@cdo/apps/util/HttpClient';

export async function uploadBase64ToUrl(
  dataUrl: string,
  uploadUrl: string,
  mimeType: string
): Promise<Response> {
  const localResponse = await fetch(dataUrl);
  const blob = await localResponse.blob();
  const file = new File([blob], 'file', {
    type: mimeType,
  });

  return await HttpClient.put(uploadUrl, file);
}

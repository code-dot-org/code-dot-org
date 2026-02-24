/**
 * API for managing files via the code.org dashboard, which saves to S3.
 */

import HttpClient from '@cdo/apps/util/HttpClient';

const rootUrl = (channelId: string) => `/v3/files/${channelId}/`;

export function getProjectThumbnailUrl(channelId: string) {
  return `${rootUrl(channelId)}.metadata/thumbnail.png`;
}

export async function updateProjectThumbnail(
  channelId: string,
  file: Blob
): Promise<Response> {
  const url = `${rootUrl(channelId)}.metadata/thumbnail.png`;
  return HttpClient.put(
    url,
    file,
    true, // useAuthenticityToken
    {
      'Content-Type': 'image/png',
    }
  );
}

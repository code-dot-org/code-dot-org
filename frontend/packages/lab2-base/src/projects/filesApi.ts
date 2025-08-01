/**
 * API for managing files via the code.org dashboard, which saves to S3.
 */

import {retrieveToken} from '@code-dot-org/user';

const rootUrl = (channelId: string) => `/v3/files/${channelId}/`;

export function getProjectThumbnailUrl(channelId: string) {
  return `${rootUrl(channelId)}.metadata/thumbnail.png`;
}

export async function updateProjectThumbnail(
  channelId: string,
  file: Blob
): Promise<Response> {
  const url = `${rootUrl(channelId)}.metadata/thumbnail.png`;
  return fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': 'image/png',
      'X-CSRF-TOKEN': await retrieveToken(),
    },
  });
}

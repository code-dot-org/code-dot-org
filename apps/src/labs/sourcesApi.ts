import {Source, SourceUpdateOptions} from './types';
import {SOURCE_FILE} from './constants';
const {stringifyQueryParams} = require('@cdo/apps/utils');

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(channelId: string): Promise<Response> {
  return fetch(rootUrl(channelId));
}

// TODO: do we need contentType header?
export async function update(
  channelId: string,
  source: Source,
  options?: SourceUpdateOptions
): Promise<Response> {
  const url = rootUrl(channelId) + stringifyQueryParams(options);
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(source)
  });
}

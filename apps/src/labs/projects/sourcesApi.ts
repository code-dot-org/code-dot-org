/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import {Source, SourceUpdateOptions} from '../types';
import {SOURCE_FILE} from '../constants';
const {stringifyQueryParams} = require('@cdo/apps/utils');

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(channelId: string): Promise<Response> {
  return fetch(rootUrl(channelId));
}

export async function update(
  channelId: string,
  source: Source,
  options?: SourceUpdateOptions
): Promise<Response> {
  const url = rootUrl(channelId) + stringifyQueryParams(options);
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify({source: JSON.stringify(source)}),
  });
}

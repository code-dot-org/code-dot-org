/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import {ProjectSources, SourceUpdateOptions} from '../types';
import {SOURCE_FILE} from '../constants';
import HttpClient, {GetResponse} from '@cdo/apps/util/HttpClient';
import {SourceResponseValidator} from '../responseValidators';
import {stringifyQueryParams} from '@cdo/apps/utils';

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(
  channelId: string
): Promise<GetResponse<ProjectSources>> {
  return HttpClient.fetchJson<ProjectSources>(
    rootUrl(channelId),
    {},
    SourceResponseValidator
  );
}

export async function update(
  channelId: string,
  sources: ProjectSources,
  options?: SourceUpdateOptions
): Promise<Response> {
  const url = rootUrl(channelId) + stringifyQueryParams(options as object);
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(sources),
  });
}

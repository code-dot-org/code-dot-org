/**
 * API for loading and saving sources via the code.org dashboard, which saves to S3.
 * A source is the code of a project.
 */

import {ProjectSources, SourceUpdateOptions} from '../types';
import {SOURCE_FILE} from '../constants';
import HttpClient, {GetResponse} from '@cdo/apps/util/HttpClient';
import Lab2Registry from '../Lab2Registry';
import {DefaultSourceResponseValidator} from '../responseValidators';
const {stringifyQueryParams} = require('@cdo/apps/utils');

const rootUrl = (channelId: string) =>
  `/v3/sources/${channelId}/${SOURCE_FILE}`;

export async function get(
  channelId: string
): Promise<GetResponse<ProjectSources>> {
  const sourceValidator =
    Lab2Registry.getInstance().getSourceResponseValidator() ||
    DefaultSourceResponseValidator;
  return HttpClient.fetchJson<ProjectSources>(
    rootUrl(channelId),
    {},
    sourceValidator
  );
}

export async function update(
  channelId: string,
  sources: ProjectSources,
  options?: SourceUpdateOptions
): Promise<Response> {
  const url = rootUrl(channelId) + stringifyQueryParams(options);
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(sources),
  });
}

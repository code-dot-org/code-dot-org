import HttpClient from '@cdo/apps/util/HttpClient';

import {PartialUserAppOptions} from '../types';

const userAppOptionsRequests = new Map<
  string,
  Promise<PartialUserAppOptions>
>();

export default function fetchUserAppOptions(
  userAppOptionsUrl: string
): Promise<PartialUserAppOptions> {
  const existingRequest = userAppOptionsRequests.get(userAppOptionsUrl);
  if (existingRequest) {
    return existingRequest;
  }

  const request = HttpClient.fetchJson<PartialUserAppOptions>(
    userAppOptionsUrl,
    undefined,
    response => response as unknown as PartialUserAppOptions
  )
    .then(({value}) => value)
    .catch(error => {
      userAppOptionsRequests.delete(userAppOptionsUrl);
      throw error;
    });

  userAppOptionsRequests.set(userAppOptionsUrl, request);
  return request;
}

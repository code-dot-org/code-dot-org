import {useQuery, type UseQueryOptions} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {SchoolZipSearchResults} from './schools.types';
import {schoolsKeys} from './schools.keys';

// The Rails route constrains :zip to 5 digits, so a shorter one would 404.
const ZIP = /^\d{5}$/;

export function useSchoolZipSearch(
  api: ApiClient,
  zip: string,
  options?: Omit<
    UseQueryOptions<SchoolZipSearchResults>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: schoolsKeys.zipSearch(zip),
    queryFn: () => api.schools.zipSearch({zip}),
    enabled: ZIP.test(zip),
    ...options,
  });
}

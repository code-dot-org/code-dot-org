import type {Transport} from '../../transports/types';
import {SchoolZipSearchResultsSchema} from './schools.schemata';
import type {SchoolZipSearchResults} from './schools.types';

// The Rails action renders the school list only for an XHR.
const XHR_REQUESTED_WITH = {'X-Requested-With': 'XMLHttpRequest'} as const;

export function createSchoolsApi(transport: Transport) {
  return {
    /** GET /dashboardapi/v1/schoolzipsearch/:zip — the route requires 5 digits. */
    async zipSearch(params: {zip: string}): Promise<SchoolZipSearchResults> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/dashboardapi/v1/schoolzipsearch/${params.zip}`,
        headers: XHR_REQUESTED_WITH,
      });

      return SchoolZipSearchResultsSchema.parse(raw);
    },
  };
}

import {z} from 'zod';

import {SchoolZipSearchResultsSchema} from './schools.schemata';

export type SchoolZipSearchResults = z.infer<
  typeof SchoolZipSearchResultsSchema
>;

export type SchoolZipSearchResult = SchoolZipSearchResults[number];

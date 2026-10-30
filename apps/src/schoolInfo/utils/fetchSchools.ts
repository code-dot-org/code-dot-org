import {SCHOOL_ZIP_SEARCH_URL} from '@cdo/apps/signUpFlow/signUpFlowConstants';

export async function fetchSchools(
  zip: string
): Promise<{nces_id: number; name: string}[]> {
  const searchUrl = `${SCHOOL_ZIP_SEARCH_URL}${zip}`;
  const response = await fetch(searchUrl, {
    headers: {'X-Requested-With': 'XMLHttpRequest'},
  });
  if (!response.ok) {
    throw new Error('Zip code search for schools failed');
  }
  const data = await response.json();
  return data;
}

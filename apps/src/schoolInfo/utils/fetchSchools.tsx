import {SCHOOL_ZIP_SEARCH_URL} from '../constants';

export async function fetchSchools(
  zip: string,
  callback: (data: {nces_id: number; name: string}[]) => void
) {
  console.log('FETCHING SCHOOLLSSS!!!!!!');
  try {
    const searchUrl = `${SCHOOL_ZIP_SEARCH_URL}${zip}`;
    const response = await fetch(searchUrl, {
      headers: {'X-Requested-With': 'XMLHttpRequest'},
    });
    if (!response.ok) {
      return;
    }
    const data = await response.json();

    callback(data);
  } catch (error) {
    console.log('There was a problem with the fetch operation:', error);
  }
}

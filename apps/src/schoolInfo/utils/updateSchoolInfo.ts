import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {buildSchoolData} from './buildSchoolData';

export async function updateSchoolInfo({
  formUrl,
  authTokenName,
  authTokenValue,
  schoolId,
  country,
  schoolName,
  schoolZip,
}: {
  formUrl: string;
  authTokenName: string;
  authTokenValue: string;
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
}) {
  console.log('IN UPDATE SCHOOL INFO');
  const schoolData = buildSchoolData({
    schoolId,
    country,
    schoolName,
    schoolZip,
  });
  if (!schoolData) {
    return;
  }
  const response = await fetch(formUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
    body: JSON.stringify({
      _method: 'patch',
      [authTokenName]: authTokenValue,
      ...schoolData,
    }),
  });

  if (!response.ok) {
    throw new Error('School info update failed');
  }
}

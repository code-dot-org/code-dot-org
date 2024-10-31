import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {buildSchoolData} from './buildSchoolData';

export async function updateSchoolInfo({
  schoolId,
  country,
  schoolName,
  schoolZip,
}: {
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
}) {
  const schoolData = buildSchoolData({
    schoolId,
    country,
    schoolName,
    schoolZip,
  });
  if (!schoolData) {
    return;
  }
  const response = await fetch('/api/v1/user_school_infos', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
    body: JSON.stringify(schoolData),
  });

  if (!response.ok) {
    throw new Error('School info update failed');
  }
}

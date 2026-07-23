import HttpClient from '@cdo/apps/util/HttpClient';

interface DemoSectionStalenessResponse {
  message?: string;
}

// Some onboarding flows require the demo section to have certain settings
// (e.g. a specific curriculum assigned). Resolves true when the given section
// has drifted from those requirements and the teacher should be prompted to
// fix it, false when the section is up to date, absent, or the check could not
// be run.
const confirmDemoSectionSettings = (
  demoSectionId: number | null | undefined,
): Promise<boolean> => {
  if (!demoSectionId) {
    return Promise.resolve(false);
  }

  // An up-to-date section responds with a 204; a stale one responds with a
  // 200 carrying a {message} body.
  return HttpClient.get(
    `/api/v1/sections/demo/check_staleness?id=${demoSectionId}`,
  )
    .then(response => {
      if (response.status === 204) {
        return false;
      }

      return response
        .json()
        .then((data: DemoSectionStalenessResponse) => !!data.message);
    })
    .catch(error => {
      console.error('Error checking demo section staleness:', error);
      return false;
    });
};

export default confirmDemoSectionSettings;

import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

const docsCache: Map<string, Promise<string>> = new Map();

// Fetch serialized JSON docs from programmingClassesController to use in tutor's context
export const fetchDocsForClass = async (programmingClassKey: string) => {
  if (docsCache.has(programmingClassKey)) {
    return await docsCache.get(programmingClassKey);
  }
  docsCache.set(
    programmingClassKey,
    new Promise((resolve, reject) => {
      (async () => {
        try {
          const response = await fetch(
            `/docs/ide/pythonlab/classes/${programmingClassKey}/get_serialized`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': await getAuthenticityToken(), // do I need this?
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const classDocs = JSON.stringify(await response.json());

          resolve(classDocs);
        } catch (error) {
          console.error(
            `🤖: error getting docs for ${programmingClassKey}: `,
            error
          );
          MetricsReporter.logError({
            event: MetricEvent.AI_TUTOR_FETCH_DOCS_FOR_CLASS_FAIL,
            errorMessage: JSON.stringify(error),
          });
          reject(error);
        }
      })();
    })
  );

  return await docsCache.get(programmingClassKey);
};

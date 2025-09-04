import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

const docsCache: Map<string, Promise<string>> = new Map();

// Fetch serialized JSON docs from programmingClassesController to use in tutor's context
export const fetchDocsForClass = async (programmingClassKey: string) => {
  console.log(`🤖: fetchDocsForClass called with ${programmingClassKey}`);
  if (docsCache.has(programmingClassKey)) {
    console.log(`🤖: fetchDocsForClass cache hit for ${programmingClassKey}`);
    console.log(
      `🤖: fetchDocsForClass awaited docsCache.get(programmingClassKey)`,
      await docsCache.get(programmingClassKey)
    );
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

          console.log(
            `🤖: fetchDocsForClass about to resolve the class docs promise`,
            classDocs
          );
          resolve(classDocs);
        } catch (error) {
          console.log(
            `🤖: fetchDocsForClass catching an error!!!!!!! : `,
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
  console.log(`🤖: fetchDocsForClass about to return the await`);
  return await docsCache.get(programmingClassKey);
};

import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';

const docsCache: Map<string, Promise<string>> = new Map();

// Fetch serialized JSON docs from programmingClassesController to use in tutor's context
export const tryFetchDocsForClass = async (programmingClassKey: string) => {
  if (docsCache.has(programmingClassKey)) {
    return await docsCache.get(programmingClassKey);
  }
  docsCache.set(
    programmingClassKey,
    new Promise(resolve => {
      (async () => {
        try {
          const url = `/docs/ide/pythonlab/classes/${programmingClassKey}/get_serialized`;
          const response = await HttpClient.get(url);
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
          resolve('');
        }
      })();
    })
  );

  return await docsCache.get(programmingClassKey);
};

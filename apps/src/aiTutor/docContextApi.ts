import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

// Fetch serialized JSON docs from programmingClassesController to use in tutor's context
export const fetchDocsForClass = async (programmingClassKey: string) => {
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
    const classDocs = await response.json();
    return classDocs;
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_FETCH_DOCS_FOR_CLASS_FAIL,
      errorMessage: JSON.stringify(error),
    });
    throw error;
  }
};

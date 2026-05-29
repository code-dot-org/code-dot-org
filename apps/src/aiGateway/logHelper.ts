import {NetworkError} from '@cdo/apps/util/HttpClient';
/**
 * Resolves the most descriptive representation of an error for logging.
 * If it's a NetworkError, it attempts to safely extract the response body.
 */
export const getErrorLogData = async (error: unknown) => {
  if (error instanceof NetworkError && error.response) {
    try {
      // Clone to avoid disturbing the original stream.
      const bodyText = await error.response.clone().text();
      let parsedBody;
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText; // Fallback to raw text if not JSON.
      }

      return {
        type: 'NetworkError',
        status: error.response.status,
        url: error.response.url,
        body: parsedBody,
        error, // Included for stack trace.
      };
    } catch (e) {
      return {type: 'NetworkError (Unreadable Body)', error};
    }
  }
  // Default return for standard Errors.
  return {type: 'GenericError', error};
};

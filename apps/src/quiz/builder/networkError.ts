import {isNetworkError} from '@cdo/apps/util/HttpClient';

// Quiz builder endpoints report a handled failure as {error: "..."} with a
// 4xx. Pull that string out, or fall back to a generic message when the
// failure carried no usable body.
export async function networkErrorMessage(error: unknown): Promise<string> {
  if (isNetworkError(error)) {
    try {
      const data = await error.response.json();
      if (typeof data.error === 'string' && data.error) {
        return data.error;
      }
    } catch {
      // Response body was not JSON.
    }
  }
  return 'Something went wrong.';
}

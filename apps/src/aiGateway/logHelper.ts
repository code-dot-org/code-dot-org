import * as Observability from '@code-dot-org/core/plugins/observability';

import {NetworkError} from '@cdo/apps/util/HttpClient';

export type GatewayErrorCategory =
  | 'jwt_missing'
  | 'jwt_expired'
  | 'jwt_invalid'
  | 'turnstile_failed'
  | 'turnstile_timeout'
  | 'rate_limit_local'
  | 'provider_429'
  | 'provider_5xx'
  | 'provider_timeout'
  | 'validation_error'
  | 'unhandled';

// Status-to-category mapping per docs/observability/error-taxonomy.md.
// Imprecise until Phase 2 C2 adds structured error bodies to gateway responses.
export const inferGatewayErrorCategory = (
  status: number
): GatewayErrorCategory => {
  if (status === 401) return 'jwt_invalid';
  if (status === 429) return 'rate_limit_local';
  if (status === 504) return 'provider_timeout';
  if (status >= 500) return 'provider_5xx';
  if (status >= 400) return 'validation_error';
  return 'unhandled';
};

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

export const reportGatewayError = async (
  error: unknown,
  source = 'ai-gateway'
): Promise<void> => {
  const logData = await getErrorLogData(error);
  console.error(`[${source}] fetch error:`, logData);

  const hasStatus = 'status' in logData && typeof logData.status === 'number';
  Observability.recordError(error, {
    error_type: logData.type,
    ...(hasStatus
      ? {
          status_code: (logData as {status: number}).status,
          category: inferGatewayErrorCategory(
            (logData as {status: number}).status
          ),
        }
      : {category: 'unhandled' as GatewayErrorCategory}),
  });
};

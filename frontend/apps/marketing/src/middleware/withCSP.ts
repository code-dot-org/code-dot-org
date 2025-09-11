import {NextFetchEvent, NextRequest} from 'next/server';

import {getStage} from '@/config/stage';
import {getCSPHeader} from '@/middleware/csp';

import {MiddlewareFactory} from './types';

/**
 * This middleware adds a Content-Security-Policy header to all responses.
 * The CSP is determined based on the current stage (development, staging, production).
 */

export const withCSP: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const stage = getStage();
    const response = await next(request, event);

    response.headers.set('Content-Security-Policy', getCSPHeader(stage));

    return response;
  };
};

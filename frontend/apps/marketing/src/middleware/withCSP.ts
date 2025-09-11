import {NextFetchEvent, NextRequest} from 'next/server';

import {getStage} from '@/config/stage';
import {getCSPHeader} from '@/middleware/csp';

import {MiddlewareFactory} from './types';

/**
 * This middleware detects the brand via the hostname of the request and injects it into the top level [brand]
 * param to enable multi-tenancy in this application.
 *
 * See: https://github.com/vercel/platforms
 *
 * This effectively routes requests as such:
 *
 * localhost.code.org:3001/en-US/home -> /localhost.code.org:3001/en-US/home
 */

export const withCSP: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const stage = getStage();
    const response = await next(request, event);

    response.headers.set('Content-Security-Policy', getCSPHeader(stage));

    return response;
  };
};

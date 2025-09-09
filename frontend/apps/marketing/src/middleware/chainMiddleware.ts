import {NextRequest, NextResponse} from 'next/server';

import {
  ChainableMiddleware,
  MiddlewareFactory as MiddlewareFactory,
} from './types';

/**
 * Helper to compose multiple MiddlewareFactory instances together.
 *
 * We restrict the type of middleware to ChainableMiddleware, which is a strict
 * subset of the full NextMiddleware type.  Specifically, we require middleware
 * layers to return Promise<NextResponse>, as opposed to a few other return
 * types that NextMiddleware allows in general.  This restriction allows
 * middleware layers that want to set response cookies to do so using the
 * NextResponse cookies api: each layer reliably receives a NextResponse from
 * the next layer in the chain, and can add cookies to it before passing it on
 * down.
 *
 * Important: layers must construct NextResponses (specifically the .next() and
 * .rewrite() variants) by passing in the (possibly mutated) request object.
 * Then any headers/cookies that have been set on the request object (including
 * by earlier layers) will be properly passed on to the Next.js request
 * handlers: page components, server actions and route handlers.
 */
export function chainMiddleware(
  functions: MiddlewareFactory[] = [],
  index = 0,
): ChainableMiddleware {
  const current = functions[index];
  if (current) {
    const next = chainMiddleware(functions, index + 1);
    return current(next);
  }

  return async (request: NextRequest) => NextResponse.next({request});
}

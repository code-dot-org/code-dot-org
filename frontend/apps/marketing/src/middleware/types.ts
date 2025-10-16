import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

export type ChainableMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
) => Promise<NextResponse>;

export type MiddlewareFactory = (
  middleware: ChainableMiddleware,
) => ChainableMiddleware;

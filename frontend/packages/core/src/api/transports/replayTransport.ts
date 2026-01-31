import {ApiError, type Transport, type RequestOptions} from './types';
import {toReplayKey} from './url';
import {idbGet, idbPut} from './simpleIdb';

export type ReplayMode = 'replay' | 'record' | 'auto';

export type ReplayTransportOptions = {
  mode: ReplayMode;
  namespace?: string; // separate recordings by app/lab/env
  backingTransport: Transport; // typically httpTransport
  /** If true, only record successful (2xx) responses */
  recordOnlySuccess?: boolean;
};

type Recording = {
  key: string;
  createdAt: number;
  request: RequestOptions;
  response: unknown;
  // optionally store status/headers if you care later
};

export function createReplayTransport(opts: ReplayTransportOptions): Transport {
  const {
    mode,
    namespace = 'default',
    backingTransport,
    recordOnlySuccess = true,
  } = opts;

  return {
    async request<TResponse>(req: RequestOptions): Promise<TResponse> {
      const key = `${namespace}:${toReplayKey(req)}`;

      if (mode === 'replay') {
        const rec = await idbGet<Recording>(key);
        if (!rec) {
          throw new ApiError(
            `No replay recording for ${key}`,
            404,
            req.url,
            req.method,
          );
        }
        return rec.response as TResponse;
      }

      if (mode === 'auto') {
        const rec = await idbGet<Recording>(key);
        if (rec) return rec.response as TResponse;
        // fallthrough to record
      }

      // record mode or auto-miss: hit backing transport
      try {
        const response = await backingTransport.request<TResponse>(req);

        // record it
        await idbPut<Recording>(key, {
          key,
          createdAt: Date.now(),
          request: req,
          response,
        });

        return response;
      } catch (e) {
        if (!recordOnlySuccess) {
          await idbPut<Recording>(key, {
            key,
            createdAt: Date.now(),
            request: req,
            response: {__error: serializeError(e)},
          });
        }
        throw e;
      }
    },
  };
}

function serializeError(e: unknown): unknown {
  if (e instanceof Error) {
    return {name: e.name, message: e.message, stack: e.stack};
  }
  return e;
}

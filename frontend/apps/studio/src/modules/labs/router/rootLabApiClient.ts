import {
  createApiClient,
  type ApiClient,
  type ApiResponse,
  type RequestOptions,
  type Transport,
} from '@code-dot-org/core/api';

/**
 * Root-level api client wrapper. The prototype studio runs without a live
 * Rails backend, so `GET /levels/:id/level_properties` would hit a 404 or
 * return an incomplete shape that fails Zod validation (the source of the
 * "ZodError: exemplarSources undefined" page error). This wrapper inspects
 * the browser URL — if it's a `/app/projects/<labType>/<channelId>/edit`
 * route — and stubs the level_properties response with the minimum valid
 * shape for that lab.
 *
 * The guided-lesson stages still wrap their own `<ApiClientProvider>` for
 * per-step config (specific maze grids, datasci datasets, etc.); this is the
 * safety net for direct lab access.
 */

const STUB_APP_OPTIONS_BASE = {
  channel: null,
  publicCaching: null,
  displayTheme: null,
  isSignedIn: false,
} as const;

function pathOf(url: string): string {
  const noQuery = url.split('?')[0];
  return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
}

/** Detect which lab the current URL is for, and the level id it carries. */
function readLabFromUrl(): {labType: string; channelId: string} | undefined {
  const m = window.location.pathname.match(
    /^\/app\/projects\/([^/]+)\/([^/]+)\/edit$/,
  );
  if (!m) return undefined;
  return {labType: m[1], channelId: m[2]};
}

/** Minimal level_properties for the base Zod schema to accept. */
function buildLevelPropertiesFor(labType: string, levelId: number) {
  const appName = labTypeToAppName(labType);
  const base: Record<string, unknown> = {
    id: levelId,
    appName,
    exemplarSources: null,
    offerBrowserTts: null,
  };
  if (appName === 'maze') {
    Object.assign(base, {
      skin: 'birds',
      authoredHints: '[]',
      solutionBlocks: '<xml/>',
      maze: JSON.stringify([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 1, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ]),
      startDirection: '1',
      startBlocks:
        '<xml><block type="when_run" deletable="false" movable="false"/></xml>',
      toolboxBlocks:
        '<xml><block type="maze_moveForward"/>' +
        '<block type="maze_turn"><title name="DIR">turnLeft</title></block>' +
        '<block type="maze_turn"><title name="DIR">turnRight</title></block></xml>',
    });
  }
  if (appName === 'music') {
    Object.assign(base, {
      usesProjects: true,
      levelData: {},
    });
  }
  return {[levelId]: base};
}

function labTypeToAppName(labType: string): string {
  // URL slug → schema appName. Most match, except slugs that use a hyphen but
  // the schema appName uses an underscore.
  if (labType === 'standalone-video') return 'standalone_video';
  if (labType === 'ai-trainer') return 'ai_trainer';
  return labType;
}

/**
 * Build a fallback stub transport. It only intercepts the level_properties
 * + app_options endpoints when the current URL is a known lab edit page;
 * everything else passes through to the real http transport.
 */
function makeRootStubTransport(realTransport: Transport): Transport {
  const stubFor = (req: RequestOptions): unknown | undefined => {
    if (req.url.startsWith('http')) return undefined;

    const labCtx = readLabFromUrl();
    if (!labCtx) return undefined;
    const numericChannel = parseInt(labCtx.channelId);
    if (!Number.isFinite(numericChannel)) return undefined;

    const path = pathOf(req.url);

    if (req.method === 'GET') {
      if (/^\/levels\/\d+\/level_properties$/.test(path)) {
        return buildLevelPropertiesFor(labCtx.labType, numericChannel);
      }
      if (
        path === `/projects/${labTypeToAppName(labCtx.labType)}/level_properties`
      ) {
        return buildLevelPropertiesFor(labCtx.labType, numericChannel);
      }
      if (/^\/levels\/\d+\/app_options$/.test(path)) {
        return {
          ...STUB_APP_OPTIONS_BASE,
          levelId: numericChannel,
        };
      }
    }

    return undefined;
  };

  return {
    async request<T>(req: RequestOptions): Promise<T> {
      const stub = stubFor(req);
      if (stub !== undefined) return stub as T;
      return realTransport.request<T>(req);
    },
    async requestWithMeta<T>(
      req: RequestOptions,
      blob?: boolean,
    ): Promise<ApiResponse<T>> {
      const stub = stubFor(req);
      if (stub !== undefined) {
        return {
          data: stub as T,
          meta: {status: 200, url: req.url, headers: {}},
        };
      }
      return realTransport.requestWithMeta<T>(req, blob);
    },
    async requestBlob(req: RequestOptions): Promise<Blob> {
      return realTransport.requestBlob(req);
    },
  };
}

export function createRootStubApiClient(realApi: ApiClient): ApiClient {
  return createApiClient(makeRootStubTransport(realApi.transport));
}

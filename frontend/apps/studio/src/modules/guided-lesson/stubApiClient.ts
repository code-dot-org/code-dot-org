import {
  createApiClient,
  type ApiClient,
  type ApiResponse,
  type RequestOptions,
  type Transport,
} from '@code-dot-org/core/api';

/**
 * Stubbed Dashboard API for the hackathon prototype. Lets the Music Lab and
 * Maze Lab mount inside the guided lesson without a running dashboard.
 *
 * `createStubbedLabApiClient(realApi, options)` returns a fresh ApiClient
 * whose transport intercepts dashboard endpoints and returns canned data.
 * Lab-specific payload (e.g. the maze grid, start blocks, toolbox) comes
 * from `options.levelProperties`, so each lab step in the lesson can pin
 * its own content.
 *
 * Music takes the `usesProjects: true` path so the channel + sources flow
 * runs and the `LevelLoadCompleted` lifecycle fires with real `initialSources`
 * (avoiding a lab-base crash when sources are undefined). Maze uses
 * `BlocklyLab` and pulls level_properties via levelId from the URL, so for
 * maze we answer both `/projects/maze/level_properties` (standalone) and
 * `/levels/:id/level_properties` (per-level).
 *
 * Absolute URLs (curriculum.code.org sound assets) pass through to the real
 * http transport so music playback still works.
 */

export type LabKind = 'music' | 'maze' | 'datasci' | 'ai_trainer';

export interface StubbedLabOptions {
  kind: LabKind;
  /**
   * Numeric levelId used in the level_properties map key. Each maze step
   * uses a distinct id so React Query caches the configs separately.
   */
  levelId: number;
  /** Per-level fields merged into the base stub. */
  levelProperties?: Record<string, unknown>;
}

const STUB_CHANNEL_ID = 'stub-music-channel';
const NOW_ISO = '2026-01-01T00:00:00Z';

const STUB_APP_OPTIONS_BASE = {
  channel: null,
  publicCaching: null,
  displayTheme: null,
  isSignedIn: false,
} as const;

const STUB_CHANNEL_FOR_LEVEL = {
  channel: STUB_CHANNEL_ID,
};

const STUB_CHANNEL = {
  id: STUB_CHANNEL_ID,
  name: 'Music Lab (prototype)',
  isOwner: true,
  projectType: 'music',
  publishedAt: null,
  createdAt: NOW_ISO,
  updatedAt: NOW_ISO,
  frozen: null,
};

/**
 * Sentinel `source` value that JSON.parses to `null`. Makes
 * `currentSources?.source` falsy in MusicLab so it falls through to its own
 * `DefaultStartBlocks` (the "when run" block) instead of anything we provide.
 */
const STUB_EMPTY_SOURCES = {source: 'null'};

function buildMusicLevelProperties(
  levelId: number,
  extra: Record<string, unknown>,
) {
  return {
    [levelId]: {
      id: levelId,
      appName: 'music',
      longInstructions:
        'Drag a block from the toolbox into the workspace, then press Run.',
      exemplarSources: null,
      offerBrowserTts: null,
      usesProjects: true,
      levelData: {},
      ...extra,
    },
  };
}

function buildMazeLevelProperties(
  levelId: number,
  extra: Record<string, unknown>,
) {
  // The `maze` schema requires raw string fields for maze, startBlocks,
  // solutionBlocks, startDirection, toolboxBlocks, authoredHints, and skin.
  // It transforms them via DOMParser + JSON.parse at parse time.
  return {
    [levelId]: {
      id: levelId,
      appName: 'maze',
      exemplarSources: null,
      offerBrowserTts: null,
      skin: 'birds',
      authoredHints: '[]',
      solutionBlocks: '<xml/>',
      ...extra,
    },
  };
}

function buildDatasciLevelProperties(
  levelId: number,
  extra: Record<string, unknown>,
) {
  // Datasci's schema is loose — only optional `startBlocks` and `toolboxBlocks`
  // strings — so this stays minimal. Base schema requires id, appName, plus
  // nullable `exemplarSources` and `offerBrowserTts`.
  return {
    [levelId]: {
      id: levelId,
      appName: 'datasci',
      exemplarSources: null,
      offerBrowserTts: null,
      ...extra,
    },
  };
}

function buildAiTrainerLevelProperties(
  levelId: number,
  extra: Record<string, unknown>,
) {
  // Same loose shape as datasci — only optional startBlocks/toolboxBlocks.
  return {
    [levelId]: {
      id: levelId,
      appName: 'ai_trainer',
      exemplarSources: null,
      offerBrowserTts: null,
      ...extra,
    },
  };
}

function pathOf(url: string): string {
  const noQuery = url.split('?')[0];
  return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
}

function buildStubFor(options: StubbedLabOptions) {
  const levelProperties =
    options.kind === 'music'
      ? buildMusicLevelProperties(options.levelId, options.levelProperties ?? {})
      : options.kind === 'datasci'
        ? buildDatasciLevelProperties(
            options.levelId,
            options.levelProperties ?? {},
          )
        : options.kind === 'ai_trainer'
          ? buildAiTrainerLevelProperties(
              options.levelId,
              options.levelProperties ?? {},
            )
          : buildMazeLevelProperties(
              options.levelId,
              options.levelProperties ?? {},
            );

  const appOptions = {
    ...STUB_APP_OPTIONS_BASE,
    levelId: options.levelId,
  };

  return function stubFor(req: RequestOptions): unknown | undefined {
    // Absolute URLs (e.g. curriculum.code.org for music assets) — never stubbed.
    if (req.url.startsWith('http')) return undefined;

    const path = pathOf(req.url);

    if (req.method === 'GET') {
      // Standalone level_properties (music takes this path).
      if (path === `/projects/${options.kind}/level_properties`) {
        console.info('[stubApiClient]', options.kind, 'serving', path);
        return levelProperties;
      }
      // Per-level level_properties (maze takes this path — the App pulls
      // channelId from the URL, parses it to levelId, and queries here).
      if (/^\/levels\/\d+\/level_properties$/.test(path)) {
        console.info('[stubApiClient]', options.kind, 'serving', path);
        return levelProperties;
      }
      if (/^\/levels\/\d+\/app_options$/.test(path)) {
        return appOptions;
      }
      // The lab base's ProjectManager fetches version history on init even
      // for read-only flows; if we hand back `{}`, zod blows up with
      // "expected array". Return an empty list so the comment-state init
      // succeeds with nothing to show.
      if (/\/v3\/sources\/[^/]+\/[^/]+\/versions(\?|$)/.test(path)) {
        return [];
      }

      // Music's channel + sources flow.
      if (options.kind === 'music') {
        if (/^\/projects\/(script\/\d+\/)?level\/\d+(\/user\/\d+)?$/.test(path)) {
          return STUB_CHANNEL_FOR_LEVEL;
        }
        if (path === `/v3/channels/${STUB_CHANNEL_ID}`) return STUB_CHANNEL;
        if (path === `/v3/channels/${STUB_CHANNEL_ID}/abuse`) {
          return {abuse_score: 0};
        }
        if (path === `/v3/channels/${STUB_CHANNEL_ID}/sharing_disabled`) {
          return {sharing_disabled: false};
        }
        if (
          path === `/v3/channels/${STUB_CHANNEL_ID}/is_teacher_of_project_owner`
        ) {
          return {is_teacher_of_project_owner: false};
        }
        if (path.startsWith(`/v3/sources/${STUB_CHANNEL_ID}`)) {
          return STUB_EMPTY_SOURCES;
        }
      }
    }

    // Writes silently no-op so the lab thinks its saves succeeded.
    if (req.method !== 'GET') {
      return {timestamp: NOW_ISO, versionId: 'stub-version'};
    }

    console.warn(
      '[stubApiClient] unhandled dashboard request — returning {}:',
      req.method,
      path,
    );
    return {};
  };
}

function makeStubTransport(
  realTransport: Transport,
  stubFor: ReturnType<typeof buildStubFor>,
): Transport {
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

export function createStubbedLabApiClient(
  realApi: ApiClient,
  options: StubbedLabOptions,
): ApiClient {
  const stubFor = buildStubFor(options);
  return createApiClient(makeStubTransport(realApi.transport, stubFor));
}

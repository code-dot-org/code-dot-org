// Channels handlers — stub. Follow-up PR will implement `GET /v3/channels/:id`,
// publish/unpublish, abuse score, sharing flags, etc., reading from the
// active fixture's `channel` and persisting writes via `scenarioStore`.

import type {RequestHandler} from 'msw';

export const channelsHandlers: RequestHandler[] = [];

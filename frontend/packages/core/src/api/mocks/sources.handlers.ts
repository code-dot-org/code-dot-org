// Sources handlers — stub. Follow-up PR will implement `GET/PUT
// /v3/sources/:channelId/:sourceFile` and the version-list/restore endpoints,
// reading from the active fixture's `sources` and persisting PUTs via
// `scenarioStore` (sessionStorage write-through).

import type {RequestHandler} from 'msw';

export const sourcesHandlers: RequestHandler[] = [];

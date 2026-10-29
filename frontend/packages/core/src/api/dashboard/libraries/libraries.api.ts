// Shared helper libraries: JavaScript that levels name in their
// helperLibraries and that labs run before a student's program.

import {z} from 'zod';

import type {Transport} from '../../transports/types';

export function createLibrariesApi(transport: Transport) {
  return {
    /** GET /libraries/:name: the library's source, as plain text. */
    async getSource(params: {name: string}): Promise<string> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: `/libraries/${encodeURIComponent(params.name)}`,
      });
      return z.string().parse(raw);
    },
  };
}

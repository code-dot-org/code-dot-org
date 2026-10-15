import {describe, expect, it} from 'vitest';

import {Route} from '../edit';

describe('/projects/$labType/$channelId/edit route', () => {
  it('opts out of the global footer (full-bleed lab)', () => {
    expect(Route.options.staticData?.hideFooter).toBe(true);
  });
});

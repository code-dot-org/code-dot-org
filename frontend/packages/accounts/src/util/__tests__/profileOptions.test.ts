import {describe, expect, it} from 'vitest';

import {US_STATE_OPTIONS} from '../profileOptions';

// Parity with legacy User.us_state_dropdown_options.
describe('US_STATE_OPTIONS', () => {
  it('leads with the not-listed-here option (code ??)', () => {
    expect(US_STATE_OPTIONS[0]).toEqual({
      value: '??',
      text: 'I live somewhere not listed here',
    });
  });

  it('labels DC "Washington, D.C." and sorts it after Washington', () => {
    const labels = US_STATE_OPTIONS.map(o => o.text);
    expect(US_STATE_OPTIONS).toContainEqual({
      value: 'DC',
      text: 'Washington, D.C.',
    });
    expect(labels).not.toContain('District of Columbia');
    expect(labels.indexOf('Washington, D.C.')).toBeGreaterThan(
      labels.indexOf('Washington'),
    );
  });
});

import {render} from '@testing-library/react';
import React from 'react';

import AdaptiveHeaderPortal, {
  ADAPTIVE_HEADER_ID,
} from '@cdo/apps/code-studio/components/header/AdaptiveHeaderPortal';

describe('AdaptiveHeaderPortal', () => {
  it('leaves an empty element for the adaptive lab to fill', () => {
    render(<AdaptiveHeaderPortal />);
    const slot = document.getElementById(ADAPTIVE_HEADER_ID);
    expect(slot).toBeTruthy();
    expect(slot?.childElementCount).toBe(0);
  });
});

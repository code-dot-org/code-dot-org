import {beforeEach, describe, expect, it} from 'vitest';

import {loadIconFont} from '../iconFont';

describe('loadIconFont (standalone dev host)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('injects the FontAwesome stylesheet so DSCO icons render', () => {
    loadIconFont();

    const faLinks = document.head.querySelectorAll(
      'link[rel="stylesheet"][href*="font-awesome"]',
    );
    expect(faLinks.length).toBeGreaterThan(0);
  });
});

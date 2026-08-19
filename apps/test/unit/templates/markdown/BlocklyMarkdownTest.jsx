import {render, screen} from '@testing-library/react';
import React from 'react';

import BlocklyMarkdown from '@cdo/apps/templates/markdown/BlocklyMarkdown';

/*
 * These render through the *built* @code-dot-org/markdown package: apps
 * resolves the package's `require` condition, so this is the only place the CJS
 * dist gets exercised. The markdown package's own vitest suite runs against
 * src, so it cannot catch a packaging/interop regression -- e.g. a default
 * import of a design-system component resolving to a namespace object instead
 * of the component (see the `interop` note in that package's vite.config.ts).
 */
describe('BlocklyMarkdown', () => {
  it('renders --- as a design-system divider', () => {
    render(<BlocklyMarkdown content={'above\n\n---\n\nbelow'} />);

    // The DSCO Divider renders an <hr> (role separator) carrying its hashed
    // module class.
    const divider = screen.getByRole('separator');
    expect(divider.className).toMatch(/divider/);
  });

  it('renders a link as a design-system link', () => {
    render(<BlocklyMarkdown content="[text](https://example.com)" />);

    const link = screen.getByRole('link', {name: 'text'});
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.className).toMatch(/link/);
  });
});

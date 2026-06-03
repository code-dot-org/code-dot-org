import {cleanup, render} from '@testing-library/react';
import {page} from 'vitest/browser';
import {afterEach, describe, expect, it} from 'vitest';

// Load the design-system color variables so the [data-theme] toggle has effect.
// (System fonts via fontVariables, not the brand web font, keep screenshots
// deterministic.)
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {scenarios} from '../../demo/scenarios';

afterEach(cleanup);

const THEMES = ['Light', 'Dark'] as const;

describe('Markdown visuals', () => {
  // Drive the shared scenarios in each theme; the baseline name is
  // `<scenario id>-<theme>`.
  for (const theme of THEMES) {
    for (const scenario of scenarios) {
      it(`${scenario.name} (${theme})`, async () => {
        render(
          <div
            data-testid="scene"
            data-theme={theme}
            style={{
              background: 'var(--background-neutral-primary)',
              color: 'var(--text-neutral-primary)',
              fontFamily: 'sans-serif',
              padding: 16,
              width: 600,
            }}
          >
            {scenario.render()}
          </div>,
        );
        await expect
          .element(page.getByTestId('scene'))
          .toMatchScreenshot(`${scenario.id}-${theme.toLowerCase()}`);
      });
    }
  }
});

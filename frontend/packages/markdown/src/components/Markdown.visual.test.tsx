import {cleanup, render} from '@testing-library/react';
import {page} from 'vitest/browser';
import {afterEach, describe, expect, it} from 'vitest';

import {scenarios} from '../../demo/scenarios';

afterEach(cleanup);

describe('Markdown visuals', () => {
  // Drive the same scenarios the demo app renders; each `id` is the screenshot
  // baseline name.
  for (const scenario of scenarios) {
    it(scenario.name, async () => {
      render(
        <div
          data-testid="scene"
          style={{
            background: '#fff',
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
        .toMatchScreenshot(scenario.id);
    });
  }
});

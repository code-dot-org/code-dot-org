import {cleanup, render} from '@testing-library/react';
import {page} from 'vitest/browser';
import {afterEach, describe, expect, it, vi} from 'vitest';

// The themes color workspace chrome via design-system CSS variables (e.g.
// `var(--neutral-base-black)` for dark backgrounds). Load those definitions so
// the variables resolve; without them light and dark variants render alike.
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/fontVariables.css';

import {themes} from '../../themes';
import type {BlocklySerialization} from '../../types';

import BlocklyWorkspace from './index';

/*
 * Per-theme screenshot baselines. Each theme restyles the block colours (and
 * some workspace chrome), so rendering one fixed program under every theme and
 * comparing against committed images guards those palettes against accidental
 * change. Runs in headless Chromium (vitest.browser.config.ts); regenerate the
 * baselines with `yarn test:browser:update`.
 */

afterEach(cleanup);

// One small program spanning several block categories (loop, text, math, logic)
// so theme palette differences are visible. Fixed coordinates keep layout — and
// therefore the screenshot — deterministic.
const PROGRAM: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'controls_repeat_ext',
        x: 24,
        y: 24,
        inputs: {
          TIMES: {shadow: {type: 'math_number', fields: {NUM: 5}}},
          DO: {
            block: {
              type: 'text_print',
              inputs: {
                TEXT: {shadow: {type: 'text', fields: {TEXT: 'hi'}}},
              },
            },
          },
        },
      },
      {
        type: 'logic_compare',
        x: 24,
        y: 150,
        inputs: {
          A: {shadow: {type: 'math_number', fields: {NUM: 1}}},
          B: {shadow: {type: 'math_number', fields: {NUM: 2}}},
        },
      },
    ],
  },
};

describe('BlocklyWorkspace theme screenshots', () => {
  for (const [name, theme] of Object.entries(themes)) {
    it(name, async () => {
      const {container} = render(
        <div
          data-testid="scene"
          style={{display: 'flex', width: 600, height: 360}}
        >
          <BlocklyWorkspace startBlocks={PROGRAM} theme={theme} />
        </div>,
      );

      // Wait until the program is drawn before capturing.
      await vi.waitFor(
        () => {
          const svg = container.querySelector('svg.blocklySvg');
          expect(svg?.querySelector('.blocklyDraggable')).not.toBeNull();
          expect(svg?.textContent).toContain('hi');
        },
        {timeout: 5000, interval: 50},
      );

      await expect.element(page.getByTestId('scene')).toMatchScreenshot(name);
    });
  }
});

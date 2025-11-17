import type {TestRunnerConfig} from '@storybook/test-runner';
import {INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS} from 'storybook/viewport';

const DEFAULT_VIEWPORT_SIZE = {width: 1280, height: 720};

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(page, context) {
    // Match the last bit of the Story class to the viewport type
    // Get the viewport name that matches the built-in viewports, if
    // that last bit is well-known
    const storyName = context.id;
    const viewportName = storyName.endsWith('-mobile')
      ? 'mobile2'
      : storyName.endsWith('-small-desktop')
        ? 'ipad12p'
        : storyName.endsWith('-tablet')
          ? 'tablet'
          : undefined;

    // Get that viewport configuration
    const viewportParameter =
      INITIAL_VIEWPORTS[viewportName] || MINIMAL_VIEWPORTS[viewportName];

    // If we found one, apply the viewport dimensions
    if (viewportParameter) {
      const viewportSize = Object.entries(
        viewportParameter.styles || {},
      ).reduce(
        (acc, [screen, size]) => {
          if (screen === 'width' || screen === 'height') {
            acc[screen] = parseInt(size as string);
          }
          return acc;
        },
        {width: 0, height: 0},
      );

      return page.setViewportSize(viewportSize);
    } else {
      // Otherwise, just set the viewport to the provided default
      return page.setViewportSize(DEFAULT_VIEWPORT_SIZE);
    }
  },
};

export default config;

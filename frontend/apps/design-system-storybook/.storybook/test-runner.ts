import type {TestRunnerConfig} from '@storybook/test-runner';
import {getStoryContext} from '@storybook/test-runner';
import {INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS} from 'storybook/viewport';

const DEFAULT_VIEWPORT_SIZE = {width: 1280, height: 720};

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(page, story) {
    const context = await getStoryContext(page, story);
    const viewportName = context.parameters?.viewport?.defaultViewport;
    const viewportParameter =
      INITIAL_VIEWPORTS[viewportName] || MINIMAL_VIEWPORTS[viewportName];

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
      return page.setViewportSize(DEFAULT_VIEWPORT_SIZE);
    }
  },
};

export default config;

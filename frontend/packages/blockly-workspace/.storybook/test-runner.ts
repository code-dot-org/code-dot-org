import {INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';
import type {TestRunnerConfig} from '@storybook/test-runner';
import {getStoryContext} from '@storybook/test-runner';
import {injectAxe, checkA11y} from 'axe-playwright';

const DEFAULT_VIEWPORT_SIZE = {width: 1280, height: 720};

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(page, story) {
    await injectAxe(page);

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

      page.setViewportSize(viewportSize);
    } else {
      page.setViewportSize(DEFAULT_VIEWPORT_SIZE);
    }
  },
  async postVisit(page, context) {
    // Get the entire context of a story, including parameters, args, argTypes, etc.
    const storyContext = await getStoryContext(page, context);

    const storyA11yConfigRules = storyContext.parameters?.a11y?.config
      ?.rules as {id: string; enabled: boolean}[];
    const customAxeRules = {} as {
      [key: string]: {
        enabled: boolean;
      };
    };

    // If some custom a11y rules config is passed to the story - it will be automatically fetched by test runner
    // so that CI and QA will also follow that config.
    if (storyA11yConfigRules) {
      storyA11yConfigRules.forEach(
        rule => (customAxeRules[rule.id] = {enabled: rule.enabled}),
      );
    }

    // Do not run a11y tests on disabled stories.
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      verbose: false,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: {rules: customAxeRules},
    });
  },
};

export default config;

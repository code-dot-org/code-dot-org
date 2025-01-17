import type {TestRunnerConfig} from '@storybook/test-runner';
import {getStoryContext} from '@storybook/test-runner';

import {injectAxe, checkA11y} from 'axe-playwright';

/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
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

import cdoReactConfig from './react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...cdoReactConfig,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@code-dot-org/lab',
              message:
                'Labs are embeddable widgets that run inside any host (Studio, Storybook, standalone). ' +
                '@code-dot-org/lab is the host shell that wraps labs with error boundaries, level context, ' +
                'and routing — importing it from a lab creates a circular dependency and breaks embeddability. ' +
                'Move host-specific wiring to a Studio adapter (e.g. apps/studio/src/modules/labs/).',
            },
          ],
        },
      ],
    },
  },
];

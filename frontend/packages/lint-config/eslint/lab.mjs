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
              name: '@code-dot-org/lab/host',
              message: `@code-dot-org/lab/host is the shell that wraps labs with error boundaries, level context, and loading UI — only platform hosts (Studio, apps) should import it. Labs import @code-dot-org/lab/contexts for hooks and types.`,
            },
          ],
        },
      ],
    },
  },
];

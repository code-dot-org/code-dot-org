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
                'Embeddable labs must not depend on the framework package. Host wiring belongs in Studio adapters.',
            },
          ],
        },
      ],
    },
  },
];

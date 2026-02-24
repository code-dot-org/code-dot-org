import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          baseUrl: '.',
          paths: {
            '@/*': [`${__dirname}/src/*`],
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    // Force all packages to use the same React instance to avoid "Invalid hook call" errors
    // This is critical for MUI components that use @emotion/react
    '^react$': resolve(__dirname, 'node_modules/react'),
    '^react-dom$': resolve(__dirname, 'node_modules/react-dom'),
    '^react-dom/client$': resolve(__dirname, 'node_modules/react-dom/client'),
    '^react/jsx-runtime$': resolve(__dirname, 'node_modules/react/jsx-runtime'),
    '^react/jsx-dev-runtime$': resolve(
      __dirname,
      'node_modules/react/jsx-dev-runtime',
    ),
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};

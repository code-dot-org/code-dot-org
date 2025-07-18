import {dirname, basename} from 'path';
import {fileURLToPath} from 'url';

const packageName = basename(dirname(fileURLToPath(import.meta.url)));

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
            [`@${packageName}/*`]: [`${dirname(fileURLToPath(import.meta.url))}/src/*`],
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
    [`^@${packageName}/(.*)$`]: '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};

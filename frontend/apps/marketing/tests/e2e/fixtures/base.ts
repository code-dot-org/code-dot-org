import {mergeTests} from '@playwright/test';
import {test as eyesTest} from '@applitools/eyes-playwright/fixture';

export const test = mergeTests(eyesTest);

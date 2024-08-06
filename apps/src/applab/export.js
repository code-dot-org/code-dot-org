import {executors as audioExecutors} from '../code-studio/audioApi';
import {executors as timeoutExecutors} from '../code-studio/timeoutApi';
import * as dontMarshalApi from '../dontMarshalApi';
import {dropletGlobalConfigBlocks} from '../dropletUtils';

import * as api from './api';

export function getExportedGlobals() {
  const globals = Object.assign(
    {},
    audioExecutors,
    timeoutExecutors,
    dontMarshalApi,
    api
  );
  dropletGlobalConfigBlocks.forEach(block => {
    globals[block.func] = block.parent[block.func];
  });
  return globals;
}

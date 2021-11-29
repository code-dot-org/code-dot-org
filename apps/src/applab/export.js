import * as api from './api';
import {executors as audioExecutors} from '../lib/util/audioApi';
import {executors as timeoutExecutors} from '../lib/util/timeoutApi';
import * as dontMarshalApi from '../dontMarshalApi';
import {dropletGlobalConfigBlocks} from '../dropletUtils';

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

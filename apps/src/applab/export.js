import * as api from './api';
import {executors} from '../lib/util/audioApi';
import * as dontMarshalApi from './dontMarshalApi';
import {dropletGlobalConfigBlocks} from '../dropletUtils';

export function getExportedGlobals() {
  const globals = Object.assign({}, executors, dontMarshalApi, api);
  dropletGlobalConfigBlocks.forEach(block => {
    globals[block.func] = block.parent[block.func];
  });
  return globals;
}

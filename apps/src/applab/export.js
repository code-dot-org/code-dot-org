import * as api from './api';
import {executors} from '../lib/util/audioApi';
import * as dontMarshalApi from './dontMarshalApi';

export function getExportedGlobals() {
  return Object.assign({}, executors, dontMarshalApi, api);
}

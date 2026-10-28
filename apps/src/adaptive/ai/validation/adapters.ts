import {AppName} from '@cdo/apps/lab2/types';

import {WorkAdapter} from './types';
import {weblab2Adapter} from './weblab2';

const WORK_ADAPTERS: {[app in AppName]?: WorkAdapter} = {
  weblab2: weblab2Adapter,
};

/** How the lab takes part in checking its work, or undefined for a lab whose work cannot be checked. */
export function workAdapterFor(appName: string): WorkAdapter | undefined {
  return WORK_ADAPTERS[appName as AppName];
}

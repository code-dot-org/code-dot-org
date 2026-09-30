// Interpreted helper libraries the lab carries, so a run needs no fetch for
// them. They are files in dashboard/config/libraries, read at build time;
// any other library a level names is fetched from /libraries.
import {DashboardApiClient} from '@code-dot-org/core/api';

import nativeSpriteLab from '../../../../../../dashboard/config/libraries/NativeSpriteLab.interpreted.js?raw';

const BUNDLED: Record<string, string> = {
  NativeSpriteLab: nativeSpriteLab,
};

export async function loadHelperLibrary(name: string): Promise<string> {
  if (name in BUNDLED) {
    return BUNDLED[name];
  }
  return DashboardApiClient.libraries.getSource({name});
}

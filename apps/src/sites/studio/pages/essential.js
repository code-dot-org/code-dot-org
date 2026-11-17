import {initializeCore} from '@code-dot-org/core';
import * as Observability from '@code-dot-org/core/plugins/observability';

import DCDO from '@cdo/apps/dcdo';

const corePlugins = [];

if (DCDO.get('frontend-observability-enabled', false)) {
  corePlugins.push(Observability.observabilityPlugin);
}

initializeCore({plugins: corePlugins});

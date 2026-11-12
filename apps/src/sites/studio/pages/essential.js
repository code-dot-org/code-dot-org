import {initializeCore} from '@code-dot-org/core';
import {analyticsPlugin} from '@code-dot-org/core/plugins/analytics';
import {consentPlugin} from '@code-dot-org/core/plugins/consent';
import * as Observability from '@code-dot-org/core/plugins/observability';

import DCDO from '@cdo/apps/dcdo';

const corePlugins = [];

if (DCDO.get('frontend-observability-enabled', false)) {
  corePlugins.push(Observability.observabilityPlugin);
}

if (DCDO.get('statsig-plugin-enabled', false)) {
  corePlugins.push(consentPlugin, analyticsPlugin);
}

initializeCore({plugins: corePlugins});

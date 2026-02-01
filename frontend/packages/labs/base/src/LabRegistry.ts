import type {ProjectType} from '@code-dot-org/core/api';
import type {ProjectManager} from '@code-dot-org/projects';

import LabMetricsReporter from './LabMetricsReporter';
import LifecycleNotifier from './LifecycleNotifier';

class LabRegistry {
  metricsReporter: LabMetricsReporter;
  lifecycleNotifier: LifecycleNotifier;
  appName: ProjectType = 'unknown';
  projectManager?: ProjectManager;

  constructor() {
    this.metricsReporter = new LabMetricsReporter();
    this.lifecycleNotifier = new LifecycleNotifier();
  }
}

export default new LabRegistry();

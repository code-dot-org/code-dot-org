import _ from 'lodash';

import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';

export const showV2TeacherDashboard: () => boolean = _.once(() => {
  return (
    DCDO.get('teacher-local-nav-v2', false) ||
    experiments.isEnabled('teacher-local-nav-v2')
  );
});

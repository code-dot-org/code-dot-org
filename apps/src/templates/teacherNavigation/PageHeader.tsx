import _ from 'lodash';
import React from 'react';
import {matchPath, useLocation} from 'react-router-dom';

import {Heading1} from '@cdo/apps/componentLibrary/typography';

import {
  getSectionRouterPath,
  LABELED_TEACHER_DASHBOARD_PATHS,
} from './TeacherDashboardPaths';

const PageHeader: React.FC = () => {
  const location = useLocation();
  const pathName = React.useMemo(
    () =>
      _.find(
        LABELED_TEACHER_DASHBOARD_PATHS,
        path =>
          matchPath(getSectionRouterPath(path.url), location.pathname) !== null
      )?.label || 'unknown path',
    [location]
  );
  return <Heading1>{pathName}</Heading1>;
};

export default PageHeader;

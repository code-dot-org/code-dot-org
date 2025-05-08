import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useMemo} from 'react';
// import {useNavigate, NavigateFunction, Link} from 'react-router-dom';
import {Link} from 'react-router-dom';

import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';

import styles from './teacherHomepage.module.scss';

interface LinkElementProps {
  value: string;
  label: string;
  iconName?: string;
  url: string;
  eventName?: string;
  eventOptions?: object;
}

const LinkOption: React.FC<LinkElementProps> = ({
  value,
  label,
  iconName,
  url,
  eventName,
  eventOptions,
}) => {
  const isTeacherDashboard = useMemo(
    () => Object.values(TEACHER_NAVIGATION_PATHS).includes(value),
    [value]
  );

  return (
    <li>
      {isTeacherDashboard ? (
        <Link
          to={url}
          className={styles.dropdownMenuItem}
          onClick={() => {
            if (eventName)
              analyticsReporter.sendEvent(eventName, {}, PLATFORMS.BOTH);
          }}
        >
          {iconName && (
            <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
          )}
          <span>{label}</span>
        </Link>
      ) : (
        <a
          className={styles.dropdownMenuItem}
          href={url}
          onClick={() => {
            if (eventName)
              analyticsReporter.sendEvent(
                eventName,
                eventOptions,
                PLATFORMS.BOTH
              );
          }}
        >
          <span>{label}</span>
        </a>
      )}
    </li>
  );
};

export default LinkOption;

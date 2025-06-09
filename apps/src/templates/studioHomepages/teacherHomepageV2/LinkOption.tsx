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
  labelStyle?: 'b' | 'i';
  iconName?: string;
  url: string;
  eventName?: string;
  eventOptions: object;
}

const LinkOption: React.FC<LinkElementProps> = ({
  value,
  label,
  labelStyle,
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
          id={`ui-test-${label.replace(' ', '-')}`}
          to={url}
          className={styles.dropdownMenuItem}
          onClick={() => {
            if (eventName)
              analyticsReporter.sendEvent(
                eventName,
                eventOptions,
                PLATFORMS.BOTH
              );
          }}
        >
          {iconName && (
            <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
          )}
          <span>{label}</span>
        </Link>
      ) : (
        <a
          id={`ui-test-${label.replaceAll(' ', '-').replaceAll(':', '')}`}
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
          {labelStyle === 'b' ? (
            <span>
              <b>{label}</b>
            </span>
          ) : labelStyle === 'i' ? (
            <span style={{paddingLeft: '1em'}}>{label}</span>
          ) : (
            <span>{label}</span>
          )}
        </a>
      )}
    </li>
  );
};

export default LinkOption;

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {Typography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

import styles from './selfPacedProgressTable.module.scss';
// Generic table styles that are shared with LandingPage.jsx
import './tableStyles.scss';

const CourseRow = ({
  name,
  title,
  current_lesson_name,
  percent_completed,
  finish_url,
  path,
}) => (
  <tr>
    <td>
      <Link href={path} size="s" type="secondary">
        {title}
      </Link>
    </td>
    <td>
      <Typography variant="body3" gutterBottom>
        {current_lesson_name}
      </Typography>
    </td>
    <td>
      {percent_completed === 100 ? (
        <Typography
          className={styles.completePill}
          variant="body4"
          gutterBottom
        >
          {i18n.selfPacedPlCompleted()}
        </Typography>
      ) : (
        <div className={styles.progressWrapper}>
          <Typography variant="body3" gutterBottom>
            {percent_completed}% {i18n.selfPacedPlCompleted()}
          </Typography>
          {/* Progress bar */}
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div className={styles.progressBar} data-testid="progress-bar">
            <span
              className={styles.progressBarFill}
              style={{width: `${percent_completed}%`}}
            />
          </div>
        </div>
      )}
    </td>
    <td>
      <div className="flexWrapper">
        {percent_completed < 100 && (
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            href={path}
          >
            {i18n.selfPacedPlContinueCourse()}
          </MuiButton>
        )}
        {finish_url && (
          <MuiButton
            variant="outlined"
            color="secondary"
            size="small"
            href={studio(finish_url)}
            startIcon={<FontAwesomeV6Icon iconName="print" iconStyle="solid" />}
          >
            {i18n.selfPacedPlPrintCertificates()}
          </MuiButton>
        )}
      </div>
    </td>
  </tr>
);

CourseRow.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  current_lesson_name: PropTypes.string.isRequired,
  percent_completed: PropTypes.number.isRequired,
  finish_url: PropTypes.string,
  path: PropTypes.string,
};

export default function SelfPacedProgressTable({plCoursesStarted}) {
  return (
    <div className="tableWrapper">
      <table className={styles.selfPacedProgressTable}>
        <thead>
          <tr>
            <th>{i18n.selfPacedPlCourseName()}</th>
            <th>{i18n.selfPacedPlCurrentLesson()}</th>
            <th>{i18n.selfPacedPlCourseCompletion()}</th>
            <th>{i18n.selfPacedPlActions()}</th>
          </tr>
        </thead>
        <tbody>
          {plCoursesStarted.map((course, index) => (
            <CourseRow
              key={index}
              name={course.name}
              title={course.title}
              current_lesson_name={course.current_lesson_name}
              percent_completed={course.percent_completed}
              finish_url={course.finish_url}
              path={course.path}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

SelfPacedProgressTable.propTypes = {
  plCoursesStarted: PropTypes.arrayOf(PropTypes.object),
};

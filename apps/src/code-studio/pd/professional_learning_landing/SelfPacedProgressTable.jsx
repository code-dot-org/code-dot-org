import PropTypes from 'prop-types';
import React from 'react';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import Link from '@cdo/apps/componentLibrary/link';
import {
  BodyThreeText,
  BodyFourText,
} from '@cdo/apps/componentLibrary/typography';
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
}) => (
  <tr>
    <td>
      <Link href={studio(`/s/${name}`)} size="s" type="secondary">
        {title}
      </Link>
    </td>
    <td>
      <BodyThreeText>{current_lesson_name}</BodyThreeText>
    </td>
    <td>
      {percent_completed === 100 ? (
        <BodyFourText className={styles.completePill}>
          {i18n.selfPacedPlCompleted()}
        </BodyFourText>
      ) : (
        <div className={styles.progressWrapper}>
          <BodyThreeText>
            {percent_completed}% {i18n.selfPacedPlCompleted()}
          </BodyThreeText>
          {/* Progress bar */}
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
          <LinkButton
            color={'purple'}
            href={studio(`/s/${name}`)}
            size="s"
            text={i18n.selfPacedPlContinueCourse()}
          />
        )}
        {finish_url && (
          <LinkButton
            color={'black'}
            href={studio(finish_url)}
            size="s"
            text={i18n.selfPacedPlPrintCertificates()}
            type={'secondary'}
            iconLeft={{
              iconName: 'print',
              iconStyle: 'solid',
            }}
          />
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

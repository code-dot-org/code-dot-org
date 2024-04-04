import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Link from '@cdo/apps/componentLibrary/link';
import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {
  BodyThreeText,
  BodyFourText,
} from '@cdo/apps/componentLibrary/typography';
import styles from './selfPacedProgressTable.module.scss';
import './tableStyles.scss'; // Generic table styles that are share with LandingPage.jsx

const CourseRow = ({
  name,
  title,
  current_lesson_name,
  percent_completed,
  finish_url,
}) => (
  <tr>
    <td>
      <Link href={`/${name}`} size="s" type="secondary">
        {title}
      </Link>
    </td>
    <td>
      <BodyThreeText>{current_lesson_name}</BodyThreeText>
    </td>
    <td>
      {percent_completed === '100' ? (
        <BodyFourText className={styles.completePill}>
          {i18n.selfPacedPlCompleted()}
        </BodyFourText>
      ) : (
        <BodyThreeText>
          {percent_completed}% {i18n.selfPacedPlCompleted()}
        </BodyThreeText>
      )}
    </td>
    <td>
      <div className="flexWrapper">
        {percent_completed < 100 && (
          <LinkButton
            color={'purple'}
            href={`/${name}`}
            size="s"
            text={i18n.selfPacedPlContinueCourse()}
          />
        )}
        {finish_url && (
          <LinkButton
            color={'black'}
            href={finish_url}
            size="s"
            text={i18n.printCertificate()}
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
  percent_completed: PropTypes.string.isRequired,
  finish_url: PropTypes.string,
};

export default function SelfPacedProgressTable({plCoursesStarted}) {
  return (
    <div className={styles.tableWrapper}>
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
              name={`/s/${course.name}`}
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

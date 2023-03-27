import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import Button from '@cdo/apps/templates/Button';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import i18n from '@cdo/locale';
import styles from './summary-entry-point.module.scss';

const SUMMARY_PATH = '/summary';

const SummaryEntryPoint = ({students}) => {
  // If viewing the page as Participant, be sure to rewrite the link URL
  // to view as Instructor, so we don't just get redirected back.
  const params = document.location.search.replace(
    `viewAs=${ViewType.Participant}`,
    `viewAs=${ViewType.Instructor}`
  );
  const summaryUrl = document.location.pathname + SUMMARY_PATH + params;

  const data = getScriptData('freeresponse');

  return (
    <div className={styles.summaryEntryPoint}>
      <Button
        color={Button.ButtonColor.neutralDark}
        text={i18n.viewStudentResponses()}
        icon="arrow-up-right-from-square"
        href={summaryUrl}
        __useDeprecatedTag
      />

      <div className={styles.responseCounter}>
        <p>
          <i className="fa fa-user" />
          <span className={styles.counter}>
            {data.responses.length}/{students.length}{' '}
          </span>
          <span className={styles.text}>{i18n.studentsAnswered()}</span>
        </p>
      </div>
    </div>
  );
};

SummaryEntryPoint.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string
    })
  )
};

export default connect(
  // NOTE: Some of this state data is loaded in by the teacher panel. If you
  // remove the teacher panel, or try to use this component on a page without
  // the teacher panel, it will require extra steps to load in the data.
  state => ({
    students: state.teacherSections.selectedStudents
  })
)(SummaryEntryPoint);

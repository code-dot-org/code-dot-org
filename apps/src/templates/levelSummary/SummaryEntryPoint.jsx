import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

import styles from './summary-entry-point.module.scss';

const SUMMARY_PATH = '/summary';

const SummaryEntryPoint = ({scriptData, students, selectedSection}) => {
  // If viewing the page as Participant, be sure to rewrite the link URL
  // to view as Instructor, so we don't just get redirected back.
  const params = document.location.search.replace(
    `viewAs=${ViewType.Participant}`,
    `viewAs=${ViewType.Instructor}`
  );
  const summaryUrl = document.location.pathname + SUMMARY_PATH + params;

  let className = styles.summaryEntryPoint;
  if (!scriptData.is_contained_level) {
    className += ' ' + styles.isStandalone;
    if (scriptData.question_content_blank) {
      className += ' ' + styles.noQuestionContent;
    }
  }

  return (
    <div className={className}>
      <Button
        color={Button.ButtonColor.neutralDark}
        text={i18n.viewStudentResponses()}
        href={summaryUrl}
        className={styles.button}
        __useDeprecatedTag
      />

      {selectedSection && (
        <>
          <div className={styles.responseIcon}>
            <i className="fa fa-user" />
          </div>
          <div
            className={styles.responseCounter}
            data-testid={'response-counter'}
          >
            <p>
              <span className={styles.counter}>
                {scriptData.response_count}/{students.length}{' '}
              </span>
              <span className={styles.text}>{i18n.studentsAnswered()}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

SummaryEntryPoint.propTypes = {
  scriptData: PropTypes.object,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string,
    })
  ),
  selectedSection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default connect(
  // NOTE: Some of this state data is loaded in by the teacher panel. If you
  // remove the teacher panel, or try to use this component on a page without
  // the teacher panel, it will require extra steps to load in the data.
  state => ({
    students: state.teacherSections.selectedStudents,
    selectedSection:
      state.teacherSections.sections[state.teacherSections.selectedSectionId],
  })
)(SummaryEntryPoint);

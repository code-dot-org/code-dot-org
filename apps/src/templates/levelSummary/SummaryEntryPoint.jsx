import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import styles from './summary-entry-point.module.scss';

const SUMMARY_PARAM = 'view=summary';

const SummaryEntryPoint = ({students}) => {
  const summaryUrlJoin = window.location.search === '' ? '?' : '&';
  const summaryUrl = window.location.href + summaryUrlJoin + SUMMARY_PARAM;

  const data = getScriptData('freeresponse');

  return (
    <div className={styles.summaryEntryPoint}>
      <Button
        color="neutralDark"
        text="View student responses"
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
